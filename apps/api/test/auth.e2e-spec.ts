import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as argon2 from 'argon2';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ExchangeService } from '../src/modules/auth/services/exchange.service';
import { UsersService } from '../src/modules/users/users.service';

const PASSWORD = 'Sup3rSecret!pass';
const rand = () => Math.random().toString(36).slice(2, 10);
const uniqueEmail = (label: string) => `${label}-${rand()}@e2e.test`;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const GRACE_MS = 2000; // REFRESH_GRACE_SECONDS=2 (test/setup-env.ts)

describe('Auth & RBAC (e2e)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let users: UsersService;
  let exchange: ExchangeService;

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
    exchange = app.get(ExchangeService);
  });

  afterAll(async () => {
    await app?.close();
  });

  const signup = (label: string, extra: Record<string, unknown> = {}) =>
    request(server)
      .post('/api/auth/signup')
      .send({ name: 'E2E User', email: uniqueEmail(label), password: PASSWORD, ...extra });

  const login = (email: string) =>
    request(server).post('/api/auth/login').send({ email, password: PASSWORD });

  describe('POST /api/auth/signup', () => {
    it('creates a volunteer and returns a token pair + sanitized user', async () => {
      const email = uniqueEmail('signup');
      const res = await request(server)
        .post('/api/auth/signup')
        .send({ name: 'E2E Volunteer', email, password: PASSWORD })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.email).toBe(email);
      expect(res.body.user.role).toBe('volunteer');
      expect(res.body.user).not.toHaveProperty('passwordHash');
      expect(res.body.user).not.toHaveProperty('refreshTokenHash');
    });

    it('accepts an explicit self-assignable role', async () => {
      const res = await signup('org', { role: 'organisation' }).expect(201);
      expect(res.body.user.role).toBe('organisation');
    });

    it('rejects duplicate email with 409', async () => {
      const email = uniqueEmail('dupe');
      await request(server)
        .post('/api/auth/signup')
        .send({ name: 'Alice', email, password: PASSWORD })
        .expect(201);
      const res = await request(server)
        .post('/api/auth/signup')
        .send({ name: 'Bob', email, password: PASSWORD })
        .expect(409);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('rejects admin self-signup with 403', async () => {
      const res = await signup('evil', { role: 'admin' }).expect(403);
      expect(res.body.message).toMatch(/internally/i);
    });

    it('rejects a short password with 400', async () => {
      await request(server)
        .post('/api/auth/signup')
        .send({ name: 'Short', email: uniqueEmail('short'), password: '123' })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with correct credentials', async () => {
      const email = uniqueEmail('login');
      await request(server)
        .post('/api/auth/signup')
        .send({ name: 'Leo', email, password: PASSWORD })
        .expect(201);
      const res = await login(email).expect(200);
      expect(res.body.accessToken).toBeTruthy();
      expect(res.body.refreshToken).toBeTruthy();
    });

    it('rejects wrong password with 401', async () => {
      const email = uniqueEmail('badpw');
      await request(server)
        .post('/api/auth/signup')
        .send({ name: 'Bob', email, password: PASSWORD })
        .expect(201);
      const res = await request(server)
        .post('/api/auth/login')
        .send({ email, password: 'wrong-password' })
        .expect(401);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('rejects unknown email with 401 (same message)', async () => {
      const res = await login(uniqueEmail('ghost')).expect(401);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });
  });

  describe('GET /api/auth/me', () => {
    it('401 without a bearer token', async () => {
      await request(server).get('/api/auth/me').expect(401);
    });

    it('200 with a bearer token, returning the profile', async () => {
      const email = uniqueEmail('me');
      const created = await request(server)
        .post('/api/auth/signup')
        .send({ name: 'Me User', email, password: PASSWORD })
        .expect(201);
      const res = await request(server)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${created.body.accessToken}`)
        .expect(200);
      expect(res.body.email).toBe(email);
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('401 for a garbage token', async () => {
      await request(server)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer not.a.token')
        .expect(401);
    });
  });

  describe('refresh rotation, grace replay and reuse detection', () => {
    it('rotates, returns the same pair within grace, and revokes ALL sessions on stale replay', async () => {
      const email = uniqueEmail('rotate');
      const sessionA = await request(server)
        .post('/api/auth/signup')
        .send({ name: 'Alice', email, password: PASSWORD })
        .expect(201);
      const sessionB = await login(email).expect(200);

      // Rotation of session A.
      const rotated = await request(server)
        .post('/api/auth/refresh')
        .send({ refreshToken: sessionA.body.refreshToken })
        .expect(200);
      expect(rotated.body.refreshToken).not.toBe(sessionA.body.refreshToken);

      // Second tab replaying the old token inside the grace window gets the
      // SAME pair (idempotent) instead of being logged out.
      const replay = await request(server)
        .post('/api/auth/refresh')
        .send({ refreshToken: sessionA.body.refreshToken })
        .expect(200);
      expect(replay.body.refreshToken).toBe(rotated.body.refreshToken);
      expect(replay.body.accessToken).toBe(rotated.body.accessToken);

      // Session B still healthy right after rotation.
      const rotatedB = await request(server)
        .post('/api/auth/refresh')
        .send({ refreshToken: sessionB.body.refreshToken })
        .expect(200);

      // Past the grace window the old token is a replay → 401 + revoke-all.
      await delay(GRACE_MS + 300);
      await request(server)
        .post('/api/auth/refresh')
        .send({ refreshToken: sessionA.body.refreshToken })
        .expect(401);

      // Every other session of that user is dead now.
      await request(server)
        .post('/api/auth/refresh')
        .send({ refreshToken: rotated.body.refreshToken })
        .expect(401);
      await request(server)
        .post('/api/auth/refresh')
        .send({ refreshToken: rotatedB.body.refreshToken })
        .expect(401);
    });

    it('rejects a tampered token without killing other sessions', async () => {
      const email = uniqueEmail('tamper');
      const session = await request(server)
        .post('/api/auth/signup')
        .send({ name: 'Trent', email, password: PASSWORD })
        .expect(201);
      const other = await login(email).expect(200);

      const token = session.body.refreshToken as string;
      const tampered = `${token.slice(0, token.length - 3)}xyz`;
      await request(server)
        .post('/api/auth/refresh')
        .send({ refreshToken: tampered })
        .expect(401);

      await request(server)
        .post('/api/auth/refresh')
        .send({ refreshToken: other.body.refreshToken })
        .expect(200);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('revokes the session (204, then refresh fails)', async () => {
      const session = await signup('logout').expect(201);
      await request(server)
        .post('/api/auth/logout')
        .send({ refreshToken: session.body.refreshToken })
        .expect(204);
      await request(server)
        .post('/api/auth/refresh')
        .send({ refreshToken: session.body.refreshToken })
        .expect(401);
    });

    it('is idempotent for garbage tokens', async () => {
      await request(server)
        .post('/api/auth/logout')
        .send({ refreshToken: 'garbage-token-value-000' })
        .expect(204);
    });
  });

  describe('RBAC (@Roles)', () => {
    let volunteerToken: string;
    let adminToken: string;

    beforeAll(async () => {
      const volunteer = await signup('rbac-vol').expect(201);
      volunteerToken = volunteer.body.accessToken;

      const adminEmail = uniqueEmail('rbac-admin');
      await users.create({
        email: adminEmail,
        name: 'E2E Admin',
        passwordHash: await argon2.hash(PASSWORD),
        role: 'admin',
      });
      const adminLogin = await login(adminEmail).expect(200);
      adminToken = adminLogin.body.accessToken;
    });

    it('401 without a token', async () => {
      await request(server).get('/api/auth/admin/ping').expect(401);
    });

    it('403 when a volunteer hits an admin-only route', async () => {
      const res = await request(server)
        .get('/api/auth/admin/ping')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(403);
      expect(res.body.message).toMatch(/not permitted/i);
    });

    it('200 for an admin', async () => {
      const res = await request(server)
        .get('/api/auth/admin/ping')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body).toEqual({ ok: true, scope: 'admin' });
    });
  });

  describe('POST /api/auth/exchange (OAuth one-time codes)', () => {
    const provisionGoogleUser = async (label: string) =>
      users.create({
        email: uniqueEmail(label),
        name: 'Google User',
        role: 'volunteer',
        googleId: `gid-${rand()}`,
      });

    it('consumes a single-use code and returns a token pair', async () => {
      const user = await provisionGoogleUser('exch');
      const code = await exchange.issue(user.id);

      const res = await request(server)
        .post('/api/auth/exchange')
        .send({ code })
        .expect(200);
      expect(res.body.user.id).toBe(user.id);
      expect(res.body.accessToken).toBeTruthy();

      // Single use.
      await request(server).post('/api/auth/exchange').send({ code }).expect(401);
    });

    it('applies a one-time role choice while the account is provisional', async () => {
      const user = await provisionGoogleUser('exch-role');
      const code = await exchange.issue(user.id);

      const res = await request(server)
        .post('/api/auth/exchange')
        .send({ code, role: 'organisation' })
        .expect(200);
      expect(res.body.user.role).toBe('organisation');

      // Role is now locked: a second choice is refused.
      const secondCode = await exchange.issue(user.id);
      const denied = await request(server)
        .post('/api/auth/exchange')
        .send({ code: secondCode, role: 'mentor' })
        .expect(403);
      expect(denied.body.message).toMatch(/already been chosen/i);
    });

    it('rejects the admin role with 403', async () => {
      const user = await provisionGoogleUser('exch-admin');
      const code = await exchange.issue(user.id);
      const res = await request(server)
        .post('/api/auth/exchange')
        .send({ code, role: 'admin' })
        .expect(403);
      expect(res.body.message).toMatch(/internally/i);
    });

    it('rejects unknown or expired codes with 401', async () => {
      await request(server)
        .post('/api/auth/exchange')
        .send({ code: 'definitely-not-a-real-exchange-code' })
        .expect(401);
    });
  });

  describe('public surface', () => {
    it('serves feature-stub ping routes without auth', async () => {
      const res = await request(server).get('/api/volunteers/ping').expect(200);
      expect(res.body).toMatchObject({ module: 'volunteers', status: 'ok' });
    });

    it('returns 503 for Google OAuth until credentials are configured', async () => {
      await request(server).get('/api/auth/google').expect(503);
    });
  });
});
