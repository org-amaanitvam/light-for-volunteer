import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'rajat@example.com' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  @IsEmail({}, { message: 'A valid email address is required' })
  @MaxLength(255)
  email!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(128)
  password!: string;
}
