import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../database/entities/message.entity';
import { Thread } from '../../database/entities/thread.entity';
import { ThreadParticipant } from '../../database/entities/thread-participant.entity';

/**
 * Messaging service — thread management and message persistence.
 *
 * Owner: Suraj. Uses the existing `Message` entity (Vishal's schema)
 * plus the new `Thread` and `ThreadParticipant` entities.
 */
@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Thread)
    private readonly threadRepo: Repository<Thread>,
    @InjectRepository(ThreadParticipant)
    private readonly participantRepo: Repository<ThreadParticipant>,
  ) {}

  // ── Thread management ──────────────────────────────────────────

  /**
   * Find an existing 1-on-1 thread between two users, or create one.
   * Prevents duplicate threads for the same pair.
   */
  async findOrCreateThread(
    userId: string,
    receiverId: string,
  ): Promise<Thread> {
    if (userId === receiverId) {
      throw new ForbiddenException('Cannot create a thread with yourself');
    }

    // Look for an existing thread where both users are participants.
    const existing = await this.threadRepo
      .createQueryBuilder('t')
      .innerJoin('thread_participants', 'p1', 'p1.thread_id = t.id AND p1.user_id = :userId', { userId })
      .innerJoin('thread_participants', 'p2', 'p2.thread_id = t.id AND p2.user_id = :receiverId', { receiverId })
      .getOne();

    if (existing) {
      return this.getThreadWithParticipants(existing.id);
    }

    // Create new thread with both participants.
    const thread = this.threadRepo.create();
    const saved = await this.threadRepo.save(thread);

    const participants = this.participantRepo.create([
      { thread_id: saved.id, user_id: userId },
      { thread_id: saved.id, user_id: receiverId },
    ]);
    await this.participantRepo.save(participants);

    this.logger.debug(
      `Created thread ${saved.id} between ${userId} and ${receiverId}`,
    );

    return this.getThreadWithParticipants(saved.id);
  }

  /**
   * List all threads the user belongs to, with participant info
   * and the most recent message preview, ordered by latest activity.
   */
  async getThreadsForUser(userId: string): Promise<
    Array<{
      thread: Thread;
      lastMessage: Message | null;
    }>
  > {
    // Get all thread IDs the user participates in.
    const participations = await this.participantRepo.find({
      where: { user_id: userId },
      relations: { thread: { participants: { user: true } } },
    });

    const results: Array<{ thread: Thread; lastMessage: Message | null }> = [];

    for (const p of participations) {
      const lastMessage = await this.messageRepo.findOne({
        where: { thread_id: p.thread_id },
        order: { sent_at: 'DESC' },
        relations: { sender: true },
      });

      results.push({ thread: p.thread, lastMessage });
    }

    // Sort by last message time (most recent first), threads with no messages last.
    results.sort((a, b) => {
      const timeA = a.lastMessage?.sent_at?.getTime() ?? 0;
      const timeB = b.lastMessage?.sent_at?.getTime() ?? 0;
      return timeB - timeA;
    });

    return results;
  }

  /** Check whether a user is a participant of a thread. */
  async isThreadParticipant(
    threadId: string,
    userId: string,
  ): Promise<boolean> {
    const count = await this.participantRepo.count({
      where: { thread_id: threadId, user_id: userId },
    });
    return count > 0;
  }

  // ── Messages ───────────────────────────────────────────────────

  /**
   * Persist a message and return it with the sender relation loaded.
   */
  async sendMessage(
    senderId: string,
    threadId: string,
    text: string,
  ): Promise<Message> {
    // Verify thread exists.
    const thread = await this.threadRepo.findOne({ where: { id: threadId } });
    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    const message = this.messageRepo.create({
      thread_id: threadId,
      sender: { id: senderId },
      text,
    });

    const saved = await this.messageRepo.save(message);

    // Touch thread's updated_at to reflect latest activity.
    await this.threadRepo.update(threadId, { updated_at: new Date() });

    // Return with sender loaded.
    return this.messageRepo.findOneOrFail({
      where: { id: saved.id },
      relations: { sender: true },
    });
  }

  /**
   * Retrieve paginated message history for a thread (newest first).
   * Caller must verify thread membership before calling.
   */
  async getMessages(
    threadId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ messages: Message[]; total: number }> {
    const [messages, total] = await this.messageRepo.findAndCount({
      where: { thread_id: threadId },
      order: { sent_at: 'DESC' },
      relations: { sender: true },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { messages, total };
  }

  // ── Internal helpers ───────────────────────────────────────────

  private async getThreadWithParticipants(threadId: string): Promise<Thread> {
    return this.threadRepo.findOneOrFail({
      where: { id: threadId },
      relations: { participants: { user: true } },
    });
  }
}
