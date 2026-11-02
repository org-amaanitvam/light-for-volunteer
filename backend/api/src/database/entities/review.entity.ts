import { 
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn
} from 'typeorm';
import { Application } from './application.entity';
import { User } from '../../modules/users/entities/user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Application,{ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => User,{ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'given_by' })
  given_by: User;

  @ManyToOne(() => User,{ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'given_to' })
  given_to: User;
}
