import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  @MaxLength(100, { message: '제목은 최대 100자까지 입력할 수 있습니다.' })
  title: string;

  @IsString({ message: '내용은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  content: string;

  @IsString({ message: '작성자 이름은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '작성자 이름을 입력해주세요.' })
  @MaxLength(30, {
    message: '작성자 이름은 최대 30자까지 입력할 수 있습니다.',
  })
  authorName: string;
}
