import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ConfigModule.forRoot() (in AppModule) already loaded the right .env.*
  // file and validated it by the time this line runs, so it's safe to pull
  // values from ConfigService here — no manual dotenv import needed anymore.
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Parses the Cookie header into req.cookies — needed to read the
  // httpOnly refresh-token cookie on /auth/refresh and /auth/logout.
  app.use(cookieParser());

  // Without this, the browser blocks every request from the frontend's
  // origin to the API before it even leaves the page — different origin per
  // browser rules. curl never hits this, since CORS is enforced by browsers,
  // not servers. `credentials: true` is required separately for the browser
  // to send/store the httpOnly refresh-token cookie on cross-origin requests.
  app.enableCors({
    origin: configService.getOrThrow<string>('CORS_ORIGIN'),
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('AccessSuite API')
    .setDescription('Multi-tenant RBAC + billing SaaS API')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(configService.getOrThrow<number>('PORT'));
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
