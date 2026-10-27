import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { OpportunityType } from '../../database/enums/opportunity-type.enum';
import { LocationType } from '../../database/enums/location-type.enum';
import { OpportunityStatus } from '../../database/enums/opportunity-status.enum';

export class CreateOpportunityDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(OpportunityType)
  @IsNotEmpty()
  type: OpportunityType;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillsRequired?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills_required?: string[];

  @IsOptional()
  @IsEnum(LocationType)
  locationType?: LocationType;

  @IsOptional()
  @IsEnum(LocationType)
  location_type?: LocationType;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  pointsReward?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  points_reward?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  openings?: number = 1;

  @Type(() => Date)
  @IsDate()
  deadline: Date;

  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus = OpportunityStatus.DRAFT;

  @IsOptional()
  @IsString()
  orgId?: string;

  @IsOptional()
  @IsString()
  org_id?: string;
}
