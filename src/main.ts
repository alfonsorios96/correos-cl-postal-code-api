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

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

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
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Server ready at http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();
