export class MyCommentPostDto {
  id: number;
  title: string;
}

export class MyCommentResponseDto {
  id: number;
  content: string;
  createdAt: Date;
  post: MyCommentPostDto;
}
