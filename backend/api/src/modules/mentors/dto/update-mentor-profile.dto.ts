import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMentorProfileDto {
  @IsOptional() @IsString() @MaxLength(160)
  headline?: string;

  @IsOptional() @IsString() @MaxLength(3000)
  about?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  skills?: string[];
}
