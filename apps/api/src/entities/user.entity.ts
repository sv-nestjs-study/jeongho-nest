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

  // 응답 JSON과 기본 DB 조회에서 비밀번호 해시를 제외합니다.
  @Exclude()
  @Column({ select: false })
  passwordHash: string;

  // 응답 JSON과 기본 DB 조회에서 Refresh Token 해시를 제외합니다.
  @Exclude()
  @Column({ type: 'varchar', select: false, nullable: true })
  refreshTokenHash: string | null;

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];
}
