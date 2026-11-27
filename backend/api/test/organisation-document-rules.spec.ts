import { BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { OrganisationDocumentType } from '../src/database/enums/organisation-document-type.enum';
import { CreateOrganisationDocumentDto } from '../src/dtos/organisation-document/create-organisation-document.dto';
import { OrganisationDocumentRulesService } from '../src/modules/organisations/organisation-document-rules.service';

describe('OrganisationDocumentRulesService', () => {
  const rules = new OrganisationDocumentRulesService();

  it.each([
    ['Trust', 'ngo'],
    ['Society', 'ngo'],
    ['DARPAN', 'ngo'],
    ['Section 8', 'ngo'],
    ['Company', 'company'],
    ['Private Limited', 'company'],
    ['Institution / College', 'institution'],
    ['Other', 'other'],
    ['Community Initiative', 'other'],
  ] as const)(
    'classifies %s and returns a document policy',
    (registrationType, category) => {
      expect(rules.getRequirements(registrationType).organisationCategory).toBe(category);
    },
  );

  it('requires the registration certificate for Other and permits PAN as optional', () => {
    const requirements = rules.getRequirements('Other');

    expect(requirements.requiredDocuments).toEqual([
      { type: OrganisationDocumentType.REGISTRATION_CERTIFICATE, required: true },
    ]);
    expect(requirements.optionalDocuments).toEqual([
      { type: OrganisationDocumentType.PAN_CERTIFICATE, required: false },
    ]);
    expect(() =>
      rules.validateCompleteness('Other', [
        OrganisationDocumentType.REGISTRATION_CERTIFICATE,
      ]),
    ).not.toThrow();
    expect(() =>
      rules.validateCompleteness('Other', [
        OrganisationDocumentType.PAN_CERTIFICATE,
      ]),
    ).toThrow(BadRequestException);
  });

  it('requires either GST or PAN for a company', () => {
    const base = [
      OrganisationDocumentType.CIN_CERTIFICATE,
      OrganisationDocumentType.AUTHORISATION_LETTER,
    ];

    expect(() =>
      rules.validateCompleteness('Company', [
        ...base,
        OrganisationDocumentType.GST_CERTIFICATE,
      ]),
    ).not.toThrow();
    expect(() =>
      rules.validateCompleteness('Company', [
        ...base,
        OrganisationDocumentType.PAN_CERTIFICATE,
      ]),
    ).not.toThrow();
    expect(() => rules.validateCompleteness('Company', base)).toThrow(
      /gst_certificate or pan_certificate/i,
    );
  });

  it('rejects unknown registration types and mismatched document types', () => {
    expect(() => rules.getRequirements('Unlisted type')).toThrow(
      BadRequestException,
    );
    expect(
      rules.isSupportedDocumentType(
        'Institution',
        OrganisationDocumentType.CIN_CERTIFICATE,
      ),
    ).toBe(false);
  });
});

describe('CreateOrganisationDocumentDto', () => {
  it('rejects malformed or non-private storage keys', async () => {
    const dto = Object.assign(new CreateOrganisationDocumentDto(), {
      documentType: OrganisationDocumentType.REGISTRATION_CERTIFICATE,
      storageKey: 'https://storage.example/file.pdf',
      originalFileName: 'registration.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024,
    });

    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('storageKey');
  });
});
