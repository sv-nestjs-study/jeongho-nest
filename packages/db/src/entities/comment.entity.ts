import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTimestampEntity } from './base-timestamp.entity';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity('comments')
export class Comment extends BaseTimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  content: string;

  @ManyToOne(() => Post, (post) => post.comments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @ManyToOne(() => User, (user) => user.comments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorId' })
  author: User;
}
