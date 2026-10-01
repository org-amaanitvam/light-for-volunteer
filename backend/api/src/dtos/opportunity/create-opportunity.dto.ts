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

  @IsArray()
  @IsString({ each: true })
  skillsRequired: string[];

  @IsEnum(LocationType)
  @IsNotEmpty()
  locationType: LocationType;

  @IsOptional()
  @IsString()
  city?: string;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  pointsReward: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  openings: number;

  @Type(() => Date)
  @IsDate()
  deadline: Date;

  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus = OpportunityStatus.DRAFT;
}