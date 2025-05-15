import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostalCode } from './entities/postal-code.entity';
import { PostalCodeSearchDto } from './dto/postal-code-search.dto';
import { scrapePostalCode } from '../utils/postal-code-scraper.util';
import { AppLogger } from '../common/logger/logger.service';
import { PostalCodeResponseDto } from './dto/postal-code-response.dto';

@Injectable()
export class PostalCodesService {
  constructor(
    @InjectRepository(PostalCode)
    private readonly postalCodeRepository: Repository<PostalCode>,
    private readonly logger: AppLogger,
  ) {}

  async findOrScrape(
    dto: PostalCodeSearchDto,
  ): Promise<PostalCodeResponseDto | { error: string }> {
    const commune = dto.commune.trim().toLowerCase();
    const street = dto.street.trim().toLowerCase();
    const number = dto.number.trim();

    this.logger.log(
      `Searching postal code for ${commune}, ${street} ${number}`,
      'PostalCodesService',
    );

    const existing = await this.postalCodeRepository.findOne({
      where: { commune, street, number, isActive: true },
    });

    if (existing) {
      this.logger.debug(
        `Postal code found in DB: ${existing.code}`,
        'PostalCodesService',
      );

      return {
        id: existing.id,
        street: existing.street,
        number: existing.number,
        commune: existing.commune,
        postalCode: existing.code,
      };
    }

    this.logger.debug(
      `Postal code not found in DB. Scraping required.`,
      'PostalCodesService',
    );

    const result = await scrapePostalCode(commune, street, number);

    if (result.error) {
      this.logger.error(
        `Scraping failed: ${result.error}`,
        undefined,
        'PostalCodesService',
      );
      return { error: result.error };
    }

    const newRecord = this.postalCodeRepository.create({
      commune,
      street,
      number,
      code: result.postalCode,
    });

    const saved = await this.postalCodeRepository.save(newRecord);

    this.logger.log(
      `Postal code scraped and saved: ${result.postalCode}`,
      'PostalCodesService',
    );

    return {
      id: saved.id,
      street: saved.street,
      number: saved.number,
      commune: saved.commune,
      postalCode: saved.code,
    };
  }
}
