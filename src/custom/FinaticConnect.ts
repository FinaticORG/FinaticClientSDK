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
 */
export function getSafeLogger(config?: Partial<SdkConfig> | SdkConfig): Logger {
  try {
    return getLogger(config as SdkConfig | undefined);
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

    const logLevel = config?.logLevel || getEnvVar('FINATIC_LOG_LEVEL') || 'error';
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
    console.warn('[Finatic SDK] Using fallback logger due to pino initialization error:', error);
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
    
    // Replace brokers wrapper
    const brokersApi = new BrokersApi(config);
    self.brokers = new CustomBrokersWrapper(brokersApi, config, sdkConfig);
  }

  /**
   * Custom initialization with better error handling and logging.
   * Override the generated init method to ensure startSession() is always called.
   */
  static override async init(
    token: string,
    userId?: string,
    options?: { baseUrl?: string; sdkConfig?: Partial<SdkConfig> }
  ): Promise<FinaticConnect> {
    const logger = getSafeLogger(options?.sdkConfig);
    
    logger.debug('FinaticConnect.init() called', {
      token: token ? `${token.substring(0, 20)}...` : 'missing',
      userId,
      hasOptions: !!options,
    });

    try {
      // Access private instance via type assertion to base class
      const baseClass = GeneratedFinaticConnect as any;
      
      // Clear instance if it exists but has no valid session (Safari compatibility)
      if (baseClass.instance && !baseClass.instance.getSessionId()) {
        logger.debug('Clearing existing instance without sessionId');
        baseClass.instance = null;
      }

      let instance: FinaticConnect;

      if (!baseClass.instance) {
        logger.debug('Creating new FinaticConnect instance');
        const connectOptions: FinaticConnectOptions = {
          token,
          baseUrl: options?.baseUrl || 'https://api.finatic.dev',
          ...(options?.sdkConfig ? { sdkConfig: options.sdkConfig } : {}),
        };

        instance = new FinaticConnect(connectOptions);
        baseClass.instance = instance;

        // CRITICAL: Start session with the token - this should make the network call
        logger.debug('Calling startSession() inside init()');
        await instance.startSession(token, userId);
        logger.debug('startSession() completed in init()');
      } else {
        logger.debug('Using existing FinaticConnect instance');
        instance = baseClass.instance as FinaticConnect;
      }

      // Verify session was initialized correctly
      const sessionId = instance.getSessionId();
      if (!sessionId) {
        const error = new Error(
          'Session initialization failed: startSession() did not return a session_id. ' +
          'Please check that the API endpoint returned a valid session response. ' +
          'The network call to /api/v1/session/start may have failed or returned an invalid response.'
        );
        logger.error('FinaticConnect.init() failed - no sessionId', error, {});
        throw error;
      }

      logger.debug('FinaticConnect.init() completed successfully', { sessionId });
      return instance;
    } catch (error) {
      // Re-throw with more context if it's a session initialization error
      if (error instanceof Error) {
        if (error.message.includes('Session not initialized')) {
          const enhancedError = new Error(
            `Failed to initialize Finatic session: ${error.message}. ` +
            'This may indicate that startSession() was called but did not successfully create a session. ' +
            'Please check the API response and ensure the one-time token is valid.'
          );
          logger.error('FinaticConnect.init() session initialization error', enhancedError, {});
          throw enhancedError;
        }
        logger.error('FinaticConnect.init() error', error, {});
      }
      
      // Re-throw other errors as-is
      throw error;
    }
  }

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

  /**
   * Override getAllAccounts to properly handle response format.
   */
  override async getAllAccounts(filter?: any): Promise<any[]> {
    const allData: any[] = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
      const result = await this.brokers.getAccounts(
        filter?.brokerId,
        filter?.connectionId,
        filter?.accountType,
        filter?.status,
        filter?.currency,
        limit,
        offset,
        filter?.withMetadata
      );
      
      // Ensure result is an array
      const dataArray = Array.isArray(result) ? result : [];
      if (!dataArray || dataArray.length === 0) break;
      
      allData.push(...dataArray);
      if (dataArray.length < limit) break;
      offset += limit;
    }
    
    return allData;
  }

  /**
   * Override getAllOrders to properly handle response format.
   */
  override async getAllOrders(filter?: any): Promise<any[]> {
    const allData: any[] = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
      const result = await this.brokers.getOrders(
        filter?.brokerId,
        filter?.connectionId,
        filter?.accountId,
        filter?.symbol,
        filter?.orderStatus,
        filter?.side,
        filter?.assetType,
        limit,
        offset,
        filter?.createdAfter,
        filter?.createdBefore,
        filter?.withMetadata
      );
      
      // Ensure result is an array
      const dataArray = Array.isArray(result) ? result : [];
      if (!dataArray || dataArray.length === 0) break;
      
      allData.push(...dataArray);
      if (dataArray.length < limit) break;
      offset += limit;
    }
    
    return allData;
  }

  /**
   * Override getAllPositions to properly handle response format.
   */
  override async getAllPositions(filter?: any): Promise<any[]> {
    const allData: any[] = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
      const result = await this.brokers.getPositions(
        filter?.brokerId,
        filter?.connectionId,
        filter?.accountId,
        filter?.symbol,
        filter?.side,
        filter?.assetType,
        filter?.positionStatus,
        limit,
        offset,
        filter?.updatedAfter,
        filter?.updatedBefore,
        filter?.withMetadata
      );
      
      // Ensure result is an array
      const dataArray = Array.isArray(result) ? result : [];
      if (!dataArray || dataArray.length === 0) break;
      
      allData.push(...dataArray);
      if (dataArray.length < limit) break;
      offset += limit;
    }
    
    return allData;
  }

  /**
   * Override getAllBalances to properly handle response format.
   */
  override async getAllBalances(filter?: any): Promise<any[]> {
    const allData: any[] = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
      const result = await this.brokers.getBalances(
        filter?.brokerId,
        filter?.connectionId,
        filter?.accountId,
        filter?.isEndOfDaySnapshot,
        limit,
        offset,
        filter?.balanceCreatedAfter,
        filter?.balanceCreatedBefore,
        filter?.withMetadata
      );
      
      // Ensure result is an array
      const dataArray = Array.isArray(result) ? result : [];
      if (!dataArray || dataArray.length === 0) break;
      
      allData.push(...dataArray);
      if (dataArray.length < limit) break;
      offset += limit;
    }
    
    return allData;
  }

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

