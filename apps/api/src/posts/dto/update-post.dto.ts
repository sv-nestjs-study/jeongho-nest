import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePostDto {
  /**
   * 수정할 게시글 제목
   * @example "수정된 Nest Swagger 학습"
   */
  @IsOptional()
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  @MaxLength(100, { message: '제목은 최대 100자까지 입력할 수 있습니다.' })
  title?: string;

  /**
   * 수정할 게시글 내용
   * @example "수정된 Swagger 문서 내용입니다."
   */
  @IsOptional()
  @IsString({ message: '내용은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  content?: string;
}
