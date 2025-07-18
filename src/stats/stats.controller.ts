import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { StatsService } from './stats.service';
import { AppStatsDto } from './dto/stats.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('🧩 System')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('summary')
  @ApiOperation({
    summary: '📈 Get database record counts',
    description: `**Public endpoint.** Returns the total number of records for key entities in the system (regions, communes, streets, postal codes, etc.).
Useful for diagnostics, system monitoring or public transparency.`,
  })
  @ApiResponse({
    status: 200,
    description: 'Stats retrieved successfully.',
    type: AppStatsDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while fetching stats.',
  })
  async getSummary(): Promise<AppStatsDto> {
    try {
      return await this.statsService.getStats();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw new InternalServerErrorException(
        'An error occurred while retrieving statistics.',
      );
    }
  }
}
