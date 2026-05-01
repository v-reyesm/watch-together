import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.use(helmet());

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  if (process.env.NODE_ENV !== 'production') {
    const openApiConfig = new DocumentBuilder()
      .setTitle('WatchTogether API')
      .setDescription('API reference')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, openApiConfig);

    app.use(
      '/api/docs',
      apiReference({
        spec: { content: document },
        title: 'API Reference',
        layout: 'modern',
        defaultHttpClient: { targetKey: 'shell', clientKey: 'curl' },
      }),
    );

    app.use(
      '/openapi.json',
      (_req: unknown, res: { json: (doc: object) => void }) =>
        res.json(document),
    );
  }

  await app.listen(process.env.PORT ?? 8080);
}
void bootstrap();
