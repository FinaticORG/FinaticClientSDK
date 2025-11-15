/**
 * Custom brokers wrapper - Extends generated wrapper.
 * 
 * This file is protected and will not be overwritten during regeneration.
 * Add your custom brokers logic here.
 */

// Import generated wrapper
import { BrokersWrapper } from '../../generated/wrappers/brokers';
import { BrokersApi } from '../../generated/api/brokers-api';
import type { Configuration } from '../../generated/configuration';
import type { SdkConfig } from '../../generated/config';
import { getSafeLogger } from '../../custom/FinaticConnect';

/**
 * Custom wrapper for brokers operations.
 * Uses safe logger that works in browser environments.
 * Automatically adds session headers to all API requests.
 */
export class CustomBrokersWrapper extends BrokersWrapper {
  constructor(api: BrokersApi, config?: Configuration, sdkConfig?: SdkConfig) {
    super(api, config, sdkConfig);
    
    // Override the logger with our safe logger
    // This is needed because the generated BrokersWrapper uses pino directly
    // which fails in browser environments
    (this as any).logger = getSafeLogger(sdkConfig);
  }

  /**
   * Helper method to ensure session headers are set on the configuration.
   * This is called both from setSessionContext and can be called before API calls.
   */
  private _ensureSessionHeaders(): void {
    const sessionId = (this as any).sessionId;
    const companyId = (this as any).companyId;
    const csrfToken = (this as any).csrfToken;
    
    if (!sessionId || !companyId) {
      return; // No session context to set
    }

    const config = (this as any).config as Configuration | undefined;
    const api = (this as any).api as BrokersApi;
    
    // Update wrapper's config
    if (config && config.baseOptions) {
      if (!config.baseOptions.headers) {
        config.baseOptions.headers = {};
      }
      config.baseOptions.headers['x-session-id'] = sessionId;
      config.baseOptions.headers['x-company-id'] = companyId;
      if (csrfToken) {
        config.baseOptions.headers['x-csrf-token'] = csrfToken;
      }
    }
    
    // Update API instance's configuration (they should be the same reference, but be safe)
    if (api && (api as any).configuration) {
      if (!(api as any).configuration.baseOptions) {
        (api as any).configuration.baseOptions = {};
      }
      if (!(api as any).configuration.baseOptions.headers) {
        (api as any).configuration.baseOptions.headers = {};
      }
      (api as any).configuration.baseOptions.headers['x-session-id'] = sessionId;
      (api as any).configuration.baseOptions.headers['x-company-id'] = companyId;
      if (csrfToken) {
        (api as any).configuration.baseOptions.headers['x-csrf-token'] = csrfToken;
      }
    }
  }

  /**
   * Override setSessionContext to automatically add session headers to all API requests.
   * This ensures all broker endpoints include authentication headers without overriding each method.
   */
  override setSessionContext(sessionId: string, companyId: string, csrfToken: string): void {
    // Call parent to store values
    super.setSessionContext(sessionId, companyId, csrfToken);
    
    // Ensure headers are set on configuration
    this._ensureSessionHeaders();
  }

