import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      // DTO에 없는 필드는 허용하지 않습니다.
      whitelist: true,
      // DTO에 없는 필드가 오면 제거하지 않고 400 오류를 반환합니다.
      forbidNonWhitelisted: true,
    }),
  );
  // @Exclude() 같은 class-transformer 규칙을 모든 응답에 적용합니다.
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Board API')
    .setDescription('Nest CRUD 학습용 게시판 API')
    .setVersion('1.0')
    .addTag('게시글', '게시글 API')
    .addTag('인증', '회원가입, 로그인, JWT 인증 API')
    .addTag('댓글', '댓글 API')
    .addTag('사용자', '내 프로필과 내 활동 API')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api-docs', app, documentFactory);

  await app.listen(Number(configService.get<string>('PORT') ?? 3000));
}
void bootstrap();
