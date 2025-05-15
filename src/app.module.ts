/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostalCodesModule } from './postal-codes/postal-codes.module';
import { RegionsModule } from './regions/regions.module';
import { CommunesModule } from './communes/communes.module';
import { StreetsModule } from './streets/streets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        synchronize: true, //config.get<string>('NODE_ENV') !== 'production',
        autoLoadEntities: true,
        logging: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    PostalCodesModule,
    RegionsModule,
    CommunesModule,
    StreetsModule,
  ],
})
export class AppModule {}
