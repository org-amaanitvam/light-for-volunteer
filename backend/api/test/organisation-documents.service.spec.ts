import { BadRequestException } from '@nestjs/common';
import { OrganisationDocument } from '../src/database/entities/organisation-document.entity';
import { OrganisationDocumentStatus } from '../src/database/enums/organisation-document-status.enum';
import { OrganisationDocumentType } from '../src/database/enums/organisation-document-type.enum';
import { OrganisationDocumentsService } from '../src/modules/organisations/organisation-documents.service';
import { OrganisationDocumentRulesService } from '../src/modules/organisations/organisation-document-rules.service';

describe('OrganisationDocumentsService completeness', () => {
  const service = new OrganisationDocumentsService(
    {} as never,
    {} as never,
    new OrganisationDocumentRulesService(),
    {} as never,
    {} as never,
  );

  const document = (
    documentType: OrganisationDocumentType,
    status: OrganisationDocumentStatus,
  ) => ({ documentType, status }) as OrganisationDocument;

  it('does not allow rejected or information-requested required documents at resubmission', () => {
    expect(() =>
      service.validateCompleteness('Other', [
        document(
          OrganisationDocumentType.REGISTRATION_CERTIFICATE,
          OrganisationDocumentStatus.REJECTED,
        ),
      ]),
    ).toThrow(BadRequestException);

    expect(() =>
      service.validateCompleteness('Other', [
        document(
          OrganisationDocumentType.REGISTRATION_CERTIFICATE,
          OrganisationDocumentStatus.NEEDS_INFO,
        ),
      ]),
    ).toThrow(/replace rejected or information-requested/i);
  });

  it('requires each required document to be approved before organisation approval', () => {
    expect(() =>
      service.validateApprovalCompleteness('Other', [
        document(
          OrganisationDocumentType.REGISTRATION_CERTIFICATE,
          OrganisationDocumentStatus.PENDING,
        ),
      ]),
    ).toThrow(/must be approved/i);

    expect(() =>
      service.validateApprovalCompleteness('Other', [
        document(
          OrganisationDocumentType.REGISTRATION_CERTIFICATE,
          OrganisationDocumentStatus.APPROVED,
        ),
      ]),
    ).not.toThrow();
  });
});
