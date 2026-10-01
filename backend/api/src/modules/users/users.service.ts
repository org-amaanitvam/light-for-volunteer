import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Role } from '@lfv/types';
import { User } from './entities/user.entity';

export interface CreateUserInput {
  email: string;
  name: string;
  passwordHash?: string | null;
  role: Role;
  phone?: string | null;
  city?: string | null;
  googleId?: string | null;
}

/**
 * The only write path to the `users` table. Other modules (and Auth) go
 * through this service so invariants — lowercase email, role defaults — stay
 * in one place.
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email: email.toLowerCase().trim() } });
  }

  async findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.users.findOne({ where: { googleId } });
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = this.users.create({
      email: input.email.toLowerCase().trim(),
      name: input.name,
      passwordHash: input.passwordHash ?? null,
      role: input.role,
      phone: input.phone ?? null,
      city: input.city ?? null,
      googleId: input.googleId ?? null,
    });
    const saved = await this.users.save(user);
    this.logger.debug(`Created user ${saved.id} (${saved.role})`);
    return saved;
  }

  async updateRole(id: string, role: Role): Promise<User> {
    await this.users.update({ id }, { role });
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Links a local account to a Google identity (first Google sign-in). */
  async attachGoogleId(id: string, googleId: string): Promise<User> {
    await this.users.update({ id }, { googleId });
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Used by the Postgres fallback session store (single active refresh). */
  async setRefreshTokenHash(id: string, hash: string | null): Promise<void> {
    await this.users.update({ id }, { refreshTokenHash: hash });
  }
}
