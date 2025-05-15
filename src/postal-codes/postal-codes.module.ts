// src/postal-codes/postal-codes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostalCodesService } from './postal-codes.service';
import { PostalCodesController } from './postal-codes.controller';
import { PostalCode } from './entities/postal-code.entity';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostalCode]), LoggerModule],
  controllers: [PostalCodesController],
  providers: [PostalCodesService],
  exports: [PostalCodesService],
})
export class PostalCodesModule {}
