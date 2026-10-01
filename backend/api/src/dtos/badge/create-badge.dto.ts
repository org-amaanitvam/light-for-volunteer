import { IsNotEmpty, IsObject, IsString, IsUrl } from 'class-validator';

export class CreateBadgeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  criteria: string;

  @IsUrl({}, { message: 'Icon must be a valid URL' })
  @IsNotEmpty()
  iconUrl: string;
}