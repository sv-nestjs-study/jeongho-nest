import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, User } from '@jeongho-nest/db';
import { MyCommentResponseDto } from './dto/my-comment-response.dto';
import { MyProfileResponseDto } from './dto/my-profile-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  findByEmailOrNickname(email: string, nickname: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: [{ email }, { nickname }],
    });
  }

  findByEmailWithPasswordHash(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  findByIdWithRefreshTokenHash(id: number): Promise<User | null> {
    // 기본 조회에서 숨긴 Refresh Token 해시를 재발급 때만 조회합니다.
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.refreshTokenHash')
      .where('user.id = :id', { id })
      .getOne();
  }

  create(email: string, nickname: string, passwordHash: string): Promise<User> {
    const user = this.usersRepository.create({
      email,
      nickname,
      passwordHash,
    });

    return this.usersRepository.save(user);
  }

  async updateRefreshTokenHash(
    id: number,
    refreshTokenHash: string,
  ): Promise<void> {
    await this.usersRepository.update(id, { refreshTokenHash });
  }

  async findMyProfile(userId: number): Promise<MyProfileResponseDto> {
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      createdAt: user.createdAt,
    };
  }

  async findMyComments(userId: number): Promise<MyCommentResponseDto[]> {
    const comments = await this.commentsRepository.find({
      where: { author: { id: userId } },
      relations: { post: true },
      order: { createdAt: 'DESC' },
    });

    return comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      post: {
        id: comment.post.id,
        title: comment.post.title,
      },
    }));
  }
}
