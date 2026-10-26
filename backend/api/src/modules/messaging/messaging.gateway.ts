import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagingService } from './messaging.service';

/**
 * Socket.io WebSocket gateway for real-time messaging and notification push.
 *
 * Clients connect with their JWT access token in the handshake:
 *   `io('/ws', { auth: { token: '<accessToken>' } })`
 *
 * On connection every client auto-joins their personal room `user:<userId>`
 * so the server can push targeted notifications.
 *
 * Owner: Suraj.
 */
@WebSocketGateway({
  namespace: '/ws',
  cors: { origin: '*' }, // Suryansh will tighten CORS via env config.
})
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagingGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly messagingService: MessagingService,
  ) {}

  // ── Connection lifecycle ──────────────────────────────────────────

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        client.handshake.auth?.token ??
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn('WS connection rejected — no token');
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('auth.access.secret');
      const payload = this.jwtService.verify(token, { secret });

      // Attach user info to the socket for later use.
      client.data.userId = payload.sub;
      client.data.email = payload.email;
      client.data.role = payload.role;

      // Auto-join personal room for notifications.
      await client.join(`user:${payload.sub}`);

      this.logger.debug(`WS connected: ${payload.email} (${payload.sub})`);
    } catch {
      this.logger.warn('WS connection rejected — invalid token');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const email = client.data?.email ?? 'unknown';
    this.logger.debug(`WS disconnected: ${email}`);
  }

  // ── Chat events ───────────────────────────────────────────────────

  @SubscribeMessage('join_thread')
  async onJoinThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ): Promise<{ ok: boolean }> {
    const userId = client.data.userId;
    if (!userId) return { ok: false };

    // Verify the user is a participant of this thread.
    const isMember = await this.messagingService.isThreadParticipant(
      data.threadId,
      userId,
    );
    if (!isMember) {
      client.emit('error', { message: 'Not a member of this thread' });
      return { ok: false };
    }

    await client.join(`thread:${data.threadId}`);
    return { ok: true };
  }

  @SubscribeMessage('leave_thread')
  async onLeaveThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ): Promise<{ ok: boolean }> {
    await client.leave(`thread:${data.threadId}`);
    return { ok: true };
  }

  @SubscribeMessage('send_message')
  async onSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string; text: string },
  ): Promise<{ ok: boolean; messageId?: string }> {
    const userId = client.data.userId;
    if (!userId) return { ok: false };

    if (!data.threadId || !data.text?.trim()) {
      client.emit('error', { message: 'threadId and text are required' });
      return { ok: false };
    }

    const isMember = await this.messagingService.isThreadParticipant(
      data.threadId,
      userId,
    );
    if (!isMember) {
      client.emit('error', { message: 'Not a member of this thread' });
      return { ok: false };
    }

    const message = await this.messagingService.sendMessage(
      userId,
      data.threadId,
      data.text.trim(),
    );

    // Broadcast to everyone in the thread room (including sender).
    this.server.to(`thread:${data.threadId}`).emit('new_message', message);

    return { ok: true, messageId: message.id };
  }

  @SubscribeMessage('typing')
  async onTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ): Promise<void> {
    const userId = client.data.userId;
    if (!userId || !data.threadId) return;

    // Broadcast to the thread room excluding the sender.
    client.to(`thread:${data.threadId}`).emit('user_typing', {
      threadId: data.threadId,
      userId,
    });
  }

  // ── Public helpers for other modules (e.g. notifications) ─────────

  /**
   * Emit an event to a specific user's personal room.
   * Used by NotificationsService to push real-time notifications.
   */
  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}
