import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from '../regions/entities/region.entity';
import { Commune } from '../communes/entities/commune.entity';
import { Street } from '../streets/entities/street.entity';
import { StreetNumber } from '../street-numbers/entities/street-number.entity';
import { PostalCode } from '../postal-codes/entities/postal-code.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Region,
      Commune,
      Street,
      StreetNumber,
      PostalCode,
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
