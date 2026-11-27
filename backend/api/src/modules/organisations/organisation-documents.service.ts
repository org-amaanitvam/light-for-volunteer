import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrganisationDocument } from '../../database/entities/organisation-document.entity';
import { OrganisationDocumentStatus } from '../../database/enums/organisation-document-status.enum';
import { CreateOrganisationDocumentDto } from '../../dtos/organisation-document/create-organisation-document.dto';
import type { JwtAccessPayload } from '../auth/interfaces/jwt-payload.interface';
import { StorageService } from '../storage/storage.service';
import { OrganisationAccessService } from './organisation-access.service';
import { OrganisationDocumentRulesService } from './organisation-document-rules.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrganisationDocumentsService {
  private readonly logger = new Logger(OrganisationDocumentsService.name);

  constructor(
    @InjectRepository(OrganisationDocument)
    private readonly documents: Repository<OrganisationDocument>,
    private readonly storage: StorageService,
    private readonly rules: OrganisationDocumentRulesService,
    private readonly dataSource: DataSource,
    private readonly access: OrganisationAccessService,
  ) {}

  async getRequiredDocuments(userId: string) {
    const membership = await this.access.requireApprovedMembership(userId);
    return this.rules.getRequirements(membership.organisation.registration_type);
  }

  async list(userId: string) {
    const membership = await this.access.requireApprovedMembership(userId);
    const documents = await this.documents.find({
      where: { organisation: { id: membership.organisation.id } },
      relations: { reviewedBy: true },
      order: { createdAt: 'DESC' },
    });

    return documents.map((document) => this.toResponse(document));
  }

  async getDownloadUrl(user: JwtAccessPayload, documentId: string) {
    const membership = await this.access.requireApprovedMembership(user.sub);
    const document = await this.documents.findOne({
      where: {
        id: documentId,
        organisation: { id: membership.organisation.id },
      },
      relations: { uploadedBy: true },
    });

    if (!document || !document.uploadedBy?.id) {
      throw new NotFoundException('Organisation document not found');
    }

    return this.storage.createOrganisationDocumentDownloadUrl(
      user,
      document.fileKey,
      document.uploadedBy.id,
    );
  }

  async attach(user: JwtAccessPayload, dto: CreateOrganisationDocumentDto) {
    const membership = await this.access.requireApprovedOwnerMembership(user.sub);
    const organisation = membership.organisation;
    await this.validateDocument(user, organisation.registration_type, dto);

    return this.dataSource.transaction(async (manager) => {
      const documentRepository = manager.getRepository(OrganisationDocument);
      const existing = await documentRepository.findOne({
        where: {
          organisation: { id: organisation.id },
          documentType: dto.documentType,
        },
      });

      if (existing) {
        throw new ConflictException(
          'This document type already exists; use the replacement endpoint',
        );
      }

      const requirements = this.rules.getRequirements(organisation.registration_type);
      const isRequired =
        requirements.requiredDocuments.some((item) => item.type === dto.documentType) ||
        requirements.requiredDocumentGroups.some((group) =>
          group.oneOf.includes(dto.documentType),
        );

      const document = documentRepository.create({
        organisation,
        uploadedByMembership: membership,
        documentType: dto.documentType,
        fileKey: dto.storageKey,
        storageProvider: this.storage.getProviderName(),
        originalFileName: dto.originalFileName,
        mimeType: dto.mimeType,
        fileSize: dto.fileSize,
        status: OrganisationDocumentStatus.PENDING,
        isRequired,
        rejectionReason: null,
        uploadedBy: { id: user.sub },
        reviewedBy: null,
        reviewedAt: null,
      });

      return this.toResponse(await documentRepository.save(document));
    });
  }

  async replace(
    user: JwtAccessPayload,
    documentId: string,
    dto: CreateOrganisationDocumentDto,
  ) {
    const membership = await this.access.requireApprovedOwnerMembership(user.sub);
    const organisation = membership.organisation;
    await this.validateDocument(user, organisation.registration_type, dto);

    const replacement = await this.dataSource.transaction(async (manager) => {
      const documentRepository = manager.getRepository(OrganisationDocument);
      const document = await documentRepository.findOne({
        where: {
          id: documentId,
          organisation: { id: organisation.id },
        },
      });

      if (!document) {
        throw new NotFoundException('Organisation document not found');
      }

      if (document.status === OrganisationDocumentStatus.APPROVED) {
        throw new ConflictException('Approved documents cannot be replaced directly');
      }

      if (document.documentType !== dto.documentType) {
        throw new BadRequestException('Replacement must use the existing document type');
      }

      const oldFileKey = document.fileKey;
      const oldUploaderId = document.uploadedBy?.id;
      document.fileKey = dto.storageKey;
      document.storageProvider = this.storage.getProviderName();
      document.originalFileName = dto.originalFileName;
      document.mimeType = dto.mimeType;
      document.fileSize = dto.fileSize;
      document.status = OrganisationDocumentStatus.PENDING;
      document.rejectionReason = null;
      document.uploadedBy = { id: user.sub } as User;
      document.uploadedByMembership = membership;
      document.reviewedBy = null;
      document.reviewedAt = null;

      return {
        saved: await documentRepository.save(document),
        oldFileKey,
        oldUploaderId,
      };
    });

    if (
      replacement.oldUploaderId &&
      replacement.oldFileKey !== dto.storageKey
    ) {
      try {
        await this.storage.deleteOrganisationDocumentObject(
          user,
          replacement.oldFileKey,
          replacement.oldUploaderId,
        );
      } catch (error) {
        this.logger.warn(
          `Could not remove superseded organisation document object for document ${documentId}: ${
            error instanceof Error ? error.message : 'unknown storage error'
          }`,
        );
      }
    }

    return this.toResponse(replacement.saved);
  }

  validateCompleteness(
    registrationType: string | null,
    documents: OrganisationDocument[],
  ): void {
    this.rules.validateCompleteness(
      registrationType,
      documents.map((document) => document.documentType),
    );
    const requirements = this.rules.getRequirements(registrationType);
    const rejectedStatuses = new Set([
      OrganisationDocumentStatus.REJECTED,
      OrganisationDocumentStatus.NEEDS_INFO,
    ]);

    const missing: string[] = requirements.requiredDocuments
      .filter(
        (required) =>
          !documents.some(
            (document) =>
              document.documentType === required.type &&
              !rejectedStatuses.has(document.status),
          ),
      )
      .map((required) => required.type as string);

    for (const group of requirements.requiredDocumentGroups) {
      if (
        !group.oneOf.some((type) =>
          documents.some(
            (document) =>
              document.documentType === type &&
              !rejectedStatuses.has(document.status),
          ),
        )
      ) {
        missing.push(group.oneOf.join(' or '));
      }
    }

    if (missing.length > 0) {
      throw new BadRequestException(
        `Replace rejected or information-requested required documents before resubmitting: ${missing.join(', ')}`,
      );
    }
  }

  validateApprovalCompleteness(
    registrationType: string | null,
    documents: OrganisationDocument[],
  ): void {
    this.rules.validateCompleteness(
      registrationType,
      documents.map((document) => document.documentType),
    );
    const requirements = this.rules.getRequirements(registrationType);
    const missing: string[] = requirements.requiredDocuments
      .filter(
        (required) =>
          !documents.some(
            (document) =>
              document.documentType === required.type &&
              document.status === OrganisationDocumentStatus.APPROVED,
          ),
      )
      .map((required) => required.type);

    for (const group of requirements.requiredDocumentGroups) {
      if (
        !group.oneOf.some((type) =>
          documents.some(
            (document) =>
              document.documentType === type &&
              document.status === OrganisationDocumentStatus.APPROVED,
          ),
        )
      ) {
        missing.push(group.oneOf.join(' or '));
      }
    }

    if (missing.length > 0) {
      throw new BadRequestException(
        `Required documents must be approved before organisation verification: ${missing.join(', ')}`,
      );
    }
  }

  private async validateDocument(
    user: JwtAccessPayload,
    registrationType: string | null,
    dto: CreateOrganisationDocumentDto,
  ): Promise<void> {
    if (!this.rules.isSupportedDocumentType(registrationType, dto.documentType)) {
      throw new BadRequestException(
        `Document type ${dto.documentType} is not supported for ${registrationType || 'this organisation type'}`,
      );
    }

    const ownPrefix = `verification-documents/${user.sub}/`;
    if (!dto.storageKey.startsWith(ownPrefix)) {
      throw new ForbiddenException(
        'Storage key does not belong to the authenticated uploader',
      );
    }

    const verified = await this.storage.verifyUpload(user, dto.storageKey);
    if (verified.contentType !== dto.mimeType) {
      throw new BadRequestException('Uploaded MIME type does not match the stored object');
    }
    if (verified.size !== dto.fileSize) {
      throw new BadRequestException('Uploaded file size does not match the stored object');
    }
  }

  private toResponse(document: OrganisationDocument) {
    return {
      id: document.id,
      organisationId: document.organisation?.id ?? null,
      documentType: document.documentType,
      storageProvider: document.storageProvider,
      originalFileName: document.originalFileName,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      status: document.status,
      isRequired: document.isRequired,
      rejectionReason: document.rejectionReason,
      reviewedBy: document.reviewedBy?.id ?? null,
      reviewedAt: document.reviewedAt,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
