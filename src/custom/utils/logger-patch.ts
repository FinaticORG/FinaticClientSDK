/**
 * Logger patch for browser environments.
 * This patches the generated logger to work in browser/Next.js environments.
 * 
 * This file is protected - add custom logger fixes here.
 */

import { getLogger as originalGetLogger, type Logger, type LogLevel } from '../../generated/utils/logger';
import type { SdkConfig } from '../../generated/config';

let isPatched = false;

/**
 * Patched logger getter that handles browser environment issues with pino
 */
export function getLogger(config?: SdkConfig): Logger {
  // Try to use original logger first
  try {
    return originalGetLogger(config);
  } catch (error) {
    // Fallback logger for browser environments where pino might not work correctly
    const getEnvVar = (key: string): string | undefined => {
      try {
        // Check Node.js process.env
        if (typeof (globalThis as any).process !== 'undefined') {
          const proc = (globalThis as any).process;
          if (proc.env && proc.env[key]) {
            return proc.env[key];
          }
        }
      } catch {
        // Ignore if process is not available
      }
      
      // Check for Vite env vars in browser
      if (typeof window !== 'undefined') {
        const importMeta = (globalThis as any).import?.meta;
        if (importMeta?.env) {
          return importMeta.env[key];
        }
      }
      return undefined;
    };

    const logLevel = (config?.logLevel || getEnvVar('FINATIC_LOG_LEVEL') || 'error') as LogLevel;
    const fallbackLogger: Logger = {
      debug: (message: string, data?: Record<string, any>) => {
        if (logLevel === 'debug') {
          console.debug(`[DEBUG] ${message}`, data || '');
        }
      },
      info: (message: string, data?: Record<string, any>) => {
        if (['debug', 'info'].includes(logLevel)) {
          console.info(`[INFO] ${message}`, data || '');
        }
      },
      warn: (message: string, data?: Record<string, any>) => {
        if (['debug', 'info', 'warn'].includes(logLevel)) {
          console.warn(`[WARN] ${message}`, data || '');
        }
      },
      error: (message: string, error?: Error | any, data?: Record<string, any>) => {
        console.error(`[ERROR] ${message}`, error || data || '');
      },
    };
    
    if (!isPatched) {
      console.warn('[Finatic SDK] Using fallback logger due to pino initialization error:', error);
      isPatched = true;
    }
    
    return fallbackLogger;
  }
}

