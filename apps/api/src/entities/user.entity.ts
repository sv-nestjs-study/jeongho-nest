import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTimestampEntity } from './base-timestamp.entity';

@Entity('users')
export class User extends BaseTimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 30, unique: true })
  nickname: string;

  @Column({ select: false })
  passwordHash: string;
}
