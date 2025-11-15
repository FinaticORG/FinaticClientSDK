/**
 * Custom FinaticConnect extension.
 * 
 * This file is protected and will not be overwritten during regeneration.
 * Add custom logic to extend or override generated FinaticConnect behavior.
 */

import { FinaticConnect as GeneratedFinaticConnect } from '../generated/FinaticConnect';
import type { FinaticConnectOptions } from '../generated/FinaticConnect';
import type { SdkConfig } from '../generated/config';
import { getLogger, type Logger } from '../generated/utils/logger';
import { CustomSessionWrapper } from './wrappers/session';
import { CustomBrokersWrapper } from './wrappers/brokers';
import { SessionApi } from '../generated/api/session-api';
import { BrokersApi } from '../generated/api/brokers-api';

/**
 * Safe logger getter that handles browser environment issues with pino
 * Exported so custom wrappers can use it
 * 
 * Enhanced to match generated pino logger with:
 * - Structured JSON output (pino-compatible format)
 * - Production detection (silent/error-only by default)
 * - Hierarchical log levels
 * - Timestamps (ISO format)
 * - Metadata formatting
 */
export function getSafeLogger(config?: Partial<SdkConfig> | SdkConfig): Logger {
  try {
    return getLogger(config as SdkConfig | undefined);
  } catch (error) {
    // Enhanced fallback logger for browser environments where pino might not work correctly
    
    // Log level hierarchy (matching pino's numeric levels)
    const LOG_LEVELS: Record<string, number> = {
      silent: 0,
      error: 10,
      warn: 20,
      info: 30,
      debug: 40,
    };

    type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

    /**
     * Get environment variable from various sources
     */
    const getEnvVar = (key: string): string | undefined => {
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
    };

    /**
     * Detect if we're in production mode
     */
    const isProduction = (): boolean => {
      // Check Vite mode
      const viteMode = getEnvVar('MODE');
      if (viteMode === 'production') return true;
      
      // Check Vite PROD flag
      const viteProd = getEnvVar('PROD');
      if (viteProd === 'true') return true;
      
      // Check NODE_ENV
      const nodeEnv = getEnvVar('NODE_ENV');
      if (nodeEnv === 'production') return true;
      
      // Check hostname patterns (production domains typically don't have localhost/127.0.0.1)
      if (typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;
        if (hostname && !hostname.includes('localhost') && !hostname.includes('127.0.0.1') && !hostname.includes('0.0.0.0')) {
          // Could be production, but be conservative - only return true if explicitly set
          // This is a fallback, not primary detection
        }
      }
      
      return false;
    };

    /**
     * Get effective log level considering production mode
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
    const isProd = isProduction();

    /**
     * Check if we should log at this level
     */
    const shouldLog = (messageLevel: LogLevel): boolean => {
      if (logLevel === 'silent') return false;
      const configuredLevel = LOG_LEVELS[logLevel] ?? LOG_LEVELS['error'];
      const msgLevel = LOG_LEVELS[messageLevel] ?? LOG_LEVELS['error'];
      if (configuredLevel === undefined || msgLevel === undefined) return false;
      return msgLevel >= configuredLevel;
    };

    /**
     * Format log entry as structured JSON (pino-compatible)
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
     * Format log entry as pretty array (non-structured mode)
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
     * No-op logger for silent mode
     */
    const noopLogger: Logger = {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    // Return no-op logger if silent
    if (logLevel === 'silent') {
      return noopLogger;
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

    // Only warn about fallback logger once, and only in non-production
    if (!isProd) {
      console.warn('[Finatic SDK] Using fallback logger due to pino initialization error:', error);
    }
    
    return fallbackLogger;
  }
}

/**
 * Custom FinaticConnect class that extends the generated class.
 * Use this to add custom initialization logic or override methods.
 */
export class FinaticConnect extends GeneratedFinaticConnect {
  // Marker to verify custom class is being used
  static readonly __CUSTOM_CLASS__ = true;

  /**
   * Override constructor to use custom wrappers with safe logger
   */
  constructor(options: FinaticConnectOptions) {
    super(options);
    
    // Replace wrappers with custom ones that use safe logger
    // This is needed because the generated wrappers use pino directly
    // which fails in browser environments
    const self = this as any;
    const config = self.config;
    const sdkConfig = self.sdkConfig;
    
    // Replace session wrapper
    const sessionApi = new SessionApi(config);
    self.session = new CustomSessionWrapper(sessionApi, config, sdkConfig);
    
    // Replace brokers wrapper with custom one that uses safe logger
    // Session headers are now handled by the generator, but we still need the safe logger
    const brokersApi = new BrokersApi(config);
    self.brokers = new CustomBrokersWrapper(brokersApi, config, sdkConfig);
  }

  // Static init() method is now handled by the generator with enhanced error handling and session validation

  /**
   * Custom startSession with better error handling and logging.
   * Override to ensure session context is always set when session is created.
   */
  override async startSession(oneTimeToken: string, userId?: string): Promise<{ session_id: string; company_id: string }> {
    // Access private sdkConfig via type assertion
    const sdkConfig = (this as any).sdkConfig as SdkConfig | undefined;
    const logger = getSafeLogger(sdkConfig);
    
    logger.debug('FinaticConnect.startSession() called', {
      oneTimeToken: oneTimeToken ? `${oneTimeToken.substring(0, 20)}...` : 'missing',
      userId,
    });

    try {
      // Call the generated startSession method - this should make the network call
      logger.debug('Calling super.startSession() to make network request');
      const result = await super.startSession(oneTimeToken, userId);
      logger.debug('super.startSession() completed', {
        hasSessionId: !!result.session_id,
        hasCompanyId: !!result.company_id,
        sessionId: result.session_id,
        companyId: result.company_id,
      });
      
      // Verify session context was set
      const sessionId = this.getSessionId();
      const companyId = this.getCompanyId();
      
      if (!sessionId || !companyId) {
        // Log what we received for debugging
        logger.warn('FinaticConnect.startSession() warning - session context not set', {
          received: result,
          sessionIdSet: !!sessionId,
          companyIdSet: !!companyId,
          responseSessionId: result.session_id,
          responseCompanyId: result.company_id,
        });
        
        // Try to set context from response if it wasn't set
        if (result.session_id && result.company_id && !sessionId) {
          logger.debug('Attempting to set session context from response');
          this.setSessionContext(result.session_id, result.company_id, '');
          logger.debug('Session context set from response');
        } else if (!result.session_id || !result.company_id) {
          throw new Error(
            `startSession() response missing required fields. ` +
            `Expected session_id and company_id, got: ${JSON.stringify(result)}`
          );
        }
      } else {
        logger.debug('Session context already set', { sessionId, companyId });
      }
      
      return result;
    } catch (error) {
      // Enhance error messages for debugging
      if (error instanceof Error) {
        logger.error('FinaticConnect.startSession() error', error, {
          oneTimeToken: oneTimeToken ? `${oneTimeToken.substring(0, 20)}...` : 'missing',
          userId,
        });
      }
      throw error;
    }
  }

  // Pagination methods (getAllAccounts, getAllOrders, getAllPositions, getAllBalances)
  // are now handled by the generator with proper filter parameter support

  /**
   * Get order fills for a specific order.
   */
  async getOrderFills(orderId: string, connectionId?: string, limit?: number, offset?: number): Promise<any[]> {
    return await this.brokers.getOrderFills(orderId, connectionId, limit, offset);
  }

  /**
   * Get order events for a specific order.
   */
  async getOrderEvents(orderId: string, connectionId?: string, limit?: number, offset?: number): Promise<any[]> {
    return await this.brokers.getOrderEvents(orderId, connectionId, limit, offset);
  }

  /**
   * Get order groups (related orders grouped together).
   */
  async getOrderGroups(brokerId?: string, connectionId?: string, limit?: number, offset?: number, createdAfter?: string, createdBefore?: string): Promise<any[]> {
    return await this.brokers.getOrderGroups(brokerId, connectionId, limit, offset, createdAfter, createdBefore);
  }

  /**
   * Get position lots (tax lots for positions).
   */
  async getPositionLots(brokerId?: string, connectionId?: string, accountId?: string, symbol?: string, positionId?: string, limit?: number, offset?: number): Promise<any[]> {
    return await this.brokers.getPositionLots(brokerId, connectionId, accountId, symbol, positionId, limit, offset);
  }

  /**
   * Get position lot fills for a specific lot.
   */
  async getPositionLotFills(lotId: string, connectionId?: string, limit?: number, offset?: number): Promise<any[]> {
    return await this.brokers.getPositionLotFills(lotId, connectionId, limit, offset);
  }

  /**
   * Disconnect company from broker connection.
   */
  async disconnectCompany(connectionId: string): Promise<any> {
    return await this.brokers.disconnectCompanyFromBroker(connectionId);
  }
}

