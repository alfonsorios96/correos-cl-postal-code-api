import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { StatsService } from './stats.service';
import { AppStatsDto } from './dto/stats.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Statistics')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Get database record counts',
    description:
      'Returns the total number of records for each entity in the application.',
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
