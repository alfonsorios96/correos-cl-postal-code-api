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
import { Region } from '../regions/entities/region.entity';

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

    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,

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

    // 1. Buscar comuna por normalizedName
    const commune = await this.communeRepository.findOne({
      where: { normalizedName: normalizedCommune },
      relations: ['region'],
    });

    if (!commune) {
      throw new NotFoundException(`Commune '${communeInput}' not found`);
    }

    // 2. Buscar o crear calle por normalizedName
    let street = await this.streetRepository.findOne({
      where: {
        normalizedName: normalizedStreet,
        commune: { id: commune.id },
      },
    });

    if (!street) {
      street = this.streetRepository.create({
        name: streetInput,
        normalizedName: normalizedStreet,
        commune,
      });
      street = await this.streetRepository.save(street);
    }

    // 3. Buscar número de calle
    let streetNumber = await this.streetNumberRepository.findOne({
      where: {
        value: numberValue,
        street: { id: street.id },
      },
      relations: ['postalCode'],
    });

    // 4. Si ya tiene postalCode, devolver respuesta
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

    // 5. Scraper si no hay postal code asociado
    this.logger.debug(
      `Postal code not found locally. Executing scraper.`,
      'PostalCodesService',
    );

    const result = await scrapePostalCode(
      commune.name,
      street.name,
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

    // 6. Guardar código postal
    const postalCode = await this.postalCodeRepository.save(
      this.postalCodeRepository.create({
        code: result.postalCode,
      }),
    );

    // 7. Crear o actualizar StreetNumber
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
