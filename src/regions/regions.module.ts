import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from './entities/region.entity';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Region]), LoggerModule],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class RegionsModule {}
