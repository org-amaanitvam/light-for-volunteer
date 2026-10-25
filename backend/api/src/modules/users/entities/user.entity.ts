import { DEFAULT_ROLE, ROLES, type Role } from '@lfv/types';
import { Organisation } from '../../../database/entities/organisation.entity';
import { VolunteerProfile } from '../../../database/entities/volunteer-profile.entity';
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * The single identity record for every platform user — shared by volunteers,
 * organisations, mentors and admins. Schema is owned by Vishal
 * (`src/database/`); this entity is the Auth module's view of it.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    transformer: {
      to: (value: string) => value?.toLowerCase().trim(),
      from: (value: string) => value,
    },
  })
  email!: string;

  /** argon2id hash. `null` for accounts that only sign in via Google OAuth. */
  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
  passwordHash!: string | null;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({
    type: 'enum',
    enum: [...ROLES],
    default: DEFAULT_ROLE,
  })
  role!: Role;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  city!: string | null;

  /**
   * sha256 of the current refresh token — Postgres fallback used only when
   * Redis is unavailable (single-session mode). Active sessions normally live
   * in Redis; see `auth/services/session.store.ts`.
   */
  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 255, nullable: true })
  refreshTokenHash!: string | null;

  @Column({ name: 'google_id', type: 'varchar', length: 64, nullable: true, unique: true })
  googleId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToOne(() => VolunteerProfile, (profile) => profile.user)
  volunteerProfile!: VolunteerProfile;

  @OneToOne(() => Organisation, (org) => org.user)
  organisation!: Organisation;
}
