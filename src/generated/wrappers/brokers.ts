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

// Always import PaginatedData since method bodies may reference it (even if unreachable)
import { PaginatedData } from '../utils/pagination';

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
  /** Connection ID */
  connectionId: string;
}

export interface GetOrdersParams {
  /** Filter by broker ID */
  brokerId?: string;
  /** Filter by connection ID */
  connectionId?: string;
  /** Filter by broker provided account ID or internal account UUID */
  accountId?: string;
  /** Filter by symbol */
  symbol?: string;
  /** Filter by order status (e.g., 'filled', 'pending_new', 'cancelled') */
  orderStatus?: string;
  /** Filter by order side (e.g., 'buy', 'sell') */
  side?: BrokerDataOrderSideEnum;
  /** Filter by asset type (e.g., 'stock', 'option', 'crypto', 'future') */
  assetType?: BrokerDataAssetTypeEnum;
  /** Maximum number of orders to return */
  limit?: number;
  /** Number of orders to skip for pagination */
  offset?: number;
  /** Filter orders created after this timestamp */
  createdAfter?: string;
  /** Filter orders created before this timestamp */
  createdBefore?: string;
  /** Include order metadata in response (excluded by default for FDX compliance) */
  includeMetadata?: boolean;
}

export interface GetPositionsParams {
  /** Filter by broker ID */
  brokerId?: string;
  /** Filter by connection ID */
  connectionId?: string;
  /** Filter by broker provided account ID or internal account UUID */
  accountId?: string;
  /** Filter by symbol */
  symbol?: string;
  /** Filter by position side (e.g., 'long', 'short') */
  side?: BrokerDataOrderSideEnum;
  /** Filter by asset type (e.g., 'stock', 'option', 'crypto', 'future') */
  assetType?: BrokerDataAssetTypeEnum;
  /** Filter by position status: 'open' (quantity > 0) or 'closed' (quantity = 0) */
  positionStatus?: BrokerDataPositionStatusEnum;
  /** Maximum number of positions to return */
  limit?: number;
  /** Number of positions to skip for pagination */
  offset?: number;
  /** Filter positions updated after this timestamp */
  updatedAfter?: string;
  /** Filter positions updated before this timestamp */
  updatedBefore?: string;
  /** Include position metadata in response (excluded by default for FDX compliance) */
  includeMetadata?: boolean;
}

export interface GetBalancesParams {
  /** Filter by broker ID */
  brokerId?: string;
  /** Filter by connection ID */
  connectionId?: string;
  /** Filter by broker provided account ID or internal account UUID */
  accountId?: string;
  /** Filter by end-of-day snapshot status (true/false) */
  isEndOfDaySnapshot?: boolean;
  /** Maximum number of balances to return */
  limit?: number;
  /** Number of balances to skip for pagination */
  offset?: number;
  /** Filter balances created after this timestamp */
  balanceCreatedAfter?: string;
  /** Filter balances created before this timestamp */
  balanceCreatedBefore?: string;
  /** Include balance metadata in response (excluded by default for FDX compliance) */
  includeMetadata?: boolean;
}

export interface GetAccountsParams {
  /** Filter by broker ID */
  brokerId?: string;
  /** Filter by connection ID */
  connectionId?: string;
  /** Filter by account type (e.g., 'margin', 'cash', 'crypto_wallet', 'live', 'sim') */
  accountType?: BrokerDataAccountTypeEnum;
  /** Filter by account status (e.g., 'active', 'inactive') */
  status?: AccountStatus;
  /** Filter by currency (e.g., 'USD', 'EUR') */
  currency?: string;
  /** Maximum number of accounts to return */
  limit?: number;
  /** Number of accounts to skip for pagination */
  offset?: number;
  /** Include connection metadata in response (excluded by default for FDX compliance) */
  includeMetadata?: boolean;
}

export interface GetOrderFillsParams {
  /** Order ID */
  orderId: string;
  /** Filter by connection ID */
  connectionId?: string;
  /** Maximum number of fills to return */
  limit?: number;
  /** Number of fills to skip for pagination */
  offset?: number;
  /** Include fill metadata in response (excluded by default for FDX compliance) */
  includeMetadata?: boolean;
}

export interface GetOrderEventsParams {
  /** Order ID */
  orderId: string;
  /** Filter by connection ID */
  connectionId?: string;
  /** Maximum number of events to return */
  limit?: number;
  /** Number of events to skip for pagination */
  offset?: number;
  /** Include event metadata in response (excluded by default for FDX compliance) */
  includeMetadata?: boolean;
}

export interface GetOrderGroupsParams {
  /** Filter by broker ID */
  brokerId?: string;
  /** Filter by connection ID */
  connectionId?: string;
  /** Maximum number of order groups to return */
  limit?: number;
  /** Number of order groups to skip for pagination */
  offset?: number;
  /** Filter order groups created after this timestamp */
  createdAfter?: string;
  /** Filter order groups created before this timestamp */
  createdBefore?: string;
  /** Include group metadata in response (excluded by default for FDX compliance) */
  includeMetadata?: boolean;
}

export interface GetPositionLotsParams {
  /** Filter by broker ID */
  brokerId?: string;
  /** Filter by connection ID */
  connectionId?: string;
  /** Filter by broker provided account ID */
  accountId?: string;
  /** Filter by symbol */
  symbol?: string;
  /** Filter by position ID */
  positionId?: string;
  /** Maximum number of position lots to return */
  limit?: number;
  /** Number of position lots to skip for pagination */
  offset?: number;
}

