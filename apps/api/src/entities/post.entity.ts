import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTimestampEntity } from './base-timestamp.entity';

// PostgreSQL의 posts 테이블과 연결되는 Entity입니다.
@Entity('posts')
export class Post extends BaseTimestampEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  content!: string;
}
