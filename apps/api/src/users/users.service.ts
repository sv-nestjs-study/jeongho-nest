import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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
}
