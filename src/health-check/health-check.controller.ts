import { Controller, Get, HttpCode } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { HealthCheckService } from './health-check.service';
import { HealthCheckResult } from '@nestjs/terminus';

@ApiTags('Health Check')
@Controller('health')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Check system health',
    description:
      'Returns the health status of the database, scraper and general system.',
  })
  @ApiOkResponse({
    description: 'System is healthy',
    schema: {
      example: {
        status: 'ok',
        info: {
          database: { status: 'up' },
          scraper: { status: 'up' },
        },
        error: {},
        details: {
          database: { status: 'up' },
          scraper: { status: 'up' },
        },
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'System is partially or completely unavailable',
    schema: {
      example: {
        status: 'error',
        info: {
          database: { status: 'up' },
        },
        error: {
          scraper: {
            status: 'down',
            message: 'Failed to initialize scraper context',
          },
        },
        details: {
          database: { status: 'up' },
          scraper: {
            status: 'down',
            message: 'Failed to initialize scraper context',
          },
        },
      },
    },
  })
  async check(): Promise<HealthCheckResult> {
    return this.healthCheckService.checkAll();
  }
}
