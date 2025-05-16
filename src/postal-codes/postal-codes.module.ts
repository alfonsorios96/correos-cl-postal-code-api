import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostalCodesService } from './postal-codes.service';
import { PostalCodesController } from './postal-codes.controller';
import { PostalCode } from './entities/postal-code.entity';
import { LoggerModule } from '../common/logger/logger.module';
import { Commune } from '../communes/entities/commune.entity';
import { Street } from '../streets/entities/street.entity';
import { StreetNumber } from '../street-numbers/entities/street-number.entity';
import { Region } from '../regions/entities/region.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostalCode,
      Commune,
      Street,
      StreetNumber,
      Region,
    ]),
    LoggerModule,
  ],
  controllers: [PostalCodesController],
  providers: [PostalCodesService],
  exports: [PostalCodesService],
})
export class PostalCodesModule {}
