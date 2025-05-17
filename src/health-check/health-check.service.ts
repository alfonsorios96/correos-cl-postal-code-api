import { Injectable } from '@nestjs/common';
import {
  HealthCheckService as TerminusHealthCheckService,
  TypeOrmHealthIndicator,
  HealthCheckResult,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { AppLogger } from '../common/logger/logger.service';
import { getBrowser } from '../utils/browser-provider.util';

@Injectable()
export class HealthCheckService {
  private readonly CONTEXT = 'HealthCheckService';

  constructor(
    private readonly health: TerminusHealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly logger: AppLogger,
  ) {}

  async checkDatabase(): Promise<HealthIndicatorResult> {
    this.logger.debug('Checking database connection...', this.CONTEXT);
    return this.db.pingCheck('database');
  }

  async checkScraper(): Promise<HealthIndicatorResult> {
    this.logger.debug('Checking scraper availability...', this.CONTEXT);

    try {
      const browser = await getBrowser();
      const context = await browser.newContext();
      await context.close();

      return {
        scraper: {
          status: 'up',
        },
      };
    } catch (error) {
      this.logger.error(
        'Scraper check failed',
        (error as Error)?.stack ?? String(error),
        this.CONTEXT,
      );
      return {
        scraper: {
          status: 'down',
          message: 'Failed to initialize scraper context',
        },
      };
    }
  }

  async checkAll(): Promise<HealthCheckResult> {
    this.logger.log('Performing full system health check...', this.CONTEXT);
    return this.health.check([
      async () => this.checkDatabase(),
      async () => this.checkScraper(),
    ]);
  }
}
