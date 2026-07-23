import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    // PostsModule의 forFeature([Post])로 등록한 Repository를 주입합니다.
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  create(createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postsRepository.create(createPostDto);

    return this.postsRepository.save(post);
  }

  findAll(): Promise<Post[]> {
    return this.postsRepository.find();
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOneBy({ id });

    if (!post) {
      // 존재하지 않는 id는 404 오류를 반환합니다.
      throw new NotFoundException(`Post with id ${id} was not found`);
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    if (
      updatePostDto.title === undefined &&
      updatePostDto.content === undefined
    ) {
      // 선택 필드만 있는 수정 DTO에서 빈 객체 요청을 400으로 처리합니다.
      throw new BadRequestException('At least one field must be provided');
    }

    // update는 전달된 필드만 DB에 바로 수정합니다.
    const result = await this.postsRepository.update(id, updatePostDto);

    if (result.affected === 0) {
      throw new NotFoundException(`Post with id ${id} was not found`);
    }

    // update는 수정 결과 Entity를 반환하지 않으므로 다시 조회합니다.
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // delete는 id 조건으로 DB 행을 바로 삭제합니다.
    const result = await this.postsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Post with id ${id} was not found`);
    }
  }
}