export interface GetPositionLotFillsParams {
  /** Position lot ID */
  lotId: string;
  /** Filter by connection ID */
  connectionId?: string;
  /** Maximum number of fills to return */
  limit?: number;
  /** Number of fills to skip for pagination */
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
   * @param params No parameters required for this method
   * @returns {Promise<FinaticResponse<BrokerInfo[]>>} Standard response with success/Error/Warning structure
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
  async getBrokers(params?: {}): Promise<FinaticResponse<BrokerInfo[]>> {
    // No parameters - use empty params object
    const resolvedParams: GetBrokersParams = params || {};    // Generate request ID
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
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/', resolvedParams, this.sdkConfig);
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
      params: resolvedParams,
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
      // Use 'any' for initial type to allow PaginatedData assignment, then assert final type
      const standardResponse: any = convertToPlainObject(responseData);
      
        // Phase 2: Wrap paginated responses with PaginatedData
      const hasLimit = false;
      const hasOffset = false;
      const hasPagination = hasLimit && hasOffset;
      if (hasPagination && standardResponse.success?.data && Array.isArray(standardResponse.success.data) && standardResponse.success.meta) {
        // PaginatedData is already imported at top of file
        const paginationMeta = (standardResponse.success.meta as any)?.pagination;
        if (paginationMeta) {
        const paginatedData = new PaginatedData(
          standardResponse.success.data,
          {
            has_more: paginationMeta.has_more,
            next_offset: paginationMeta.next_offset,
            current_offset: paginationMeta.current_offset,
            limit: paginationMeta.limit,
          },
          this.getBrokers.bind(this),
          resolvedParams,
          this
        );
        standardResponse.success.data = paginatedData;
        }
      }
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/', resolvedParams, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Brokers completed', {
        request_id: requestId,
        action: 'getBrokers'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
      // Type assertion to final return type (handles both paginated and non-paginated responses)
      return standardResponse as FinaticResponse<BrokerInfo[]>;
      
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
   * @param params No parameters required for this method
   * @returns {Promise<FinaticResponse<UserBrokerConnectionWithPermissions[]>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/connections
   * @methodId list_broker_connections_api_v1_brokers_connections_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getBrokerConnections({});
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   */
  async getBrokerConnections(params?: {}): Promise<FinaticResponse<UserBrokerConnectionWithPermissions[]>> {
    // No parameters - use empty params object
    const resolvedParams: GetBrokerConnectionsParams = params || {};    // Authentication check
    if (!this.sessionId || !this.companyId) {
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
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/connections', resolvedParams, this.sdkConfig);
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
      params: resolvedParams,
      action: 'getBrokerConnections'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.listBrokerConnectionsApiV1BrokersConnectionsGet({ headers: { 'x-request-id': requestId, ...(this.sessionId && this.companyId ? { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, ...(this.csrfToken ? { 'x-csrf-token': this.csrfToken } : {}) } : {}) } });
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
      // Use 'any' for initial type to allow PaginatedData assignment, then assert final type
      const standardResponse: any = convertToPlainObject(responseData);
      
        // Phase 2: Wrap paginated responses with PaginatedData
      const hasLimit = false;
      const hasOffset = false;
      const hasPagination = hasLimit && hasOffset;
      if (hasPagination && standardResponse.success?.data && Array.isArray(standardResponse.success.data) && standardResponse.success.meta) {
        // PaginatedData is already imported at top of file
        const paginationMeta = (standardResponse.success.meta as any)?.pagination;
        if (paginationMeta) {
        const paginatedData = new PaginatedData(
          standardResponse.success.data,
          {
            has_more: paginationMeta.has_more,
            next_offset: paginationMeta.next_offset,
            current_offset: paginationMeta.current_offset,
            limit: paginationMeta.limit,
          },
          this.getBrokerConnections.bind(this),
          resolvedParams,
          this
        );
        standardResponse.success.data = paginatedData;
        }
      }
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/connections', resolvedParams, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('List Broker Connections completed', {
        request_id: requestId,
        action: 'getBrokerConnections'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
      // Type assertion to final return type (handles both paginated and non-paginated responses)
      return standardResponse as FinaticResponse<UserBrokerConnectionWithPermissions[]>;
      
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
   * @param params.connectionId {string} Connection ID
   * @returns {Promise<FinaticResponse<DisconnectActionResult>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: DELETE /api/v1/brokers/disconnect-company/{connection_id}
   * @methodId disconnect_company_from_broker_api_v1_brokers_disconnect_company__connection_id__delete
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.disconnectCompanyFromBroker({
    connectionId: '00000000-0000-0000-0000-000000000000'
   * });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   */
  async disconnectCompanyFromBroker(params: DisconnectCompanyFromBrokerParams): Promise<FinaticResponse<DisconnectActionResult>> {
    // Use params object (required parameters present)
    const resolvedParams: DisconnectCompanyFromBrokerParams = params;    // Authentication check
    if (!this.sessionId || !this.companyId) {
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
      const cacheKey = generateCacheKey('DELETE', '/api/v1/brokers/disconnect-company/{connection_id}', resolvedParams, this.sdkConfig);
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
      params: resolvedParams,
      action: 'disconnectCompanyFromBroker'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.disconnectCompanyFromBrokerApiV1BrokersDisconnectCompanyConnectionIdDelete({ connectionId: resolvedParams.connectionId ?? null }, { headers: { 'x-request-id': requestId, ...(this.sessionId && this.companyId ? { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, ...(this.csrfToken ? { 'x-csrf-token': this.csrfToken } : {}) } : {}) } });
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
      // Use 'any' for initial type to allow PaginatedData assignment, then assert final type
      const standardResponse: any = convertToPlainObject(responseData);
      
        // Phase 2: Wrap paginated responses with PaginatedData
      const hasLimit = false;
      const hasOffset = false;
      const hasPagination = hasLimit && hasOffset;
      if (hasPagination && standardResponse.success?.data && Array.isArray(standardResponse.success.data) && standardResponse.success.meta) {
        // PaginatedData is already imported at top of file
        const paginationMeta = (standardResponse.success.meta as any)?.pagination;
        if (paginationMeta) {
        const paginatedData = new PaginatedData(
          standardResponse.success.data,
          {
            has_more: paginationMeta.has_more,
            next_offset: paginationMeta.next_offset,
            current_offset: paginationMeta.current_offset,
            limit: paginationMeta.limit,
          },
          this.disconnectCompanyFromBroker.bind(this),
          resolvedParams,
          this
        );
        standardResponse.success.data = paginatedData;
        }
      }
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('DELETE', '/api/v1/brokers/disconnect-company/{connection_id}', resolvedParams, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Disconnect Company From Broker completed', {
        request_id: requestId,
        action: 'disconnectCompanyFromBroker'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
      // Type assertion to final return type (handles both paginated and non-paginated responses)
      return standardResponse as FinaticResponse<DisconnectActionResult>;
      
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
   * @param params.brokerId {string} (optional) Filter by broker ID
   * @param params.connectionId {string} (optional) Filter by connection ID
   * @param params.accountId {string} (optional) Filter by broker provided account ID or internal account UUID
   * @param params.symbol {string} (optional) Filter by symbol
   * @param params.orderStatus {string} (optional) Filter by order status (e.g., 'filled', 'pending_new', 'cancelled')
   * @param params.side {BrokerDataOrderSideEnum} (optional) Filter by order side (e.g., 'buy', 'sell')
   * @param params.assetType {BrokerDataAssetTypeEnum} (optional) Filter by asset type (e.g., 'stock', 'option', 'crypto', 'future')
   * @param params.limit {number} (optional) Maximum number of orders to return
   * @param params.offset {number} (optional) Number of orders to skip for pagination
   * @param params.createdAfter {string} (optional) Filter orders created after this timestamp
   * @param params.createdBefore {string} (optional) Filter orders created before this timestamp
   * @param params.includeMetadata {boolean} (optional) Include order metadata in response (excluded by default for FDX compliance)
   * @returns {Promise<FinaticResponse<PaginatedData<FDXBrokerOrder>>>} Standard response with success/Error/Warning structure
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
    brokerId: 'alpaca',
    connectionId: '00000000-0000-0000-0000-000000000000',
    accountId: '123456789'
   * });
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
  async getOrders(params?: GetOrdersParams): Promise<FinaticResponse<PaginatedData<FDXBrokerOrder>>> {
    // Use params object (with default empty object)
    const resolvedParams: GetOrdersParams = params || {};
    if (params?.side !== undefined) {
      const coerced = coerceEnumValue(params.side, BrokerDataOrderSideEnum, 'side');
      if (coerced !== undefined) {
        params.side = coerced;
      }
    }
    if (params?.assetType !== undefined) {
      const coerced = coerceEnumValue(params.assetType, BrokerDataAssetTypeEnum, 'assetType');
      if (coerced !== undefined) {
        params.assetType = coerced;
      }
    }    // Authentication check
    if (!this.sessionId || !this.companyId) {
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
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders', resolvedParams, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as FinaticResponse<PaginatedData<FDXBrokerOrder>>;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Orders', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/orders',
      params: resolvedParams,
      action: 'getOrders'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getOrdersApiV1BrokersDataOrdersGet({ ...(resolvedParams.brokerId !== undefined ? { brokerId: resolvedParams.brokerId } : {}), ...(resolvedParams.connectionId !== undefined ? { connectionId: resolvedParams.connectionId } : {}), ...(resolvedParams.accountId !== undefined ? { accountId: resolvedParams.accountId } : {}), ...(resolvedParams.symbol !== undefined ? { symbol: resolvedParams.symbol } : {}), ...(resolvedParams.orderStatus !== undefined ? { orderStatus: resolvedParams.orderStatus } : {}), ...(resolvedParams.side !== undefined ? { side: resolvedParams.side } : {}), ...(resolvedParams.assetType !== undefined ? { assetType: resolvedParams.assetType } : {}), ...(resolvedParams.limit !== undefined ? { limit: resolvedParams.limit } : {}), ...(resolvedParams.offset !== undefined ? { offset: resolvedParams.offset } : {}), ...(resolvedParams.createdAfter !== undefined ? { createdAfter: resolvedParams.createdAfter } : {}), ...(resolvedParams.createdBefore !== undefined ? { createdBefore: resolvedParams.createdBefore } : {}), ...(resolvedParams.includeMetadata !== undefined ? { includeMetadata: resolvedParams.includeMetadata } : {}) }, { headers: { 'x-request-id': requestId, ...(this.sessionId && this.companyId ? { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, ...(this.csrfToken ? { 'x-csrf-token': this.csrfToken } : {}) } : {}) } });
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
      // Use 'any' for initial type to allow PaginatedData assignment, then assert final type
      const standardResponse: any = convertToPlainObject(responseData);
      
        // Phase 2: Wrap paginated responses with PaginatedData
      const hasLimit = true;
      const hasOffset = true;
      const hasPagination = hasLimit && hasOffset;
      if (hasPagination && standardResponse.success?.data && Array.isArray(standardResponse.success.data) && standardResponse.success.meta) {
        // PaginatedData is already imported at top of file
        const paginationMeta = (standardResponse.success.meta as any)?.pagination;
        if (paginationMeta) {
        const paginatedData = new PaginatedData(
          standardResponse.success.data,
          {
            has_more: paginationMeta.has_more,
            next_offset: paginationMeta.next_offset,
            current_offset: paginationMeta.current_offset,
            limit: paginationMeta.limit,
          },
          this.getOrders.bind(this),
          resolvedParams,
          this
        );
        standardResponse.success.data = paginatedData;
        }
      }
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders', resolvedParams, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Orders completed', {
        request_id: requestId,
        action: 'getOrders'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
      // Type assertion to final return type (handles both paginated and non-paginated responses)
      return standardResponse as FinaticResponse<PaginatedData<FDXBrokerOrder>>;
      
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
      const errorResponse: FinaticResponse<PaginatedData<FDXBrokerOrder>> = {
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
   * @param params.brokerId {string} (optional) Filter by broker ID
   * @param params.connectionId {string} (optional) Filter by connection ID
   * @param params.accountId {string} (optional) Filter by broker provided account ID or internal account UUID
   * @param params.symbol {string} (optional) Filter by symbol
   * @param params.side {BrokerDataOrderSideEnum} (optional) Filter by position side (e.g., 'long', 'short')
   * @param params.assetType {BrokerDataAssetTypeEnum} (optional) Filter by asset type (e.g., 'stock', 'option', 'crypto', 'future')
   * @param params.positionStatus {BrokerDataPositionStatusEnum} (optional) Filter by position status: 'open' (quantity > 0) or 'closed' (quantity = 0)
   * @param params.limit {number} (optional) Maximum number of positions to return
   * @param params.offset {number} (optional) Number of positions to skip for pagination
   * @param params.updatedAfter {string} (optional) Filter positions updated after this timestamp
   * @param params.updatedBefore {string} (optional) Filter positions updated before this timestamp
   * @param params.includeMetadata {boolean} (optional) Include position metadata in response (excluded by default for FDX compliance)
   * @returns {Promise<FinaticResponse<PaginatedData<FDXBrokerPosition>>>} Standard response with success/Error/Warning structure
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
    brokerId: 'alpaca',
    connectionId: '00000000-0000-0000-0000-000000000000',
    accountId: '123456789'
   * });
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
  async getPositions(params?: GetPositionsParams): Promise<FinaticResponse<PaginatedData<FDXBrokerPosition>>> {
    // Use params object (with default empty object)
    const resolvedParams: GetPositionsParams = params || {};
    if (params?.side !== undefined) {
      const coerced = coerceEnumValue(params.side, BrokerDataOrderSideEnum, 'side');
      if (coerced !== undefined) {
        params.side = coerced;
      }
    }
    if (params?.assetType !== undefined) {
      const coerced = coerceEnumValue(params.assetType, BrokerDataAssetTypeEnum, 'assetType');
      if (coerced !== undefined) {
        params.assetType = coerced;
      }
    }
    if (params?.positionStatus !== undefined) {
      const coerced = coerceEnumValue(params.positionStatus, BrokerDataPositionStatusEnum, 'positionStatus');
      if (coerced !== undefined) {
        params.positionStatus = coerced;
      }
    }    // Authentication check
    if (!this.sessionId || !this.companyId) {
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
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions', resolvedParams, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as FinaticResponse<PaginatedData<FDXBrokerPosition>>;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Positions', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/positions',
      params: resolvedParams,
      action: 'getPositions'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getPositionsApiV1BrokersDataPositionsGet({ ...(resolvedParams.brokerId !== undefined ? { brokerId: resolvedParams.brokerId } : {}), ...(resolvedParams.connectionId !== undefined ? { connectionId: resolvedParams.connectionId } : {}), ...(resolvedParams.accountId !== undefined ? { accountId: resolvedParams.accountId } : {}), ...(resolvedParams.symbol !== undefined ? { symbol: resolvedParams.symbol } : {}), ...(resolvedParams.side !== undefined ? { side: resolvedParams.side } : {}), ...(resolvedParams.assetType !== undefined ? { assetType: resolvedParams.assetType } : {}), ...(resolvedParams.positionStatus !== undefined ? { positionStatus: resolvedParams.positionStatus } : {}), ...(resolvedParams.limit !== undefined ? { limit: resolvedParams.limit } : {}), ...(resolvedParams.offset !== undefined ? { offset: resolvedParams.offset } : {}), ...(resolvedParams.updatedAfter !== undefined ? { updatedAfter: resolvedParams.updatedAfter } : {}), ...(resolvedParams.updatedBefore !== undefined ? { updatedBefore: resolvedParams.updatedBefore } : {}), ...(resolvedParams.includeMetadata !== undefined ? { includeMetadata: resolvedParams.includeMetadata } : {}) }, { headers: { 'x-request-id': requestId, ...(this.sessionId && this.companyId ? { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, ...(this.csrfToken ? { 'x-csrf-token': this.csrfToken } : {}) } : {}) } });
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
      // Use 'any' for initial type to allow PaginatedData assignment, then assert final type
      const standardResponse: any = convertToPlainObject(responseData);
      
        // Phase 2: Wrap paginated responses with PaginatedData
      const hasLimit = true;
      const hasOffset = true;
      const hasPagination = hasLimit && hasOffset;
      if (hasPagination && standardResponse.success?.data && Array.isArray(standardResponse.success.data) && standardResponse.success.meta) {
        // PaginatedData is already imported at top of file
        const paginationMeta = (standardResponse.success.meta as any)?.pagination;
        if (paginationMeta) {
        const paginatedData = new PaginatedData(
          standardResponse.success.data,
          {
            has_more: paginationMeta.has_more,
            next_offset: paginationMeta.next_offset,
            current_offset: paginationMeta.current_offset,
            limit: paginationMeta.limit,
          },
          this.getPositions.bind(this),
          resolvedParams,
          this
        );
        standardResponse.success.data = paginatedData;
        }
      }
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions', resolvedParams, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Positions completed', {
        request_id: requestId,
        action: 'getPositions'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
      // Type assertion to final return type (handles both paginated and non-paginated responses)
      return standardResponse as FinaticResponse<PaginatedData<FDXBrokerPosition>>;
      
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
      const errorResponse: FinaticResponse<PaginatedData<FDXBrokerPosition>> = {
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
   * @param params.brokerId {string} (optional) Filter by broker ID
   * @param params.connectionId {string} (optional) Filter by connection ID
   * @param params.accountId {string} (optional) Filter by broker provided account ID or internal account UUID
   * @param params.isEndOfDaySnapshot {boolean} (optional) Filter by end-of-day snapshot status (true/false)
   * @param params.limit {number} (optional) Maximum number of balances to return
   * @param params.offset {number} (optional) Number of balances to skip for pagination
   * @param params.balanceCreatedAfter {string} (optional) Filter balances created after this timestamp
   * @param params.balanceCreatedBefore {string} (optional) Filter balances created before this timestamp
   * @param params.includeMetadata {boolean} (optional) Include balance metadata in response (excluded by default for FDX compliance)
   * @returns {Promise<FinaticResponse<PaginatedData<FDXBrokerBalance>>>} Standard response with success/Error/Warning structure
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
    brokerId: 'alpaca',
    connectionId: '00000000-0000-0000-0000-000000000000',
    accountId: '123456789'
   * });
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
  async getBalances(params?: GetBalancesParams): Promise<FinaticResponse<PaginatedData<FDXBrokerBalance>>> {
    // Use params object (with default empty object)
    const resolvedParams: GetBalancesParams = params || {};    // Authentication check
    if (!this.sessionId || !this.companyId) {
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
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/balances', resolvedParams, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as FinaticResponse<PaginatedData<FDXBrokerBalance>>;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Balances', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/balances',
      params: resolvedParams,
      action: 'getBalances'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getBalancesApiV1BrokersDataBalancesGet({ ...(resolvedParams.brokerId !== undefined ? { brokerId: resolvedParams.brokerId } : {}), ...(resolvedParams.connectionId !== undefined ? { connectionId: resolvedParams.connectionId } : {}), ...(resolvedParams.accountId !== undefined ? { accountId: resolvedParams.accountId } : {}), ...(resolvedParams.isEndOfDaySnapshot !== undefined ? { isEndOfDaySnapshot: resolvedParams.isEndOfDaySnapshot } : {}), ...(resolvedParams.limit !== undefined ? { limit: resolvedParams.limit } : {}), ...(resolvedParams.offset !== undefined ? { offset: resolvedParams.offset } : {}), ...(resolvedParams.balanceCreatedAfter !== undefined ? { balanceCreatedAfter: resolvedParams.balanceCreatedAfter } : {}), ...(resolvedParams.balanceCreatedBefore !== undefined ? { balanceCreatedBefore: resolvedParams.balanceCreatedBefore } : {}), ...(resolvedParams.includeMetadata !== undefined ? { includeMetadata: resolvedParams.includeMetadata } : {}) }, { headers: { 'x-request-id': requestId, ...(this.sessionId && this.companyId ? { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, ...(this.csrfToken ? { 'x-csrf-token': this.csrfToken } : {}) } : {}) } });
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
      // Use 'any' for initial type to allow PaginatedData assignment, then assert final type
      const standardResponse: any = convertToPlainObject(responseData);
      
        // Phase 2: Wrap paginated responses with PaginatedData
      const hasLimit = true;
      const hasOffset = true;
      const hasPagination = hasLimit && hasOffset;
      if (hasPagination && standardResponse.success?.data && Array.isArray(standardResponse.success.data) && standardResponse.success.meta) {
        // PaginatedData is already imported at top of file
        const paginationMeta = (standardResponse.success.meta as any)?.pagination;
        if (paginationMeta) {
        const paginatedData = new PaginatedData(
          standardResponse.success.data,
          {
            has_more: paginationMeta.has_more,
            next_offset: paginationMeta.next_offset,
            current_offset: paginationMeta.current_offset,
            limit: paginationMeta.limit,
          },
          this.getBalances.bind(this),
          resolvedParams,
          this
        );
        standardResponse.success.data = paginatedData;
        }
      }
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/balances', resolvedParams, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Balances completed', {
        request_id: requestId,
        action: 'getBalances'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
      // Type assertion to final return type (handles both paginated and non-paginated responses)
      return standardResponse as FinaticResponse<PaginatedData<FDXBrokerBalance>>;
      
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
      const errorResponse: FinaticResponse<PaginatedData<FDXBrokerBalance>> = {
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
   * @param params.brokerId {string} (optional) Filter by broker ID
   * @param params.connectionId {string} (optional) Filter by connection ID
   * @param params.accountType {BrokerDataAccountTypeEnum} (optional) Filter by account type (e.g., 'margin', 'cash', 'crypto_wallet', 'live', 'sim')
   * @param params.status {AccountStatus} (optional) Filter by account status (e.g., 'active', 'inactive')
   * @param params.currency {string} (optional) Filter by currency (e.g., 'USD', 'EUR')
   * @param params.limit {number} (optional) Maximum number of accounts to return
   * @param params.offset {number} (optional) Number of accounts to skip for pagination
   * @param params.includeMetadata {boolean} (optional) Include connection metadata in response (excluded by default for FDX compliance)
   * @returns {Promise<FinaticResponse<PaginatedData<FDXBrokerAccount>>>} Standard response with success/Error/Warning structure
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
    brokerId: 'alpaca',
    connectionId: '00000000-0000-0000-0000-000000000000',
    accountType: 'margin'
   * });
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
  async getAccounts(params?: GetAccountsParams): Promise<FinaticResponse<PaginatedData<FDXBrokerAccount>>> {
    // Use params object (with default empty object)
    const resolvedParams: GetAccountsParams = params || {};
    if (params?.accountType !== undefined) {
      const coerced = coerceEnumValue(params.accountType, BrokerDataAccountTypeEnum, 'accountType');
      if (coerced !== undefined) {
        params.accountType = coerced;
      }
    }    // Authentication check
    if (!this.sessionId || !this.companyId) {
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
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/accounts', resolvedParams, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as FinaticResponse<PaginatedData<FDXBrokerAccount>>;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Accounts', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/accounts',
      params: resolvedParams,
      action: 'getAccounts'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getAccountsApiV1BrokersDataAccountsGet({ ...(resolvedParams.brokerId !== undefined ? { brokerId: resolvedParams.brokerId } : {}), ...(resolvedParams.connectionId !== undefined ? { connectionId: resolvedParams.connectionId } : {}), ...(resolvedParams.accountType !== undefined ? { accountType: resolvedParams.accountType } : {}), ...(resolvedParams.status !== undefined ? { status: resolvedParams.status } : {}), ...(resolvedParams.currency !== undefined ? { currency: resolvedParams.currency } : {}), ...(resolvedParams.limit !== undefined ? { limit: resolvedParams.limit } : {}), ...(resolvedParams.offset !== undefined ? { offset: resolvedParams.offset } : {}), ...(resolvedParams.includeMetadata !== undefined ? { includeMetadata: resolvedParams.includeMetadata } : {}) }, { headers: { 'x-request-id': requestId, ...(this.sessionId && this.companyId ? { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, ...(this.csrfToken ? { 'x-csrf-token': this.csrfToken } : {}) } : {}) } });
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
      // Use 'any' for initial type to allow PaginatedData assignment, then assert final type
      const standardResponse: any = convertToPlainObject(responseData);
      
        // Phase 2: Wrap paginated responses with PaginatedData
      const hasLimit = true;
      const hasOffset = true;
      const hasPagination = hasLimit && hasOffset;
      if (hasPagination && standardResponse.success?.data && Array.isArray(standardResponse.success.data) && standardResponse.success.meta) {
        // PaginatedData is already imported at top of file
        const paginationMeta = (standardResponse.success.meta as any)?.pagination;
        if (paginationMeta) {
        const paginatedData = new PaginatedData(
          standardResponse.success.data,
          {
            has_more: paginationMeta.has_more,
            next_offset: paginationMeta.next_offset,
            current_offset: paginationMeta.current_offset,
            limit: paginationMeta.limit,
          },
          this.getAccounts.bind(this),
          resolvedParams,
          this
        );
        standardResponse.success.data = paginatedData;
        }
      }
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/accounts', resolvedParams, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Accounts completed', {
        request_id: requestId,
        action: 'getAccounts'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
      // Type assertion to final return type (handles both paginated and non-paginated responses)
      return standardResponse as FinaticResponse<PaginatedData<FDXBrokerAccount>>;
      
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
      const errorResponse: FinaticResponse<PaginatedData<FDXBrokerAccount>> = {
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
   * @param params.orderId {string} Order ID
   * @param params.connectionId {string} (optional) Filter by connection ID
   * @param params.limit {number} (optional) Maximum number of fills to return
   * @param params.offset {number} (optional) Number of fills to skip for pagination
   * @param params.includeMetadata {boolean} (optional) Include fill metadata in response (excluded by default for FDX compliance)
   * @returns {Promise<FinaticResponse<PaginatedData<FDXBrokerOrderFill>>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/orders/{order_id}/fills
   * @methodId get_order_fills_api_v1_brokers_data_orders__order_id__fills_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.getOrderFills({
    orderId: '00000000-0000-0000-0000-000000000000'
   * });
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
   * const result = await finatic.getOrderFills({
    orderId: '00000000-0000-0000-0000-000000000000',
    connectionId: '00000000-0000-0000-0000-000000000000',
    limit: 100,
    offset: 0
   * });
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
  async getOrderFills(params: GetOrderFillsParams): Promise<FinaticResponse<PaginatedData<FDXBrokerOrderFill>>> {
    // Use params object (required parameters present)
    const resolvedParams: GetOrderFillsParams = params;    // Authentication check
    if (!this.sessionId || !this.companyId) {
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
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/{order_id}/fills', resolvedParams, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as FinaticResponse<PaginatedData<FDXBrokerOrderFill>>;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Order Fills', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/orders/{order_id}/fills',
      params: resolvedParams,
      action: 'getOrderFills'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getOrderFillsApiV1BrokersDataOrdersOrderIdFillsGet({ orderId: resolvedParams.orderId ?? null, ...(resolvedParams.connectionId !== undefined ? { connectionId: resolvedParams.connectionId } : {}), ...(resolvedParams.limit !== undefined ? { limit: resolvedParams.limit } : {}), ...(resolvedParams.offset !== undefined ? { offset: resolvedParams.offset } : {}), ...(resolvedParams.includeMetadata !== undefined ? { includeMetadata: resolvedParams.includeMetadata } : {}) }, { headers: { 'x-request-id': requestId, ...(this.sessionId && this.companyId ? { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, ...(this.csrfToken ? { 'x-csrf-token': this.csrfToken } : {}) } : {}) } });
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
      // Use 'any' for initial type to allow PaginatedData assignment, then assert final type
      const standardResponse: any = convertToPlainObject(responseData);
      
        // Phase 2: Wrap paginated responses with PaginatedData
      const hasLimit = true;
      const hasOffset = true;
      const hasPagination = hasLimit && hasOffset;
      if (hasPagination && standardResponse.success?.data && Array.isArray(standardResponse.success.data) && standardResponse.success.meta) {
        // PaginatedData is already imported at top of file
        const paginationMeta = (standardResponse.success.meta as any)?.pagination;
        if (paginationMeta) {
        const paginatedData = new PaginatedData(
          standardResponse.success.data,
          {
            has_more: paginationMeta.has_more,
            next_offset: paginationMeta.next_offset,
            current_offset: paginationMeta.current_offset,
            limit: paginationMeta.limit,
          },
          this.getOrderFills.bind(this),
          resolvedParams,
          this
        );
        standardResponse.success.data = paginatedData;
        }
      }
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/{order_id}/fills', resolvedParams, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Order Fills completed', {
        request_id: requestId,
        action: 'getOrderFills'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
      // Type assertion to final return type (handles both paginated and non-paginated responses)
      return standardResponse as FinaticResponse<PaginatedData<FDXBrokerOrderFill>>;
      
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
      const errorResponse: FinaticResponse<PaginatedData<FDXBrokerOrderFill>> = {
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
   * @param params.orderId {string} Order ID
   * @param params.connectionId {string} (optional) Filter by connection ID
   * @param params.limit {number} (optional) Maximum number of events to return
   * @param params.offset {number} (optional) Number of events to skip for pagination
   * @param params.includeMetadata {boolean} (optional) Include event metadata in response (excluded by default for FDX compliance)
   * @returns {Promise<FinaticResponse<PaginatedData<FDXBrokerOrderEvent>>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/orders/{order_id}/events
   * @methodId get_order_events_api_v1_brokers_data_orders__order_id__events_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.getOrderEvents({
    orderId: '00000000-0000-0000-0000-000000000000'
   * });
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
   * const result = await finatic.getOrderEvents({
    orderId: '00000000-0000-0000-0000-000000000000',
    connectionId: '00000000-0000-0000-0000-000000000000',
    limit: 100,
    offset: 0
   * });
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
  async getOrderEvents(params: GetOrderEventsParams): Promise<FinaticResponse<PaginatedData<FDXBrokerOrderEvent>>> {
    // Use params object (required parameters present)
    const resolvedParams: GetOrderEventsParams = params;    // Authentication check
    if (!this.sessionId || !this.companyId) {
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
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/{order_id}/events', resolvedParams, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as FinaticResponse<PaginatedData<FDXBrokerOrderEvent>>;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Order Events', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/orders/{order_id}/events',
      params: resolvedParams,
      action: 'getOrderEvents'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getOrderEventsApiV1BrokersDataOrdersOrderIdEventsGet({ orderId: resolvedParams.orderId ?? null, ...(resolvedParams.connectionId !== undefined ? { connectionId: resolvedParams.connectionId } : {}), ...(resolvedParams.limit !== undefined ? { limit: resolvedParams.limit } : {}), ...(resolvedParams.offset !== undefined ? { offset: resolvedParams.offset } : {}), ...(resolvedParams.includeMetadata !== undefined ? { includeMetadata: resolvedParams.includeMetadata } : {}) }, { headers: { 'x-request-id': requestId, ...(this.sessionId && this.companyId ? { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, ...(this.csrfToken ? { 'x-csrf-token': this.csrfToken } : {}) } : {}) } });
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
      // Use 'any' for initial type to allow PaginatedData assignment, then assert final type
      const standardResponse: any = convertToPlainObject(responseData);
      
        // Phase 2: Wrap paginated responses with PaginatedData
      const hasLimit = true;
      const hasOffset = true;
      const hasPagination = hasLimit && hasOffset;
      if (hasPagination && standardResponse.success?.data && Array.isArray(standardResponse.success.data) && standardResponse.success.meta) {
        // PaginatedData is already imported at top of file
        const paginationMeta = (standardResponse.success.meta as any)?.pagination;
        if (paginationMeta) {
        const paginatedData = new PaginatedData(
          standardResponse.success.data,
          {
            has_more: paginationMeta.has_more,
            next_offset: paginationMeta.next_offset,
            current_offset: paginationMeta.current_offset,
            limit: paginationMeta.limit,
          },
          this.getOrderEvents.bind(this),
          resolvedParams,
          this
        );
        standardResponse.success.data = paginatedData;
        }
      }
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/{order_id}/events', resolvedParams, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Order Events completed', {
        request_id: requestId,
        action: 'getOrderEvents'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
      // Type assertion to final return type (handles both paginated and non-paginated responses)
      return standardResponse as FinaticResponse<PaginatedData<FDXBrokerOrderEvent>>;
      
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
      const errorResponse: FinaticResponse<PaginatedData<FDXBrokerOrderEvent>> = {
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
   * @param params.brokerId {string} (optional) Filter by broker ID
   * @param params.connectionId {string} (optional) Filter by connection ID
   * @param params.limit {number} (optional) Maximum number of order groups to return
   * @param params.offset {number} (optional) Number of order groups to skip for pagination
   * @param params.createdAfter {string} (optional) Filter order groups created after this timestamp
   * @param params.createdBefore {string} (optional) Filter order groups created before this timestamp
   * @param params.includeMetadata {boolean} (optional) Include group metadata in response (excluded by default for FDX compliance)
   * @returns {Promise<FinaticResponse<PaginatedData<FDXBrokerOrderGroup>>>} Standard response with success/Error/Warning structure
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
    brokerId: 'alpaca',
    connectionId: '00000000-0000-0000-0000-000000000000',
    limit: 100
   * });
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
  async getOrderGroups(params?: GetOrderGroupsParams): Promise<FinaticResponse<PaginatedData<FDXBrokerOrderGroup>>> {
    // Use params object (with default empty object)
    const resolvedParams: GetOrderGroupsParams = params || {};    // Authentication check
    if (!this.sessionId || !this.companyId) {
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
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/groups', resolvedParams, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as FinaticResponse<PaginatedData<FDXBrokerOrderGroup>>;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Order Groups', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/orders/groups',
      params: resolvedParams,
      action: 'getOrderGroups'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getOrderGroupsApiV1BrokersDataOrdersGroupsGet({ ...(resolvedParams.brokerId !== undefined ? { brokerId: resolvedParams.brokerId } : {}), ...(resolvedParams.connectionId !== undefined ? { connectionId: resolvedParams.connectionId } : {}), ...(resolvedParams.limit !== undefined ? { limit: resolvedParams.limit } : {}), ...(resolvedParams.offset !== undefined ? { offset: resolvedParams.offset } : {}), ...(resolvedParams.createdAfter !== undefined ? { createdAfter: resolvedParams.createdAfter } : {}), ...(resolvedParams.createdBefore !== undefined ? { createdBefore: resolvedParams.createdBefore } : {}), ...(resolvedParams.includeMetadata !== undefined ? { includeMetadata: resolvedParams.includeMetadata } : {}) }, { headers: { 'x-request-id': requestId, ...(this.sessionId && this.companyId ? { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, ...(this.csrfToken ? { 'x-csrf-token': this.csrfToken } : {}) } : {}) } });
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
      // Use 'any' for initial type to allow PaginatedData assignment, then assert final type
      const standardResponse: any = convertToPlainObject(responseData);
      
        // Phase 2: Wrap paginated responses with PaginatedData
      const hasLimit = true;
      const hasOffset = true;
      const hasPagination = hasLimit && hasOffset;
      if (hasPagination && standardResponse.success?.data && Array.isArray(standardResponse.success.data) && standardResponse.success.meta) {
        // PaginatedData is already imported at top of file
        const paginationMeta = (standardResponse.success.meta as any)?.pagination;
        if (paginationMeta) {
        const paginatedData = new PaginatedData(
          standardResponse.success.data,
          {
            has_more: paginationMeta.has_more,
            next_offset: paginationMeta.next_offset,
            current_offset: paginationMeta.current_offset,
            limit: paginationMeta.limit,
          },
          this.getOrderGroups.bind(this),
          resolvedParams,
          this
        );
        standardResponse.success.data = paginatedData;
        }
      }
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/groups', resolvedParams, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Order Groups completed', {
        request_id: requestId,
        action: 'getOrderGroups'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
      // Type assertion to final return type (handles both paginated and non-paginated responses)
      return standardResponse as FinaticResponse<PaginatedData<FDXBrokerOrderGroup>>;
      
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
      const errorResponse: FinaticResponse<PaginatedData<FDXBrokerOrderGroup>> = {
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
   * @param params.brokerId {string} (optional) Filter by broker ID
   * @param params.connectionId {string} (optional) Filter by connection ID
   * @param params.accountId {string} (optional) Filter by broker provided account ID
   * @param params.symbol {string} (optional) Filter by symbol
   * @param params.positionId {string} (optional) Filter by position ID
   * @param params.limit {number} (optional) Maximum number of position lots to return
   * @param params.offset {number} (optional) Number of position lots to skip for pagination
   * @returns {Promise<FinaticResponse<PaginatedData<FDXBrokerPositionLot>>>} Standard response with success/Error/Warning structure
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
    brokerId: 'alpaca',
    connectionId: '00000000-0000-0000-0000-000000000000',
    accountId: '123456789'
   * });
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
  async getPositionLots(params?: GetPositionLotsParams): Promise<FinaticResponse<PaginatedData<FDXBrokerPositionLot>>> {
    // Use params object (with default empty object)
    const resolvedParams: GetPositionLotsParams = params || {};    // Authentication check
    if (!this.sessionId || !this.companyId) {
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
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions/lots', resolvedParams, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as FinaticResponse<PaginatedData<FDXBrokerPositionLot>>;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Position Lots', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/positions/lots',
      params: resolvedParams,
      action: 'getPositionLots'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getPositionLotsApiV1BrokersDataPositionsLotsGet({ ...(resolvedParams.brokerId !== undefined ? { brokerId: resolvedParams.brokerId } : {}), ...(resolvedParams.connectionId !== undefined ? { connectionId: resolvedParams.connectionId } : {}), ...(resolvedParams.accountId !== undefined ? { accountId: resolvedParams.accountId } : {}), ...(resolvedParams.symbol !== undefined ? { symbol: resolvedParams.symbol } : {}), ...(resolvedParams.positionId !== undefined ? { positionId: resolvedParams.positionId } : {}), ...(resolvedParams.limit !== undefined ? { limit: resolvedParams.limit } : {}), ...(resolvedParams.offset !== undefined ? { offset: resolvedParams.offset } : {}) }, { headers: { 'x-request-id': requestId, ...(this.sessionId && this.companyId ? { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, ...(this.csrfToken ? { 'x-csrf-token': this.csrfToken } : {}) } : {}) } });
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
      // Use 'any' for initial type to allow PaginatedData assignment, then assert final type
      const standardResponse: any = convertToPlainObject(responseData);
      
        // Phase 2: Wrap paginated responses with PaginatedData
      const hasLimit = true;
      const hasOffset = true;
      const hasPagination = hasLimit && hasOffset;
      if (hasPagination && standardResponse.success?.data && Array.isArray(standardResponse.success.data) && standardResponse.success.meta) {
        // PaginatedData is already imported at top of file
        const paginationMeta = (standardResponse.success.meta as any)?.pagination;
        if (paginationMeta) {
        const paginatedData = new PaginatedData(
          standardResponse.success.data,
          {
            has_more: paginationMeta.has_more,
            next_offset: paginationMeta.next_offset,
            current_offset: paginationMeta.current_offset,
            limit: paginationMeta.limit,
          },
          this.getPositionLots.bind(this),
          resolvedParams,
          this
        );
        standardResponse.success.data = paginatedData;
        }
      }
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions/lots', resolvedParams, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Position Lots completed', {
        request_id: requestId,
        action: 'getPositionLots'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
      // Type assertion to final return type (handles both paginated and non-paginated responses)
      return standardResponse as FinaticResponse<PaginatedData<FDXBrokerPositionLot>>;
      
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
      const errorResponse: FinaticResponse<PaginatedData<FDXBrokerPositionLot>> = {
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
   * @param params.lotId {string} Position lot ID
   * @param params.connectionId {string} (optional) Filter by connection ID
   * @param params.limit {number} (optional) Maximum number of fills to return
   * @param params.offset {number} (optional) Number of fills to skip for pagination
   * @returns {Promise<FinaticResponse<PaginatedData<FDXBrokerPositionLotFill>>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/brokers/data/positions/lots/{lot_id}/fills
   * @methodId get_position_lot_fills_api_v1_brokers_data_positions_lots__lot_id__fills_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.getPositionLotFills({
    lotId: '00000000-0000-0000-0000-000000000000'
   * });
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
   * const result = await finatic.getPositionLotFills({
    lotId: '00000000-0000-0000-0000-000000000000',
    connectionId: '00000000-0000-0000-0000-000000000000',
    limit: 100,
    offset: 0
   * });
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
  async getPositionLotFills(params: GetPositionLotFillsParams): Promise<FinaticResponse<PaginatedData<FDXBrokerPositionLotFill>>> {
    // Use params object (required parameters present)
    const resolvedParams: GetPositionLotFillsParams = params;    // Authentication check
    if (!this.sessionId || !this.companyId) {
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
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions/lots/{lot_id}/fills', resolvedParams, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as FinaticResponse<PaginatedData<FDXBrokerPositionLotFill>>;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Position Lot Fills', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/positions/lots/{lot_id}/fills',
      params: resolvedParams,
      action: 'getPositionLotFills'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getPositionLotFillsApiV1BrokersDataPositionsLotsLotIdFillsGet({ lotId: resolvedParams.lotId ?? null, ...(resolvedParams.connectionId !== undefined ? { connectionId: resolvedParams.connectionId } : {}), ...(resolvedParams.limit !== undefined ? { limit: resolvedParams.limit } : {}), ...(resolvedParams.offset !== undefined ? { offset: resolvedParams.offset } : {}) }, { headers: { 'x-request-id': requestId, ...(this.sessionId && this.companyId ? { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, ...(this.csrfToken ? { 'x-csrf-token': this.csrfToken } : {}) } : {}) } });
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
      // Use 'any' for initial type to allow PaginatedData assignment, then assert final type
      const standardResponse: any = convertToPlainObject(responseData);
      
        // Phase 2: Wrap paginated responses with PaginatedData
      const hasLimit = true;
      const hasOffset = true;
      const hasPagination = hasLimit && hasOffset;
      if (hasPagination && standardResponse.success?.data && Array.isArray(standardResponse.success.data) && standardResponse.success.meta) {
        // PaginatedData is already imported at top of file
        const paginationMeta = (standardResponse.success.meta as any)?.pagination;
        if (paginationMeta) {
        const paginatedData = new PaginatedData(
          standardResponse.success.data,
          {
            has_more: paginationMeta.has_more,
            next_offset: paginationMeta.next_offset,
            current_offset: paginationMeta.current_offset,
            limit: paginationMeta.limit,
          },
          this.getPositionLotFills.bind(this),
          resolvedParams,
          this
        );
        standardResponse.success.data = paginatedData;
        }
      }
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions/lots/{lot_id}/fills', resolvedParams, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Position Lot Fills completed', {
        request_id: requestId,
        action: 'getPositionLotFills'
      });
      
      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
      // Type assertion to final return type (handles both paginated and non-paginated responses)
      return standardResponse as FinaticResponse<PaginatedData<FDXBrokerPositionLotFill>>;
      
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
      const errorResponse: FinaticResponse<PaginatedData<FDXBrokerPositionLotFill>> = {
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
