import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/modules/users/users.service';
import { TokenService } from '../src/modules/auth/services/token.service';
import { OpportunityType } from '../src/database/enums/opportunity-type.enum';
import { LocationType } from '../src/database/enums/location-type.enum';
import { OpportunityStatus } from '../src/database/enums/opportunity-status.enum';

const rand = () => Math.random().toString(36).slice(2, 10);
const uniqueEmail = (label: string) => `${label}-${rand()}@e2e.test`;

describe('Opportunities & Search Module (e2e)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let users: UsersService;
  let tokens: TokenService;

  let orgUser: any;
  let orgToken: string;
  let adminUser: any;
  let adminToken: string;
  let volUser: any;
  let volToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();
    server = app.getHttpServer();
    users = app.get(UsersService);
    tokens = app.get(TokenService);

    // Setup Organisation user & JWT
    orgUser = await users.create({
      name: 'Hope EdTech Foundation',
      email: uniqueEmail('org'),
      role: 'organisation',
    });
    orgToken = await tokens.signAccessToken({
      id: orgUser.id,
      email: orgUser.email,
      role: 'organisation',
    });

    // Setup Admin user & JWT
    adminUser = await users.create({
      name: 'Admin Moderator',
      email: uniqueEmail('admin'),
      role: 'admin',
    });
    adminToken = await tokens.signAccessToken({
      id: adminUser.id,
      email: adminUser.email,
      role: 'admin',
    });

    // Setup Volunteer user & JWT
    volUser = await users.create({
      name: 'Volunteer User',
      email: uniqueEmail('volunteer'),
      role: 'volunteer',
    });
    volToken = await tokens.signAccessToken({
      id: volUser.id,
      email: volUser.email,
      role: 'volunteer',
    });
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('Module Health Ping Endpoints', () => {
    it('GET /api/opportunities/ping returns ok and owner Aryan', async () => {
      const res = await request(server).get('/api/opportunities/ping').expect(200);
      expect(res.body).toEqual({ module: 'opportunities', status: 'ok', owner: 'Aryan' });
    });

    it('GET /api/search/ping returns ok and owner Aryan', async () => {
      const res = await request(server).get('/api/search/ping').expect(200);
      expect(res.body).toEqual({ module: 'search', status: 'ok', owner: 'Aryan' });
    });
  });

  describe('Categories Discovery', () => {
    it('GET /api/opportunities/categories returns list of categories', async () => {
      const res = await request(server).get('/api/opportunities/categories').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('count');
      expect(res.body[0]).toHaveProperty('active');
    });
  });

  describe('Opportunity Lifecycle & Status Workflow', () => {
    let createdOppId: string;

    it('Organisation creates an opportunity as DRAFT (POST /api/opportunities)', async () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 2);

      const res = await request(server)
        .post('/api/opportunities')
        .set('Authorization', `Bearer ${orgToken}`)
        .send({
          title: 'Youth Coding & Digital Literacy Mentor',
          description: 'Help young students develop coding skills and improve their digital literacy.',
          type: OpportunityType.VOLUNTEERING,
          category: 'Education & Literacy',
          skillsRequired: ['Teaching', 'Programming', 'Communication'],
          locationType: LocationType.HYBRID,
          city: 'New Delhi',
          duration: '3 months',
          pointsReward: 50,
          openings: 3,
          deadline: futureDate.toISOString(),
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Youth Coding & Digital Literacy Mentor');
      expect(res.body.status).toBe(OpportunityStatus.DRAFT);
      expect(res.body.organisation.org_name).toBe('Hope EdTech Foundation');

      createdOppId = res.body.id;
    });

    it('Public visitors cannot see DRAFT opportunity in listings', async () => {
      const res = await request(server).get('/api/opportunities').expect(200);
      const found = res.body.data.find((item: any) => item.id === createdOppId);
      expect(found).toBeUndefined();
    });

    it('Public visitors get 404 when directly requesting DRAFT opportunity', async () => {
      await request(server).get(`/api/opportunities/${createdOppId}`).expect(404);
    });

    it('Organisation owner can view their DRAFT opportunity', async () => {
      const res = await request(server)
        .get(`/api/opportunities/${createdOppId}`)
        .set('Authorization', `Bearer ${orgToken}`)
        .expect(200);

      expect(res.body.id).toBe(createdOppId);
      expect(res.body.status).toBe(OpportunityStatus.DRAFT);
    });

    it('Organisation submits DRAFT for review (POST /api/opportunities/:id/submit)', async () => {
      const res = await request(server)
        .post(`/api/opportunities/${createdOppId}/submit`)
        .set('Authorization', `Bearer ${orgToken}`)
        .expect(201);

      expect(res.body.id).toBe(createdOppId);
      expect(res.body.status).toBe(OpportunityStatus.PENDING_REVIEW);
    });

    it('Admin reviews and approves opportunity to LIVE (PATCH /api/admin/opportunities/:id/review)', async () => {
      const res = await request(server)
        .patch(`/api/admin/opportunities/${createdOppId}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' })
        .expect(200);

      expect(res.body.status).toBe(OpportunityStatus.LIVE);
    });

    it('Public visitors CAN now see LIVE opportunity in GET /api/opportunities', async () => {
      const res = await request(server).get('/api/opportunities').expect(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      const found = res.body.data.find((item: any) => item.id === createdOppId);
      expect(found).toBeDefined();
      expect(found.title).toBe('Youth Coding & Digital Literacy Mentor');
    });

    it('Search index has synchronized: GET /api/search/opportunities finds the live listing', async () => {
      const res = await request(server)
        .get('/api/search/opportunities?search=Coding')
        .expect(200);

      expect(res.body.data.length).toBeGreaterThan(0);
      const found = res.body.data.find((item: any) => item.id === createdOppId);
      expect(found).toBeDefined();
      expect(res.body.meta).toHaveProperty('facets');
    });

    it('Search facets endpoint returns category and location aggregates', async () => {
      const res = await request(server).get('/api/search/facets').expect(200);
      expect(res.body).toHaveProperty('categories');
      expect(res.body).toHaveProperty('types');
      expect(res.body).toHaveProperty('locationTypes');
    });

    it('Organisation updates opportunity details (PATCH /api/opportunities/:id)', async () => {
      const res = await request(server)
        .patch(`/api/opportunities/${createdOppId}`)
        .set('Authorization', `Bearer ${orgToken}`)
        .send({
          title: 'Advanced Youth Coding & AI Mentor',
          openings: 5,
        })
        .expect(200);

      expect(res.body.title).toBe('Advanced Youth Coding & AI Mentor');
      expect(res.body.openings).toBe(5);
    });

    it('Organisation views their own opportunities list (GET /api/opportunities/mine)', async () => {
      const res = await request(server)
        .get('/api/opportunities/mine')
        .set('Authorization', `Bearer ${orgToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find((item: any) => item.id === createdOppId);
      expect(found).toBeDefined();
      expect(found).toHaveProperty('applicant_stats');
    });

    it('Organisation closes opportunity (POST /api/opportunities/:id/close)', async () => {
      const res = await request(server)
        .post(`/api/opportunities/${createdOppId}/close`)
        .set('Authorization', `Bearer ${orgToken}`)
        .expect(201);

      expect(res.body.status).toBe(OpportunityStatus.CLOSED);
    });

    it('Closed opportunity is removed from search index', async () => {
      const res = await request(server)
        .get('/api/search/opportunities?search=Advanced')
        .expect(200);

      const found = res.body.data.find((item: any) => item.id === createdOppId);
      expect(found).toBeUndefined();
    });

    it('Organisation reopens opportunity (POST /api/opportunities/:id/reopen)', async () => {
      const res = await request(server)
        .post(`/api/opportunities/${createdOppId}/reopen`)
        .set('Authorization', `Bearer ${orgToken}`)
        .expect(201);

      expect(res.body.status).toBe(OpportunityStatus.PENDING_REVIEW);
    });

    it('Non-owner cannot delete opportunity', async () => {
      await request(server)
        .delete(`/api/opportunities/${createdOppId}`)
        .set('Authorization', `Bearer ${volToken}`)
        .expect(403);
    });

    it('Admin or owner can delete opportunity (DELETE /api/opportunities/:id)', async () => {
      const res = await request(server)
        .delete(`/api/opportunities/${createdOppId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toEqual({
        message: 'Opportunity deleted successfully',
        id: createdOppId,
      });
    });
  });
});
