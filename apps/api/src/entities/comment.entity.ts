import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';
import { BaseTimestampEntity } from './base-timestamp.entity';

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
  // 기본 이름 규칙인 postId를 사용할 때는 생략할 수 있습니다.
  @JoinColumn({ name: 'postId' })
  post: Post;

  @ManyToOne(() => User, (user) => user.comments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorId' })
  author: User;
}
