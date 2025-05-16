import { DataSource } from 'typeorm';
import { Region } from '../entities/region.entity';
import { Commune } from '../../communes/entities/commune.entity';
import { Street } from '../../streets/entities/street.entity';
import { StreetNumber } from '../../street-numbers/entities/street-number.entity';
import { PostalCode } from '../../postal-codes/entities/postal-code.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'postal_codes',
  entities: [Region, Commune, Street, StreetNumber, PostalCode],
  synchronize: false,
  logging: false,
});

const regionsSeed: Partial<Region>[] = [
  {
    number: 1,
    name: 'Tarapacá',
    label: 'Región de Tarapacá',
    romanNumber: 'I',
  },
  {
    number: 2,
    name: 'Antofagasta',
    label: 'Región de Antofagasta',
    romanNumber: 'II',
  },
  {
    number: 3,
    name: 'Atacama',
    label: 'Región de Atacama',
    romanNumber: 'III',
  },
  {
    number: 4,
    name: 'Coquimbo',
    label: 'Región de Coquimbo',
    romanNumber: 'IV',
  },
  {
    number: 5,
    name: 'Valparaíso',
    label: 'Región de Valparaíso',
    romanNumber: 'V',
  },
  {
    number: 6,
    name: 'Libertador Bernardo O’Higgins',
    label: 'Región de O’Higgins',
    romanNumber: 'VI',
  },
  { number: 7, name: 'Maule', label: 'Región del Maule', romanNumber: 'VII' },
  {
    number: 8,
    name: 'Biobío',
    label: 'Región del Biobío',
    romanNumber: 'VIII',
  },
  {
    number: 9,
    name: 'La Araucanía',
    label: 'Región de La Araucanía',
    romanNumber: 'IX',
  },
  {
    number: 10,
    name: 'Los Lagos',
    label: 'Región de Los Lagos',
    romanNumber: 'X',
  },
  {
    number: 11,
    name: 'Aysén',
    label: 'Región de Aysén del General Carlos Ibáñez del Campo',
    romanNumber: 'XI',
  },
  {
    number: 12,
    name: 'Magallanes',
    label: 'Región de Magallanes y de la Antártica Chilena',
    romanNumber: 'XII',
  },
  {
    number: 13,
    name: 'Metropolitana',
    label: 'Región Metropolitana de Santiago',
    romanNumber: 'RM',
  },
  {
    number: 14,
    name: 'Los Ríos',
    label: 'Región de Los Ríos',
    romanNumber: 'XIV',
  },
  {
    number: 15,
    name: 'Arica y Parinacota',
    label: 'Región de Arica y Parinacota',
    romanNumber: 'XV',
  },
  { number: 16, name: 'Ñuble', label: 'Región de Ñuble', romanNumber: 'XVI' },
];

async function seedRegions() {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(Region);

  for (const region of regionsSeed) {
    const exists = await repo.findOne({ where: { number: region.number } });
    if (!exists) {
      const newRegion = repo.create(region);
      await repo.save(newRegion);
      console.log(`✅ Inserted: ${region.label}`);
    } else {
      console.log(`⚠️ Skipped (already exists): ${region.label}`);
    }
  }

  await AppDataSource.destroy();
  console.log('🌱 Region seeding completed');
}

seedRegions().catch((error) => {
  console.error('❌ Error seeding regions:', error);
  process.exit(1);
});
