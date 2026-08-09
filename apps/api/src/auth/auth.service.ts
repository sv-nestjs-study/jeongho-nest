import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignUpDto } from './dto/sign-up.dto';
import type { AuthTokens } from './auth-tokens.interface';
import type { JwtPayload } from './jwt-payload.interface';

type RefreshTokenExpiresIn = `${number}${'s' | 'm' | 'h' | 'd'}`;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

  async login(loginDto: LoginDto): Promise<AuthTokens> {
    const email = loginDto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmailWithPasswordHash(email);
    const isPasswordValid =
      user && (await bcrypt.compare(loginDto.password, user.passwordHash));

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    return this.issueTokens(user.id);
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<AuthTokens> {
    let payload: JwtPayload;

    try {
      // Refresh Token의 서명과 만료 시간을 검증합니다.
      payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshTokenDto.refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    const user = await this.usersService.findByIdWithRefreshTokenHash(
      payload.sub,
    );
    // 요청 토큰과 DB에 저장한 해시를 비교합니다.
    const isRefreshTokenValid =
      user?.refreshTokenHash &&
      (await bcrypt.compare(
        refreshTokenDto.refreshToken,
        user.refreshTokenHash,
      ));

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    return this.issueTokens(user.id);
  }

  private async issueTokens(userId: number): Promise<AuthTokens> {
    const payload = { sub: userId };
    // Access Token과 Refresh Token을 서로 다른 만료 시간으로 발급합니다.
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow<RefreshTokenExpiresIn>(
          'JWT_REFRESH_EXPIRES_IN',
        ),
      }),
    ]);
    // Refresh Token 원문 대신 해시만 DB에 저장합니다.
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    // 재발급 시 기존 해시를 새 토큰 해시로 교체합니다.
    await this.usersService.updateRefreshTokenHash(userId, refreshTokenHash);

    return { accessToken, refreshToken };
  }
}
