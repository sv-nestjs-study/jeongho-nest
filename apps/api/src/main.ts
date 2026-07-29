import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
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
  await app.listen(Number(configService.get<string>('PORT') ?? 3000));
}
void bootstrap();
