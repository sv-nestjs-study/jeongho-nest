import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTimestampEntity } from './base-timestamp.entity';
import { Comment } from './comment.entity';

@Entity('users')
export class User extends BaseTimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 30, unique: true })
  nickname: string;

  @Exclude()
  @Column({ select: false })
  passwordHash: string;

  @Exclude()
  @Column({ type: 'varchar', select: false, nullable: true })
  refreshTokenHash: string | null;

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];
}
