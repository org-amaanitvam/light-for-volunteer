import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsString,
  MaxLength,
  Min,
  Max,
  Matches,
} from 'class-validator';

export enum StoragePurpose {
  RESUME = 'resume',
  VERIFICATION = 'verification',
  PORTFOLIO = 'portfolio',
}

export class PresignUploadDto {
  @ApiProperty({
    enum: StoragePurpose,
    example: StoragePurpose.RESUME,
  })
  @IsEnum(StoragePurpose)
  purpose!: StoragePurpose;

  @ApiProperty({
    example: 'my-resume.pdf',
  })
  @IsString()
  @MaxLength(255)
  fileName!: string;

  @ApiProperty({
  example: 'application/pdf',
})
@IsString()
@MaxLength(100)
@Matches(
  /^(application\/pdf|image\/jpeg|image\/png|image\/webp)$/,
  { message: 'Unsupported file type' },
)
contentType!: string;

  @ApiProperty({
    example: 524288,
    description: 'File size in bytes',
  })
  @IsInt()
  @Min(1)
  @Max(10 * 1024 * 1024)
  fileSize!: number;
}

export class PresignDownloadDto {
  @ApiProperty({
    example: 'resumes/user-id/file-id.pdf',
  })
  @IsString()
  @MaxLength(1024)
  key!: string;
}

export class DeleteObjectDto {
  @ApiProperty({
    example: 'resumes/user-id/file-id.pdf',
  })
  @IsString()
  @MaxLength(1024)
  key!: string;
}

export class VerifyUploadDto {
  @ApiProperty({
    example: 'resumes/user-id/file-id.pdf',
  })
  @IsString()
  @MaxLength(1024)
  key!: string;
}