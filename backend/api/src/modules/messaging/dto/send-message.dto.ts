import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ description: 'UUID of the thread to send the message to' })
  @IsUUID()
  @IsNotEmpty()
  threadId: string;

  @ApiProperty({ description: 'Message text content' })
  @IsString()
  @IsNotEmpty()
  text: string;
}
