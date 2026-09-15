import { config } from 'dotenv';
import { resolve } from 'node:path';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from './entities/post.entity';
import { User } from './entities/user.entity';

// Nest DI 밖에서 실행되는 migration CLI가 API 환경 변수를 읽도록 합니다.
config({
  path:
    process.env.DOTENV_CONFIG_PATH ??
    resolve(process.cwd(), 'apps/board/api/.env'),
});

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  entities: [Post, User, Comment],
  migrations: [resolve(__dirname, '../migrations/*{.ts,.js}')],
});
