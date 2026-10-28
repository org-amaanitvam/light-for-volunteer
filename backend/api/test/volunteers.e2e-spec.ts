import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { VolunteerProfile } from '../src/database/entities/volunteer-profile.entity';

const PASSWORD = 'Sup3rSecret!pass';
const rand = () => Math.random().toString(36).slice(2, 10);
const uniqueEmail = (label: string) => `${label}-${rand()}@e2e.test`;

describe('Volunteers (e2e)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();
    server = app.getHttpServer();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app?.close();
  });

  const signup = async (label: string, role: 'volunteer' | 'organisation' = 'volunteer') => {
    const response = await request(server)
      .post('/api/auth/signup')
      .send({ name: `E2E ${label}`, email: uniqueEmail(label), password: PASSWORD, role })
      .expect(201);

    return {
      token: response.body.accessToken as string,
      userId: response.body.user.id as string,
    };
  };

  const asUser = (token: string) => ({ Authorization: `Bearer ${token}` });

  describe('GET /api/volunteers/profile', () => {
    it('creates an empty profile and returns the same profile on later calls', async () => {
      const user = await signup('profile');

      const first = await request(server)
        .get('/api/volunteers/profile')
        .set(asUser(user.token))
        .expect(200);
      const second = await request(server)
        .get('/api/volunteers/profile')
        .set(asUser(user.token))
        .expect(200);

      expect(first.body.id).toBeTruthy();
      expect(second.body.id).toBe(first.body.id);
      expect(first.body).toMatchObject({
        headline: null,
        about: null,
        skills: [],
        portfolioLinks: [],
        points: 0,
        ratingAvg: 0,
        badges: [],
        resumeUrl: null,
        totalHours: 0,
      });
    });

    it('creates only one profile when two first reads race', async () => {
      const user = await signup('parallel');
      const [first, second] = await Promise.all([
        request(server).get('/api/volunteers/profile').set(asUser(user.token)),
        request(server).get('/api/volunteers/profile').set(asUser(user.token)),
      ]);

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      expect(first.body.id).toBe(second.body.id);
    });

    it('rejects an organisation role and requests without a token', async () => {
      const organisation = await signup('org-cannot-read', 'organisation');

      await request(server)
        .get('/api/volunteers/profile')
        .set(asUser(organisation.token))
        .expect(403);
      await request(server).get('/api/volunteers/profile').expect(401);
    });
  });

  describe('PATCH /api/volunteers/profile', () => {
    it('updates the editable profile fields and normalizes list values', async () => {
      const user = await signup('patch');
      const response = await request(server)
        .patch('/api/volunteers/profile')
        .set(asUser(user.token))
        .send({
          headline: '  Volunteer designer  ',
          about: '  I help local teams.  ',
          skills: [' React ', 'react', 'Accessibility'],
          portfolioLinks: ['https://example.com/work'],
          resumeUrl: 'https://example.com/resume.pdf',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        headline: 'Volunteer designer',
        about: 'I help local teams.',
        skills: ['React', 'Accessibility'],
        portfolioLinks: ['https://example.com/work'],
        resumeUrl: 'https://example.com/resume.pdf',
        points: 0,
        badges: [],
      });
    });

    it('rejects attempts to change fields owned by other modules', async () => {
      const user = await signup('protected-field');

      await request(server)
        .patch('/api/volunteers/profile')
        .set(asUser(user.token))
        .send({ points: 999 })
        .expect(400);
    });

    it('rejects comma-containing list items', async () => {
      const user = await signup('comma');

      await request(server)
        .patch('/api/volunteers/profile')
        .set(asUser(user.token))
        .send({ skills: ['a,b'] })
        .expect(400);
    });

    it('clears nullable fields and lists when they are set to null', async () => {
      const user = await signup('clear-fields');
      await request(server)
        .patch('/api/volunteers/profile')
        .set(asUser(user.token))
        .send({
          headline: 'Volunteer',
          about: 'Profile details',
          resumeUrl: 'https://example.com/resume.pdf',
          skills: ['Mentoring'],
          portfolioLinks: ['https://example.com/work'],
        })
        .expect(200);

      const response = await request(server)
        .patch('/api/volunteers/profile')
        .set(asUser(user.token))
        .send({
          headline: null,
          about: null,
          resumeUrl: null,
          skills: null,
          portfolioLinks: null,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        headline: null,
        about: null,
        resumeUrl: null,
        skills: [],
        portfolioLinks: [],
      });
    });

    it('preserves points and badges written by the gamification module', async () => {
      const user = await signup('points-preserved');
      const profile = await request(server)
        .get('/api/volunteers/profile')
        .set(asUser(user.token))
        .expect(200);

      await dataSource
        .getRepository(VolunteerProfile)
        .update(profile.body.id, { points: 41, badges: ['helper'] });

      const response = await request(server)
        .patch('/api/volunteers/profile')
        .set(asUser(user.token))
        .send({ headline: 'Updated headline' })
        .expect(200);

      expect(response.body.points).toBe(41);
      expect(response.body.badges).toEqual(['helper']);
    });

    it('rejects an organisation role and requests without a token', async () => {
      const organisation = await signup('org-cannot-edit', 'organisation');

      await request(server)
        .patch('/api/volunteers/profile')
        .set(asUser(organisation.token))
        .send({ headline: 'No' })
        .expect(403);
      await request(server).patch('/api/volunteers/profile').send({ headline: 'No' }).expect(401);
    });
  });

  describe('GET /api/volunteers/:id', () => {
    it('returns the public profile without personal contact or resume fields', async () => {
      const owner = await signup('public-profile');
      const viewer = await signup('profile-viewer');

      await request(server)
        .patch('/api/volunteers/profile')
        .set(asUser(owner.token))
        .send({ headline: 'Community helper', resumeUrl: 'https://example.com/private.pdf' })
        .expect(200);

      const response = await request(server)
        .get(`/api/volunteers/${owner.userId}`)
        .set(asUser(viewer.token))
        .expect(200);

      expect(response.body).toMatchObject({
        userId: owner.userId,
        name: 'E2E public-profile',
        headline: 'Community helper',
        skills: [],
        portfolioLinks: [],
        badges: [],
        points: 0,
        ratingAvg: 0,
      });
      expect(response.body).toHaveProperty('city');
      expect(response.body).not.toHaveProperty('resumeUrl');
      expect(response.body).not.toHaveProperty('email');
      expect(response.body).not.toHaveProperty('phone');
    });

    it('returns 404 for a user without a profile and 400 for an invalid UUID', async () => {
      const owner = await signup('no-profile');

      await request(server)
        .get(`/api/volunteers/${owner.userId}`)
        .set(asUser(owner.token))
        .expect(404);
      await request(server)
        .get('/api/volunteers/not-a-uuid')
        .set(asUser(owner.token))
        .expect(400);
    });

    it('returns 404 for a valid UUID with no matching user', async () => {
      const viewer = await signup('unknown-user-viewer');

      await request(server)
        .get('/api/volunteers/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')
        .set(asUser(viewer.token))
        .expect(404);
    });
  });
});
