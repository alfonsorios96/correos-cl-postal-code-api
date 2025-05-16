import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../regions/entities/region.entity';
import { Commune } from '../communes/entities/commune.entity';
import regionsData from './data/regions.data';
import communesData from './data/communes.data';

@Injectable()
export class SeedersService {
  constructor(
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
    @InjectRepository(Commune)
    private readonly communeRepository: Repository<Commune>,
  ) {}

  async seedRegions() {
    for (const region of regionsData) {
      const exists = await this.regionRepository.findOne({
        where: { number: region.number },
      });
      if (!exists) {
        const newRegion = this.regionRepository.create(region);
        await this.regionRepository.save(newRegion);
        console.log(`✅ Inserted: ${region.label}`);
      } else {
        console.log(`⚠️ Skipped (already exists): ${region.label}`);
      }
    }

    return { message: '🌱 Region seeding completed' };
  }

  async seedCommunes() {
    for (const commune of communesData) {
      const region = await this.regionRepository.findOne({
        where: { number: commune.regionNumber },
      });

      if (!region) {
        console.warn(
          `⛔️ Skipped commune "${commune.name}": region ${commune.regionNumber} not found.`,
        );
        continue;
      }

      const exists = await this.communeRepository.findOne({
        where: { name: commune.name, region: { id: region.id } },
        relations: ['region'],
      });

      if (!exists) {
        const newCommune = this.communeRepository.create({
          name: commune.name,
          region,
        });
        await this.communeRepository.save(newCommune);
        console.log(`✅ Inserted: ${commune.name}`);
      } else {
        console.log(`⚠️ Skipped (already exists): ${commune.name}`);
      }
    }

    return { message: '🌱 Commune seeding completed' };
  }
}
