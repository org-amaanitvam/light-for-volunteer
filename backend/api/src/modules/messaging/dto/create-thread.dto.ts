import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateThreadDto {
  @ApiProperty({ description: 'UUID of the user to start a conversation with' })
  @IsUUID()
  @IsNotEmpty()
  receiverId: string;
}
