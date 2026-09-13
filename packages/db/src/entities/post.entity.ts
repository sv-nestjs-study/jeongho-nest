import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTimestampEntity } from './base-timestamp.entity';
import { Comment } from './comment.entity';

@Entity('posts')
export class Post extends BaseTimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ length: 30, default: '익명' })
  authorName: string;

  @Column({ type: 'integer', default: 0 })
  viewCount: number;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  commentCount: number;
}
