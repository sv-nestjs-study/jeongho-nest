import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  @MaxLength(100, { message: '이메일은 최대 100자까지 입력할 수 있습니다.' })
  email: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @MaxLength(72, { message: '비밀번호는 최대 72자까지 입력할 수 있습니다.' })
  password: string;
}
