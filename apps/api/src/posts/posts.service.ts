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
      throw new NotFoundException(`Post with id ${id} was not found`);
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    if (
      updatePostDto.title === undefined &&
      updatePostDto.content === undefined
    ) {
      throw new BadRequestException('At least one field must be provided');
    }

    const post = await this.findOne(id);

    Object.assign(post, updatePostDto);

    return this.postsRepository.save(post);
  }

  async remove(id: number): Promise<void> {
    const result = await this.postsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Post with id ${id} was not found`);
    }
  }
}
