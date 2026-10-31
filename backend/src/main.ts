import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('FormatFlowBootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;
  const corsOrigins = configService.get<string[]>('corsOrigins') || [
    'http://localhost:4200',
    'http://localhost:3000',
  ];

  // Configure CORS
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (
        !origin ||
        corsOrigins.includes(origin) ||
        corsOrigins.includes('*') ||
        origin.endsWith('.anythingforyou.in') ||
        origin === 'https://fileforge.anythingforyou.in'
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during development and client integrations
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    })
  );

  // Swagger OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('FormatFlow API')
    .setDescription(
      'FormatFlow Enterprise REST API for high-performance file conversion across images, PDFs, and documents.'
    )
    .setVersion('1.0')
    .addTag('Conversions', 'File upload, conversion lifecycle, download, and instant deletion')
    .addTag('Tools & Formats', 'Catalog of supported tools, metadata, and format capabilities')
    .addTag('Health', 'Uptime, disk storage monitoring, and conversion engine status')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.log(`🚀 FormatFlow API server running at http://localhost:${port}`);
  logger.log(`📖 Swagger API documentation available at http://localhost:${port}/api/docs`);
}

await bootstrap();
