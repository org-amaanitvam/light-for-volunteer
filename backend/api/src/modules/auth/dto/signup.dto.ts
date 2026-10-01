import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'Rajat Jain', minLength: 2 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2, { message: 'name must be at least 2 characters' })
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'rajat@example.com' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  @IsEmail({}, { message: 'A valid email address is required' })
  @MaxLength(255)
  email!: string;

  @ApiProperty({ minLength: 8, description: 'Plain password; hashed with argon2id' })
  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters' })
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({
    enum: ['volunteer', 'organisation', 'mentor'],
    default: 'volunteer',
    description:
      'Role to register as. `admin` cannot be self-assigned (403). Defaults to volunteer.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  role?: string;
}
