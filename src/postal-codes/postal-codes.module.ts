import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostalCodesService } from './postal-codes.service';
import { PostalCodesController } from './postal-codes.controller';
import { PostalCode } from './entities/postal-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostalCode])],
  controllers: [PostalCodesController],
  providers: [PostalCodesService],
  exports: [PostalCodesService],
})
export class PostalCodesModule {}
