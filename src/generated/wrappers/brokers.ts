/**
 * Generated wrapper functions for brokers operations (Phase 2A).
 * 
 * This file is regenerated on each run - do not edit directly.
 * For custom logic, edit src/custom/wrappers/brokers.ts instead.
 */

import { BrokersApi } from '../api/brokers-api';
import type { Configuration } from '../configuration';
import type { SdkConfig } from '../config';
import { generateRequestId } from '../utils/request-id';
import { retryApiCall } from '../utils/retry';
import { getLogger, type Logger } from '../utils/logger';
import { handleError } from '../utils/error-handling';
import { getCache, generateCacheKey } from '../utils/cache';
import { applyRequestInterceptors, applyResponseInterceptors, applyErrorInterceptors } from '../utils/interceptors';
import { coerceEnumValue } from '../utils/enum-coercion';
import { convertToPlainObject } from '../utils/plain-object';
import { PublicAccountTypeEnum } from '../models';
import { PublicAssetTypeEnum } from '../models';
import { PublicOrderSideEnum } from '../models';
import { PublicOrderStatusEnum } from '../models';
import { PublicPositionStatusEnum } from '../models';

import type { AccountStatus } from '../models';
import type { Accounts } from '../models';
import type { Balances } from '../models';
import type { BrokerInfo } from '../models';
import type { DisconnectActionResult } from '../models';
import type { OrderActionResult } from '../models';
import type { OrderEventResponse } from '../models';
import type { OrderFillResponse } from '../models';
import type { OrderGroupResponse } from '../models';
import type { OrderResponse } from '../models';
import type { PositionLotFillResponse } from '../models';
import type { PositionLotResponse } from '../models';
import type { PositionResponse } from '../models';
import type { UserBrokerConnections } from '../models';

// Phase 2C: Input/Output type definitions
export interface GetBrokersParams {
  // No parameters
}

export interface GetBrokersResponse {
  success: {
    data: BrokerInfo[];
    meta?: Record<string, any>;
  };
  Error?: {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, any>;
  };
  Warning?: Array<{
    message: string;
    code?: string;
    details?: Record<string, any>;
  }>;
}

export interface ListBrokerConnectionsParams {
  // No parameters
}

export interface ListBrokerConnectionsResponse {
  success: {
    data: UserBrokerConnections[];
    meta?: Record<string, any>;
  };
  Error?: {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, any>;
  };
  Warning?: Array<{
    message: string;
    code?: string;
    details?: Record<string, any>;
  }>;
}

export interface DisconnectCompanyFromBrokerParams {
  connectionId: string;
}

export interface DisconnectCompanyFromBrokerResponse {
  success: {
    data: DisconnectActionResult;
    meta?: Record<string, any>;
  };
  Error?: {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, any>;
  };
  Warning?: Array<{
    message: string;
    code?: string;
    details?: Record<string, any>;
  }>;
}

export interface GetOrdersParams {
  brokerId?: string;
  connectionId?: string;
  accountId?: string;
  symbol?: string;
  orderStatus?: PublicOrderStatusEnum;
  side?: PublicOrderSideEnum;
  assetType?: PublicAssetTypeEnum;
  limit?: number;
  offset?: number;
  createdAfter?: string;
  createdBefore?: string;
  withMetadata?: boolean;
}

export interface GetOrdersResponse {
  success: {
    data: OrderResponse[];
    meta?: Record<string, any>;
  };
  Error?: {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, any>;
  };
  Warning?: Array<{
    message: string;
    code?: string;
    details?: Record<string, any>;
  }>;
}

export interface GetPositionsParams {
  brokerId?: string;
  connectionId?: string;
  accountId?: string;
  symbol?: string;
  side?: PublicOrderSideEnum;
  assetType?: PublicAssetTypeEnum;
  positionStatus?: PublicPositionStatusEnum;
  limit?: number;
  offset?: number;
  updatedAfter?: string;
  updatedBefore?: string;
  withMetadata?: boolean;
}

export interface GetPositionsResponse {
  success: {
    data: PositionResponse[];
    meta?: Record<string, any>;
  };
  Error?: {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, any>;
  };
  Warning?: Array<{
    message: string;
    code?: string;
    details?: Record<string, any>;
  }>;
}

export interface GetBalancesParams {
  brokerId?: string;
  connectionId?: string;
  accountId?: string;
  isEndOfDaySnapshot?: boolean;
  limit?: number;
  offset?: number;
  balanceCreatedAfter?: string;
  balanceCreatedBefore?: string;
  withMetadata?: boolean;
}

export interface GetBalancesResponse {
  success: {
    data: Balances[];
    meta?: Record<string, any>;
  };
  Error?: {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, any>;
  };
  Warning?: Array<{
    message: string;
    code?: string;
    details?: Record<string, any>;
  }>;
}

export interface GetAccountsParams {
  brokerId?: string;
  connectionId?: string;
  accountType?: PublicAccountTypeEnum;
  status?: AccountStatus;
  currency?: string;
  limit?: number;
  offset?: number;
  withMetadata?: boolean;
}

export interface GetAccountsResponse {
  success: {
    data: Accounts[];
    meta?: Record<string, any>;
  };
  Error?: {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, any>;
  };
  Warning?: Array<{
    message: string;
    code?: string;
    details?: Record<string, any>;
  }>;
}

export interface GetOrderFillsParams {
  orderId: string;
  connectionId?: string;
  limit?: number;
  offset?: number;
}

export interface GetOrderFillsResponse {
  success: {
    data: OrderFillResponse[];
    meta?: Record<string, any>;
  };
  Error?: {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, any>;
  };
  Warning?: Array<{
    message: string;
    code?: string;
    details?: Record<string, any>;
  }>;
}

export interface GetOrderEventsParams {
  orderId: string;
  connectionId?: string;
  limit?: number;
  offset?: number;
}

export interface GetOrderEventsResponse {
  success: {
    data: OrderEventResponse[];
    meta?: Record<string, any>;
  };
  Error?: {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, any>;
  };
  Warning?: Array<{
    message: string;
    code?: string;
    details?: Record<string, any>;
  }>;
}

export interface GetOrderGroupsParams {
  brokerId?: string;
  connectionId?: string;
  limit?: number;
  offset?: number;
  createdAfter?: string;
  createdBefore?: string;
}

export interface GetOrderGroupsResponse {
  success: {
    data: OrderGroupResponse[];
    meta?: Record<string, any>;
  };
  Error?: {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, any>;
  };
  Warning?: Array<{
    message: string;
    code?: string;
    details?: Record<string, any>;
  }>;
}

export interface GetPositionLotsParams {
  brokerId?: string;
  connectionId?: string;
  accountId?: string;
  symbol?: string;
  positionId?: string;
  limit?: number;
  offset?: number;
}

export interface GetPositionLotsResponse {
  success: {
    data: PositionLotResponse[];
    meta?: Record<string, any>;
  };
  Error?: {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, any>;
  };
  Warning?: Array<{
    message: string;
    code?: string;
    details?: Record<string, any>;
  }>;
}

export interface GetPositionLotFillsParams {
  lotId: string;
  connectionId?: string;
  limit?: number;
  offset?: number;
}

export interface GetPositionLotFillsResponse {
  success: {
    data: PositionLotFillResponse[];
    meta?: Record<string, any>;
  };
  Error?: {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, any>;
  };
  Warning?: Array<{
    message: string;
    code?: string;
    details?: Record<string, any>;
  }>;
}

export interface PlaceOrderParams {
  body?: any;
  connectionId?: string;
}

export interface PlaceOrderResponse {
  success: {
    data: OrderActionResult;
    meta?: Record<string, any>;
  };
  Error?: {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, any>;
  };
  Warning?: Array<{
    message: string;
    code?: string;
    details?: Record<string, any>;
  }>;
}

export interface CancelOrderParams {
  orderId: string;
  body?: any;
  accountNumber?: string;
  connectionId?: string;
}

