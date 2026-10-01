import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  @IsNotEmpty()
  opportunityId: string;

  @IsString()
  @IsNotEmpty()
  pitchText: string;
}