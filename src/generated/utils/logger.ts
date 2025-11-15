/**
 * Structured logger utility with pino package (Phase 2B).
 * 
 * Generated - do not edit directly.
 */

// @ts-ignore - pino types available via @types/pino
import pino from 'pino';
import type { SdkConfig } from '../config';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface Logger {
  debug(message: string, data?: Record<string, any>): void;
  info(message: string, data?: Record<string, any>): void;
  warn(message: string, data?: Record<string, any>): void;
  error(message: string, error?: Error | any, data?: Record<string, any>): void;
}

let _loggerInstance: pino.Logger | null = null;

/**
 * Get or create a pino logger instance.
 */
export function getLogger(config?: SdkConfig): Logger {
  if (_loggerInstance) {
    return _loggerInstance as unknown as Logger;
  }
  
  const logLevel = (config?.logLevel || process.env['FINATIC_LOG_LEVEL'] || 'error') as LogLevel;
  
  const pinoConfig: pino.LoggerOptions = {
    level: logLevel === 'silent' ? 'silent' : logLevel,
    ...(config?.structuredLogging !== false && {
      formatters: {
        level: (label: string) => {
          return { level: label };
        },
      },
      // Use default timestamp - pino will handle it automatically
      timestamp: true,
    }),
  };
  
  _loggerInstance = pino(pinoConfig);
  
  return _loggerInstance as unknown as Logger;
}
