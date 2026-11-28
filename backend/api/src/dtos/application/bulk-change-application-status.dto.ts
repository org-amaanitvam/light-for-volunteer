import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { ApplicationStatus } from '../../database/enums/application-status.enum';

export class BulkUpdateApplicationStatusDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsUUID('4', { each: true })
  applicationIds!: string[];

  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;

  @IsOptional() @IsInt() @Min(0) @Max(500)
  hoursCompleted?: number;
}