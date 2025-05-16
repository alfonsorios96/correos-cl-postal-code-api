import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostalCode } from './entities/postal-code.entity';
import { PostalCodeSearchDto } from './dto/postal-code-search.dto';
import { AppLogger } from '../common/logger/logger.service';
import { PostalCodeResponseDto } from './dto/postal-code-response.dto';
import { normalizeText } from '../utils/normalize-text.util';
import { scrapePostalCode } from '../utils/postal-code-scraper.util';
import { Commune } from '../communes/entities/commune.entity';
import { Street } from '../streets/entities/street.entity';
import { StreetNumber } from '../street-numbers/entities/street-number.entity';

@Injectable()
export class PostalCodesService {
  constructor(
    @InjectRepository(PostalCode)
    private readonly postalCodeRepository: Repository<PostalCode>,

    @InjectRepository(Commune)
    private readonly communeRepository: Repository<Commune>,

    @InjectRepository(Street)
    private readonly streetRepository: Repository<Street>,

    @InjectRepository(StreetNumber)
    private readonly streetNumberRepository: Repository<StreetNumber>,

    private readonly logger: AppLogger,
  ) {}

  async findOrScrape(
    dto: PostalCodeSearchDto,
  ): Promise<PostalCodeResponseDto | { error: string }> {
    const communeInput = dto.commune.trim();
    const streetInput = dto.street.trim();
    const numberValue = dto.number.trim();

    const normalizedCommune = normalizeText(communeInput);
    const normalizedStreet = normalizeText(streetInput);

    this.logger.log(
      `Searching postal code for ${normalizedCommune}, ${normalizedStreet} ${numberValue}`,
      'PostalCodesService',
    );

    // 1. Buscar comuna
    const commune = await this.communeRepository.findOne({
      where: { normalizedName: normalizedCommune },
      relations: ['region'],
    });

    if (!commune) {
      throw new NotFoundException(`Commune '${communeInput}' not found`);
    }

    // 2. Buscar calle
    let street = await this.streetRepository.findOne({
      where: {
        normalizedName: normalizedStreet,
        commune: { id: commune.id },
      },
    });

    // 3. Buscar número de calle
    let streetNumber: StreetNumber | null = null;
    if (street) {
      streetNumber = await this.streetNumberRepository.findOne({
        where: {
          value: numberValue,
          street: { id: street.id },
        },
        relations: ['postalCode'],
      });

      // 4. Si ya tiene postal code, retornarlo
      if (streetNumber?.postalCode) {
        return {
          id: streetNumber.postalCode.id,
          street: street.name,
          number: streetNumber.value,
          commune: commune.name,
          region: commune.region.name,
          postalCode: streetNumber.postalCode.code,
        };
      }
    }

    // 5. Scraping
    this.logger.debug(
      `Postal code not found locally. Executing scraper.`,
      'PostalCodesService',
    );

    const result = await scrapePostalCode(
      commune.name,
      streetInput,
      numberValue,
    );

    if (result.error) {
      this.logger.error(
        `Scraping failed: ${result.error}`,
        undefined,
        'PostalCodesService',
      );
      return { error: result.error };
    }

    // 6. Guardar postal code y entidades asociadas solo si el scraper fue exitoso
    if (!street) {
      street = await this.streetRepository.save(
        this.streetRepository.create({
          name: streetInput,
          normalizedName: normalizedStreet,
          commune,
        }),
      );
    }

    const postalCode = await this.postalCodeRepository.save(
      this.postalCodeRepository.create({
        code: result.postalCode,
      }),
    );

    if (!streetNumber) {
      streetNumber = this.streetNumberRepository.create({
        value: numberValue,
        street,
        postalCode,
      });
    } else {
      streetNumber.postalCode = postalCode;
    }

    await this.streetNumberRepository.save(streetNumber);

    this.logger.log(
      `Postal code scraped and saved: ${result.postalCode}`,
      'PostalCodesService',
    );

    return {
      id: postalCode.id,
      street: street.name,
      number: streetNumber.value,
      commune: commune.name,
      region: commune.region.name,
      postalCode: postalCode.code,
    };
  }
}
