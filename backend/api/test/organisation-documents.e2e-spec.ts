import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Organisation } from '../src/database/entities/organisation.entity';
import { OrganisationDocument } from '../src/database/entities/organisation-document.entity';
import { OrganisationMember } from '../src/database/entities/organisation-member.entity';
import { OrganisationDocumentStatus } from '../src/database/enums/organisation-document-status.enum';
import { OrganisationDocumentType } from '../src/database/enums/organisation-document-type.enum';
import { OrganisationMemberRole } from '../src/database/enums/organisation-member-role.enum';
import { OrganisationMemberStatus } from '../src/database/enums/organisation-member-status.enum';
import { VerificationStatus } from '../src/database/enums/verification-status.enum';
import { StorageService } from '../src/modules/storage/storage.service';

const PASSWORD = 'Sup3rSecret!pass';
const rand = () => Math.random().toString(36).slice(2, 10);
const uniqueEmail = (label: string) =>
  `${label}-${rand()}@e2e.test`;

describe('Organisation documents (e2e)', () => {
  let app: INestApplication;
  let server: ReturnType<INestApplication['getHttpServer']>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const storageStub = {
      verifyUpload: jest.fn(async (_user, key: string) => ({
        success: true,
        key,
        size: 1024,
        contentType: 'application/pdf',
      })),
      deleteObject: jest.fn(async (_user, dto: { key: string }) => ({
        success: true,
        key: dto.key,
      })),
      createDownloadUrl: jest.fn(async (_user, dto: { key: string }) => ({
        downloadUrl: `https://example.test/${dto.key}`,
        expiresIn: 300,
        key: dto.key,
      })),
      getProviderName: jest.fn(() => 'r2'),
      createOrganisationDocumentDownloadUrl: jest.fn(
        async (_user, key: string) => ({
          downloadUrl: `https://example.test/private/${encodeURIComponent(key)}`,
          expiresIn: 300,
        }),
      ),
      deleteOrganisationDocumentObject: jest.fn(async () => undefined),
    };

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(StorageService)
      .useValue(storageStub)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    server = app.getHttpServer();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app?.close();
  });

  const signup = async (
    label: string,
    role: 'volunteer' | 'organisation' = 'organisation',
  ) => {
    const response = await request(server)
      .post('/api/auth/signup')
      .send({
        name: `E2E ${label}`,
        email: uniqueEmail(label),
        password: PASSWORD,
        role,
      })
      .expect(201);

    return {
      token: response.body.accessToken as string,
      userId: response.body.user.id as string,
    };
  };

  const auth = (token: string) => ({
    Authorization: `Bearer ${token}`,
  });

  const documentPayload = (
    userId: string,
    documentType: OrganisationDocumentType,
  ) => ({
    documentType,
    storageKey: `verification-documents/${userId}/${randomUUID()}.pdf`,
    originalFileName: 'organisation-document.pdf',
    mimeType: 'application/pdf',
    fileSize: 1024,
  });

  const addMembership = (
    organisationId: string,
    userId: string,
    role: OrganisationMemberRole,
    status: OrganisationMemberStatus,
  ) =>
    dataSource.getRepository(OrganisationMember).save(
      dataSource.getRepository(OrganisationMember).create({
        organisation: { id: organisationId },
        user: { id: userId },
        role,
        status,
      }),
    );

  it('returns NGO requirements and rejects an incomplete resubmission', async () => {
    const owner = await signup('document-owner');
    const organisation = await request(server)
      .post('/api/organisations')
      .set(auth(owner.token))
      .send({
        orgName: 'E2E NGO',
        registrationType: 'Trust',
      })
      .expect(201);

    await request(server)
      .get('/api/organisations/me/documents/required')
      .set(auth(owner.token))
      .expect(200)
      .expect(({ body }) => {
        expect(body.organisationCategory).toBe('ngo');
        expect(body.requiredDocuments.map((item: { type: string }) => item.type))
          .toEqual(expect.arrayContaining([
            'registration_certificate',
            'pan_certificate',
            'certificate_12a',
            'certificate_80g',
            'darpan_id',
          ]));
      });

    await dataSource
      .getRepository(Organisation)
      .update(organisation.body.id, {
        verification_status: VerificationStatus.REJECTED,
      });

    await request(server)
      .post('/api/organisations/me/resubmit')
      .set(auth(owner.token))
      .expect(400);
  });

  it('returns policies for every declared registration type and rejects unknown types', async () => {
    const owner = await signup('requirements-all-types');
    const organisation = await request(server)
      .post('/api/organisations')
      .set(auth(owner.token))
      .send({ orgName: 'E2E Requirements Coverage' })
      .expect(201);
    const organisations = dataSource.getRepository(Organisation);

    const policies = [
      {
        registrationTypes: [
          'ngo',
          'non governmental organisation',
          'non governmental organization',
          'non governmental organisation ngo',
          'non profit',
          'trust',
          'society',
          'trust society',
          'section 8',
          'section 8 company',
          'darpan',
          'darpan registered',
          'charitable foundation',
        ],
        category: 'ngo',
        required: [
          OrganisationDocumentType.REGISTRATION_CERTIFICATE,
          OrganisationDocumentType.PAN_CERTIFICATE,
          OrganisationDocumentType.CERTIFICATE_12A,
          OrganisationDocumentType.CERTIFICATE_80G,
          OrganisationDocumentType.DARPAN_ID,
        ],
        groups: [],
        optional: [],
      },
      {
        registrationTypes: ['company', 'private limited', 'llp', 'corporate'],
        category: 'company',
        required: [
          OrganisationDocumentType.CIN_CERTIFICATE,
          OrganisationDocumentType.AUTHORISATION_LETTER,
        ],
        groups: [[
          OrganisationDocumentType.GST_CERTIFICATE,
          OrganisationDocumentType.PAN_CERTIFICATE,
        ]],
        optional: [],
      },
      {
        registrationTypes: [
          'institution',
          'college',
          'university',
          'school',
          'research institution',
        ],
        category: 'institution',
        required: [OrganisationDocumentType.AFFILIATION_PROOF],
        groups: [],
        optional: [],
      },
      {
        registrationTypes: ['other', 'community initiative'],
        category: 'other',
        required: [OrganisationDocumentType.REGISTRATION_CERTIFICATE],
        groups: [],
        optional: [OrganisationDocumentType.PAN_CERTIFICATE],
      },
    ] as const;

    for (const policy of policies) {
      for (const registrationType of policy.registrationTypes) {
        await organisations.update(organisation.body.id, {
          registration_type: registrationType,
        });

        const response = await request(server)
          .get('/api/organisations/me/documents/required')
          .set(auth(owner.token))
          .expect(200);

        expect(response.body.organisationCategory).toBe(policy.category);
        expect(response.body.requiredDocuments.map((item: { type: string }) => item.type))
          .toEqual(policy.required);
        expect(
          response.body.requiredDocumentGroups.map(
            (group: { oneOf: string[] }) => group.oneOf,
          ),
        ).toEqual(policy.groups);
        expect(response.body.optionalDocuments.map((item: { type: string }) => item.type))
          .toEqual(policy.optional);
      }
    }

    await organisations.update(organisation.body.id, {
      registration_type: 'unsupported registration type',
    });
    await request(server)
      .get('/api/organisations/me/documents/required')
      .set(auth(owner.token))
      .expect(400);
  });

  it('keeps Other optional PAN from satisfying required-document completeness', async () => {
    const owner = await signup('other-completeness');
    const organisation = await request(server)
      .post('/api/organisations')
      .set(auth(owner.token))
      .send({ orgName: 'E2E Other Completeness', registrationType: 'Other' })
      .expect(201);
    await dataSource.getRepository(Organisation).update(organisation.body.id, {
      verification_status: VerificationStatus.REJECTED,
    });

    const optionalDocument = await request(server)
      .post('/api/organisations/me/documents')
      .set(auth(owner.token))
      .send(documentPayload(owner.userId, OrganisationDocumentType.PAN_CERTIFICATE))
      .expect(201);
    expect(optionalDocument.body.isRequired).toBe(false);
    await request(server)
      .post('/api/organisations/me/resubmit')
      .set(auth(owner.token))
      .expect(400);

    const requiredDocument = await request(server)
      .post('/api/organisations/me/documents')
      .set(auth(owner.token))
      .send(documentPayload(owner.userId, OrganisationDocumentType.REGISTRATION_CERTIFICATE))
      .expect(201);
    expect(requiredDocument.body.isRequired).toBe(true);
    const resubmitted = await request(server)
      .post('/api/organisations/me/resubmit')
      .set(auth(owner.token))
      .expect(200);
    expect(resubmitted.body.verificationStatus).toBe('pending');
  });

  it('attaches a verified object once and denies recruiter owner actions', async () => {
    const owner = await signup('document-owner-2');
    const organisation = await request(server)
      .post('/api/organisations')
      .set(auth(owner.token))
      .send({
        orgName: 'E2E Company',
        registrationType: 'Company',
      })
      .expect(201);

    const key = `verification-documents/${owner.userId}/${randomUUID()}.pdf`;
    const payload = {
      ...documentPayload(owner.userId, OrganisationDocumentType.CIN_CERTIFICATE),
      storageKey: key,
      originalFileName: 'cin.pdf',
    };

    const attached = await request(server)
      .post('/api/organisations/me/documents')
      .set(auth(owner.token))
      .send(payload)
      .expect(201);
    expect(attached.body).not.toHaveProperty('fileKey');
    const persisted = await dataSource.getRepository(OrganisationDocument).findOne({
      where: { id: attached.body.id },
      relations: {
        organisation: true,
        uploadedBy: true,
        uploadedByMembership: true,
      },
    });
    const ownerMembership = await dataSource.getRepository(OrganisationMember).findOne({
      where: {
        organisation: { id: organisation.body.id },
        user: { id: owner.userId },
      },
    });
    expect(persisted).toMatchObject({
      documentType: OrganisationDocumentType.CIN_CERTIFICATE,
      status: OrganisationDocumentStatus.PENDING,
      isRequired: true,
    });
    expect(persisted?.organisation.id).toBe(organisation.body.id);
    expect(persisted?.uploadedBy?.id).toBe(owner.userId);
    expect(persisted?.uploadedByMembership?.id).toBe(ownerMembership?.id);

    await request(server)
      .get('/api/organisations/me/documents')
      .set(auth(owner.token))
      .expect(200)
      .expect(({ body }) => {
        expect(body[0].id).toBe(attached.body.id);
        expect(body[0]).not.toHaveProperty('fileKey');
      });

    await request(server)
      .get(`/api/organisations/me/documents/${attached.body.id}/download`)
      .set(auth(owner.token))
      .expect(200)
      .expect(({ body }) => {
        expect(body.downloadUrl).toContain('/private/');
        expect(body).not.toHaveProperty('key');
      });

    const otherOwner = await signup('document-other-owner');
    await request(server)
      .post('/api/organisations')
      .set(auth(otherOwner.token))
      .send({ orgName: 'Different Company', registrationType: 'Company' })
      .expect(201);

    await request(server)
      .get(`/api/organisations/me/documents/${attached.body.id}/download`)
      .set(auth(otherOwner.token))
      .expect(404);

    await request(server)
      .post('/api/organisations/me/documents')
      .set(auth(owner.token))
      .send(payload)
      .expect(409);

    const recruiter = await signup('document-recruiter');
    await dataSource.getRepository(OrganisationMember).save(
      dataSource.getRepository(OrganisationMember).create({
        organisation: { id: organisation.body.id },
        user: { id: recruiter.userId },
        role: OrganisationMemberRole.RECRUITER,
        status: OrganisationMemberStatus.APPROVED,
      }),
    );

    await request(server)
      .post('/api/organisations/me/documents')
      .set(auth(recruiter.token))
      .send({
        ...payload,
        storageKey: `verification-documents/${recruiter.userId}/${randomUUID()}.pdf`,
      })
      .expect(403);
  });

  it('rejects invalid document type, MIME, size, metadata, and uploader ownership', async () => {
    const owner = await signup('document-invalid-payload');
    await request(server)
      .post('/api/organisations')
      .set(auth(owner.token))
      .send({ orgName: 'E2E Invalid Upload Company', registrationType: 'Company' })
      .expect(201);

    await request(server)
      .post('/api/organisations/me/documents')
      .set(auth(owner.token))
      .send(documentPayload(owner.userId, OrganisationDocumentType.REGISTRATION_CERTIFICATE))
      .expect(400);
    await request(server)
      .post('/api/organisations/me/documents')
      .set(auth(owner.token))
      .send({
        ...documentPayload(owner.userId, OrganisationDocumentType.CIN_CERTIFICATE),
        mimeType: 'image/png',
      })
      .expect(400);
    await request(server)
      .post('/api/organisations/me/documents')
      .set(auth(owner.token))
      .send({
        ...documentPayload(owner.userId, OrganisationDocumentType.CIN_CERTIFICATE),
        fileSize: 10 * 1024 * 1024 + 1,
      })
      .expect(400);
    await request(server)
      .post('/api/organisations/me/documents')
      .set(auth(owner.token))
      .send({
        documentType: OrganisationDocumentType.CIN_CERTIFICATE,
        storageKey: `verification-documents/${owner.userId}/${randomUUID()}.pdf`,
        mimeType: 'application/pdf',
        fileSize: 1024,
      })
      .expect(400);

    const otherUser = await signup('document-foreign-uploader');
    await request(server)
      .post('/api/organisations/me/documents')
      .set(auth(owner.token))
      .send({
        ...documentPayload(owner.userId, OrganisationDocumentType.CIN_CERTIFICATE),
        storageKey: `verification-documents/${otherUser.userId}/${randomUUID()}.pdf`,
      })
      .expect(403);
  });

  it('replaces an existing document without creating a duplicate and resets review status', async () => {
    const owner = await signup('document-replacement');
    const organisation = await request(server)
      .post('/api/organisations')
      .set(auth(owner.token))
      .send({ orgName: 'E2E Document Replacement', registrationType: 'Other' })
      .expect(201);
    const original = await request(server)
      .post('/api/organisations/me/documents')
      .set(auth(owner.token))
      .send(documentPayload(owner.userId, OrganisationDocumentType.REGISTRATION_CERTIFICATE))
      .expect(201);

    await dataSource.getRepository(OrganisationDocument).update(original.body.id, {
      status: OrganisationDocumentStatus.REJECTED,
      rejectionReason: 'Document is not legible',
    });

    const replacementPayload = {
      ...documentPayload(owner.userId, OrganisationDocumentType.REGISTRATION_CERTIFICATE),
      originalFileName: 'replacement-registration.pdf',
    };
    const replacement = await request(server)
      .patch(`/api/organisations/me/documents/${original.body.id}`)
      .set(auth(owner.token))
      .send(replacementPayload)
      .expect(200);
    expect(replacement.body.id).toBe(original.body.id);
    expect(replacement.body.originalFileName).toBe('replacement-registration.pdf');
    expect(replacement.body.status).toBe(OrganisationDocumentStatus.PENDING);
    expect(replacement.body.rejectionReason).toBeNull();

    const documents = await dataSource.getRepository(OrganisationDocument).find({
      where: { organisation: { id: organisation.body.id } },
    });
    expect(documents).toHaveLength(1);
    expect(documents[0]?.fileKey).toBe(replacementPayload.storageKey);
  });

  it('allows approved members to read documents but rejects pending, rejected, and other-org access', async () => {
    const owner = await signup('document-owner-3');
    const organisation = await request(server)
      .post('/api/organisations')
      .set(auth(owner.token))
      .send({
        orgName: 'E2E Institution',
        registrationType: 'Institution',
      })
      .expect(201);
    const uploaded = await request(server)
      .post('/api/organisations/me/documents')
      .set(auth(owner.token))
      .send(documentPayload(owner.userId, OrganisationDocumentType.AFFILIATION_PROOF))
      .expect(201);

    const viewer = await signup('document-viewer');
    await addMembership(
      organisation.body.id,
      viewer.userId,
      OrganisationMemberRole.VIEWER,
      OrganisationMemberStatus.APPROVED,
    );

    await request(server)
      .get('/api/organisations/me/documents')
      .set(auth(viewer.token))
      .expect(200);

    await request(server)
      .get('/api/organisations/me/documents/required')
      .set(auth(viewer.token))
      .expect(200);
    await request(server)
      .get(`/api/organisations/me/documents/${uploaded.body.id}/download`)
      .set(auth(viewer.token))
      .expect(200);

    await request(server)
      .patch('/api/organisations/me')
      .set(auth(viewer.token))
      .send({ about: 'Not allowed' })
      .expect(404);

    const pendingMember = await signup('document-pending-member');
    const rejectedMember = await signup('document-rejected-member');
    const unaffiliatedUser = await signup('document-unaffiliated-user');
    await addMembership(
      organisation.body.id,
      pendingMember.userId,
      OrganisationMemberRole.VIEWER,
      OrganisationMemberStatus.PENDING,
    );
    await addMembership(
      organisation.body.id,
      rejectedMember.userId,
      OrganisationMemberRole.VIEWER,
      OrganisationMemberStatus.REJECTED,
    );

    for (const user of [pendingMember, rejectedMember, unaffiliatedUser]) {
      await request(server)
        .get('/api/organisations/me/documents')
        .set(auth(user.token))
        .expect(403);
      await request(server)
        .get(`/api/organisations/me/documents/${uploaded.body.id}/download`)
        .set(auth(user.token))
        .expect(403);
    }

    const otherOwner = await signup('document-other-organisation');
    await request(server)
      .post('/api/organisations')
      .set(auth(otherOwner.token))
      .send({ orgName: 'E2E Separate Organisation', registrationType: 'Other' })
      .expect(201);
    await request(server)
      .get(`/api/organisations/me/documents/${uploaded.body.id}/download`)
      .set(auth(otherOwner.token))
      .expect(404);
    await request(server).get('/api/organisations/me/documents').expect(401);
  });
});
