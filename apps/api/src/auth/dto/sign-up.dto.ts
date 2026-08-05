import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  @MaxLength(100, { message: '이메일은 최대 100자까지 입력할 수 있습니다.' })
  email: string;

  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '닉네임을 입력해주세요.' })
  @MaxLength(30, { message: '닉네임은 최대 30자까지 입력할 수 있습니다.' })
  nickname: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(72, { message: '비밀번호는 최대 72자까지 입력할 수 있습니다.' })
  password: string;
}
