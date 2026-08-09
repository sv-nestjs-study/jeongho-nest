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

  create(email: string, nickname: string, passwordHash: string): Promise<User> {
    const user = this.usersRepository.create({
      email,
      nickname,
      passwordHash,
    });

    return this.usersRepository.save(user);
  }
}
