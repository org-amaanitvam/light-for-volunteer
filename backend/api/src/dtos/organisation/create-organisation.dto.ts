import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';
import { VerificationStatus } from '../../database/enums/verification-status.enum';

export class CreateOrganisationDto {
  @IsString()
  @IsNotEmpty()
  orgName: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @IsOptional()
  @IsString()
  registrationType?: string; // Section 8 / Trust / Company / DARPAN etc.

  @IsOptional()
  @IsString()
  registrationId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  @Matches(/^(verification-documents\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.pdf|https:\/\/\S+)$/i, {
    message: 'Verification document must be an uploaded PDF key or HTTPS URL',
  })
  verificationDocUrl?: string;
}

export class UpdateVerificationStatusDto {
  @IsEnum(VerificationStatus)
  @IsNotEmpty()
  verificationStatus: VerificationStatus;
}
