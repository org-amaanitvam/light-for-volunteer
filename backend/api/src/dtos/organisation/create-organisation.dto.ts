import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
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
  @IsUrl({}, { message: 'Verification document must be a valid URL' })
  verificationDocUrl?: string;
}

export class UpdateVerificationStatusDto {
  @IsEnum(VerificationStatus)
  @IsNotEmpty()
  verificationStatus: VerificationStatus;
}