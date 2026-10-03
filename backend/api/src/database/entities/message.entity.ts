import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn 
} from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  thread_id: string;

  @ManyToOne(() => User,{ onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ type: 'text' })
  text: string;

  @CreateDateColumn()
  sent_at: Date;
}