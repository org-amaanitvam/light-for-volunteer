import { IsArray, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateVolunteerProfileDto {
  @IsOptional()
  @IsString()
  headline?: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  @Matches(/^(resumes\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.pdf|https:\/\/\S+)$/i, { message: 'Resume must be an uploaded PDF key or HTTPS URL' })
  resumeUrl?: string;

  @IsOptional()
  @IsArray()
  @Matches(/^(portfolio\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|pdf)|https:\/\/\S+)$/i, { each: true, message: 'Each portfolio item must be an uploaded file key or HTTPS URL' })
  portfolioLinks?: string[];
}
