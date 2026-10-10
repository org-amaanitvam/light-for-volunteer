import { IsIn } from 'class-validator';

export class ReviewOpportunityDto {
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';
}
