import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreetNumber } from './entities/street-number.entity';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([StreetNumber]), LoggerModule],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class StreetNumbersModule {}
