import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

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
  @IsUrl({}, { message: 'Resume must be a valid URL' })
  resumeUrl?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true, message: 'Each portfolio link must be a valid URL' })
  portfolioLinks?: string[];
}