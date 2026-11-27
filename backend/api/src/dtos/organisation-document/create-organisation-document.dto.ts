import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { OrganisationDocumentType } from '../../database/enums/organisation-document-type.enum';

export class CreateOrganisationDocumentDto {
  @ApiProperty({ enum: OrganisationDocumentType })
  @IsEnum(OrganisationDocumentType)
  documentType!: OrganisationDocumentType;

  @ApiProperty({ example: 'verification-documents/user-id/document-id.pdf' })
  @IsString()
  @MaxLength(1024)
  @Matches(
    /^verification-documents\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.pdf$/i,
    {
    message: 'storageKey must be a private organisation verification document key',
    },
  )
  storageKey!: string;

  @ApiProperty({ example: 'registration-certificate.pdf' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  originalFileName!: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @MaxLength(100)
  @Matches(/^application\/pdf$/)
  mimeType!: string;

  @ApiProperty({ example: 524288 })
  @IsInt()
  @Min(1)
  @Max(10 * 1024 * 1024)
  fileSize!: number;
}
