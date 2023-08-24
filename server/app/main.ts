import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { logger } from '@app/logger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useLogger(logger);
  app.enableCors({
    credentials: true,
    origin: true,
  });

  await app.listen(configService.get('SERVER_PORT'));
}
bootstrap();
