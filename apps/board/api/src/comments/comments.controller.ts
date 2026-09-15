import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { Comment } from '@jeongho-nest/db';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsService } from './comments.service';

@ApiTags('댓글')
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @Post()
  @ApiParam({
    name: 'postId',
    type: Number,
    description: '게시글 ID',
    example: 1,
  })
  @ApiCreatedResponse({ description: '댓글 생성 성공', type: Comment })
  @ApiBadRequestResponse({
    description: '게시글 ID 또는 요청 본문이 올바르지 않습니다.',
  })
  @ApiNotFoundResponse({ description: '게시글을 찾을 수 없습니다.' })
  create(
    @Param('postId', ParseIntPipe) postId: number,
    @Request() request: { user: JwtPayload },
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    return this.commentsService.create(
      postId,
      request.user.sub,
      createCommentDto,
    );
  }

  @Get()
  @ApiParam({
    name: 'postId',
    type: Number,
    description: '게시글 ID',
    example: 1,
  })
  @ApiOkResponse({
    description: '댓글 목록 조회 성공',
    type: Comment,
    isArray: true,
  })
  @ApiBadRequestResponse({ description: '게시글 ID는 숫자여야 합니다.' })
  @ApiNotFoundResponse({ description: '게시글을 찾을 수 없습니다.' })
  findAll(@Param('postId', ParseIntPipe) postId: number): Promise<Comment[]> {
    return this.commentsService.findAll(postId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({
    name: 'postId',
    type: Number,
    description: '게시글 ID',
    example: 1,
  })
  @ApiParam({
    name: 'commentId',
    type: Number,
    description: '댓글 ID',
    example: 1,
  })
  @ApiNoContentResponse({ description: '댓글 삭제 성공' })
  @ApiBadRequestResponse({
    description: '게시글 ID 또는 댓글 ID가 올바르지 않습니다.',
  })
  @ApiForbiddenResponse({ description: '댓글을 삭제할 권한이 없습니다.' })
  @ApiNotFoundResponse({ description: '게시글 또는 댓글을 찾을 수 없습니다.' })
  remove(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Request() request: { user: JwtPayload },
  ): Promise<void> {
    return this.commentsService.remove(postId, commentId, request.user.sub);
  }
}
