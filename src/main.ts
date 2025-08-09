import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './guards/global-execution';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const hostUrl = configService.get<string>('hostUrl');
  const port = configService.get<number>('port');
  const appName = configService.get<string>('appName');
  const apiPrefix = configService.get<string>('apiPrefix');

  app.enableCors();
  app.setGlobalPrefix(apiPrefix as string);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(port as number);
  console.log(`🚀 ${appName} is running in ${hostUrl}:${port}${apiPrefix}`);
}

bootstrap();
