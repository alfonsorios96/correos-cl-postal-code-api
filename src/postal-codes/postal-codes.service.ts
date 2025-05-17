import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

    if (!numberValue) {
      return { error: 'Número de calle no puede estar vacío' };
    }

    const normalizedCommune = normalizeText(communeInput);
    const normalizedStreet = normalizeText(streetInput);

    this.logger.log(
      `Normalized input → Commune: '${normalizedCommune}', Street: '${normalizedStreet}', Number: '${numberValue}'`,
      'PostalCodesService',
    );

    const commune = await this.communeRepository.findOne({
      where: { normalizedName: normalizedCommune },
      relations: ['region'],
    });

    if (!commune) {
      this.logger.warn(
        `Commune not found: '${communeInput}'`,
        'PostalCodesService',
      );
      throw new NotFoundException(`Commune '${communeInput}' not found`);
    }

    let street = await this.streetRepository.findOne({
      where: {
        normalizedName: normalizedStreet,
        commune: { id: commune.id },
      },
    });

    let streetNumber: StreetNumber | null = null;

    if (street) {
      this.logger.debug(`Street found: ${street.name}`, 'PostalCodesService');

      streetNumber = await this.streetNumberRepository.findOne({
        where: {
          value: numberValue,
          street: { id: street.id },
        },
        relations: ['postalCode'],
      });

      if (streetNumber?.postalCode) {
        this.logger.log(
          `Postal code already exists for ${street.name} ${numberValue}: ${streetNumber.postalCode.code}`,
          'PostalCodesService',
        );

        return {
          id: streetNumber.postalCode.id,
          street: street.name.toUpperCase(),
          number: streetNumber.value,
          commune: commune.name.toUpperCase(),
          region: commune.region.label.toUpperCase(),
          postalCode: streetNumber.postalCode.code,
        };
      }
    }

    this.logger.debug(
      `No valid postal code found. Executing scraper...`,
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

    const scrapedCode = result.postalCode!.trim();

    this.logger.log(
      `Scraper returned postal code: ${scrapedCode}`,
      'PostalCodesService',
    );

    if (!street) {
      const existingStreet = await this.streetRepository.findOne({
        where: {
          normalizedName: normalizedStreet,
          commune: { id: commune.id },
        },
      });

      if (existingStreet) {
        this.logger.warn(
          `Race condition detected: reusing existing street`,
          'PostalCodesService',
        );
        street = existingStreet;
      } else {
        street = await this.streetRepository.save(
          this.streetRepository.create({
            name: streetInput.toUpperCase(),
            normalizedName: normalizedStreet,
            commune,
          }),
        );
        this.logger.log(
          `New street created: ${street.name}`,
          'PostalCodesService',
        );
      }
    }

    let postalCode = await this.postalCodeRepository.findOne({
      where: { code: scrapedCode },
    });

    if (!postalCode) {
      postalCode = await this.postalCodeRepository.save(
        this.postalCodeRepository.create({ code: scrapedCode }),
      );
      this.logger.log(
        `New postal code created: ${postalCode.code}`,
        'PostalCodesService',
      );
    } else {
      this.logger.debug(
        `Postal code reused: ${postalCode.code}`,
        'PostalCodesService',
      );
    }

    if (!streetNumber) {
      const existingStreetNumber = await this.streetNumberRepository.findOne({
        where: {
          value: numberValue,
          street: { id: street.id },
        },
      });

      if (existingStreetNumber) {
        this.logger.warn(
          `Race condition on number. Reusing and updating`,
          'PostalCodesService',
        );
        streetNumber = existingStreetNumber;
      } else {
        streetNumber = this.streetNumberRepository.create({
          value: numberValue,
          street,
          postalCode,
        });
        this.logger.log(`Creating new street number`, 'PostalCodesService');
      }
    }

    if (!streetNumber.postalCode) {
      streetNumber.postalCode = postalCode;
    }

    await this.streetNumberRepository.save(streetNumber);

    this.logger.log(
      `Street number saved: ${street.name} ${streetNumber.value} → ${postalCode.code}`,
      'PostalCodesService',
    );

    return {
      id: postalCode.id,
      street: street.name.toUpperCase(),
      number: streetNumber.value,
      commune: commune.name.toUpperCase(),
      region: commune.region.label.toUpperCase(),
      postalCode: postalCode.code,
    };
  }

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{
    data: PostalCodeResponseDto[];
    meta: Readonly<{ total: number; page: number; limit: number }>;
  }> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);

    const [postalCodes, total] = await this.postalCodeRepository.findAndCount({
      order: { id: 'ASC' },
      take: safeLimit,
      skip: (safePage - 1) * safeLimit,
      relations: [
        'streetNumbers',
        'streetNumbers.street',
        'streetNumbers.street.commune',
        'streetNumbers.street.commune.region',
      ],
    });

    const data = postalCodes.flatMap<PostalCodeResponseDto>((pc) =>
      pc.streetNumbers.map<PostalCodeResponseDto>((sn) => ({
        id: pc.id,
        street: sn.street.name.toUpperCase(),
        number: sn.value,
        commune: sn.street.commune.name.toUpperCase(),
        region: sn.street.commune.region.label.toUpperCase(),
        postalCode: pc.code,
      })),
    );

    this.logger.log(
      `findAll → page:${safePage} limit:${safeLimit} returned:${data.length}/${total}`,
      'PostalCodesService',
    );

    return {
      data,
      meta: { total, page: safePage, limit: safeLimit } as const,
    };
  }

  async findByCode(code: string): Promise<PostalCodeResponseDto[]> {
    const trimmed = code.trim();

    if (!trimmed) {
      throw new BadRequestException('Postal code cannot be empty');
    }

    const postal = await this.postalCodeRepository.findOne({
      where: { code: trimmed },
      relations: [
        'streetNumbers',
        'streetNumbers.street',
        'streetNumbers.street.commune',
        'streetNumbers.street.commune.region',
      ],
    });

    if (!postal) {
      this.logger.warn(
        `Postal code not found: ${trimmed}`,
        'PostalCodesService',
      );
      throw new NotFoundException(`Postal code '${trimmed}' not found`);
    }

    const result = postal.streetNumbers.map<PostalCodeResponseDto>((sn) => ({
      id: postal.id,
      street: sn.street.name.toUpperCase(),
      number: sn.value,
      commune: sn.street.commune.name.toUpperCase(),
      region: sn.street.commune.region.label.toUpperCase(),
      postalCode: postal.code,
    }));

    this.logger.log(
      `findByCode '${trimmed}' → ${result.length} address(es)`,
      'PostalCodesService',
    );

    return result;
  }
}
