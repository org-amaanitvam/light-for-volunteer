import { 
  Entity, PrimaryGeneratedColumn, Column
} from 'typeorm';

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  criteria: string;

  @Column()
  icon_url: string;
}