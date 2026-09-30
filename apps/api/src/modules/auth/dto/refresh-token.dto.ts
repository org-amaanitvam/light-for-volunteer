import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'The refresh token returned by signup/login/refresh/exchange',
    minLength: 20,
  })
  @IsString()
  @Length(20, 4096, { message: 'refreshToken is not a valid token' })
  refreshToken!: string;
}
