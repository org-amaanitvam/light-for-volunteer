import { BadRequestException, Injectable } from '@nestjs/common';
import { OrganisationDocumentType } from '../../database/enums/organisation-document-type.enum';

export interface RequiredOrganisationDocument {
  type: OrganisationDocumentType;
  required: true;
}

export interface OrganisationDocumentRequirements {
  registrationType: string;
  organisationCategory: 'ngo' | 'company' | 'institution' | 'other';
  requiredDocuments: RequiredOrganisationDocument[];
  requiredDocumentGroups: {
    oneOf: OrganisationDocumentType[];
    required: true;
  }[];
  optionalDocuments: {
    type: OrganisationDocumentType;
    required: false;
  }[];
}

const NGO_TYPES = new Set([
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
]);

const INSTITUTION_TYPES = new Set([
  'institution',
  'college',
  'university',
  'school',
  'research institution',
]);

const COMPANY_TYPES = new Set([
  'company',
  'private limited',
  'llp',
  'corporate',
]);

@Injectable()
export class OrganisationDocumentRulesService {
  getRequirements(
    registrationType: string | null | undefined,
  ): OrganisationDocumentRequirements {
    const normalised = this.normalise(registrationType);
    let organisationCategory: OrganisationDocumentRequirements['organisationCategory'];
    let requiredTypes: OrganisationDocumentType[];
    let requiredDocumentGroups: OrganisationDocumentRequirements['requiredDocumentGroups'] = [];
    let optionalTypes: OrganisationDocumentType[] = [];

    if (NGO_TYPES.has(normalised)) {
      organisationCategory = 'ngo';
      requiredTypes = [
        OrganisationDocumentType.REGISTRATION_CERTIFICATE,
        OrganisationDocumentType.PAN_CERTIFICATE,
        OrganisationDocumentType.CERTIFICATE_12A,
        OrganisationDocumentType.CERTIFICATE_80G,
        OrganisationDocumentType.DARPAN_ID,
      ];
    } else if (
      COMPANY_TYPES.has(normalised) ||
      normalised.includes('company')
    ) {
      organisationCategory = 'company';
      requiredTypes = [
        OrganisationDocumentType.CIN_CERTIFICATE,
        OrganisationDocumentType.AUTHORISATION_LETTER,
      ];
      requiredDocumentGroups = [
        {
          oneOf: [
            OrganisationDocumentType.GST_CERTIFICATE,
            OrganisationDocumentType.PAN_CERTIFICATE,
          ],
          required: true,
        },
      ];
    } else if (
      INSTITUTION_TYPES.has(normalised) ||
      normalised.includes('institution')
    ) {
      organisationCategory = 'institution';
      requiredTypes = [OrganisationDocumentType.AFFILIATION_PROOF];
    } else if (normalised === 'other' || normalised === 'community initiative') {
      organisationCategory = 'other';
      requiredTypes = [OrganisationDocumentType.REGISTRATION_CERTIFICATE];
      optionalTypes = [OrganisationDocumentType.PAN_CERTIFICATE];
    } else {
      throw new BadRequestException(
        'Select a supported organisation registration type before submitting documents',
      );
    }

    return {
      registrationType: registrationType?.trim() ?? '',
      organisationCategory,
      requiredDocuments: requiredTypes.map((type) => ({ type, required: true })),
      requiredDocumentGroups,
      optionalDocuments: optionalTypes.map((type) => ({ type, required: false })),
    };
  }

  isSupportedDocumentType(
    registrationType: string | null | undefined,
    documentType: OrganisationDocumentType,
  ): boolean {
    const requirements = this.getRequirements(registrationType);
    return (
      requirements.requiredDocuments.some((document) => document.type === documentType) ||
      requirements.requiredDocumentGroups.some((group) => group.oneOf.includes(documentType)) ||
      requirements.optionalDocuments.some((document) => document.type === documentType)
    );
  }

  validateCompleteness(
    registrationType: string | null | undefined,
    submittedTypes: OrganisationDocumentType[],
  ): void {
    const requirements = this.getRequirements(registrationType);
    const submitted = new Set(submittedTypes);
    const missing: string[] = requirements.requiredDocuments
      .filter((document) => !submitted.has(document.type))
      .map((document) => document.type);

    for (const group of requirements.requiredDocumentGroups) {
      if (!group.oneOf.some((type) => submitted.has(type))) {
        missing.push(group.oneOf.join(' or '));
      }
    }

    if (missing.length > 0) {
      throw new BadRequestException(
        `Missing required organisation documents: ${missing.join(', ')}`,
      );
    }
  }

  private normalise(value: string | null | undefined): string {
    return (value ?? '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ');
  }
}
