/**
 * Structured logger utility with browser-safe console logging (Phase 2C).
 *
 * Generated - do not edit directly.
 *
 * This logger uses browser console APIs for all logging in browser environments.
 */

import type { SdkConfig } from '../config';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface Logger {
  debug(message: string, data?: Record<string, any>): void;
  info(message: string, data?: Record<string, any>): void;
  warn(message: string, data?: Record<string, any>): void;
  error(message: string, error?: Error | any, data?: Record<string, any>): void;
}

let _loggerInstance: Logger | null = null;

/**
 * Get environment variable from various sources (browser and Node.js).
 */
function getEnvVar(key: string): string | undefined {
  try {
    // Check Node.js process.env (SSR environments)
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
}

/**
 * Detect if we're in production mode.
 */
function isProduction(): boolean {
  // Check Vite mode
  const viteMode = getEnvVar('MODE');
  if (viteMode === 'production') return true;

  // Check Vite PROD flag
  const viteProd = getEnvVar('PROD');
  if (viteProd === 'true') return true;

  // Check NODE_ENV
  const nodeEnv = getEnvVar('NODE_ENV');
  if (nodeEnv === 'production') return true;

  return false;
}

/**
 * Get or create a logger instance with browser-safe fallback.
 */
export function getLogger(config?: SdkConfig): Logger {
  if (_loggerInstance) {
    return _loggerInstance;
  }

  // Client SDK always uses browser-safe logger (no pino)
  return getBrowserSafeLogger(config);
}

/**
 * Browser-safe logger for Client SDK.
 */
function getBrowserSafeLogger(config?: SdkConfig): Logger {
  // Log level hierarchy (matching pino's numeric levels)
  const LOG_LEVELS: Record<string, number> = {
    silent: 0,
    error: 10,
    warn: 20,
    info: 30,
    debug: 40,
  };

  /**
   * Get effective log level considering production mode.
   */
  const getEffectiveLogLevel = (): LogLevel => {
    // Explicit config always wins
    if (config?.logLevel) {
      return config.logLevel as LogLevel;
    }

    // Check environment variable
    const envLevel = getEnvVar('FINATIC_LOG_LEVEL');
    if (envLevel && ['debug', 'info', 'warn', 'error', 'silent'].includes(envLevel)) {
      return envLevel as LogLevel;
    }

    // In production, default to error-only (unless explicitly overridden above)
    if (isProduction()) {
      return 'error';
    }

    // Development default
    return 'error'; // Even in dev, default to error for safety
  };

  const logLevel = getEffectiveLogLevel();
  const structuredLogging = config?.structuredLogging ?? false;

  /**
   * Check if we should log at this level.
   */
  const shouldLog = (messageLevel: LogLevel): boolean => {
    if (logLevel === 'silent') return false;
    const configuredLevel = LOG_LEVELS[logLevel] ?? LOG_LEVELS['error'];
    const msgLevel = LOG_LEVELS[messageLevel] ?? LOG_LEVELS['error'];
    if (configuredLevel === undefined || msgLevel === undefined) return false;
    return msgLevel >= configuredLevel;
  };

  /**
   * Format log entry as structured JSON (pino-compatible).
   */
  const formatStructuredLog = (
    level: number,
    levelLabel: string,
    message: string,
    data?: Record<string, any>,
    error?: Error | any
  ): string => {
    const logEntry: Record<string, any> = {
      level,
      time: Date.now(), // Unix timestamp in milliseconds (matching pino)
      msg: message,
    };

    // Add metadata from data object (flat merge, matching pino behavior)
    if (data && typeof data === 'object') {
      Object.assign(logEntry, data);
    }

    // Add error information if present
    if (error) {
      if (error instanceof Error) {
        logEntry['err'] = {
          type: error.name,
          message: error.message,
          stack: error.stack,
        };
      } else if (typeof error === 'object') {
        logEntry['err'] = error;
      } else {
        logEntry['err'] = { message: String(error) };
      }
    }

    return JSON.stringify(logEntry);
  };

  /**
   * Format log entry as pretty array (non-structured mode).
   */
  const formatPrettyLog = (
    levelLabel: string,
    message: string,
    data?: Record<string, any>,
    error?: Error | any
  ): any[] => {
    const parts: any[] = [`[${levelLabel.toUpperCase()}] ${message}`];

    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      parts.push(data);
    }

    if (error) {
      parts.push(error);
    }

    return parts;
  };

  /**
   * No-op logger for silent mode.
   */
  const noopLogger: Logger = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  };

  // Return no-op logger if silent
  if (logLevel === 'silent') {
    _loggerInstance = noopLogger;
    return _loggerInstance;
  }

  const fallbackLogger: Logger = {
    debug: (message: string, data?: Record<string, any>) => {
      if (!shouldLog('debug')) return;

      const debugLevel = LOG_LEVELS['debug'];
      if (debugLevel === undefined) return;

      if (structuredLogging) {
        const logStr = formatStructuredLog(debugLevel, 'debug', message, data);
        console.debug(logStr);
      } else {
        const logArgs = formatPrettyLog('debug', message, data);
        console.debug(...logArgs);
      }
    },

    info: (message: string, data?: Record<string, any>) => {
      if (!shouldLog('info')) return;

      const infoLevel = LOG_LEVELS['info'];
      if (infoLevel === undefined) return;

      if (structuredLogging) {
        const logStr = formatStructuredLog(infoLevel, 'info', message, data);
        console.info(logStr);
      } else {
        const logArgs = formatPrettyLog('info', message, data);
        console.info(...logArgs);
      }
    },

    warn: (message: string, data?: Record<string, any>) => {
      if (!shouldLog('warn')) return;

      const warnLevel = LOG_LEVELS['warn'];
      if (warnLevel === undefined) return;

      if (structuredLogging) {
        const logStr = formatStructuredLog(warnLevel, 'warn', message, data);
        console.warn(logStr);
      } else {
        const logArgs = formatPrettyLog('warn', message, data);
        console.warn(...logArgs);
      }
    },

    error: (message: string, error?: Error | any, data?: Record<string, any>) => {
      if (!shouldLog('error')) return;

      const errorLevel = LOG_LEVELS['error'];
      if (errorLevel === undefined) return;

      if (structuredLogging) {
        const logStr = formatStructuredLog(errorLevel, 'error', message, data, error);
        console.error(logStr);
      } else {
        const logArgs = formatPrettyLog('error', message, data, error);
        console.error(...logArgs);
      }
    },
  };

  _loggerInstance = fallbackLogger;
  return _loggerInstance;
}