  /**
   * Helper to get session headers for API requests.
   * This ensures headers are always included even if baseOptions isn't working as expected.
   */
  private _getSessionHeaders(): Record<string, string> {
    const sessionId = (this as any).sessionId;
    const companyId = (this as any).companyId;
    const csrfToken = (this as any).csrfToken;
    
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['x-session-id'] = sessionId;
    }
    if (companyId) {
      headers['x-company-id'] = companyId;
    }
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
    return headers;
  }

  /**
   * Override getAccounts to ensure session headers are included.
   * This is a temporary fix until we figure out why baseOptions headers aren't working for data endpoints.
   */
  override async getAccounts(brokerId?: any, connectionId?: any, accountType?: any, status?: any, currency?: any, limit?: number, offset?: number, withMetadata?: any): Promise<any[]> {
    // Authentication check (same as parent)
    if (!(this as any).sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Get session headers explicitly - must have sessionId and companyId
    const sessionId = (this as any).sessionId;
    const companyId = (this as any).companyId;
    const csrfToken = (this as any).csrfToken || '';
    
    if (!sessionId || !companyId) {
      throw new Error('Session context incomplete. Missing sessionId or companyId.');
    }

    const requestId = (this as any)._generateRequestId();
    
    // Build headers object explicitly
    const headers: Record<string, string> = {
      'x-session-id': sessionId,
      'x-company-id': companyId,
      'x-request-id': requestId,
    };
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
    
    // Call the API directly with session headers explicitly included
    const response = await (this as any).api.getAccountsApiV1BrokersDataAccountsGet(
      {
        ...(brokerId !== undefined ? { brokerId } : {}),
        ...(connectionId !== undefined ? { connectionId } : {}),
        ...(accountType !== undefined ? { accountType } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(currency !== undefined ? { currency } : {}),
        ...(limit !== undefined ? { limit } : {}),
        ...(offset !== undefined ? { offset } : {}),
        ...(withMetadata !== undefined ? { withMetadata } : {}),
      },
      { headers }
    );
    
    // Unwrap response (same logic as parent)
    const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
      ? response.data.data
      : (response && typeof response === 'object' && 'data' in response)
      ? response.data
      : response;
    
    return result;
  }

  /**
   * Override getBalances to ensure session headers are included.
   */
  override async getBalances(brokerId?: any, connectionId?: any, accountId?: any, isEndOfDaySnapshot?: any, limit?: number, offset?: number, balanceCreatedAfter?: any, balanceCreatedBefore?: any, withMetadata?: boolean): Promise<any[]> {
    if (!(this as any).sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    const sessionId = (this as any).sessionId;
    const companyId = (this as any).companyId;
    const csrfToken = (this as any).csrfToken || '';
    
    if (!sessionId || !companyId) {
      throw new Error('Session context incomplete. Missing sessionId or companyId.');
    }

    const requestId = (this as any)._generateRequestId();
    const headers: Record<string, string> = {
      'x-session-id': sessionId,
      'x-company-id': companyId,
      'x-request-id': requestId,
    };
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
    
    const response = await (this as any).api.getBalancesApiV1BrokersDataBalancesGet(
      {
        ...(brokerId !== undefined ? { brokerId } : {}),
        ...(connectionId !== undefined ? { connectionId } : {}),
        ...(accountId !== undefined ? { accountId } : {}),
        ...(isEndOfDaySnapshot !== undefined ? { isEndOfDaySnapshot } : {}),
        ...(limit !== undefined ? { limit } : {}),
        ...(offset !== undefined ? { offset } : {}),
        ...(balanceCreatedAfter !== undefined ? { balanceCreatedAfter } : {}),
        ...(balanceCreatedBefore !== undefined ? { balanceCreatedBefore } : {}),
        ...(withMetadata !== undefined ? { withMetadata } : {}),
      },
      { headers }
    );
    
    const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
      ? response.data.data
      : (response && typeof response === 'object' && 'data' in response)
      ? response.data
      : response;
    
    return result;
  }

  /**
   * Override getOrders to ensure session headers are included.
   */
  override async getOrders(brokerId?: any, connectionId?: any, accountId?: any, symbol?: any, orderStatus?: any, side?: any, assetType?: any, limit?: number, offset?: number, createdAfter?: any, createdBefore?: any, withMetadata?: boolean): Promise<any[]> {
    if (!(this as any).sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    const sessionId = (this as any).sessionId;
    const companyId = (this as any).companyId;
    const csrfToken = (this as any).csrfToken || '';
    
    if (!sessionId || !companyId) {
      throw new Error('Session context incomplete. Missing sessionId or companyId.');
    }

    const requestId = (this as any)._generateRequestId();
    const headers: Record<string, string> = {
      'x-session-id': sessionId,
      'x-company-id': companyId,
      'x-request-id': requestId,
    };
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
    
    const response = await (this as any).api.getOrdersApiV1BrokersDataOrdersGet(
      {
        ...(brokerId !== undefined ? { brokerId } : {}),
        ...(connectionId !== undefined ? { connectionId } : {}),
        ...(accountId !== undefined ? { accountId } : {}),
        ...(symbol !== undefined ? { symbol } : {}),
        ...(orderStatus !== undefined ? { orderStatus } : {}),
        ...(side !== undefined ? { side } : {}),
        ...(assetType !== undefined ? { assetType } : {}),
        ...(limit !== undefined ? { limit } : {}),
        ...(offset !== undefined ? { offset } : {}),
        ...(createdAfter !== undefined ? { createdAfter } : {}),
        ...(createdBefore !== undefined ? { createdBefore } : {}),
        ...(withMetadata !== undefined ? { withMetadata } : {}),
      },
      { headers }
    );
    
    const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
      ? response.data.data
      : (response && typeof response === 'object' && 'data' in response)
      ? response.data
      : response;
    
    return result;
  }

  /**
   * Override getPositions to ensure session headers are included.
   */
  override async getPositions(brokerId?: any, connectionId?: any, accountId?: any, symbol?: any, side?: any, assetType?: any, positionStatus?: any, limit?: number, offset?: number, updatedAfter?: any, updatedBefore?: any, withMetadata?: boolean): Promise<any[]> {
    if (!(this as any).sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    const sessionId = (this as any).sessionId;
    const companyId = (this as any).companyId;
    const csrfToken = (this as any).csrfToken || '';
    
    if (!sessionId || !companyId) {
      throw new Error('Session context incomplete. Missing sessionId or companyId.');
    }

    const requestId = (this as any)._generateRequestId();
    const headers: Record<string, string> = {
      'x-session-id': sessionId,
      'x-company-id': companyId,
      'x-request-id': requestId,
    };
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
    
    const response = await (this as any).api.getPositionsApiV1BrokersDataPositionsGet(
      {
        ...(brokerId !== undefined ? { brokerId } : {}),
        ...(connectionId !== undefined ? { connectionId } : {}),
        ...(accountId !== undefined ? { accountId } : {}),
        ...(symbol !== undefined ? { symbol } : {}),
        ...(side !== undefined ? { side } : {}),
        ...(assetType !== undefined ? { assetType } : {}),
        ...(positionStatus !== undefined ? { positionStatus } : {}),
        ...(limit !== undefined ? { limit } : {}),
        ...(offset !== undefined ? { offset } : {}),
        ...(updatedAfter !== undefined ? { updatedAfter } : {}),
        ...(updatedBefore !== undefined ? { updatedBefore } : {}),
        ...(withMetadata !== undefined ? { withMetadata } : {}),
      },
      { headers }
    );
    
    const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
      ? response.data.data
      : (response && typeof response === 'object' && 'data' in response)
      ? response.data
      : response;
    
    return result;
  }
}
