import { Controller, Get, HttpCode } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { HealthCheckService } from './health-check.service';
import { HealthCheckResult } from '@nestjs/terminus';

@ApiTags('🧩 System')
@Controller('health')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: '📊 Health check of system components',
    description: `Returns the real-time health status of critical services:
- 📦 Database connection
- 🕷️ Scraper availability
- ⚙️ General system readiness

Useful for monitoring and uptime verification.`,
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
