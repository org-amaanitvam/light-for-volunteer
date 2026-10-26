import { IsEnum, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ReportTargetType } from '../../database/entities/report.entity';

export class CreateReportDto {
  @IsEnum(ReportTargetType)
  target_type: ReportTargetType;

  @IsUUID()
  target_id: string;

  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  reason: string;
}