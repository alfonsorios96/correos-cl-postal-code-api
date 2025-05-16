import { Module } from '@nestjs/common';
import { SeedersService } from './seeders.service';
import { SeedersController } from './seeders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from '../regions/entities/region.entity';
import { Commune } from '../communes/entities/commune.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Region, Commune])],
  controllers: [SeedersController],
  providers: [SeedersService],
})
export class SeedersModule {}
