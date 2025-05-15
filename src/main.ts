/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppLogger } from './common/logger/logger.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  const logger = app.get(AppLogger);
  app.useLogger(logger);

  logger.log('Starting application...', 'Bootstrap');

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('v1');

  const config = new DocumentBuilder()
    .setTitle('Chilean Postal Codes API')
    .setDescription(
      'Free and public API that retrieves postal codes from Correos de Chile using headless scraping.\n\nBuilt with ❤️ by KaiNext.',
    )
    .setVersion('1.0')
    .addTag('Postal Codes')
    .setContact('KaiNext', 'https://kainext.cl', 'contacto@kainext.cl')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/api', app, document);

  // Redirección desde la raíz '/' a '/v1/api'
  app.getHttpAdapter().get('/', (_req, res) => {
    res.redirect('/v1/api');
  });

  const port = Number(process.env.PORT) || 3000;

  await app
    .listen(port, '0.0.0.0')
    .then(() => {
      const baseUrl =
        process.env.NODE_ENV === 'production'
          ? `https://your-production-domain.com`
          : `http://localhost:${port}`;
      logger.log(`🚀 Server ready at ${baseUrl}/v1/api`, 'Bootstrap');
    })
    .catch((err) => {
      logger.error('❌ Failed to start server', err.stack, 'Bootstrap');
    });
}

void bootstrap();
