import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, Post } from '@jeongho-nest/db';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async create(
    postId: number,
    authorId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const post = await this.findPostById(postId);
    const comment = this.commentsRepository.create({
      content: createCommentDto.content,
      post,
      author: { id: authorId },
    });
    const savedComment = await this.commentsRepository.save(comment);

    return this.findCommentWithAuthor(savedComment.id);
  }

  async findAll(postId: number): Promise<Comment[]> {
    await this.findPostById(postId);

    return this.commentsRepository.find({
      where: { post: { id: postId } },
      relations: { author: true },
      order: { createdAt: 'ASC' },
    });
  }

  async remove(
    postId: number,
    commentId: number,
    authorId: number,
  ): Promise<void> {
    await this.findPostById(postId);

    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, post: { id: postId } },
      relations: { author: true },
    });

    if (!comment) {
      throw new NotFoundException(`댓글을 찾을 수 없습니다. id: ${commentId}`);
    }

    if (comment.author.id !== authorId) {
      throw new ForbiddenException('댓글을 삭제할 권한이 없습니다.');
    }

    await this.commentsRepository.softDelete(commentId);
  }

  private async findPostById(id: number): Promise<Post> {
    const post = await this.postsRepository.findOneBy({ id });

    if (!post) {
      throw new NotFoundException(`게시글을 찾을 수 없습니다. id: ${id}`);
    }

    return post;
  }

  private async findCommentWithAuthor(id: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: { author: true },
    });

    if (!comment) {
      throw new NotFoundException(`댓글을 찾을 수 없습니다. id: ${id}`);
    }

    return comment;
  }
}
