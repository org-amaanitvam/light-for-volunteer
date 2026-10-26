import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../../database/entities/message.entity';
import { Thread } from '../../database/entities/thread.entity';
import { ThreadParticipant } from '../../database/entities/thread-participant.entity';
import { MessagingController } from './messaging.controller';
import { MessagingGateway } from './messaging.gateway';
import { MessagingService } from './messaging.service';

/**
 * Messaging module — Socket.io chat with saved history.
 *
 * Exports the `MessagingGateway` so other modules (e.g. notifications)
 * can push real-time events to connected users via `emitToUser()`.
 *
 * Owner: Suraj.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Message, Thread, ThreadParticipant])],
  controllers: [MessagingController],
  providers: [MessagingGateway, MessagingService],
  exports: [MessagingGateway, MessagingService],
})
export class MessagingModule {}
