import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { OpportunityType } from '../../database/enums/opportunity-type.enum';
import { LocationType } from '../../database/enums/location-type.enum';
import { OpportunityStatus } from '../../database/enums/opportunity-status.enum';

export class QueryOpportunityDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(OpportunityType)
  type?: OpportunityType;

  @IsOptional()
  @IsString()
  category?: string;

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
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;

  @IsOptional()
  @IsString()
  skills?: string;

  @IsOptional()
  @IsString()
  orgId?: string;

  @IsOptional()
  @IsString()
  organisationId?: string;

  @IsOptional()
  @IsIn(['newest', 'relevance', 'deadline_soon', 'points', 'deadline'])
  sortBy?: 'newest' | 'relevance' | 'deadline_soon' | 'points' | 'deadline' = 'newest';

  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc' = 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
