import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<User> {
    // 같은 이메일을 같은 계정으로 다루기 위해 공백과 대소문자를 통일합니다.
    const email = signUpDto.email.trim().toLowerCase();
    const nickname = signUpDto.nickname.trim();
    const existingUser = await this.usersService.findByEmailOrNickname(
      email,
      nickname,
    );

    if (existingUser) {
      // 이메일 또는 닉네임 중 하나라도 중복되면 가입을 중단합니다.
      throw new ConflictException('이미 사용 중인 이메일 또는 닉네임입니다.');
    }

    // 12는 bcrypt 해싱 강도(salt rounds)입니다.
    const passwordHash = await bcrypt.hash(signUpDto.password, 12);

    return this.usersService.create(email, nickname, passwordHash);
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const email = loginDto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmailWithPasswordHash(email);
    const isPasswordValid =
      user && (await bcrypt.compare(loginDto.password, user.passwordHash));

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    return {
      accessToken: await this.jwtService.signAsync({ sub: user.id }),
    };
  }
}
