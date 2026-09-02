import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Post } from '../entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

interface PostCommentCountRow {
  post_id: number | string;
  commentCount: number | string;
}

@Injectable()
export class PostsService {
  constructor(
    // PostsModule의 forFeature([Post])로 등록한 Repository를 주입합니다.
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly dataSource: DataSource,
  ) {}

  create(createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postsRepository.create(createPostDto);

    return this.postsRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    const { entities, raw } = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoin('post.comments', 'comment', 'comment.deletedAt IS NULL')
      .addSelect('COUNT(comment.id)', 'commentCount')
      .groupBy('post.id')
      .orderBy('post.createdAt', 'DESC')
      .getRawAndEntities<PostCommentCountRow>();
    const commentCounts = new Map(
      raw.map((row) => [Number(row.post_id), Number(row.commentCount)]),
    );

    return entities.map((post) => {
      post.commentCount = commentCounts.get(post.id) ?? 0;

      return post;
    });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.findPostById(id);

    // DB의 viewCount 컬럼을 1 증가시킵니다.
    await this.postsRepository.increment({ id }, 'viewCount', 1);
    // increment는 수정된 Entity를 반환하지 않으므로 응답 객체의 값도 맞춥니다.
    post.viewCount += 1;

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    // update는 전달된 필드만 DB에 바로 수정합니다.
    const result = await this.postsRepository.update(id, updatePostDto);

    if (result.affected === 0) {
      throw new NotFoundException(`게시글을 찾을 수 없습니다. id: ${id}`);
    }

    // update는 수정 결과 Entity를 반환하지 않으므로 다시 조회합니다.
    return this.findPostById(id);
  }

  async remove(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const postsRepository = manager.getRepository(Post);
      const commentsRepository = manager.getRepository(Comment);
      const post = await postsRepository.findOneBy({ id });

      if (!post) {
        throw new NotFoundException(`게시글을 찾을 수 없습니다. id: ${id}`);
      }

      await commentsRepository.softDelete({ post: { id } });
      await postsRepository.softDelete(id);
    });
  }

  private async findPostById(id: number): Promise<Post> {
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect(
        'post.comments',
        'comment',
        'comment.deletedAt IS NULL',
      )
      .leftJoinAndSelect('comment.author', 'author')
      .where('post.id = :id', { id })
      .orderBy('comment.createdAt', 'ASC')
      .getOne();

    if (!post) {
      // 존재하지 않는 id는 404 오류를 반환합니다.
      throw new NotFoundException(`게시글을 찾을 수 없습니다. id: ${id}`);
    }

    return post;
  }
}
