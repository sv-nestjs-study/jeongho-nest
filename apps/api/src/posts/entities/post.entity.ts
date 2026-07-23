import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// PostgreSQL의 posts 테이블과 연결되는 Entity입니다.
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
