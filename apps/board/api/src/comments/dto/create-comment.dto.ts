import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: '댓글 내용은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '댓글 내용을 입력해주세요.' })
  @MaxLength(500, { message: '댓글 내용은 최대 500자까지 입력할 수 있습니다.' })
  content: string;
}
