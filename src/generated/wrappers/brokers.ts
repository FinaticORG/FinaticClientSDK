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
import { unwrapAxiosResponse } from '../utils/response-utils';
import { coerceEnumValue } from '../utils/enum-coercion';
import { convertToPlainObject } from '../utils/plain-object';
import { BrokerDataAccountTypeEnum } from '../models';
import { BrokerDataAssetTypeEnum } from '../models';
import { BrokerDataOrderSideEnum } from '../models';
import { BrokerDataOrderStatusEnum } from '../models';
import { BrokerDataPositionStatusEnum } from '../models';

import type { AccountStatus } from '../models';
import type { BrokerInfo } from '../models';
import type { DisconnectActionResult } from '../models';
import type { FDXBrokerAccount } from '../models';
import type { FDXBrokerBalance } from '../models';
import type { FDXBrokerOrder } from '../models';
import type { FDXBrokerOrderEvent } from '../models';
import type { FDXBrokerOrderFill } from '../models';
import type { FDXBrokerOrderGroup } from '../models';
import type { FDXBrokerPosition } from '../models';
import type { FDXBrokerPositionLot } from '../models';
import type { FDXBrokerPositionLotFill } from '../models';
import type { UserBrokerConnectionWithPermissions } from '../models';


/**
 * Standard FinaticResponse type for all API responses.
 * 
 * Generic response structure with success, error, and warning fields.
 */
export interface FinaticResponse<T> {
  '_id'?: string;
  /**
   * Success payload containing data and optional meta
   */
  'success': {
    'data': T;
    'meta'?: { [key: string]: any; } | null;
  };
  'error'?: { [key: string]: any; } | null;
  'warning'?: Array<{ [key: string]: any; }> | null;
}

// Phase 2C: Input type definitions (output types use FinaticResponse<DataType> pattern - no interfaces needed)
export interface GetBrokersParams {
  // No parameters
}

export interface GetBrokerConnectionsParams {
  // No parameters
}

export interface DisconnectCompanyFromBrokerParams {
  connectionId: string;
}

export interface GetOrdersParams {
  brokerId?: string;
  connectionId?: string;
  accountId?: string;
  symbol?: string;
  orderStatus?: BrokerDataOrderStatusEnum;
  side?: BrokerDataOrderSideEnum;
  assetType?: BrokerDataAssetTypeEnum;
  limit?: number;
  offset?: number;
  createdAfter?: string;
  createdBefore?: string;
  includeMetadata?: boolean;
}

export interface GetPositionsParams {
  brokerId?: string;
  connectionId?: string;
  accountId?: string;
  symbol?: string;
  side?: BrokerDataOrderSideEnum;
  assetType?: BrokerDataAssetTypeEnum;
  positionStatus?: BrokerDataPositionStatusEnum;
  limit?: number;
  offset?: number;
  updatedAfter?: string;
  updatedBefore?: string;
  includeMetadata?: boolean;
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
  includeMetadata?: boolean;
}

export interface GetAccountsParams {
  brokerId?: string;
  connectionId?: string;
  accountType?: BrokerDataAccountTypeEnum;
  status?: AccountStatus;
  currency?: string;
  limit?: number;
  offset?: number;
  includeMetadata?: boolean;
}

export interface GetOrderFillsParams {
  orderId: string;
  connectionId?: string;
  limit?: number;
  offset?: number;
  includeMetadata?: boolean;
}

export interface GetOrderEventsParams {
  orderId: string;
  connectionId?: string;
  limit?: number;
  offset?: number;
  includeMetadata?: boolean;
}

