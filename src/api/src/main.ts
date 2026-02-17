import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();

  const openApiConfig = new DocumentBuilder()
    .setTitle('Wath Together API')
    .setDescription('API reference')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, openApiConfig);

  app.use('/api/docs',
    apiReference({
      spec: {
        content: document,
      },
      title: 'API Reference',
      layout: 'modern',
      defaultHttpClient: { targetKey: 'shell', clientKey: 'curl' },
    }),
  );

  app.use('/openapi.json', (_req, res) => res.json(document))

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
