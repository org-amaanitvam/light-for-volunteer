import { IsIn } from 'class-validator';
import { VerificationStatus } from '../../database/enums/verification-status.enum';

export class ReviewOrganisationDto {
  @IsIn([
    VerificationStatus.VERIFIED,
    VerificationStatus.REJECTED,
  ])
  status: VerificationStatus.VERIFIED | VerificationStatus.REJECTED;
}