export interface GetOrderGroupsParams {
  brokerId?: string;
  connectionId?: string;
  limit?: number;
  offset?: number;
  createdAfter?: string;
  createdBefore?: string;
  includeMetadata?: boolean;
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

export interface GetPositionLotFillsParams {
  lotId: string;
  connectionId?: string;
  limit?: number;
  offset?: number;
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
  setSessionContext(sessionId: string, companyId: string, csrfToken: string): void {
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

  protected _handleError(error: unknown, requestId?: string): Error {
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
   * @param No parameters required for this method
   * @returns {Promise<FinaticResponse<BrokerInfo[]>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/
   * @methodId get_brokers_api_v1_brokers__get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getBrokers();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   */
  async getBrokers(): Promise<FinaticResponse<BrokerInfo[]>> {
    // No parameters - use empty params object
    const params: GetBrokersParams = {};    // Generate request ID
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
        return cached as FinaticResponse<BrokerInfo[]>;
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
      
      // Unwrap axios response immediately - get FinaticResponse object
      const responseData = unwrapAxiosResponse(response);
      if (!(responseData && typeof responseData === 'object' && 'success' in responseData)) {
        throw new Error('Unexpected response shape: missing success field');
      }
      
      // Convert response to plain object, removing _id fields recursively
      const standardResponse: FinaticResponse<BrokerInfo[]> = convertToPlainObject(responseData) as FinaticResponse<BrokerInfo[]>;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Brokers completed', {
        request_id: requestId,
        action: 'getBrokers'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
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
        // Extract error message from FinaticResponse Error field or fallback to statusText/message
        const errorResponseData = axiosError.response?.data;
        if (errorResponseData && typeof errorResponseData === 'object' && 'error' in errorResponseData) {
          errorMessage = errorResponseData.error?.message || errorMessage;
          errorCode = errorResponseData.error?.code || errorCode;
          errorStatus = errorResponseData.error?.status || errorStatus;
        } else {
          errorMessage = axiosError.response?.statusText || 
                         axiosError.message || 
                         errorMessage;
        }
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
      const errorResponse: FinaticResponse<BrokerInfo[]> = {
        success: {
          data: null as any,
        },
        error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2D: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2D: Add orphaned method detection
    // TODO Phase 2D: Add advanced convenience methods
  }

  /**
   * List Broker Connections
   * 
   * List all broker connections for the current user with permissions.
   *
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns connections that the user has any permissions for, including the current
   * company's permissions (read/write) for each connection.
   * @param No parameters required for this method
   * @returns {Promise<FinaticResponse<UserBrokerConnectionWithPermissions[]>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/connections
   * @methodId list_broker_connections_api_v1_brokers_connections_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getBrokerConnections();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   */
  async getBrokerConnections(): Promise<FinaticResponse<UserBrokerConnectionWithPermissions[]>> {
    // No parameters - use empty params object
    const params: GetBrokerConnectionsParams = {};    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

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
        return cached as FinaticResponse<UserBrokerConnectionWithPermissions[]>;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('List Broker Connections', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/connections',
      params: params,
      action: 'getBrokerConnections'
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
      
      // Unwrap axios response immediately - get FinaticResponse object
      const responseData = unwrapAxiosResponse(response);
      if (!(responseData && typeof responseData === 'object' && 'success' in responseData)) {
        throw new Error('Unexpected response shape: missing success field');
      }
      
      // Convert response to plain object, removing _id fields recursively
      const standardResponse: FinaticResponse<UserBrokerConnectionWithPermissions[]> = convertToPlainObject(responseData) as FinaticResponse<UserBrokerConnectionWithPermissions[]>;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/connections', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('List Broker Connections completed', {
        request_id: requestId,
        action: 'getBrokerConnections'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('List Broker Connections failed', error, {
        request_id: requestId,
        action: 'getBrokerConnections'
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
        // Extract error message from FinaticResponse Error field or fallback to statusText/message
        const errorResponseData = axiosError.response?.data;
        if (errorResponseData && typeof errorResponseData === 'object' && 'error' in errorResponseData) {
          errorMessage = errorResponseData.error?.message || errorMessage;
          errorCode = errorResponseData.error?.code || errorCode;
          errorStatus = errorResponseData.error?.status || errorStatus;
        } else {
          errorMessage = axiosError.response?.statusText || 
                         axiosError.message || 
                         errorMessage;
        }
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
      const errorResponse: FinaticResponse<UserBrokerConnectionWithPermissions[]> = {
        success: {
          data: null as any,
        },
        error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2D: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2D: Add orphaned method detection
    // TODO Phase 2D: Add advanced convenience methods
  }

  /**
   * Disconnect Company From Broker
   * 
   * Remove a company's access to a broker connection.
   *
   * If the company is the only one with access, the entire connection is deleted.
   * If other companies have access, only the company's access is removed.
   * @param connectionId {string} 
   * @returns {Promise<FinaticResponse<DisconnectActionResult>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: DELETE /api/v1/brokers/disconnect-company/{connection_id}
   * @methodId disconnect_company_from_broker_api_v1_brokers_disconnect_company__connection_id__delete
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.disconnectCompanyFromBroker(connectionId: '00000000-0000-0000-0000-000000000000');
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   */
  async disconnectCompanyFromBroker(connectionId: string): Promise<FinaticResponse<DisconnectActionResult>> {
    // Construct params object from individual parameters
    const params: DisconnectCompanyFromBrokerParams = {
    connectionId: connectionId
  };    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

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
        return cached as FinaticResponse<DisconnectActionResult>;
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
      
      // Unwrap axios response immediately - get FinaticResponse object
      const responseData = unwrapAxiosResponse(response);
      if (!(responseData && typeof responseData === 'object' && 'success' in responseData)) {
        throw new Error('Unexpected response shape: missing success field');
      }
      
      // Convert response to plain object, removing _id fields recursively
      const standardResponse: FinaticResponse<DisconnectActionResult> = convertToPlainObject(responseData) as FinaticResponse<DisconnectActionResult>;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('DELETE', '/api/v1/brokers/disconnect-company/{connection_id}', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Disconnect Company From Broker completed', {
        request_id: requestId,
        action: 'disconnectCompanyFromBroker'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
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
        // Extract error message from FinaticResponse Error field or fallback to statusText/message
        const errorResponseData = axiosError.response?.data;
        if (errorResponseData && typeof errorResponseData === 'object' && 'error' in errorResponseData) {
          errorMessage = errorResponseData.error?.message || errorMessage;
          errorCode = errorResponseData.error?.code || errorCode;
          errorStatus = errorResponseData.error?.status || errorStatus;
        } else {
          errorMessage = axiosError.response?.statusText || 
                         axiosError.message || 
                         errorMessage;
        }
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
      const errorResponse: FinaticResponse<DisconnectActionResult> = {
        success: {
          data: null as any,
        },
        error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2D: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2D: Add orphaned method detection
    // TODO Phase 2D: Add advanced convenience methods
  }

  /**
   * Get Orders
   * 
   * Get orders for all authorized broker connections.
   *
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns orders from connections the company has read access to.
   * @param brokerId {string} (optional) 
   * @param connectionId {string} (optional) 
   * @param accountId {string} (optional) 
   * @param symbol {string} (optional) 
   * @param orderStatus {BrokerDataOrderStatusEnum} (optional) 
   * @param side {BrokerDataOrderSideEnum} (optional) 
   * @param assetType {BrokerDataAssetTypeEnum} (optional) 
   * @param limit {number} (optional) 
   * @param offset {number} (optional) 
   * @param createdAfter {string} (optional) 
   * @param createdBefore {string} (optional) 
   * @param includeMetadata {boolean} (optional) 
   * @returns {Promise<FinaticResponse<FDXBrokerOrder[]>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/orders
   * @methodId get_orders_api_v1_brokers_data_orders_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getOrders();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getOrders(brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountId: '123456789');
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   */
  async getOrders(brokerId?: string, connectionId?: string, accountId?: string, symbol?: string, orderStatus?: BrokerDataOrderStatusEnum, side?: BrokerDataOrderSideEnum, assetType?: BrokerDataAssetTypeEnum, limit?: number, offset?: number, createdAfter?: string, createdBefore?: string, includeMetadata?: boolean): Promise<FinaticResponse<FDXBrokerOrder[]>> {
    // Construct params object from individual parameters
    const params: GetOrdersParams = {
    brokerId: brokerId,
    connectionId: connectionId,
    accountId: accountId,
    symbol: symbol,
    orderStatus: orderStatus !== undefined ? coerceEnumValue(orderStatus, BrokerDataOrderStatusEnum, 'orderStatus') : undefined,
    side: side !== undefined ? coerceEnumValue(side, BrokerDataOrderSideEnum, 'side') : undefined,
    assetType: assetType !== undefined ? coerceEnumValue(assetType, BrokerDataAssetTypeEnum, 'assetType') : undefined,
    limit: limit,
    offset: offset,
    createdAfter: createdAfter,
    createdBefore: createdBefore,
    includeMetadata: includeMetadata
  };    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

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
        return cached as FinaticResponse<FDXBrokerOrder[]>;
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
          const apiResponse = await this.api.getOrdersApiV1BrokersDataOrdersGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountId !== undefined ? { accountId: accountId } : {}), ...(symbol !== undefined ? { symbol: symbol } : {}), ...(orderStatus !== undefined ? { orderStatus: orderStatus } : {}), ...(side !== undefined ? { side: side } : {}), ...(assetType !== undefined ? { assetType: assetType } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(createdAfter !== undefined ? { createdAfter: createdAfter } : {}), ...(createdBefore !== undefined ? { createdBefore: createdBefore } : {}), ...(includeMetadata !== undefined ? { includeMetadata: includeMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap axios response immediately - get FinaticResponse object
      const responseData = unwrapAxiosResponse(response);
      if (!(responseData && typeof responseData === 'object' && 'success' in responseData)) {
        throw new Error('Unexpected response shape: missing success field');
      }
      
      // Convert response to plain object, removing _id fields recursively
      const standardResponse: FinaticResponse<FDXBrokerOrder[]> = convertToPlainObject(responseData) as FinaticResponse<FDXBrokerOrder[]>;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Orders completed', {
        request_id: requestId,
        action: 'getOrders'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
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
        // Extract error message from FinaticResponse Error field or fallback to statusText/message
        const errorResponseData = axiosError.response?.data;
        if (errorResponseData && typeof errorResponseData === 'object' && 'error' in errorResponseData) {
          errorMessage = errorResponseData.error?.message || errorMessage;
          errorCode = errorResponseData.error?.code || errorCode;
          errorStatus = errorResponseData.error?.status || errorStatus;
        } else {
          errorMessage = axiosError.response?.statusText || 
                         axiosError.message || 
                         errorMessage;
        }
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
      const errorResponse: FinaticResponse<FDXBrokerOrder[]> = {
        success: {
          data: null as any,
        },
        error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2D: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2D: Add orphaned method detection
    // TODO Phase 2D: Add advanced convenience methods
  }

  /**
   * Get Positions
   * 
   * Get positions for all authorized broker connections.
   *
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns positions from connections the company has read access to.
   * @param brokerId {string} (optional) 
   * @param connectionId {string} (optional) 
   * @param accountId {string} (optional) 
   * @param symbol {string} (optional) 
   * @param side {BrokerDataOrderSideEnum} (optional) 
   * @param assetType {BrokerDataAssetTypeEnum} (optional) 
   * @param positionStatus {BrokerDataPositionStatusEnum} (optional) 
   * @param limit {number} (optional) 
   * @param offset {number} (optional) 
   * @param updatedAfter {string} (optional) 
   * @param updatedBefore {string} (optional) 
   * @param includeMetadata {boolean} (optional) 
   * @returns {Promise<FinaticResponse<FDXBrokerPosition[]>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/positions
   * @methodId get_positions_api_v1_brokers_data_positions_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getPositions();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getPositions(brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountId: '123456789');
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   */
  async getPositions(brokerId?: string, connectionId?: string, accountId?: string, symbol?: string, side?: BrokerDataOrderSideEnum, assetType?: BrokerDataAssetTypeEnum, positionStatus?: BrokerDataPositionStatusEnum, limit?: number, offset?: number, updatedAfter?: string, updatedBefore?: string, includeMetadata?: boolean): Promise<FinaticResponse<FDXBrokerPosition[]>> {
    // Construct params object from individual parameters
    const params: GetPositionsParams = {
    brokerId: brokerId,
    connectionId: connectionId,
    accountId: accountId,
    symbol: symbol,
    side: side !== undefined ? coerceEnumValue(side, BrokerDataOrderSideEnum, 'side') : undefined,
    assetType: assetType !== undefined ? coerceEnumValue(assetType, BrokerDataAssetTypeEnum, 'assetType') : undefined,
    positionStatus: positionStatus !== undefined ? coerceEnumValue(positionStatus, BrokerDataPositionStatusEnum, 'positionStatus') : undefined,
    limit: limit,
    offset: offset,
    updatedAfter: updatedAfter,
    updatedBefore: updatedBefore,
    includeMetadata: includeMetadata
  };    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

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
        return cached as FinaticResponse<FDXBrokerPosition[]>;
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
          const apiResponse = await this.api.getPositionsApiV1BrokersDataPositionsGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountId !== undefined ? { accountId: accountId } : {}), ...(symbol !== undefined ? { symbol: symbol } : {}), ...(side !== undefined ? { side: side } : {}), ...(assetType !== undefined ? { assetType: assetType } : {}), ...(positionStatus !== undefined ? { positionStatus: positionStatus } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(updatedAfter !== undefined ? { updatedAfter: updatedAfter } : {}), ...(updatedBefore !== undefined ? { updatedBefore: updatedBefore } : {}), ...(includeMetadata !== undefined ? { includeMetadata: includeMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap axios response immediately - get FinaticResponse object
      const responseData = unwrapAxiosResponse(response);
      if (!(responseData && typeof responseData === 'object' && 'success' in responseData)) {
        throw new Error('Unexpected response shape: missing success field');
      }
      
      // Convert response to plain object, removing _id fields recursively
      const standardResponse: FinaticResponse<FDXBrokerPosition[]> = convertToPlainObject(responseData) as FinaticResponse<FDXBrokerPosition[]>;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Positions completed', {
        request_id: requestId,
        action: 'getPositions'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
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
        // Extract error message from FinaticResponse Error field or fallback to statusText/message
        const errorResponseData = axiosError.response?.data;
        if (errorResponseData && typeof errorResponseData === 'object' && 'error' in errorResponseData) {
          errorMessage = errorResponseData.error?.message || errorMessage;
          errorCode = errorResponseData.error?.code || errorCode;
          errorStatus = errorResponseData.error?.status || errorStatus;
        } else {
          errorMessage = axiosError.response?.statusText || 
                         axiosError.message || 
                         errorMessage;
        }
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
      const errorResponse: FinaticResponse<FDXBrokerPosition[]> = {
        success: {
          data: null as any,
        },
        error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2D: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2D: Add orphaned method detection
    // TODO Phase 2D: Add advanced convenience methods
  }

  /**
   * Get Balances
   * 
   * Get balances for all authorized broker connections.
   *
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns balances from connections the company has read access to.
   * @param brokerId {string} (optional) 
   * @param connectionId {string} (optional) 
   * @param accountId {string} (optional) 
   * @param isEndOfDaySnapshot {boolean} (optional) 
   * @param limit {number} (optional) 
   * @param offset {number} (optional) 
   * @param balanceCreatedAfter {string} (optional) 
   * @param balanceCreatedBefore {string} (optional) 
   * @param includeMetadata {boolean} (optional) 
   * @returns {Promise<FinaticResponse<FDXBrokerBalance[]>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/balances
   * @methodId get_balances_api_v1_brokers_data_balances_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getBalances();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getBalances(brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountId: '123456789');
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   */
  async getBalances(brokerId?: string, connectionId?: string, accountId?: string, isEndOfDaySnapshot?: boolean, limit?: number, offset?: number, balanceCreatedAfter?: string, balanceCreatedBefore?: string, includeMetadata?: boolean): Promise<FinaticResponse<FDXBrokerBalance[]>> {
    // Construct params object from individual parameters
    const params: GetBalancesParams = {
    brokerId: brokerId,
    connectionId: connectionId,
    accountId: accountId,
    isEndOfDaySnapshot: isEndOfDaySnapshot,
    limit: limit,
    offset: offset,
    balanceCreatedAfter: balanceCreatedAfter,
    balanceCreatedBefore: balanceCreatedBefore,
    includeMetadata: includeMetadata
  };    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

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
        return cached as FinaticResponse<FDXBrokerBalance[]>;
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
          const apiResponse = await this.api.getBalancesApiV1BrokersDataBalancesGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountId !== undefined ? { accountId: accountId } : {}), ...(isEndOfDaySnapshot !== undefined ? { isEndOfDaySnapshot: isEndOfDaySnapshot } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(balanceCreatedAfter !== undefined ? { balanceCreatedAfter: balanceCreatedAfter } : {}), ...(balanceCreatedBefore !== undefined ? { balanceCreatedBefore: balanceCreatedBefore } : {}), ...(includeMetadata !== undefined ? { includeMetadata: includeMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap axios response immediately - get FinaticResponse object
      const responseData = unwrapAxiosResponse(response);
      if (!(responseData && typeof responseData === 'object' && 'success' in responseData)) {
        throw new Error('Unexpected response shape: missing success field');
      }
      
      // Convert response to plain object, removing _id fields recursively
      const standardResponse: FinaticResponse<FDXBrokerBalance[]> = convertToPlainObject(responseData) as FinaticResponse<FDXBrokerBalance[]>;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/balances', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Balances completed', {
        request_id: requestId,
        action: 'getBalances'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
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
        // Extract error message from FinaticResponse Error field or fallback to statusText/message
        const errorResponseData = axiosError.response?.data;
        if (errorResponseData && typeof errorResponseData === 'object' && 'error' in errorResponseData) {
          errorMessage = errorResponseData.error?.message || errorMessage;
          errorCode = errorResponseData.error?.code || errorCode;
          errorStatus = errorResponseData.error?.status || errorStatus;
        } else {
          errorMessage = axiosError.response?.statusText || 
                         axiosError.message || 
                         errorMessage;
        }
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
      const errorResponse: FinaticResponse<FDXBrokerBalance[]> = {
        success: {
          data: null as any,
        },
        error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2D: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2D: Add orphaned method detection
    // TODO Phase 2D: Add advanced convenience methods
  }

  /**
   * Get Accounts
   * 
   * Get accounts for all authorized broker connections.
   *
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns accounts from connections the company has read access to.
   * @param brokerId {string} (optional) 
   * @param connectionId {string} (optional) 
   * @param accountType {BrokerDataAccountTypeEnum} (optional) 
   * @param status {AccountStatus} (optional) 
   * @param currency {string} (optional) 
   * @param limit {number} (optional) 
   * @param offset {number} (optional) 
   * @param includeMetadata {boolean} (optional) 
   * @returns {Promise<FinaticResponse<FDXBrokerAccount[]>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/accounts
   * @methodId get_accounts_api_v1_brokers_data_accounts_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getAccounts();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getAccounts(brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountType: 'margin');
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   */
  async getAccounts(brokerId?: string, connectionId?: string, accountType?: BrokerDataAccountTypeEnum, status?: AccountStatus, currency?: string, limit?: number, offset?: number, includeMetadata?: boolean): Promise<FinaticResponse<FDXBrokerAccount[]>> {
    // Construct params object from individual parameters
    const params: GetAccountsParams = {
    brokerId: brokerId,
    connectionId: connectionId,
    accountType: accountType !== undefined ? coerceEnumValue(accountType, BrokerDataAccountTypeEnum, 'accountType') : undefined,
    status: status,
    currency: currency,
    limit: limit,
    offset: offset,
    includeMetadata: includeMetadata
  };    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

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
        return cached as FinaticResponse<FDXBrokerAccount[]>;
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
          const apiResponse = await this.api.getAccountsApiV1BrokersDataAccountsGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountType !== undefined ? { accountType: accountType } : {}), ...(status !== undefined ? { status: status } : {}), ...(currency !== undefined ? { currency: currency } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(includeMetadata !== undefined ? { includeMetadata: includeMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap axios response immediately - get FinaticResponse object
      const responseData = unwrapAxiosResponse(response);
      if (!(responseData && typeof responseData === 'object' && 'success' in responseData)) {
        throw new Error('Unexpected response shape: missing success field');
      }
      
      // Convert response to plain object, removing _id fields recursively
      const standardResponse: FinaticResponse<FDXBrokerAccount[]> = convertToPlainObject(responseData) as FinaticResponse<FDXBrokerAccount[]>;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/accounts', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Accounts completed', {
        request_id: requestId,
        action: 'getAccounts'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
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
        // Extract error message from FinaticResponse Error field or fallback to statusText/message
        const errorResponseData = axiosError.response?.data;
        if (errorResponseData && typeof errorResponseData === 'object' && 'error' in errorResponseData) {
          errorMessage = errorResponseData.error?.message || errorMessage;
          errorCode = errorResponseData.error?.code || errorCode;
          errorStatus = errorResponseData.error?.status || errorStatus;
        } else {
          errorMessage = axiosError.response?.statusText || 
                         axiosError.message || 
                         errorMessage;
        }
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
      const errorResponse: FinaticResponse<FDXBrokerAccount[]> = {
        success: {
          data: null as any,
        },
        error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2D: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2D: Add orphaned method detection
    // TODO Phase 2D: Add advanced convenience methods
  }

  /**
   * Get Order Fills
   * 
   * Get order fills for a specific order.
   *
   * This endpoint returns all execution fills for the specified order.
   * @param orderId {string} 
   * @param connectionId {string} (optional) 
   * @param limit {number} (optional) 
   * @param offset {number} (optional) 
   * @param includeMetadata {boolean} (optional) 
   * @returns {Promise<FinaticResponse<FDXBrokerOrderFill[]>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/orders/{order_id}/fills
   * @methodId get_order_fills_api_v1_brokers_data_orders__order_id__fills_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.getOrderFills(orderId: '00000000-0000-0000-0000-000000000000');
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getOrderFills(orderId: '00000000-0000-0000-0000-000000000000', connectionId: '00000000-0000-0000-0000-000000000000', limit: 100, offset: 0);
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   */
  async getOrderFills(orderId: string, connectionId?: string, limit?: number, offset?: number, includeMetadata?: boolean): Promise<FinaticResponse<FDXBrokerOrderFill[]>> {
    // Construct params object from individual parameters
    const params: GetOrderFillsParams = {
    orderId: orderId,
    connectionId: connectionId,
    limit: limit,
    offset: offset,
    includeMetadata: includeMetadata
  };    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

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
        return cached as FinaticResponse<FDXBrokerOrderFill[]>;
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
          const apiResponse = await this.api.getOrderFillsApiV1BrokersDataOrdersOrderIdFillsGet({ orderId: orderId, ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(includeMetadata !== undefined ? { includeMetadata: includeMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap axios response immediately - get FinaticResponse object
      const responseData = unwrapAxiosResponse(response);
      if (!(responseData && typeof responseData === 'object' && 'success' in responseData)) {
        throw new Error('Unexpected response shape: missing success field');
      }
      
      // Convert response to plain object, removing _id fields recursively
      const standardResponse: FinaticResponse<FDXBrokerOrderFill[]> = convertToPlainObject(responseData) as FinaticResponse<FDXBrokerOrderFill[]>;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/{order_id}/fills', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Order Fills completed', {
        request_id: requestId,
        action: 'getOrderFills'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
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
        // Extract error message from FinaticResponse Error field or fallback to statusText/message
        const errorResponseData = axiosError.response?.data;
        if (errorResponseData && typeof errorResponseData === 'object' && 'error' in errorResponseData) {
          errorMessage = errorResponseData.error?.message || errorMessage;
          errorCode = errorResponseData.error?.code || errorCode;
          errorStatus = errorResponseData.error?.status || errorStatus;
        } else {
          errorMessage = axiosError.response?.statusText || 
                         axiosError.message || 
                         errorMessage;
        }
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
      const errorResponse: FinaticResponse<FDXBrokerOrderFill[]> = {
        success: {
          data: null as any,
        },
        error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2D: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2D: Add orphaned method detection
    // TODO Phase 2D: Add advanced convenience methods
  }

  /**
   * Get Order Events
   * 
   * Get order events for a specific order.
   *
   * This endpoint returns all lifecycle events for the specified order.
   * @param orderId {string} 
   * @param connectionId {string} (optional) 
   * @param limit {number} (optional) 
   * @param offset {number} (optional) 
   * @param includeMetadata {boolean} (optional) 
   * @returns {Promise<FinaticResponse<FDXBrokerOrderEvent[]>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/orders/{order_id}/events
   * @methodId get_order_events_api_v1_brokers_data_orders__order_id__events_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.getOrderEvents(orderId: '00000000-0000-0000-0000-000000000000');
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getOrderEvents(orderId: '00000000-0000-0000-0000-000000000000', connectionId: '00000000-0000-0000-0000-000000000000', limit: 100, offset: 0);
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   */
  async getOrderEvents(orderId: string, connectionId?: string, limit?: number, offset?: number, includeMetadata?: boolean): Promise<FinaticResponse<FDXBrokerOrderEvent[]>> {
    // Construct params object from individual parameters
    const params: GetOrderEventsParams = {
    orderId: orderId,
    connectionId: connectionId,
    limit: limit,
    offset: offset,
    includeMetadata: includeMetadata
  };    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

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
        return cached as FinaticResponse<FDXBrokerOrderEvent[]>;
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
          const apiResponse = await this.api.getOrderEventsApiV1BrokersDataOrdersOrderIdEventsGet({ orderId: orderId, ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(includeMetadata !== undefined ? { includeMetadata: includeMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap axios response immediately - get FinaticResponse object
      const responseData = unwrapAxiosResponse(response);
      if (!(responseData && typeof responseData === 'object' && 'success' in responseData)) {
        throw new Error('Unexpected response shape: missing success field');
      }
      
      // Convert response to plain object, removing _id fields recursively
      const standardResponse: FinaticResponse<FDXBrokerOrderEvent[]> = convertToPlainObject(responseData) as FinaticResponse<FDXBrokerOrderEvent[]>;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/{order_id}/events', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Order Events completed', {
        request_id: requestId,
        action: 'getOrderEvents'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
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
        // Extract error message from FinaticResponse Error field or fallback to statusText/message
        const errorResponseData = axiosError.response?.data;
        if (errorResponseData && typeof errorResponseData === 'object' && 'error' in errorResponseData) {
          errorMessage = errorResponseData.error?.message || errorMessage;
          errorCode = errorResponseData.error?.code || errorCode;
          errorStatus = errorResponseData.error?.status || errorStatus;
        } else {
          errorMessage = axiosError.response?.statusText || 
                         axiosError.message || 
                         errorMessage;
        }
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
      const errorResponse: FinaticResponse<FDXBrokerOrderEvent[]> = {
        success: {
          data: null as any,
        },
        error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2D: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2D: Add orphaned method detection
    // TODO Phase 2D: Add advanced convenience methods
  }

  /**
   * Get Order Groups
   * 
   * Get order groups.
   *
   * This endpoint returns order groups that contain multiple orders.
   * @param brokerId {string} (optional) 
   * @param connectionId {string} (optional) 
   * @param limit {number} (optional) 
   * @param offset {number} (optional) 
   * @param createdAfter {string} (optional) 
   * @param createdBefore {string} (optional) 
   * @param includeMetadata {boolean} (optional) 
   * @returns {Promise<FinaticResponse<FDXBrokerOrderGroup[]>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/orders/groups
   * @methodId get_order_groups_api_v1_brokers_data_orders_groups_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getOrderGroups();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getOrderGroups(brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', limit: 100);
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   */
  async getOrderGroups(brokerId?: string, connectionId?: string, limit?: number, offset?: number, createdAfter?: string, createdBefore?: string, includeMetadata?: boolean): Promise<FinaticResponse<FDXBrokerOrderGroup[]>> {
    // Construct params object from individual parameters
    const params: GetOrderGroupsParams = {
    brokerId: brokerId,
    connectionId: connectionId,
    limit: limit,
    offset: offset,
    createdAfter: createdAfter,
    createdBefore: createdBefore,
    includeMetadata: includeMetadata
  };    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

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
        return cached as FinaticResponse<FDXBrokerOrderGroup[]>;
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
          const apiResponse = await this.api.getOrderGroupsApiV1BrokersDataOrdersGroupsGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(createdAfter !== undefined ? { createdAfter: createdAfter } : {}), ...(createdBefore !== undefined ? { createdBefore: createdBefore } : {}), ...(includeMetadata !== undefined ? { includeMetadata: includeMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          return await applyResponseInterceptors(apiResponse, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap axios response immediately - get FinaticResponse object
      const responseData = unwrapAxiosResponse(response);
      if (!(responseData && typeof responseData === 'object' && 'success' in responseData)) {
        throw new Error('Unexpected response shape: missing success field');
      }
      
      // Convert response to plain object, removing _id fields recursively
      const standardResponse: FinaticResponse<FDXBrokerOrderGroup[]> = convertToPlainObject(responseData) as FinaticResponse<FDXBrokerOrderGroup[]>;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/groups', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Order Groups completed', {
        request_id: requestId,
        action: 'getOrderGroups'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
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
        // Extract error message from FinaticResponse Error field or fallback to statusText/message
        const errorResponseData = axiosError.response?.data;
        if (errorResponseData && typeof errorResponseData === 'object' && 'error' in errorResponseData) {
          errorMessage = errorResponseData.error?.message || errorMessage;
          errorCode = errorResponseData.error?.code || errorCode;
          errorStatus = errorResponseData.error?.status || errorStatus;
        } else {
          errorMessage = axiosError.response?.statusText || 
                         axiosError.message || 
                         errorMessage;
        }
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
      const errorResponse: FinaticResponse<FDXBrokerOrderGroup[]> = {
        success: {
          data: null as any,
        },
        error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2D: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2D: Add orphaned method detection
    // TODO Phase 2D: Add advanced convenience methods
  }

  /**
   * Get Position Lots
   * 
   * Get position lots (tax lots for positions).
   *
   * This endpoint returns tax lots for positions, which are used for tax reporting.
   * Each lot tracks when a position was opened/closed and at what prices.
   * @param brokerId {string} (optional) 
   * @param connectionId {string} (optional) 
   * @param accountId {string} (optional) 
   * @param symbol {string} (optional) 
   * @param positionId {string} (optional) 
   * @param limit {number} (optional) 
   * @param offset {number} (optional) 
   * @returns {Promise<FinaticResponse<FDXBrokerPositionLot[]>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/positions/lots
   * @methodId get_position_lots_api_v1_brokers_data_positions_lots_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getPositionLots();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getPositionLots(brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountId: '123456789');
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   */
  async getPositionLots(brokerId?: string, connectionId?: string, accountId?: string, symbol?: string, positionId?: string, limit?: number, offset?: number): Promise<FinaticResponse<FDXBrokerPositionLot[]>> {
    // Construct params object from individual parameters
    const params: GetPositionLotsParams = {
    brokerId: brokerId,
    connectionId: connectionId,
    accountId: accountId,
    symbol: symbol,
    positionId: positionId,
    limit: limit,
    offset: offset
  };    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

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
        return cached as FinaticResponse<FDXBrokerPositionLot[]>;
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
      
      // Unwrap axios response immediately - get FinaticResponse object
      const responseData = unwrapAxiosResponse(response);
      if (!(responseData && typeof responseData === 'object' && 'success' in responseData)) {
        throw new Error('Unexpected response shape: missing success field');
      }
      
      // Convert response to plain object, removing _id fields recursively
      const standardResponse: FinaticResponse<FDXBrokerPositionLot[]> = convertToPlainObject(responseData) as FinaticResponse<FDXBrokerPositionLot[]>;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions/lots', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Position Lots completed', {
        request_id: requestId,
        action: 'getPositionLots'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
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
        // Extract error message from FinaticResponse Error field or fallback to statusText/message
        const errorResponseData = axiosError.response?.data;
        if (errorResponseData && typeof errorResponseData === 'object' && 'error' in errorResponseData) {
          errorMessage = errorResponseData.error?.message || errorMessage;
          errorCode = errorResponseData.error?.code || errorCode;
          errorStatus = errorResponseData.error?.status || errorStatus;
        } else {
          errorMessage = axiosError.response?.statusText || 
                         axiosError.message || 
                         errorMessage;
        }
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
      const errorResponse: FinaticResponse<FDXBrokerPositionLot[]> = {
        success: {
          data: null as any,
        },
        error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2D: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2D: Add orphaned method detection
    // TODO Phase 2D: Add advanced convenience methods
  }

  /**
   * Get Position Lot Fills
   * 
   * Get position lot fills for a specific lot.
   *
   * This endpoint returns all fills associated with a specific position lot.
   * @param lotId {string} 
   * @param connectionId {string} (optional) 
   * @param limit {number} (optional) 
   * @param offset {number} (optional) 
   * @returns {Promise<FinaticResponse<FDXBrokerPositionLotFill[]>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/positions/lots/{lot_id}/fills
   * @methodId get_position_lot_fills_api_v1_brokers_data_positions_lots__lot_id__fills_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.getPositionLotFills(lotId: '00000000-0000-0000-0000-000000000000');
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getPositionLotFills(lotId: '00000000-0000-0000-0000-000000000000', connectionId: '00000000-0000-0000-0000-000000000000', limit: 100, offset: 0);
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   */
  async getPositionLotFills(lotId: string, connectionId?: string, limit?: number, offset?: number): Promise<FinaticResponse<FDXBrokerPositionLotFill[]>> {
    // Construct params object from individual parameters
    const params: GetPositionLotFillsParams = {
    lotId: lotId,
    connectionId: connectionId,
    limit: limit,
    offset: offset
  };    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

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
        return cached as FinaticResponse<FDXBrokerPositionLotFill[]>;
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
      
      // Unwrap axios response immediately - get FinaticResponse object
      const responseData = unwrapAxiosResponse(response);
      if (!(responseData && typeof responseData === 'object' && 'success' in responseData)) {
        throw new Error('Unexpected response shape: missing success field');
      }
      
      // Convert response to plain object, removing _id fields recursively
      const standardResponse: FinaticResponse<FDXBrokerPositionLotFill[]> = convertToPlainObject(responseData) as FinaticResponse<FDXBrokerPositionLotFill[]>;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions/lots/{lot_id}/fills', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Position Lot Fills completed', {
        request_id: requestId,
        action: 'getPositionLotFills'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
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
        // Extract error message from FinaticResponse Error field or fallback to statusText/message
        const errorResponseData = axiosError.response?.data;
        if (errorResponseData && typeof errorResponseData === 'object' && 'error' in errorResponseData) {
          errorMessage = errorResponseData.error?.message || errorMessage;
          errorCode = errorResponseData.error?.code || errorCode;
          errorStatus = errorResponseData.error?.status || errorStatus;
        } else {
          errorMessage = axiosError.response?.statusText || 
                         axiosError.message || 
                         errorMessage;
        }
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
      const errorResponse: FinaticResponse<FDXBrokerPositionLotFill[]> = {
        success: {
          data: null as any,
        },
        error: {
          message: errorMessage,
          code: errorCode,
          status: errorStatus,
          details: errorDetails,
        },
      };
      
      return errorResponse;
    }

    // TODO Phase 2D: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2D: Add orphaned method detection
    // TODO Phase 2D: Add advanced convenience methods
  }

}
