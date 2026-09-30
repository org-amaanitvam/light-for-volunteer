import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ExchangeCodeDto {
  @ApiProperty({
    description:
      'One-time code from the Google OAuth redirect (`?code=` on the frontend callback page)',
    minLength: 10,
  })
  @IsString()
  @MinLength(10, { message: 'code is not a valid exchange code' })
  @MaxLength(2048)
  code!: string;

  @ApiPropertyOptional({
    enum: ['volunteer', 'organisation', 'mentor'],
    description:
      'Optional role choice, applied once while the account is still provisional (volunteer). ' +
      '`admin` is rejected with 403.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  role?: string;
}
