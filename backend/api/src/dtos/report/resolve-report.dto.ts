import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReportAction } from '../../database/entities/report.entity';

export class ResolveReportDto {
  @IsEnum(ReportAction)
  action: ReportAction;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  resolution_note?: string;
}
