import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class AppLogger implements LoggerService {
  log(message: string, context?: string): void {
    console.log(`[LOG]${context ? ` [${context}]` : ''} ${message}`);
  }

  error(message: string, trace?: string, context?: string): void {
    console.error(`[ERROR]${context ? ` [${context}]` : ''} ${message}`);
    if (trace) {
      console.error(`[TRACE] ${trace}`);
    }
  }

  warn(message: string, context?: string): void {
    console.warn(`[WARN]${context ? ` [${context}]` : ''} ${message}`);
  }

  debug(message: string, context?: string): void {
    console.debug(`[DEBUG]${context ? ` [${context}]` : ''} ${message}`);
  }

  verbose(message: string, context?: string): void {
    console.info(`[VERBOSE]${context ? ` [${context}]` : ''} ${message}`);
  }
}
