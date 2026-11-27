import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { OrganisationDocumentStatus } from '../../database/enums/organisation-document-status.enum';

export class ReviewOrganisationDocumentDto {
  @ApiProperty({
    enum: [
      OrganisationDocumentStatus.APPROVED,
      OrganisationDocumentStatus.REJECTED,
      OrganisationDocumentStatus.NEEDS_INFO,
    ],
  })
  @IsIn([
    OrganisationDocumentStatus.APPROVED,
    OrganisationDocumentStatus.REJECTED,
    OrganisationDocumentStatus.NEEDS_INFO,
  ])
  status!:
    | OrganisationDocumentStatus.APPROVED
    | OrganisationDocumentStatus.REJECTED
    | OrganisationDocumentStatus.NEEDS_INFO;

  @ApiPropertyOptional({ minLength: 10, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  reason?: string;
}
