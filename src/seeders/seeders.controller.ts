import { Controller, Post, Body } from '@nestjs/common';
import { SeedersService } from './seeders.service';
import { SeedRequestDto } from './dto/seed-request.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { validatePasswordOrThrow } from '../utils/validate-password.util';

@ApiTags('Seeders')
@Controller('seeders')
export class SeedersController {
  constructor(private readonly seedersService: SeedersService) {}

  @Post('regions')
  @ApiOperation({
    summary: 'Seed regions',
    description:
      'Seeds all Chilean regions into the database. Requires a secure password.',
  })
  @ApiResponse({ status: 201, description: 'Regions seeded successfully' })
  @ApiResponse({
    status: 418,
    description: 'Unauthorized attempt with joke message',
  })
  async seedRegions(@Body() body: SeedRequestDto) {
    validatePasswordOrThrow(body.password);
    return this.seedersService.seedRegions();
  }

  @Post('communes')
  @ApiOperation({
    summary: 'Seed communes',
    description:
      'Seeds all Chilean communes associated with their respective regions. Requires a secure password.',
  })
  @ApiResponse({ status: 201, description: 'Communes seeded successfully' })
  @ApiResponse({
    status: 418,
    description: 'Unauthorized attempt with joke message',
  })
  async seedCommunes(@Body() body: SeedRequestDto) {
    validatePasswordOrThrow(body.password);
    return this.seedersService.seedCommunes();
  }

  @Post('normalize')
  @ApiOperation({
    summary: 'Normalize database',
    description:
      'Normalizes commune/street/postalCode data: trims, merges duplicates, and updates names. Requires a secure password.',
  })
  @ApiResponse({
    status: 200,
    description: 'Normalization completed successfully',
  })
  @ApiResponse({
    status: 418,
    description: 'Unauthorized attempt with joke message',
  })
  async normalize(@Body() body: SeedRequestDto) {
    validatePasswordOrThrow(body.password);
    return this.seedersService.normalizeDatabase(true);
  }

  @Post('all')
  @ApiOperation({
    summary: 'Seed all core data and normalize the database',
    description:
      'Executes the full seeding process for regions and communes, followed by a database normalization routine. Cleans up duplicates, trims postal codes, and standardizes street and commune names. Requires a secure password.',
  })
  @ApiResponse({
    status: 201,
    description: 'All seeding completed successfully',
  })
  @ApiResponse({
    status: 418,
    description: 'Unauthorized attempt with joke message',
  })
  async seedAll(@Body() body: SeedRequestDto) {
    validatePasswordOrThrow(body.password);

    const regionsResult = await this.seedersService.seedRegions();
    const communesResult = await this.seedersService.seedCommunes();
    const normalizationResult =
      await this.seedersService.normalizeDatabase(true);

    return {
      regions: regionsResult.message,
      communes: communesResult.message,
      normalization: normalizationResult.message,
      message: '🌱 Full seeding and normalization completed successfully!',
    };
  }
}
