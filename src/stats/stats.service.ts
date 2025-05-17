import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../regions/entities/region.entity';
import { Commune } from '../communes/entities/commune.entity';
import { Street } from '../streets/entities/street.entity';
import { StreetNumber } from '../street-numbers/entities/street-number.entity';
import { PostalCode } from '../postal-codes/entities/postal-code.entity';
import { AppStatsDto } from './dto/stats.dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Region)
    private readonly regionRepo: Repository<Region>,
    @InjectRepository(Commune)
    private readonly communeRepo: Repository<Commune>,
    @InjectRepository(Street)
    private readonly streetRepo: Repository<Street>,
    @InjectRepository(StreetNumber)
    private readonly streetNumberRepo: Repository<StreetNumber>,
    @InjectRepository(PostalCode)
    private readonly postalCodeRepo: Repository<PostalCode>,
  ) {}

  async getStats(): Promise<AppStatsDto> {
    const [regions, communes, streets, streetNumbers, postalCodes] =
      await Promise.all([
        this.regionRepo.count(),
        this.communeRepo.count(),
        this.streetRepo.count(),
        this.streetNumberRepo.count(),
        this.postalCodeRepo.count(),
      ]);

    return { regions, communes, streets, streetNumbers, postalCodes };
  }
}
