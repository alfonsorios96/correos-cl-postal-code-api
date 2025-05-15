import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Street } from './entities/street.entity';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Street]), LoggerModule],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class StreetsModule {}
