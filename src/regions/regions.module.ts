import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from './entities/region.entity';
import { LoggerModule } from '../common/logger/logger.module';
import { RegionsService } from './regions.service';
import { RegionsController } from './regions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Region]), LoggerModule],
  controllers: [RegionsController],
  providers: [RegionsService],
  exports: [TypeOrmModule],
})
export class RegionsModule {}
