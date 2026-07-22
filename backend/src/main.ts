import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Without this, the browser blocks every request from the Angular dev
  // server (localhost:4200) to the API (localhost:3000) before it even
  // leaves the page — different port = different origin, per browser rules.
  // curl never hits this, since CORS is enforced by browsers, not servers.
  app.enableCors({ origin: 'http://localhost:4200' });

  const config = new DocumentBuilder()
    .setTitle('AccessSuite API')
    .setDescription('Multi-tenant RBAC + billing SaaS API')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
