import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../regions/entities/region.entity';
import { Commune } from '../communes/entities/commune.entity';
import { Street } from '../streets/entities/street.entity';
import { StreetNumber } from '../street-numbers/entities/street-number.entity';
import { PostalCode } from '../postal-codes/entities/postal-code.entity';
import regionsData from './data/regions.data';
import communesData from './data/communes.data';
import { normalizeText } from '../utils/normalize-text.util';

@Injectable()
export class SeedersService {
  constructor(
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
    @InjectRepository(Commune)
    private readonly communeRepository: Repository<Commune>,
    @InjectRepository(Street)
    private readonly streetRepository: Repository<Street>,
    @InjectRepository(StreetNumber)
    private readonly streetNumberRepository: Repository<StreetNumber>,
    @InjectRepository(PostalCode)
    private readonly postalCodeRepository: Repository<PostalCode>,
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
          normalizedName: normalizeText(commune.name),
          region,
          isActive: true,
        });
        await this.communeRepository.save(newCommune);
        console.log(`✅ Inserted: ${commune.name}`);
      } else {
        console.log(`⚠️ Skipped (already exists): ${commune.name}`);
      }
    }

    return { message: '🌱 Commune seeding completed' };
  }

  async normalizeDatabase(commit = true) {
    const details: string[] = [];

    const communes = await this.communeRepository.find();
    for (const c of communes) {
      const normalized = normalizeText(c.name);
      if (c.normalizedName !== normalized) {
        c.normalizedName = normalized;
        if (commit) await this.communeRepository.save(c);
        details.push(`🛠️ Normalized commune: ${c.name}`);
      }
    }

    const allStreets = await this.streetRepository.find({
      relations: ['commune'],
    });
    for (const street of allStreets) {
      const normalized = normalizeText(street.name);
      if (street.normalizedName !== normalized) {
        street.normalizedName = normalized;
        if (commit) await this.streetRepository.save(street);
        details.push(`✅ Normalized street: ${street.name}`);
      }
    }

    const grouped = new Map<string, Street[]>();
    for (const s of allStreets) {
      const key = `${s.commune.id}-${s.normalizedName}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(s);
    }

    for (const group of grouped.values()) {
      if (group.length > 1) {
        const [main, ...duplicates] = group;
        for (const dup of duplicates) {
          const numbers = await this.streetNumberRepository.find({
            where: { street: { id: dup.id } },
            relations: ['postalCode'],
          });
          for (const n of numbers) {
            if (n.street.id !== main.id) {
              n.street = main;
              if (commit) await this.streetNumberRepository.save(n);
            }
          }
          if (commit) await this.streetRepository.remove(dup);
          details.push(
            `♻️ Merged duplicate street '${dup.name}' → '${main.name}'`,
          );
        }
      }
    }

    const postals = await this.postalCodeRepository.find();
    for (const p of postals) {
      const trimmed = p.code.trim();
      if (p.code !== trimmed) {
        p.code = trimmed;
        if (commit) await this.postalCodeRepository.save(p);
        details.push(`✉️ Trimmed postal code: ${trimmed}`);
      }
    }

    const allPostals = await this.postalCodeRepository.find();
    const codeMap = new Map<string, PostalCode[]>();

    for (const pc of allPostals) {
      const code = pc.code.trim();
      if (!codeMap.has(code)) codeMap.set(code, []);
      codeMap.get(code)!.push(pc);
    }

    for (const [code, group] of codeMap) {
      if (group.length > 1) {
        const [main, ...duplicates] = group;

        for (const dup of duplicates) {
          const numbers = await this.streetNumberRepository.find({
            where: { postalCode: { id: dup.id } },
          });

          for (const n of numbers) {
            n.postalCode = main;
            if (commit) await this.streetNumberRepository.save(n);
          }

          if (commit) await this.postalCodeRepository.remove(dup);
          details.push(
            `♻️ Merged postal code '${code}' (ID ${dup.id}) into ID ${main.id}`,
          );
        }
      }
    }

    return {
      message: commit
        ? '🧹 Database normalization completed'
        : '🔍 Dry-run completed (no changes saved)',
      changes: details.length,
      dryRun: !commit,
    };
  }
}