export interface CancelOrderResponse {
  success: {
    data: OrderActionResult;
    meta?: Record<string, any>;
  };
  Error?: {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, any>;
  };
  Warning?: Array<{
    message: string;
    code?: string;
    details?: Record<string, any>;
  }>;
}

export interface ModifyOrderParams {
  orderId: string;
  body?: any;
  accountNumber?: string;
  connectionId?: string;
}

export interface ModifyOrderResponse {
  success: {
    data: OrderActionResult;
    meta?: Record<string, any>;
  };
  Error?: {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, any>;
  };
  Warning?: Array<{
    message: string;
    code?: string;
    details?: Record<string, any>;
  }>;
}


/**
 * Brokers wrapper functions.
 * Provides simplified method names and response unwrapping.
 */
export class BrokersWrapper {
  protected api: BrokersApi;
  protected config?: Configuration;
  protected sdkConfig?: SdkConfig;
  protected logger: Logger;
  protected sessionId?: string;
  protected companyId?: string;
  protected csrfToken?: string;

  constructor(api: BrokersApi, config?: Configuration, sdkConfig?: SdkConfig) {
    this.api = api;
    if (config !== undefined) {
      this.config = config;
    }
    if (sdkConfig !== undefined) {
      this.sdkConfig = sdkConfig;
    }
    this.logger = getLogger(sdkConfig);
  }

  // Session context setters (called by session management)
  setSessionContext(sessionId: string, companyId: string, csrfToken: string) {
    this.sessionId = sessionId;
    this.companyId = companyId;
    this.csrfToken = csrfToken;
  }

  // Utility methods (Phase 2A)
  protected _generateRequestId(): string {
    return generateRequestId();
  }

  protected async _retryApiCall<T>(fn: () => Promise<T>): Promise<T> {
    return retryApiCall(fn);
  }

  protected _handleError(error: any, requestId?: string): Error {
    return handleError(error, requestId);
  }

