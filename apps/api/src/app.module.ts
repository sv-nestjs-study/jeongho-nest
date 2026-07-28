import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.getOrThrow<string>('DB_HOST'),
        port: Number(configService.getOrThrow<string>('DB_PORT')),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize:
          configService.getOrThrow<string>('DB_SYNCHRONIZE') === 'true',
        logging: configService.getOrThrow<string>('DB_LOGGING') === 'true',
        retryAttempts: 5,
        retryDelay: 3000,
        invalidWhereValuesBehavior: {
          null: 'throw',
          undefined: 'throw',
        },
      }),
    }),
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
