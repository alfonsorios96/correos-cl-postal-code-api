import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthCheckService } from './health-check.service';
import { HealthCheckController } from './health-check.controller';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [TerminusModule, TypeOrmModule.forFeature(), LoggerModule],
  controllers: [HealthCheckController],
  providers: [HealthCheckService],
})
export class HealthCheckModule {}
