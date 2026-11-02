import './config/load-env';
import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(helmet());

  const config = app.get(ConfigService);
  const webOrigin = config.get<string>('app.webOrigin'); //?? 'http://localhost:3000';
  const port = config.get<number>('app.port') ?? 3001;
  const nodeEnv = process.env.NODE_ENV ?? 'development';

  // CORS locked to the frontend origin (bearer tokens, no cookies → no
  // credentials needed).

  if (nodeEnv === 'production') {
  if (!webOrigin) {
    throw new Error('WEB_ORIGIN must be configured in production');
  }

  if (
    webOrigin.includes('localhost') ||
    webOrigin.includes('127.0.0.1')
  ) {
    throw new Error(
      'Localhost WEB_ORIGIN is not allowed in production',
    );
  }
}

  app.enableCors({ origin: [webOrigin], credentials: false });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Light For Volunteer API')
    .setDescription('Authentication, volunteer and organisation profiles, opportunities, applications, reviews, moderation, messaging, notifications and storage APIs.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  new Logger('Bootstrap').log(
    `API listening on http://localhost:${port}/api (docs at /docs)`,
  );
}

void bootstrap();
