import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Post as PostEntity } from '@jeongho-nest/db';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

// Swagger UI에서 게시글 API를 하나의 그룹으로 표시합니다.
@ApiTags('게시글')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * 게시글 생성
   *
   * @remarks 제목, 내용, 작성자 이름을 받아 게시글을 생성합니다.
   */
  @Post()
  // 생성 성공(201) 응답의 설명과 반환 객체 형태를 문서화합니다.
  @ApiCreatedResponse({ description: '게시글 생성 성공', type: PostEntity })
  @ApiBadRequestResponse({ description: '요청 본문이 올바르지 않습니다.' })
  create(@Body() createPostDto: CreatePostDto): Promise<PostEntity> {
    return this.postsService.create(createPostDto);
  }

  /**
   * 게시글 목록 조회
   *
   * @remarks 생성일 기준 내림차순으로 삭제되지 않은 게시글을 조회합니다.
   */
  @Get()
  @ApiOkResponse({
    description: '게시글 목록 조회 성공',
    type: PostEntity,
    isArray: true,
  })
  findAll(): Promise<PostEntity[]> {
    return this.postsService.findAll();
  }

  /**
   * 게시글 단건 조회
   *
   * @remarks 게시글을 조회하고 조회 수를 1 증가시킵니다.
   */
  @Get(':id')
  // URL의 :id를 숫자 타입과 예시값을 포함해 문서화합니다.
  @ApiParam({ name: 'id', type: Number, description: '게시글 ID', example: 1 })
  @ApiOkResponse({ description: '게시글 조회 성공', type: PostEntity })
  @ApiBadRequestResponse({ description: '게시글 ID는 숫자여야 합니다.' })
  @ApiNotFoundResponse({ description: '게시글을 찾을 수 없습니다.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
    return this.postsService.findOne(id);
  }

  /**
   * 게시글 수정
   *
   * @remarks 전달한 제목 또는 내용만 수정한 뒤 수정된 게시글을 반환합니다.
   */
  @Patch(':id')
  @ApiParam({ name: 'id', type: Number, description: '게시글 ID', example: 1 })
  @ApiOkResponse({ description: '게시글 수정 성공', type: PostEntity })
  @ApiBadRequestResponse({
    description: '게시글 ID 또는 요청 본문이 올바르지 않습니다.',
  })
  @ApiNotFoundResponse({ description: '게시글을 찾을 수 없습니다.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postsService.update(id, updatePostDto);
  }

  /**
   * 게시글 삭제
   *
   * @remarks deletedAt에 삭제 시각을 기록하는 소프트 삭제를 수행합니다.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: Number, description: '게시글 ID', example: 1 })
  // 본문 없이 성공 상태 코드 204를 반환함을 문서화합니다.
  @ApiNoContentResponse({ description: '게시글 삭제 성공' })
  @ApiBadRequestResponse({ description: '게시글 ID는 숫자여야 합니다.' })
  @ApiNotFoundResponse({ description: '게시글을 찾을 수 없습니다.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.postsService.remove(id);
  }
}
