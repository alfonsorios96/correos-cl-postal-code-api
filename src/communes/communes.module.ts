import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commune } from './entities/commune.entity';
import { LoggerModule } from '../common/logger/logger.module';
import { CommunesService } from './communes.service';
import { CommunesController } from './communes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Commune]), LoggerModule],
  controllers: [CommunesController],
  providers: [CommunesService],
  exports: [TypeOrmModule],
})
export class CommunesModule {}