  /**
   * Get Brokers
   * 
   * Get all available brokers.
   *
   * This is a fast operation that returns a cached list of available brokers.
   * The list is loaded once at startup and never changes during runtime.
   *
   * Returns
   * -------
   * FinaticResponse[list[BrokerInfo]]
   *     list of available brokers with their metadata.

   * @param params {GetBrokersParams} Input parameters object (empty for methods with no parameters)
   * @returns {Promise<GetBrokersResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/
   * @methodId get_brokers_api_v1_brokers__get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getBrokers({});
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   */
  async getBrokers(params: GetBrokersParams): Promise<GetBrokersResponse> {
    // Phase 2C: Extract individual params from input params object
    // No parameters to extract

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, params, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as GetBrokersResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Brokers', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/',
      params: params,
      action: 'getBrokers'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getBrokersApiV1BrokersGet({ headers: { 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Phase 2C: Unwrap API response and transform to standard response structure
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      
      const apiData = (responseData as any).data;
      const warnings = Array.isArray((responseData as any).warnings) ? (responseData as any).warnings : undefined;
      const meta = (responseData as any).meta;
      
      // Build standard response structure
      const standardResponse: GetBrokersResponse = {
        success: {
          data: convertToPlainObject(apiData) as BrokerInfo[],
          ...(meta ? { meta } : {}),
        },
        ...(warnings && warnings.length > 0 ? {
          Warning: warnings.map((w: any) => ({
            message: w.message || String(w),
            code: w.code,
            details: w.details || w,
          })),
        } : {}),
      };
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Brokers completed', {
        request_id: requestId,
        action: 'getBrokers'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Brokers failed', error, {
        request_id: requestId,
        action: 'getBrokers'
      });
      
      // Phase 2C: Extract error details from Axios errors or generic errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorCode = 'UNKNOWN_ERROR';
      let errorStatus: number | undefined;
      let errorDetails: Record<string, any> = {};
      
      // Handle Axios errors (from OpenAPI generator)
      if ((error as any)?.isAxiosError || (error as any)?.response) {
        const axiosError = error as any;
        errorStatus = axiosError.response?.status;
        errorCode = axiosError.code || `HTTP_${errorStatus || 'UNKNOWN'}`;
        errorMessage = axiosError.response?.data?.message || 
                       axiosError.response?.statusText || 
                       axiosError.message || 
                       errorMessage;
        errorDetails = {
          status: errorStatus,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          requestUrl: axiosError.config?.url,
          requestMethod: axiosError.config?.method,
        };
      } else if (error instanceof Error) {
        errorCode = (error as any)?.code || 'UNKNOWN_ERROR';
        errorDetails = {
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorDetails = { error };
      }
      
      // Phase 2C: Return standard error response structure
      const errorResponse: GetBrokersResponse = {
        success: {
          data: null as any,
        },
        Error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * List Broker Connections
   * 
   * List all broker connections for the current user.
   *
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns connections that the user has any permissions for.

   * @param params {ListBrokerConnectionsParams} Input parameters object (empty for methods with no parameters)
   * @returns {Promise<ListBrokerConnectionsResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/connections
   * @methodId list_broker_connections_api_v1_brokers_connections_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.listBrokerConnections({});
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   */
  async listBrokerConnections(params: ListBrokerConnectionsParams): Promise<ListBrokerConnectionsResponse> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Phase 2C: Extract individual params from input params object
    // No parameters to extract

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, params, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/connections', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as ListBrokerConnectionsResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('List Broker Connections', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/connections',
      params: params,
      action: 'listBrokerConnections'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.listBrokerConnectionsApiV1BrokersConnectionsGet({ headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Phase 2C: Unwrap API response and transform to standard response structure
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      
      const apiData = (responseData as any).data;
      const warnings = Array.isArray((responseData as any).warnings) ? (responseData as any).warnings : undefined;
      const meta = (responseData as any).meta;
      
      // Build standard response structure
      const standardResponse: ListBrokerConnectionsResponse = {
        success: {
          data: convertToPlainObject(apiData) as UserBrokerConnections[],
          ...(meta ? { meta } : {}),
        },
        ...(warnings && warnings.length > 0 ? {
          Warning: warnings.map((w: any) => ({
            message: w.message || String(w),
            code: w.code,
            details: w.details || w,
          })),
        } : {}),
      };
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/connections', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('List Broker Connections completed', {
        request_id: requestId,
        action: 'listBrokerConnections'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('List Broker Connections failed', error, {
        request_id: requestId,
        action: 'listBrokerConnections'
      });
      
      // Phase 2C: Extract error details from Axios errors or generic errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorCode = 'UNKNOWN_ERROR';
      let errorStatus: number | undefined;
      let errorDetails: Record<string, any> = {};
      
      // Handle Axios errors (from OpenAPI generator)
      if ((error as any)?.isAxiosError || (error as any)?.response) {
        const axiosError = error as any;
        errorStatus = axiosError.response?.status;
        errorCode = axiosError.code || `HTTP_${errorStatus || 'UNKNOWN'}`;
        errorMessage = axiosError.response?.data?.message || 
                       axiosError.response?.statusText || 
                       axiosError.message || 
                       errorMessage;
        errorDetails = {
          status: errorStatus,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          requestUrl: axiosError.config?.url,
          requestMethod: axiosError.config?.method,
        };
      } else if (error instanceof Error) {
        errorCode = (error as any)?.code || 'UNKNOWN_ERROR';
        errorDetails = {
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorDetails = { error };
      }
      
      // Phase 2C: Return standard error response structure
      const errorResponse: ListBrokerConnectionsResponse = {
        success: {
          data: null as any,
        },
        Error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Disconnect Company From Broker
   * 
   * Remove a company's access to a broker connection.
   *
   * If the company is the only one with access, the entire connection is deleted.
   * If other companies have access, only the company's access is removed.

   * @param params {DisconnectCompanyFromBrokerParams} Input parameters object
   * @returns {Promise<DisconnectCompanyFromBrokerResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: DELETE /api/v1/brokers/disconnect-company/{connection_id}
   * @methodId disconnect_company_from_broker_api_v1_brokers_disconnect_company__connection_id__delete
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.disconnectCompanyFromBroker({
    connectionId: 'id-123'
   * });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message);
   * }
   * ```
   */
  async disconnectCompanyFromBroker(params: DisconnectCompanyFromBrokerParams): Promise<DisconnectCompanyFromBrokerResponse> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Phase 2C: Extract individual params from input params object
    const connectionId = params.connectionId;

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, params, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('DELETE', '/api/v1/brokers/disconnect-company/{connection_id}', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as DisconnectCompanyFromBrokerResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Disconnect Company From Broker', {
      request_id: requestId,
      method: 'DELETE',
      path: '/api/v1/brokers/disconnect-company/{connection_id}',
      params: params,
      action: 'disconnectCompanyFromBroker'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.disconnectCompanyFromBrokerApiV1BrokersDisconnectCompanyConnectionIdDelete({ connectionId: connectionId }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Phase 2C: Unwrap API response and transform to standard response structure
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      
      const apiData = (responseData as any).data;
      const warnings = Array.isArray((responseData as any).warnings) ? (responseData as any).warnings : undefined;
      const meta = (responseData as any).meta;
      
      // Build standard response structure
      const standardResponse: DisconnectCompanyFromBrokerResponse = {
        success: {
          data: convertToPlainObject(apiData) as DisconnectActionResult,
          ...(meta ? { meta } : {}),
        },
        ...(warnings && warnings.length > 0 ? {
          Warning: warnings.map((w: any) => ({
            message: w.message || String(w),
            code: w.code,
            details: w.details || w,
          })),
        } : {}),
      };
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('DELETE', '/api/v1/brokers/disconnect-company/{connection_id}', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Disconnect Company From Broker completed', {
        request_id: requestId,
        action: 'disconnectCompanyFromBroker'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Disconnect Company From Broker failed', error, {
        request_id: requestId,
        action: 'disconnectCompanyFromBroker'
      });
      
      // Phase 2C: Extract error details from Axios errors or generic errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorCode = 'UNKNOWN_ERROR';
      let errorStatus: number | undefined;
      let errorDetails: Record<string, any> = {};
      
      // Handle Axios errors (from OpenAPI generator)
      if ((error as any)?.isAxiosError || (error as any)?.response) {
        const axiosError = error as any;
        errorStatus = axiosError.response?.status;
        errorCode = axiosError.code || `HTTP_${errorStatus || 'UNKNOWN'}`;
        errorMessage = axiosError.response?.data?.message || 
                       axiosError.response?.statusText || 
                       axiosError.message || 
                       errorMessage;
        errorDetails = {
          status: errorStatus,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          requestUrl: axiosError.config?.url,
          requestMethod: axiosError.config?.method,
        };
      } else if (error instanceof Error) {
        errorCode = (error as any)?.code || 'UNKNOWN_ERROR';
        errorDetails = {
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorDetails = { error };
      }
      
      // Phase 2C: Return standard error response structure
      const errorResponse: DisconnectCompanyFromBrokerResponse = {
        success: {
          data: null as any,
        },
        Error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Get Orders
   * 
   * Get orders for all authorized broker connections.
   *
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns orders from connections the company has read access to.

   * @param params {GetOrdersParams} Input parameters object
   * @returns {Promise<GetOrdersResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/orders
   * @methodId get_orders_api_v1_brokers_data_orders_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getOrders({});
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getOrders({
    brokerId: 'id-123',
    connectionId: 'id-123',
    accountId: 'id-123'
   * });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.Warning && result.Warning.length > 0) {
   *     console.warn('Warnings:', result.Warning);
   *   }
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message, result.Error.code);
   * }
   * ```
   */
  async getOrders(params: GetOrdersParams): Promise<GetOrdersResponse> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Phase 2C: Extract individual params from input params object
    const brokerId = params.brokerId;
    const connectionId = params.connectionId;
    const accountId = params.accountId;
    const symbol = params.symbol;
    let orderStatus = params.orderStatus !== undefined ? coerceEnumValue(params.orderStatus, PublicOrderStatusEnum, 'orderStatus') : undefined;
    let side = params.side !== undefined ? coerceEnumValue(params.side, PublicOrderSideEnum, 'side') : undefined;
    let assetType = params.assetType !== undefined ? coerceEnumValue(params.assetType, PublicAssetTypeEnum, 'assetType') : undefined;
    const limit = params.limit;
    const offset = params.offset;
    const createdAfter = params.createdAfter;
    const createdBefore = params.createdBefore;
    const withMetadata = params.withMetadata;

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, params, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as GetOrdersResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Orders', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/orders',
      params: params,
      action: 'getOrders'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getOrdersApiV1BrokersDataOrdersGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountId !== undefined ? { accountId: accountId } : {}), ...(symbol !== undefined ? { symbol: symbol } : {}), ...(orderStatus !== undefined ? { orderStatus: orderStatus } : {}), ...(side !== undefined ? { side: side } : {}), ...(assetType !== undefined ? { assetType: assetType } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(createdAfter !== undefined ? { createdAfter: createdAfter } : {}), ...(createdBefore !== undefined ? { createdBefore: createdBefore } : {}), ...(withMetadata !== undefined ? { withMetadata: withMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Phase 2C: Unwrap API response and transform to standard response structure
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      
      const apiData = (responseData as any).data;
      const warnings = Array.isArray((responseData as any).warnings) ? (responseData as any).warnings : undefined;
      const meta = (responseData as any).meta;
      
      // Build standard response structure
      const standardResponse: GetOrdersResponse = {
        success: {
          data: convertToPlainObject(apiData) as OrderResponse[],
          ...(meta ? { meta } : {}),
        },
        ...(warnings && warnings.length > 0 ? {
          Warning: warnings.map((w: any) => ({
            message: w.message || String(w),
            code: w.code,
            details: w.details || w,
          })),
        } : {}),
      };
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Orders completed', {
        request_id: requestId,
        action: 'getOrders'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Orders failed', error, {
        request_id: requestId,
        action: 'getOrders'
      });
      
      // Phase 2C: Extract error details from Axios errors or generic errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorCode = 'UNKNOWN_ERROR';
      let errorStatus: number | undefined;
      let errorDetails: Record<string, any> = {};
      
      // Handle Axios errors (from OpenAPI generator)
      if ((error as any)?.isAxiosError || (error as any)?.response) {
        const axiosError = error as any;
        errorStatus = axiosError.response?.status;
        errorCode = axiosError.code || `HTTP_${errorStatus || 'UNKNOWN'}`;
        errorMessage = axiosError.response?.data?.message || 
                       axiosError.response?.statusText || 
                       axiosError.message || 
                       errorMessage;
        errorDetails = {
          status: errorStatus,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          requestUrl: axiosError.config?.url,
          requestMethod: axiosError.config?.method,
        };
      } else if (error instanceof Error) {
        errorCode = (error as any)?.code || 'UNKNOWN_ERROR';
        errorDetails = {
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorDetails = { error };
      }
      
      // Phase 2C: Return standard error response structure
      const errorResponse: GetOrdersResponse = {
        success: {
          data: null as any,
        },
        Error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Get Positions
   * 
   * Get positions for all authorized broker connections.
   *
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns positions from connections the company has read access to.

   * @param params {GetPositionsParams} Input parameters object
   * @returns {Promise<GetPositionsResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/positions
   * @methodId get_positions_api_v1_brokers_data_positions_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getPositions({});
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getPositions({
    brokerId: 'id-123',
    connectionId: 'id-123',
    accountId: 'id-123'
   * });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.Warning && result.Warning.length > 0) {
   *     console.warn('Warnings:', result.Warning);
   *   }
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message, result.Error.code);
   * }
   * ```
   */
  async getPositions(params: GetPositionsParams): Promise<GetPositionsResponse> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Phase 2C: Extract individual params from input params object
    const brokerId = params.brokerId;
    const connectionId = params.connectionId;
    const accountId = params.accountId;
    const symbol = params.symbol;
    let side = params.side !== undefined ? coerceEnumValue(params.side, PublicOrderSideEnum, 'side') : undefined;
    let assetType = params.assetType !== undefined ? coerceEnumValue(params.assetType, PublicAssetTypeEnum, 'assetType') : undefined;
    let positionStatus = params.positionStatus !== undefined ? coerceEnumValue(params.positionStatus, PublicPositionStatusEnum, 'positionStatus') : undefined;
    const limit = params.limit;
    const offset = params.offset;
    const updatedAfter = params.updatedAfter;
    const updatedBefore = params.updatedBefore;
    const withMetadata = params.withMetadata;

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, params, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as GetPositionsResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Positions', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/positions',
      params: params,
      action: 'getPositions'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getPositionsApiV1BrokersDataPositionsGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountId !== undefined ? { accountId: accountId } : {}), ...(symbol !== undefined ? { symbol: symbol } : {}), ...(side !== undefined ? { side: side } : {}), ...(assetType !== undefined ? { assetType: assetType } : {}), ...(positionStatus !== undefined ? { positionStatus: positionStatus } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(updatedAfter !== undefined ? { updatedAfter: updatedAfter } : {}), ...(updatedBefore !== undefined ? { updatedBefore: updatedBefore } : {}), ...(withMetadata !== undefined ? { withMetadata: withMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Phase 2C: Unwrap API response and transform to standard response structure
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      
      const apiData = (responseData as any).data;
      const warnings = Array.isArray((responseData as any).warnings) ? (responseData as any).warnings : undefined;
      const meta = (responseData as any).meta;
      
      // Build standard response structure
      const standardResponse: GetPositionsResponse = {
        success: {
          data: convertToPlainObject(apiData) as PositionResponse[],
          ...(meta ? { meta } : {}),
        },
        ...(warnings && warnings.length > 0 ? {
          Warning: warnings.map((w: any) => ({
            message: w.message || String(w),
            code: w.code,
            details: w.details || w,
          })),
        } : {}),
      };
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Positions completed', {
        request_id: requestId,
        action: 'getPositions'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Positions failed', error, {
        request_id: requestId,
        action: 'getPositions'
      });
      
      // Phase 2C: Extract error details from Axios errors or generic errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorCode = 'UNKNOWN_ERROR';
      let errorStatus: number | undefined;
      let errorDetails: Record<string, any> = {};
      
      // Handle Axios errors (from OpenAPI generator)
      if ((error as any)?.isAxiosError || (error as any)?.response) {
        const axiosError = error as any;
        errorStatus = axiosError.response?.status;
        errorCode = axiosError.code || `HTTP_${errorStatus || 'UNKNOWN'}`;
        errorMessage = axiosError.response?.data?.message || 
                       axiosError.response?.statusText || 
                       axiosError.message || 
                       errorMessage;
        errorDetails = {
          status: errorStatus,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          requestUrl: axiosError.config?.url,
          requestMethod: axiosError.config?.method,
        };
      } else if (error instanceof Error) {
        errorCode = (error as any)?.code || 'UNKNOWN_ERROR';
        errorDetails = {
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorDetails = { error };
      }
      
      // Phase 2C: Return standard error response structure
      const errorResponse: GetPositionsResponse = {
        success: {
          data: null as any,
        },
        Error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Get Balances
   * 
   * Get balances for all authorized broker connections.
   *
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns balances from connections the company has read access to.

   * @param params {GetBalancesParams} Input parameters object
   * @returns {Promise<GetBalancesResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/balances
   * @methodId get_balances_api_v1_brokers_data_balances_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getBalances({});
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getBalances({
    brokerId: 'id-123',
    connectionId: 'id-123',
    accountId: 'id-123'
   * });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.Warning && result.Warning.length > 0) {
   *     console.warn('Warnings:', result.Warning);
   *   }
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message, result.Error.code);
   * }
   * ```
   */
  async getBalances(params: GetBalancesParams): Promise<GetBalancesResponse> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Phase 2C: Extract individual params from input params object
    const brokerId = params.brokerId;
    const connectionId = params.connectionId;
    const accountId = params.accountId;
    const isEndOfDaySnapshot = params.isEndOfDaySnapshot;
    const limit = params.limit;
    const offset = params.offset;
    const balanceCreatedAfter = params.balanceCreatedAfter;
    const balanceCreatedBefore = params.balanceCreatedBefore;
    const withMetadata = params.withMetadata;

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, params, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/balances', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as GetBalancesResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Balances', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/balances',
      params: params,
      action: 'getBalances'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getBalancesApiV1BrokersDataBalancesGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountId !== undefined ? { accountId: accountId } : {}), ...(isEndOfDaySnapshot !== undefined ? { isEndOfDaySnapshot: isEndOfDaySnapshot } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(balanceCreatedAfter !== undefined ? { balanceCreatedAfter: balanceCreatedAfter } : {}), ...(balanceCreatedBefore !== undefined ? { balanceCreatedBefore: balanceCreatedBefore } : {}), ...(withMetadata !== undefined ? { withMetadata: withMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Phase 2C: Unwrap API response and transform to standard response structure
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      
      const apiData = (responseData as any).data;
      const warnings = Array.isArray((responseData as any).warnings) ? (responseData as any).warnings : undefined;
      const meta = (responseData as any).meta;
      
      // Build standard response structure
      const standardResponse: GetBalancesResponse = {
        success: {
          data: convertToPlainObject(apiData) as Balances[],
          ...(meta ? { meta } : {}),
        },
        ...(warnings && warnings.length > 0 ? {
          Warning: warnings.map((w: any) => ({
            message: w.message || String(w),
            code: w.code,
            details: w.details || w,
          })),
        } : {}),
      };
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/balances', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Balances completed', {
        request_id: requestId,
        action: 'getBalances'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Balances failed', error, {
        request_id: requestId,
        action: 'getBalances'
      });
      
      // Phase 2C: Extract error details from Axios errors or generic errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorCode = 'UNKNOWN_ERROR';
      let errorStatus: number | undefined;
      let errorDetails: Record<string, any> = {};
      
      // Handle Axios errors (from OpenAPI generator)
      if ((error as any)?.isAxiosError || (error as any)?.response) {
        const axiosError = error as any;
        errorStatus = axiosError.response?.status;
        errorCode = axiosError.code || `HTTP_${errorStatus || 'UNKNOWN'}`;
        errorMessage = axiosError.response?.data?.message || 
                       axiosError.response?.statusText || 
                       axiosError.message || 
                       errorMessage;
        errorDetails = {
          status: errorStatus,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          requestUrl: axiosError.config?.url,
          requestMethod: axiosError.config?.method,
        };
      } else if (error instanceof Error) {
        errorCode = (error as any)?.code || 'UNKNOWN_ERROR';
        errorDetails = {
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorDetails = { error };
      }
      
      // Phase 2C: Return standard error response structure
      const errorResponse: GetBalancesResponse = {
        success: {
          data: null as any,
        },
        Error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Get Accounts
   * 
   * Get accounts for all authorized broker connections.
   *
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns accounts from connections the company has read access to.

   * @param params {GetAccountsParams} Input parameters object
   * @returns {Promise<GetAccountsResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/accounts
   * @methodId get_accounts_api_v1_brokers_data_accounts_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getAccounts({});
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getAccounts({
    brokerId: 'id-123',
    connectionId: 'id-123',
    accountType: 'cash'
   * });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.Warning && result.Warning.length > 0) {
   *     console.warn('Warnings:', result.Warning);
   *   }
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message, result.Error.code);
   * }
   * ```
   */
  async getAccounts(params: GetAccountsParams): Promise<GetAccountsResponse> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Phase 2C: Extract individual params from input params object
    const brokerId = params.brokerId;
    const connectionId = params.connectionId;
    let accountType = params.accountType !== undefined ? coerceEnumValue(params.accountType, PublicAccountTypeEnum, 'accountType') : undefined;
    const status = params.status;
    const currency = params.currency;
    const limit = params.limit;
    const offset = params.offset;
    const withMetadata = params.withMetadata;

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, params, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/accounts', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as GetAccountsResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Accounts', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/accounts',
      params: params,
      action: 'getAccounts'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getAccountsApiV1BrokersDataAccountsGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountType !== undefined ? { accountType: accountType } : {}), ...(status !== undefined ? { status: status } : {}), ...(currency !== undefined ? { currency: currency } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(withMetadata !== undefined ? { withMetadata: withMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Phase 2C: Unwrap API response and transform to standard response structure
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      
      const apiData = (responseData as any).data;
      const warnings = Array.isArray((responseData as any).warnings) ? (responseData as any).warnings : undefined;
      const meta = (responseData as any).meta;
      
      // Build standard response structure
      const standardResponse: GetAccountsResponse = {
        success: {
          data: convertToPlainObject(apiData) as Accounts[],
          ...(meta ? { meta } : {}),
        },
        ...(warnings && warnings.length > 0 ? {
          Warning: warnings.map((w: any) => ({
            message: w.message || String(w),
            code: w.code,
            details: w.details || w,
          })),
        } : {}),
      };
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/accounts', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Accounts completed', {
        request_id: requestId,
        action: 'getAccounts'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Accounts failed', error, {
        request_id: requestId,
        action: 'getAccounts'
      });
      
      // Phase 2C: Extract error details from Axios errors or generic errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorCode = 'UNKNOWN_ERROR';
      let errorStatus: number | undefined;
      let errorDetails: Record<string, any> = {};
      
      // Handle Axios errors (from OpenAPI generator)
      if ((error as any)?.isAxiosError || (error as any)?.response) {
        const axiosError = error as any;
        errorStatus = axiosError.response?.status;
        errorCode = axiosError.code || `HTTP_${errorStatus || 'UNKNOWN'}`;
        errorMessage = axiosError.response?.data?.message || 
                       axiosError.response?.statusText || 
                       axiosError.message || 
                       errorMessage;
        errorDetails = {
          status: errorStatus,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          requestUrl: axiosError.config?.url,
          requestMethod: axiosError.config?.method,
        };
      } else if (error instanceof Error) {
        errorCode = (error as any)?.code || 'UNKNOWN_ERROR';
        errorDetails = {
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorDetails = { error };
      }
      
      // Phase 2C: Return standard error response structure
      const errorResponse: GetAccountsResponse = {
        success: {
          data: null as any,
        },
        Error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Get Order Fills
   * 
   * Get order fills for a specific order.
   *
   * This endpoint returns all execution fills for the specified order.

   * @param params {GetOrderFillsParams} Input parameters object
   * @returns {Promise<GetOrderFillsResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/orders/{order_id}/fills
   * @methodId get_order_fills_api_v1_brokers_data_orders__order_id__fills_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.getOrderFills({
    orderId: 'id-123'
   * });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getOrderFills({
    orderId: 'id-123',
    connectionId: 'id-123',
    limit: 10,
    offset: 0
   * });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.Warning && result.Warning.length > 0) {
   *     console.warn('Warnings:', result.Warning);
   *   }
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message, result.Error.code);
   * }
   * ```
   */
  async getOrderFills(params: GetOrderFillsParams): Promise<GetOrderFillsResponse> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Phase 2C: Extract individual params from input params object
    const orderId = params.orderId;
    const connectionId = params.connectionId;
    const limit = params.limit;
    const offset = params.offset;

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, params, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/{order_id}/fills', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as GetOrderFillsResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Order Fills', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/orders/{order_id}/fills',
      params: params,
      action: 'getOrderFills'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getOrderFillsApiV1BrokersDataOrdersOrderIdFillsGet({ orderId: orderId, ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Phase 2C: Unwrap API response and transform to standard response structure
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      
      const apiData = (responseData as any).data;
      const warnings = Array.isArray((responseData as any).warnings) ? (responseData as any).warnings : undefined;
      const meta = (responseData as any).meta;
      
      // Build standard response structure
      const standardResponse: GetOrderFillsResponse = {
        success: {
          data: convertToPlainObject(apiData) as OrderFillResponse[],
          ...(meta ? { meta } : {}),
        },
        ...(warnings && warnings.length > 0 ? {
          Warning: warnings.map((w: any) => ({
            message: w.message || String(w),
            code: w.code,
            details: w.details || w,
          })),
        } : {}),
      };
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/{order_id}/fills', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Order Fills completed', {
        request_id: requestId,
        action: 'getOrderFills'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Order Fills failed', error, {
        request_id: requestId,
        action: 'getOrderFills'
      });
      
      // Phase 2C: Extract error details from Axios errors or generic errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorCode = 'UNKNOWN_ERROR';
      let errorStatus: number | undefined;
      let errorDetails: Record<string, any> = {};
      
      // Handle Axios errors (from OpenAPI generator)
      if ((error as any)?.isAxiosError || (error as any)?.response) {
        const axiosError = error as any;
        errorStatus = axiosError.response?.status;
        errorCode = axiosError.code || `HTTP_${errorStatus || 'UNKNOWN'}`;
        errorMessage = axiosError.response?.data?.message || 
                       axiosError.response?.statusText || 
                       axiosError.message || 
                       errorMessage;
        errorDetails = {
          status: errorStatus,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          requestUrl: axiosError.config?.url,
          requestMethod: axiosError.config?.method,
        };
      } else if (error instanceof Error) {
        errorCode = (error as any)?.code || 'UNKNOWN_ERROR';
        errorDetails = {
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorDetails = { error };
      }
      
      // Phase 2C: Return standard error response structure
      const errorResponse: GetOrderFillsResponse = {
        success: {
          data: null as any,
        },
        Error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Get Order Events
   * 
   * Get order events for a specific order.
   *
   * This endpoint returns all lifecycle events for the specified order.

   * @param params {GetOrderEventsParams} Input parameters object
   * @returns {Promise<GetOrderEventsResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/orders/{order_id}/events
   * @methodId get_order_events_api_v1_brokers_data_orders__order_id__events_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.getOrderEvents({
    orderId: 'id-123'
   * });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getOrderEvents({
    orderId: 'id-123',
    connectionId: 'id-123',
    limit: 10,
    offset: 0
   * });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.Warning && result.Warning.length > 0) {
   *     console.warn('Warnings:', result.Warning);
   *   }
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message, result.Error.code);
   * }
   * ```
   */
  async getOrderEvents(params: GetOrderEventsParams): Promise<GetOrderEventsResponse> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Phase 2C: Extract individual params from input params object
    const orderId = params.orderId;
    const connectionId = params.connectionId;
    const limit = params.limit;
    const offset = params.offset;

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, params, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/{order_id}/events', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as GetOrderEventsResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Order Events', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/orders/{order_id}/events',
      params: params,
      action: 'getOrderEvents'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getOrderEventsApiV1BrokersDataOrdersOrderIdEventsGet({ orderId: orderId, ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Phase 2C: Unwrap API response and transform to standard response structure
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      
      const apiData = (responseData as any).data;
      const warnings = Array.isArray((responseData as any).warnings) ? (responseData as any).warnings : undefined;
      const meta = (responseData as any).meta;
      
      // Build standard response structure
      const standardResponse: GetOrderEventsResponse = {
        success: {
          data: convertToPlainObject(apiData) as OrderEventResponse[],
          ...(meta ? { meta } : {}),
        },
        ...(warnings && warnings.length > 0 ? {
          Warning: warnings.map((w: any) => ({
            message: w.message || String(w),
            code: w.code,
            details: w.details || w,
          })),
        } : {}),
      };
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/{order_id}/events', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Order Events completed', {
        request_id: requestId,
        action: 'getOrderEvents'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Order Events failed', error, {
        request_id: requestId,
        action: 'getOrderEvents'
      });
      
      // Phase 2C: Extract error details from Axios errors or generic errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorCode = 'UNKNOWN_ERROR';
      let errorStatus: number | undefined;
      let errorDetails: Record<string, any> = {};
      
      // Handle Axios errors (from OpenAPI generator)
      if ((error as any)?.isAxiosError || (error as any)?.response) {
        const axiosError = error as any;
        errorStatus = axiosError.response?.status;
        errorCode = axiosError.code || `HTTP_${errorStatus || 'UNKNOWN'}`;
        errorMessage = axiosError.response?.data?.message || 
                       axiosError.response?.statusText || 
                       axiosError.message || 
                       errorMessage;
        errorDetails = {
          status: errorStatus,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          requestUrl: axiosError.config?.url,
          requestMethod: axiosError.config?.method,
        };
      } else if (error instanceof Error) {
        errorCode = (error as any)?.code || 'UNKNOWN_ERROR';
        errorDetails = {
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorDetails = { error };
      }
      
      // Phase 2C: Return standard error response structure
      const errorResponse: GetOrderEventsResponse = {
        success: {
          data: null as any,
        },
        Error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Get Order Groups
   * 
   * Get order groups.
   *
   * This endpoint returns order groups that contain multiple orders.

   * @param params {GetOrderGroupsParams} Input parameters object
   * @returns {Promise<GetOrderGroupsResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/orders/groups
   * @methodId get_order_groups_api_v1_brokers_data_orders_groups_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getOrderGroups({});
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getOrderGroups({
    brokerId: 'id-123',
    connectionId: 'id-123',
    limit: 10
   * });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.Warning && result.Warning.length > 0) {
   *     console.warn('Warnings:', result.Warning);
   *   }
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message, result.Error.code);
   * }
   * ```
   */
  async getOrderGroups(params: GetOrderGroupsParams): Promise<GetOrderGroupsResponse> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Phase 2C: Extract individual params from input params object
    const brokerId = params.brokerId;
    const connectionId = params.connectionId;
    const limit = params.limit;
    const offset = params.offset;
    const createdAfter = params.createdAfter;
    const createdBefore = params.createdBefore;

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, params, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/groups', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as GetOrderGroupsResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Order Groups', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/orders/groups',
      params: params,
      action: 'getOrderGroups'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getOrderGroupsApiV1BrokersDataOrdersGroupsGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(createdAfter !== undefined ? { createdAfter: createdAfter } : {}), ...(createdBefore !== undefined ? { createdBefore: createdBefore } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Phase 2C: Unwrap API response and transform to standard response structure
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      
      const apiData = (responseData as any).data;
      const warnings = Array.isArray((responseData as any).warnings) ? (responseData as any).warnings : undefined;
      const meta = (responseData as any).meta;
      
      // Build standard response structure
      const standardResponse: GetOrderGroupsResponse = {
        success: {
          data: convertToPlainObject(apiData) as OrderGroupResponse[],
          ...(meta ? { meta } : {}),
        },
        ...(warnings && warnings.length > 0 ? {
          Warning: warnings.map((w: any) => ({
            message: w.message || String(w),
            code: w.code,
            details: w.details || w,
          })),
        } : {}),
      };
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/groups', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Order Groups completed', {
        request_id: requestId,
        action: 'getOrderGroups'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Order Groups failed', error, {
        request_id: requestId,
        action: 'getOrderGroups'
      });
      
      // Phase 2C: Extract error details from Axios errors or generic errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorCode = 'UNKNOWN_ERROR';
      let errorStatus: number | undefined;
      let errorDetails: Record<string, any> = {};
      
      // Handle Axios errors (from OpenAPI generator)
      if ((error as any)?.isAxiosError || (error as any)?.response) {
        const axiosError = error as any;
        errorStatus = axiosError.response?.status;
        errorCode = axiosError.code || `HTTP_${errorStatus || 'UNKNOWN'}`;
        errorMessage = axiosError.response?.data?.message || 
                       axiosError.response?.statusText || 
                       axiosError.message || 
                       errorMessage;
        errorDetails = {
          status: errorStatus,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          requestUrl: axiosError.config?.url,
          requestMethod: axiosError.config?.method,
        };
      } else if (error instanceof Error) {
        errorCode = (error as any)?.code || 'UNKNOWN_ERROR';
        errorDetails = {
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorDetails = { error };
      }
      
      // Phase 2C: Return standard error response structure
      const errorResponse: GetOrderGroupsResponse = {
        success: {
          data: null as any,
        },
        Error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Get Position Lots
   * 
   * Get position lots (tax lots for positions).
   *
   * This endpoint returns tax lots for positions, which are used for tax reporting.
   * Each lot tracks when a position was opened/closed and at what prices.

   * @param params {GetPositionLotsParams} Input parameters object
   * @returns {Promise<GetPositionLotsResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/positions/lots
   * @methodId get_position_lots_api_v1_brokers_data_positions_lots_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getPositionLots({});
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getPositionLots({
    brokerId: 'id-123',
    connectionId: 'id-123',
    accountId: 'id-123'
   * });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.Warning && result.Warning.length > 0) {
   *     console.warn('Warnings:', result.Warning);
   *   }
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message, result.Error.code);
   * }
   * ```
   */
  async getPositionLots(params: GetPositionLotsParams): Promise<GetPositionLotsResponse> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Phase 2C: Extract individual params from input params object
    const brokerId = params.brokerId;
    const connectionId = params.connectionId;
    const accountId = params.accountId;
    const symbol = params.symbol;
    const positionId = params.positionId;
    const limit = params.limit;
    const offset = params.offset;

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, params, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions/lots', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as GetPositionLotsResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Position Lots', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/positions/lots',
      params: params,
      action: 'getPositionLots'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getPositionLotsApiV1BrokersDataPositionsLotsGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountId !== undefined ? { accountId: accountId } : {}), ...(symbol !== undefined ? { symbol: symbol } : {}), ...(positionId !== undefined ? { positionId: positionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Phase 2C: Unwrap API response and transform to standard response structure
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      
      const apiData = (responseData as any).data;
      const warnings = Array.isArray((responseData as any).warnings) ? (responseData as any).warnings : undefined;
      const meta = (responseData as any).meta;
      
      // Build standard response structure
      const standardResponse: GetPositionLotsResponse = {
        success: {
          data: convertToPlainObject(apiData) as PositionLotResponse[],
          ...(meta ? { meta } : {}),
        },
        ...(warnings && warnings.length > 0 ? {
          Warning: warnings.map((w: any) => ({
            message: w.message || String(w),
            code: w.code,
            details: w.details || w,
          })),
        } : {}),
      };
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions/lots', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Position Lots completed', {
        request_id: requestId,
        action: 'getPositionLots'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Position Lots failed', error, {
        request_id: requestId,
        action: 'getPositionLots'
      });
      
      // Phase 2C: Extract error details from Axios errors or generic errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorCode = 'UNKNOWN_ERROR';
      let errorStatus: number | undefined;
      let errorDetails: Record<string, any> = {};
      
      // Handle Axios errors (from OpenAPI generator)
      if ((error as any)?.isAxiosError || (error as any)?.response) {
        const axiosError = error as any;
        errorStatus = axiosError.response?.status;
        errorCode = axiosError.code || `HTTP_${errorStatus || 'UNKNOWN'}`;
        errorMessage = axiosError.response?.data?.message || 
                       axiosError.response?.statusText || 
                       axiosError.message || 
                       errorMessage;
        errorDetails = {
          status: errorStatus,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          requestUrl: axiosError.config?.url,
          requestMethod: axiosError.config?.method,
        };
      } else if (error instanceof Error) {
        errorCode = (error as any)?.code || 'UNKNOWN_ERROR';
        errorDetails = {
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorDetails = { error };
      }
      
      // Phase 2C: Return standard error response structure
      const errorResponse: GetPositionLotsResponse = {
        success: {
          data: null as any,
        },
        Error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Get Position Lot Fills
   * 
   * Get position lot fills for a specific lot.
   *
   * This endpoint returns all fills associated with a specific position lot.

   * @param params {GetPositionLotFillsParams} Input parameters object
   * @returns {Promise<GetPositionLotFillsResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/positions/lots/{lot_id}/fills
   * @methodId get_position_lot_fills_api_v1_brokers_data_positions_lots__lot_id__fills_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.getPositionLotFills({
    lotId: 'id-123'
   * });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getPositionLotFills({
    lotId: 'id-123',
    connectionId: 'id-123',
    limit: 10,
    offset: 0
   * });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.Warning && result.Warning.length > 0) {
   *     console.warn('Warnings:', result.Warning);
   *   }
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message, result.Error.code);
   * }
   * ```
   */
  async getPositionLotFills(params: GetPositionLotFillsParams): Promise<GetPositionLotFillsResponse> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Phase 2C: Extract individual params from input params object
    const lotId = params.lotId;
    const connectionId = params.connectionId;
    const limit = params.limit;
    const offset = params.offset;

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, params, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions/lots/{lot_id}/fills', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as GetPositionLotFillsResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Position Lot Fills', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/positions/lots/{lot_id}/fills',
      params: params,
      action: 'getPositionLotFills'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getPositionLotFillsApiV1BrokersDataPositionsLotsLotIdFillsGet({ lotId: lotId, ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Phase 2C: Unwrap API response and transform to standard response structure
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      
      const apiData = (responseData as any).data;
      const warnings = Array.isArray((responseData as any).warnings) ? (responseData as any).warnings : undefined;
      const meta = (responseData as any).meta;
      
      // Build standard response structure
      const standardResponse: GetPositionLotFillsResponse = {
        success: {
          data: convertToPlainObject(apiData) as PositionLotFillResponse[],
          ...(meta ? { meta } : {}),
        },
        ...(warnings && warnings.length > 0 ? {
          Warning: warnings.map((w: any) => ({
            message: w.message || String(w),
            code: w.code,
            details: w.details || w,
          })),
        } : {}),
      };
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions/lots/{lot_id}/fills', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Position Lot Fills completed', {
        request_id: requestId,
        action: 'getPositionLotFills'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Position Lot Fills failed', error, {
        request_id: requestId,
        action: 'getPositionLotFills'
      });
      
      // Phase 2C: Extract error details from Axios errors or generic errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorCode = 'UNKNOWN_ERROR';
      let errorStatus: number | undefined;
      let errorDetails: Record<string, any> = {};
      
      // Handle Axios errors (from OpenAPI generator)
      if ((error as any)?.isAxiosError || (error as any)?.response) {
        const axiosError = error as any;
        errorStatus = axiosError.response?.status;
        errorCode = axiosError.code || `HTTP_${errorStatus || 'UNKNOWN'}`;
        errorMessage = axiosError.response?.data?.message || 
                       axiosError.response?.statusText || 
                       axiosError.message || 
                       errorMessage;
        errorDetails = {
          status: errorStatus,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          requestUrl: axiosError.config?.url,
          requestMethod: axiosError.config?.method,
        };
      } else if (error instanceof Error) {
        errorCode = (error as any)?.code || 'UNKNOWN_ERROR';
        errorDetails = {
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorDetails = { error };
      }
      
      // Phase 2C: Return standard error response structure
      const errorResponse: GetPositionLotFillsResponse = {
        success: {
          data: null as any,
        },
        Error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Place Order
   * 
   * Create a new order via the specified broker connection.
   *
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Requires trading permissions for the company.
   *
   * Standard parameters
   * -------------------
   * The following fields constitute the unified Finatic *common order schema* and
   * therefore appear individually as query parameters in the autogenerated
   * OpenAPI documentation:
   *
   * - ``broker``
   * - ``account_number``
   * - ``order_type``
   * - ``asset_type``
   * - ``action``
   * - ``time_in_force``
   * - ``symbol``
   * - ``order_qty``
   *
   * They are surfaced as *query* parameters **only to make the accepted fields
   * obvious in the interactive docs**. In production usage you should send these
   * fields inside the JSON body (see ``order_request``) so that the entire order
   * specification travels in one payload. (Nothing will break if you send both, but there is no need to do so.)
   *
   * Body payload & broker-specific extras
   * -------------------------------------
   *
   * Put the standard parameters plus any broker-specific extensions under the
   * ``order`` key of the body. Refer to the bundled OpenAPI examples below to
   * see complete payloads for common order types (market, limit, spreads, etc.)
   * across supported brokers.
   *
   * For a formal reference of broker-specific extensions inspect the
   * ``BrokerOrderPlaceExtras`` schema.
   *
   * The endpoint resolves the active ``user_broker_connection`` by calling the
   * ``get_user_broker_connection_ids_for_broker`` RPC in Supabase. If no active
   * connection exists it returns a list of *available* brokers so your client
   * can guide the user accordingly.
   *
   * Broker Notes
   * ------------
   * - The responses that you get back from the broker are not always the same.
   * The response models are validated for each broker, but we do not standardize the repsonses.
   *
   * - Tasty Trade: If you want to trade options for a particular stock, first fetch the full
   * option chain via the GET https://api.tastyworks.com/option-chains/{stock_symbol}/nested endpoint.
   * This endpoint returns all available expirations that tastytrade offers for that equity symbol.
   * Each expiration contains a list of strikes, where each strike has a call and put field representing
   * the call symbol and put symbol respectively.
   *
   * We are planning to add a new endpoint to fetch the option chain for a particular stock and
   * handle this logic for you, but for now you need to fetch the option chain manually.

   * @param params {PlaceOrderParams} Input parameters object
   * @returns {Promise<PlaceOrderResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: POST /api/v1/brokers/orders
   * @methodId place_order_api_v1_brokers_orders_post
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.placeOrder({});
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.placeOrder({
    body: {},
    connectionId: 'id-123'
   * });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.Warning && result.Warning.length > 0) {
   *     console.warn('Warnings:', result.Warning);
   *   }
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message, result.Error.code);
   * }
   * ```
   */
  async placeOrder(params: PlaceOrderParams): Promise<PlaceOrderResponse> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Phase 2C: Extract individual params from input params object
    const body = params.body;
    const connectionId = params.connectionId;

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, params, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('POST', '/api/v1/brokers/orders', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as PlaceOrderResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Place Order', {
      request_id: requestId,
      method: 'POST',
      path: '/api/v1/brokers/orders',
      params: params,
      action: 'placeOrder'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.placeOrderApiV1BrokersOrdersPost({ ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(body !== undefined ? { body: body } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Phase 2C: Unwrap API response and transform to standard response structure
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      
      const apiData = (responseData as any).data;
      const warnings = Array.isArray((responseData as any).warnings) ? (responseData as any).warnings : undefined;
      const meta = (responseData as any).meta;
      
      // Build standard response structure
      const standardResponse: PlaceOrderResponse = {
        success: {
          data: convertToPlainObject(apiData) as OrderActionResult,
          ...(meta ? { meta } : {}),
        },
        ...(warnings && warnings.length > 0 ? {
          Warning: warnings.map((w: any) => ({
            message: w.message || String(w),
            code: w.code,
            details: w.details || w,
          })),
        } : {}),
      };
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('POST', '/api/v1/brokers/orders', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Place Order completed', {
        request_id: requestId,
        action: 'placeOrder'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Place Order failed', error, {
        request_id: requestId,
        action: 'placeOrder'
      });
      
      // Phase 2C: Extract error details from Axios errors or generic errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorCode = 'UNKNOWN_ERROR';
      let errorStatus: number | undefined;
      let errorDetails: Record<string, any> = {};
      
      // Handle Axios errors (from OpenAPI generator)
      if ((error as any)?.isAxiosError || (error as any)?.response) {
        const axiosError = error as any;
        errorStatus = axiosError.response?.status;
        errorCode = axiosError.code || `HTTP_${errorStatus || 'UNKNOWN'}`;
        errorMessage = axiosError.response?.data?.message || 
                       axiosError.response?.statusText || 
                       axiosError.message || 
                       errorMessage;
        errorDetails = {
          status: errorStatus,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          requestUrl: axiosError.config?.url,
          requestMethod: axiosError.config?.method,
        };
      } else if (error instanceof Error) {
        errorCode = (error as any)?.code || 'UNKNOWN_ERROR';
        errorDetails = {
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorDetails = { error };
      }
      
      // Phase 2C: Return standard error response structure
      const errorResponse: PlaceOrderResponse = {
        success: {
          data: null as any,
        },
        Error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Cancel Order
   * 
   * Cancel an existing order.
   *
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Requires trading permissions for the company.

   * @param params {CancelOrderParams} Input parameters object
   * @returns {Promise<CancelOrderResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: DELETE /api/v1/brokers/orders/{order_id}
   * @methodId cancel_order_api_v1_brokers_orders__order_id__delete
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.cancelOrder({
    orderId: 'id-123'
   * });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.cancelOrder({
    orderId: 'id-123',
    body: {},
    accountNumber: 'example',
    connectionId: 'id-123'
   * });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.Warning && result.Warning.length > 0) {
   *     console.warn('Warnings:', result.Warning);
   *   }
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message, result.Error.code);
   * }
   * ```
   */
  async cancelOrder(params: CancelOrderParams): Promise<CancelOrderResponse> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Phase 2C: Extract individual params from input params object
    const orderId = params.orderId;
    const body = params.body;
    const accountNumber = params.accountNumber;
    const connectionId = params.connectionId;

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, params, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('DELETE', '/api/v1/brokers/orders/{order_id}', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as CancelOrderResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Cancel Order', {
      request_id: requestId,
      method: 'DELETE',
      path: '/api/v1/brokers/orders/{order_id}',
      params: params,
      action: 'cancelOrder'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.cancelOrderApiV1BrokersOrdersOrderIdDelete({ orderId: orderId, ...(accountNumber !== undefined ? { accountNumber: accountNumber } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(body !== undefined ? { body: body } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Phase 2C: Unwrap API response and transform to standard response structure
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      
      const apiData = (responseData as any).data;
      const warnings = Array.isArray((responseData as any).warnings) ? (responseData as any).warnings : undefined;
      const meta = (responseData as any).meta;
      
      // Build standard response structure
      const standardResponse: CancelOrderResponse = {
        success: {
          data: convertToPlainObject(apiData) as OrderActionResult,
          ...(meta ? { meta } : {}),
        },
        ...(warnings && warnings.length > 0 ? {
          Warning: warnings.map((w: any) => ({
            message: w.message || String(w),
            code: w.code,
            details: w.details || w,
          })),
        } : {}),
      };
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('DELETE', '/api/v1/brokers/orders/{order_id}', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Cancel Order completed', {
        request_id: requestId,
        action: 'cancelOrder'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Cancel Order failed', error, {
        request_id: requestId,
        action: 'cancelOrder'
      });
      
      // Phase 2C: Extract error details from Axios errors or generic errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorCode = 'UNKNOWN_ERROR';
      let errorStatus: number | undefined;
      let errorDetails: Record<string, any> = {};
      
      // Handle Axios errors (from OpenAPI generator)
      if ((error as any)?.isAxiosError || (error as any)?.response) {
        const axiosError = error as any;
        errorStatus = axiosError.response?.status;
        errorCode = axiosError.code || `HTTP_${errorStatus || 'UNKNOWN'}`;
        errorMessage = axiosError.response?.data?.message || 
                       axiosError.response?.statusText || 
                       axiosError.message || 
                       errorMessage;
        errorDetails = {
          status: errorStatus,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          requestUrl: axiosError.config?.url,
          requestMethod: axiosError.config?.method,
        };
      } else if (error instanceof Error) {
        errorCode = (error as any)?.code || 'UNKNOWN_ERROR';
        errorDetails = {
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorDetails = { error };
      }
      
      // Phase 2C: Return standard error response structure
      const errorResponse: CancelOrderResponse = {
        success: {
          data: null as any,
        },
        Error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Modify Order
   * 
   * Modify an existing order.
   *
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Requires trading permissions for the company.

   * @param params {ModifyOrderParams} Input parameters object
   * @returns {Promise<ModifyOrderResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: PATCH /api/v1/brokers/orders/{order_id}
   * @methodId modify_order_api_v1_brokers_orders__order_id__patch
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.modifyOrder({
    orderId: 'id-123'
   * });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.modifyOrder({
    orderId: 'id-123',
    body: {},
    accountNumber: 'example',
    connectionId: 'id-123'
   * });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.Warning && result.Warning.length > 0) {
   *     console.warn('Warnings:', result.Warning);
   *   }
   * } else if (result.Error) {
   *   console.error('Error:', result.Error.message, result.Error.code);
   * }
   * ```
   */
  async modifyOrder(params: ModifyOrderParams): Promise<ModifyOrderResponse> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Phase 2C: Extract individual params from input params object
    const orderId = params.orderId;
    const body = params.body;
    const accountNumber = params.accountNumber;
    const connectionId = params.connectionId;

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, params, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('PATCH', '/api/v1/brokers/orders/{order_id}', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as ModifyOrderResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Modify Order', {
      request_id: requestId,
      method: 'PATCH',
      path: '/api/v1/brokers/orders/{order_id}',
      params: params,
      action: 'modifyOrder'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.modifyOrderApiV1BrokersOrdersOrderIdPatch({ orderId: orderId, ...(accountNumber !== undefined ? { accountNumber: accountNumber } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(body !== undefined ? { body: body } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Phase 2C: Unwrap API response and transform to standard response structure
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      
      const apiData = (responseData as any).data;
      const warnings = Array.isArray((responseData as any).warnings) ? (responseData as any).warnings : undefined;
      const meta = (responseData as any).meta;
      
      // Build standard response structure
      const standardResponse: ModifyOrderResponse = {
        success: {
          data: convertToPlainObject(apiData) as OrderActionResult,
          ...(meta ? { meta } : {}),
        },
        ...(warnings && warnings.length > 0 ? {
          Warning: warnings.map((w: any) => ({
            message: w.message || String(w),
            code: w.code,
            details: w.details || w,
          })),
        } : {}),
      };
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('PATCH', '/api/v1/brokers/orders/{order_id}', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Modify Order completed', {
        request_id: requestId,
        action: 'modifyOrder'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Modify Order failed', error, {
        request_id: requestId,
        action: 'modifyOrder'
      });
      
      // Phase 2C: Extract error details from Axios errors or generic errors
      let errorMessage = error instanceof Error ? error.message : String(error);
      let errorCode = 'UNKNOWN_ERROR';
      let errorStatus: number | undefined;
      let errorDetails: Record<string, any> = {};
      
      // Handle Axios errors (from OpenAPI generator)
      if ((error as any)?.isAxiosError || (error as any)?.response) {
        const axiosError = error as any;
        errorStatus = axiosError.response?.status;
        errorCode = axiosError.code || `HTTP_${errorStatus || 'UNKNOWN'}`;
        errorMessage = axiosError.response?.data?.message || 
                       axiosError.response?.statusText || 
                       axiosError.message || 
                       errorMessage;
        errorDetails = {
          status: errorStatus,
          statusText: axiosError.response?.statusText,
          responseData: axiosError.response?.data,
          requestUrl: axiosError.config?.url,
          requestMethod: axiosError.config?.method,
        };
      } else if (error instanceof Error) {
        errorCode = (error as any)?.code || 'UNKNOWN_ERROR';
        errorDetails = {
          stack: error.stack,
          name: error.name,
        };
      } else {
        errorDetails = { error };
      }
      
      // Phase 2C: Return standard error response structure
      const errorResponse: ModifyOrderResponse = {
        success: {
          data: null as any,
        },
        Error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

}
