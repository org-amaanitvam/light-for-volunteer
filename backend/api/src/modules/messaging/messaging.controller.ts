import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtAccessPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateThreadDto } from './dto/create-thread.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageQueryDto } from './dto/message-query.dto';
import { MessagingService } from './messaging.service';

/**
 * REST endpoints for the messaging module.
 * Real-time chat happens over the WebSocket gateway; these endpoints cover
 * thread management and history retrieval.
 *
 * Owner: Suraj.
 */
@ApiTags('messaging')
@ApiBearerAuth()
@Controller('messaging')
export class MessagingController {
  constructor(private readonly service: MessagingService) {}

  @Post('threads')
  @ApiOperation({ summary: 'Start or retrieve a 1-on-1 thread with another user' })
  createThread(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: CreateThreadDto,
  ) {
    return this.service.findOrCreateThread(user.sub, dto.receiverId);
  }

  @Get('threads')
  @ApiOperation({ summary: 'List all threads for the authenticated user' })
  listThreads(@CurrentUser() user: JwtAccessPayload) {
    return this.service.getThreadsForUser(user.sub);
  }

  @Get('threads/:threadId/messages')
  @ApiOperation({ summary: 'Paginated message history for a thread' })
  async getMessages(
    @CurrentUser() user: JwtAccessPayload,
    @Param('threadId', ParseUUIDPipe) threadId: string,
    @Query() query: MessageQueryDto,
  ) {
    // Verify the caller is a participant.
    const isMember = await this.service.isThreadParticipant(threadId, user.sub);
    if (!isMember) {
      throw new ForbiddenException('Not a member of this thread');
    }

    return this.service.getMessages(threadId, query.page, query.limit);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message to a thread (REST fallback; prefer WebSocket)' })
  async sendMessage(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: SendMessageDto,
  ) {
    // Verify the caller is a participant.
    const isMember = await this.service.isThreadParticipant(dto.threadId, user.sub);
    if (!isMember) {
      throw new ForbiddenException('Not a member of this thread');
    }

    return this.service.sendMessage(user.sub, dto.threadId, dto.text);
  }
}
