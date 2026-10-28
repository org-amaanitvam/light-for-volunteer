import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as argon2 from 'argon2';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Organisation } from '../src/database/entities/organisation.entity';
import { VerificationStatus } from '../src/database/enums/verification-status.enum';
import { UsersService } from '../src/modules/users/users.service';

const PASSWORD = 'Sup3rSecret!pass';
const rand = () => Math.random().toString(36).slice(2, 10);
const uniqueEmail = (label: string) => `${label}-${rand()}@e2e.test`;

describe('Organisations (e2e)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let dataSource: DataSource;
  let adminToken: string;

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

    const users = app.get(UsersService);
    const adminEmail = uniqueEmail('e2e-admin');
    await users.create({
      email: adminEmail,
      name: 'E2E Admin',
      passwordHash: await argon2.hash(PASSWORD),
      role: 'admin',
    });
    const adminLogin = await request(server)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: PASSWORD })
      .expect(200);
    adminToken = adminLogin.body.accessToken as string;
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

  const createOrganisation = (token: string, orgName = 'E2E Community Organisation') =>
    request(server)
      .post('/api/organisations')
      .set(asUser(token))
      .send({ orgName });

  describe('POST /api/organisations', () => {
    it('creates an organisation as pending and rejects a duplicate', async () => {
      const owner = await signup('create-org', 'organisation');

      const created = await createOrganisation(owner.token).expect(201);
      expect(created.body).toMatchObject({
        id: expect.any(String),
        orgName: 'E2E Community Organisation',
        about: null,
        website: null,
        registrationType: null,
        registrationId: null,
        verificationDocUrl: null,
        verificationStatus: 'pending',
        ratingAvg: 0,
      });

      const duplicate = await createOrganisation(owner.token).expect(409);
      expect(duplicate.body.message).toMatch(/already exists/i);
    });

    it('requires the organisation role and a bearer token', async () => {
      const volunteer = await signup('cannot-create-org');

      await createOrganisation(volunteer.token).expect(403);
      await request(server)
        .post('/api/organisations')
        .send({ orgName: 'No token' })
        .expect(401);
    });

    it('rejects verificationStatus in the create body', async () => {
      const owner = await signup('cannot-set-status', 'organisation');

      await request(server)
        .post('/api/organisations')
        .set(asUser(owner.token))
        .send({ orgName: 'Status Override Attempt', verificationStatus: 'verified' })
        .expect(400);
    });
  });

  describe('GET /api/organisations/me', () => {
    it('returns 404 before creation and the organisation after creation', async () => {
      const owner = await signup('get-me', 'organisation');

      await request(server).get('/api/organisations/me').set(asUser(owner.token)).expect(404);
      const created = await createOrganisation(owner.token, 'My Organisation').expect(201);
      const response = await request(server)
        .get('/api/organisations/me')
        .set(asUser(owner.token))
        .expect(200);

      expect(response.body.id).toBe(created.body.id);
      expect(response.body.orgName).toBe('My Organisation');
      expect(response.body.verificationStatus).toBe('pending');
    });
  });

  describe('PATCH /api/organisations/me', () => {
    it('updates editable details while pending without changing status', async () => {
      const owner = await signup('patch-pending', 'organisation');
      await createOrganisation(owner.token).expect(201);

      const response = await request(server)
        .patch('/api/organisations/me')
        .set(asUser(owner.token))
        .send({
          orgName: 'Updated Organisation',
          about: 'Supporting local communities.',
          website: 'https://example.org',
          registrationType: 'Trust',
          registrationId: 'REG-100',
          verificationDocUrl: 'https://example.org/verification.pdf',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        orgName: 'Updated Organisation',
        about: 'Supporting local communities.',
        website: 'https://example.org',
        registrationType: 'Trust',
        registrationId: 'REG-100',
        verificationDocUrl: 'https://example.org/verification.pdf',
        verificationStatus: 'pending',
      });
    });

    it('blocks verified registration changes but allows other fields', async () => {
      const owner = await signup('patch-verified', 'organisation');
      const created = await createOrganisation(owner.token).expect(201);
      await dataSource
        .getRepository(Organisation)
        .update(created.body.id, { verification_status: VerificationStatus.VERIFIED });

      const blocked = await request(server)
        .patch('/api/organisations/me')
        .set(asUser(owner.token))
        .send({ registrationId: 'REG-CHANGED' })
        .expect(409);
      expect(blocked.body.message).toMatch(/contact admin/i);

      const allowed = await request(server)
        .patch('/api/organisations/me')
        .set(asUser(owner.token))
        .send({ about: 'An ordinary profile edit.' })
        .expect(200);
      expect(allowed.body.about).toBe('An ordinary profile edit.');
      expect(allowed.body.verificationStatus).toBe('verified');
    });
  });

  describe('POST /api/organisations/me/resubmit', () => {
    it('moves rejected organisations back to pending only', async () => {
      const owner = await signup('resubmit', 'organisation');
      const created = await createOrganisation(owner.token).expect(201);
      const organisations = dataSource.getRepository(Organisation);

      await organisations.update(created.body.id, {
        verification_status: VerificationStatus.REJECTED,
      });
      const resubmitted = await request(server)
        .post('/api/organisations/me/resubmit')
        .set(asUser(owner.token))
        .expect(200);
      expect(resubmitted.body.verificationStatus).toBe('pending');

      await request(server)
        .post('/api/organisations/me/resubmit')
        .set(asUser(owner.token))
        .expect(409);

      await organisations.update(created.body.id, {
        verification_status: VerificationStatus.VERIFIED,
      });
      await request(server)
        .post('/api/organisations/me/resubmit')
        .set(asUser(owner.token))
        .expect(409);
    });
  });

  describe('GET /api/organisations/:id', () => {
    it('hides pending organisations from others and exposes verified public fields only', async () => {
      const owner = await signup('public-org-owner', 'organisation');
      const viewer = await signup('public-org-viewer');
      const created = await createOrganisation(owner.token, 'Public Organisation').expect(201);

      await request(server)
        .get(`/api/organisations/${created.body.id}`)
        .set(asUser(viewer.token))
        .expect(404);

      const ownerView = await request(server)
        .get(`/api/organisations/${created.body.id}`)
        .set(asUser(owner.token))
        .expect(200);
      expect(ownerView.body.registrationId).toBeNull();

      await request(server)
        .get(`/api/organisations/${created.body.id}`)
        .set(asUser(adminToken))
        .expect(200);

      await dataSource.getRepository(Organisation).update(created.body.id, {
        verification_status: VerificationStatus.VERIFIED,
        registration_id: 'PRIVATE-REG-123',
        verification_doc_url: 'https://example.org/private-document.pdf',
      });

      const publicView = await request(server)
        .get(`/api/organisations/${created.body.id}`)
        .set(asUser(viewer.token))
        .expect(200);
      expect(publicView.body).toMatchObject({
        id: created.body.id,
        orgName: 'Public Organisation',
        verificationStatus: 'verified',
      });
      expect(publicView.body).not.toHaveProperty('registrationId');
      expect(publicView.body).not.toHaveProperty('verificationDocUrl');
    });
  });
});
