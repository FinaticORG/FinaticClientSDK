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
import type { PublicAccountTypeEnum } from '../models';
import type { PublicAssetTypeEnum } from '../models';
import type { PublicOrderSideEnum } from '../models';
import type { PublicOrderStatusEnum } from '../models';
import type { PublicPositionStatusEnum } from '../models';
import type { UserBrokerConnections } from '../models';


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

   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {BrokerInfo[]}
   * 
   * Generated from: GET /api/v1/brokers/
   * @methodId get_brokers_api_v1_brokers__get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.getBrokers();
   * ```
   */
  async getBrokers(withEnvelope?: boolean): Promise<BrokerInfo[]> {
    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, {  }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/', {  }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Brokers', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/',
      action: 'getBrokers'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getBrokersApiV1BrokersGet({ headers: { 'x-request-id': requestId } });
          const result = apiResponse;
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Canonical unwrap: AxiosResponse.data.data or Pydantic-like data
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      const result = (responseData as any).data;
      
      if (withEnvelope === true) {
        const warnings = (responseData as any).warnings;
        const meta = (responseData as any).meta;
        const envelope: any = { data: result };
        if (Array.isArray(warnings)) envelope.warnings = warnings;
        if (meta) envelope.meta = meta;
        return envelope;
      }
      
      const finalResult = result;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/', {  }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Brokers completed', {
        request_id: requestId,
        action: 'getBrokers'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Brokers failed', error, {
        request_id: requestId,
        action: 'getBrokers'
      });
      
      throw this._handleError(error, requestId);
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

   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {UserBrokerConnections[]}
   * 
   * Generated from: GET /api/v1/brokers/connections
   * @methodId list_broker_connections_api_v1_brokers_connections_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.listBrokerConnections();
   * ```
   */
  async listBrokerConnections(withEnvelope?: boolean): Promise<UserBrokerConnections[]> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, {  }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/connections', {  }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('List Broker Connections', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/connections',
      action: 'listBrokerConnections'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.listBrokerConnectionsApiV1BrokersConnectionsGet({ headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Canonical unwrap: AxiosResponse.data.data or Pydantic-like data
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      const result = (responseData as any).data;
      
      if (withEnvelope === true) {
        const warnings = (responseData as any).warnings;
        const meta = (responseData as any).meta;
        const envelope: any = { data: result };
        if (Array.isArray(warnings)) envelope.warnings = warnings;
        if (meta) envelope.meta = meta;
        return envelope;
      }
      
      const finalResult = result;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/connections', {  }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('List Broker Connections completed', {
        request_id: requestId,
        action: 'listBrokerConnections'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('List Broker Connections failed', error, {
        request_id: requestId,
        action: 'listBrokerConnections'
      });
      
      throw this._handleError(error, requestId);
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

   * @param connectionId {string}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {DisconnectActionResult}
   * 
   * Generated from: DELETE /api/v1/brokers/disconnect-company/{connection_id}
   * @methodId disconnect_company_from_broker_api_v1_brokers_disconnect_company__connection_id__delete
   * @category brokers
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.disconnectCompanyFromBroker('example');
   * ```
   */
  async disconnectCompanyFromBroker(connectionId: string, withEnvelope?: boolean): Promise<DisconnectActionResult> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { connectionId }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('DELETE', '/api/v1/brokers/disconnect-company/{connection_id}', { connectionId }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Disconnect Company From Broker', {
      request_id: requestId,
      method: 'DELETE',
      path: '/api/v1/brokers/disconnect-company/{connection_id}',
      connectionId: connectionId,
      action: 'disconnectCompanyFromBroker'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.disconnectCompanyFromBrokerApiV1BrokersDisconnectCompanyConnectionIdDelete({ connectionId: connectionId,  }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Canonical unwrap: AxiosResponse.data.data or Pydantic-like data
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      const result = (responseData as any).data;
      
      if (withEnvelope === true) {
        const warnings = (responseData as any).warnings;
        const meta = (responseData as any).meta;
        const envelope: any = { data: result };
        if (Array.isArray(warnings)) envelope.warnings = warnings;
        if (meta) envelope.meta = meta;
        return envelope;
      }
      
      const finalResult = result;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('DELETE', '/api/v1/brokers/disconnect-company/{connection_id}', { connectionId }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Disconnect Company From Broker completed', {
        request_id: requestId,
        action: 'disconnectCompanyFromBroker'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Disconnect Company From Broker failed', error, {
        request_id: requestId,
        action: 'disconnectCompanyFromBroker'
      });
      
      throw this._handleError(error, requestId);
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

   * @param brokerId {string}
   * @param connectionId {string}
   * @param accountId {string}
   * @param symbol {string}
   * @param orderStatus {PublicOrderStatusEnum}
   * @param side {PublicOrderSideEnum}
   * @param assetType {PublicAssetTypeEnum}
   * @param limit {number}
   * @param offset {number}
   * @param createdAfter {string}
   * @param createdBefore {string}
   * @param withMetadata {boolean}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {OrderResponse[]}
   * 
   * Generated from: GET /api/v1/brokers/data/orders
   * @methodId get_orders_api_v1_brokers_data_orders_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.getOrders();
   * ```
   */
  async getOrders(brokerId?: string, connectionId?: string, accountId?: string, symbol?: string, orderStatus?: PublicOrderStatusEnum, side?: PublicOrderSideEnum, assetType?: PublicAssetTypeEnum, limit?: number, offset?: number, createdAfter?: string, createdBefore?: string, withMetadata?: boolean, withEnvelope?: boolean): Promise<OrderResponse[]> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { brokerId, connectionId, accountId, symbol, orderStatus, side, assetType, limit, offset, createdAfter, createdBefore, withMetadata }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders', { brokerId, connectionId, accountId, symbol, orderStatus, side, assetType, limit, offset, createdAfter, createdBefore, withMetadata }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Orders', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/orders',
      brokerId: brokerId,
      connectionId: connectionId,
      accountId: accountId,
      symbol: symbol,
      orderStatus: orderStatus,
      side: side,
      assetType: assetType,
      limit: limit,
      offset: offset,
      createdAfter: createdAfter,
      createdBefore: createdBefore,
      withMetadata: withMetadata,
      action: 'getOrders'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getOrdersApiV1BrokersDataOrdersGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountId !== undefined ? { accountId: accountId } : {}), ...(symbol !== undefined ? { symbol: symbol } : {}), ...(orderStatus !== undefined ? { orderStatus: orderStatus } : {}), ...(side !== undefined ? { side: side } : {}), ...(assetType !== undefined ? { assetType: assetType } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(createdAfter !== undefined ? { createdAfter: createdAfter } : {}), ...(createdBefore !== undefined ? { createdBefore: createdBefore } : {}), ...(withMetadata !== undefined ? { withMetadata: withMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Canonical unwrap: AxiosResponse.data.data or Pydantic-like data
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      const result = (responseData as any).data;
      
      if (withEnvelope === true) {
        const warnings = (responseData as any).warnings;
        const meta = (responseData as any).meta;
        const envelope: any = { data: result };
        if (Array.isArray(warnings)) envelope.warnings = warnings;
        if (meta) envelope.meta = meta;
        return envelope;
      }
      
      const finalResult = result;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders', { brokerId, connectionId, accountId, symbol, orderStatus, side, assetType, limit, offset, createdAfter, createdBefore, withMetadata }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Orders completed', {
        request_id: requestId,
        action: 'getOrders'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Orders failed', error, {
        request_id: requestId,
        action: 'getOrders'
      });
      
      throw this._handleError(error, requestId);
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

   * @param brokerId {string}
   * @param connectionId {string}
   * @param accountId {string}
   * @param symbol {string}
   * @param side {PublicOrderSideEnum}
   * @param assetType {PublicAssetTypeEnum}
   * @param positionStatus {PublicPositionStatusEnum}
   * @param limit {number}
   * @param offset {number}
   * @param updatedAfter {string}
   * @param updatedBefore {string}
   * @param withMetadata {boolean}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {PositionResponse[]}
   * 
   * Generated from: GET /api/v1/brokers/data/positions
   * @methodId get_positions_api_v1_brokers_data_positions_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.getPositions();
   * ```
   */
  async getPositions(brokerId?: string, connectionId?: string, accountId?: string, symbol?: string, side?: PublicOrderSideEnum, assetType?: PublicAssetTypeEnum, positionStatus?: PublicPositionStatusEnum, limit?: number, offset?: number, updatedAfter?: string, updatedBefore?: string, withMetadata?: boolean, withEnvelope?: boolean): Promise<PositionResponse[]> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { brokerId, connectionId, accountId, symbol, side, assetType, positionStatus, limit, offset, updatedAfter, updatedBefore, withMetadata }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions', { brokerId, connectionId, accountId, symbol, side, assetType, positionStatus, limit, offset, updatedAfter, updatedBefore, withMetadata }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Positions', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/positions',
      brokerId: brokerId,
      connectionId: connectionId,
      accountId: accountId,
      symbol: symbol,
      side: side,
      assetType: assetType,
      positionStatus: positionStatus,
      limit: limit,
      offset: offset,
      updatedAfter: updatedAfter,
      updatedBefore: updatedBefore,
      withMetadata: withMetadata,
      action: 'getPositions'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getPositionsApiV1BrokersDataPositionsGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountId !== undefined ? { accountId: accountId } : {}), ...(symbol !== undefined ? { symbol: symbol } : {}), ...(side !== undefined ? { side: side } : {}), ...(assetType !== undefined ? { assetType: assetType } : {}), ...(positionStatus !== undefined ? { positionStatus: positionStatus } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(updatedAfter !== undefined ? { updatedAfter: updatedAfter } : {}), ...(updatedBefore !== undefined ? { updatedBefore: updatedBefore } : {}), ...(withMetadata !== undefined ? { withMetadata: withMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Canonical unwrap: AxiosResponse.data.data or Pydantic-like data
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      const result = (responseData as any).data;
      
      if (withEnvelope === true) {
        const warnings = (responseData as any).warnings;
        const meta = (responseData as any).meta;
        const envelope: any = { data: result };
        if (Array.isArray(warnings)) envelope.warnings = warnings;
        if (meta) envelope.meta = meta;
        return envelope;
      }
      
      const finalResult = result;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions', { brokerId, connectionId, accountId, symbol, side, assetType, positionStatus, limit, offset, updatedAfter, updatedBefore, withMetadata }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Positions completed', {
        request_id: requestId,
        action: 'getPositions'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Positions failed', error, {
        request_id: requestId,
        action: 'getPositions'
      });
      
      throw this._handleError(error, requestId);
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

   * @param brokerId {string}
   * @param connectionId {string}
   * @param accountId {string}
   * @param isEndOfDaySnapshot {boolean}
   * @param limit {number}
   * @param offset {number}
   * @param balanceCreatedAfter {string}
   * @param balanceCreatedBefore {string}
   * @param withMetadata {boolean}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {Balances[]}
   * 
   * Generated from: GET /api/v1/brokers/data/balances
   * @methodId get_balances_api_v1_brokers_data_balances_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.getBalances();
   * ```
   */
  async getBalances(brokerId?: string, connectionId?: string, accountId?: string, isEndOfDaySnapshot?: boolean, limit?: number, offset?: number, balanceCreatedAfter?: string, balanceCreatedBefore?: string, withMetadata?: boolean, withEnvelope?: boolean): Promise<Balances[]> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { brokerId, connectionId, accountId, isEndOfDaySnapshot, limit, offset, balanceCreatedAfter, balanceCreatedBefore, withMetadata }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/balances', { brokerId, connectionId, accountId, isEndOfDaySnapshot, limit, offset, balanceCreatedAfter, balanceCreatedBefore, withMetadata }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Balances', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/balances',
      brokerId: brokerId,
      connectionId: connectionId,
      accountId: accountId,
      isEndOfDaySnapshot: isEndOfDaySnapshot,
      limit: limit,
      offset: offset,
      balanceCreatedAfter: balanceCreatedAfter,
      balanceCreatedBefore: balanceCreatedBefore,
      withMetadata: withMetadata,
      action: 'getBalances'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getBalancesApiV1BrokersDataBalancesGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountId !== undefined ? { accountId: accountId } : {}), ...(isEndOfDaySnapshot !== undefined ? { isEndOfDaySnapshot: isEndOfDaySnapshot } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(balanceCreatedAfter !== undefined ? { balanceCreatedAfter: balanceCreatedAfter } : {}), ...(balanceCreatedBefore !== undefined ? { balanceCreatedBefore: balanceCreatedBefore } : {}), ...(withMetadata !== undefined ? { withMetadata: withMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Canonical unwrap: AxiosResponse.data.data or Pydantic-like data
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      const result = (responseData as any).data;
      
      if (withEnvelope === true) {
        const warnings = (responseData as any).warnings;
        const meta = (responseData as any).meta;
        const envelope: any = { data: result };
        if (Array.isArray(warnings)) envelope.warnings = warnings;
        if (meta) envelope.meta = meta;
        return envelope;
      }
      
      const finalResult = result;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/balances', { brokerId, connectionId, accountId, isEndOfDaySnapshot, limit, offset, balanceCreatedAfter, balanceCreatedBefore, withMetadata }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Balances completed', {
        request_id: requestId,
        action: 'getBalances'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Balances failed', error, {
        request_id: requestId,
        action: 'getBalances'
      });
      
      throw this._handleError(error, requestId);
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

   * @param brokerId {string}
   * @param connectionId {string}
   * @param accountType {PublicAccountTypeEnum}
   * @param status {AccountStatus}
   * @param currency {string}
   * @param limit {number}
   * @param offset {number}
   * @param withMetadata {boolean}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {Accounts[]}
   * 
   * Generated from: GET /api/v1/brokers/data/accounts
   * @methodId get_accounts_api_v1_brokers_data_accounts_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.getAccounts();
   * ```
   */
  async getAccounts(brokerId?: string, connectionId?: string, accountType?: PublicAccountTypeEnum, status?: AccountStatus, currency?: string, limit?: number, offset?: number, withMetadata?: boolean, withEnvelope?: boolean): Promise<Accounts[]> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { brokerId, connectionId, accountType, status, currency, limit, offset, withMetadata }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/accounts', { brokerId, connectionId, accountType, status, currency, limit, offset, withMetadata }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Accounts', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/accounts',
      brokerId: brokerId,
      connectionId: connectionId,
      accountType: accountType,
      status: status,
      currency: currency,
      limit: limit,
      offset: offset,
      withMetadata: withMetadata,
      action: 'getAccounts'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getAccountsApiV1BrokersDataAccountsGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountType !== undefined ? { accountType: accountType } : {}), ...(status !== undefined ? { status: status } : {}), ...(currency !== undefined ? { currency: currency } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(withMetadata !== undefined ? { withMetadata: withMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Canonical unwrap: AxiosResponse.data.data or Pydantic-like data
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      const result = (responseData as any).data;
      
      if (withEnvelope === true) {
        const warnings = (responseData as any).warnings;
        const meta = (responseData as any).meta;
        const envelope: any = { data: result };
        if (Array.isArray(warnings)) envelope.warnings = warnings;
        if (meta) envelope.meta = meta;
        return envelope;
      }
      
      const finalResult = result;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/accounts', { brokerId, connectionId, accountType, status, currency, limit, offset, withMetadata }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Accounts completed', {
        request_id: requestId,
        action: 'getAccounts'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Accounts failed', error, {
        request_id: requestId,
        action: 'getAccounts'
      });
      
      throw this._handleError(error, requestId);
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

   * @param orderId {string}
   * @param connectionId {string}
   * @param limit {number}
   * @param offset {number}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {OrderFillResponse[]}
   * 
   * Generated from: GET /api/v1/brokers/data/orders/{order_id}/fills
   * @methodId get_order_fills_api_v1_brokers_data_orders__order_id__fills_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.getOrderFills('example');
   * ```
   */
  async getOrderFills(orderId: string, connectionId?: string, limit?: number, offset?: number, withEnvelope?: boolean): Promise<OrderFillResponse[]> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { orderId, connectionId, limit, offset }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/{order_id}/fills', { orderId, connectionId, limit, offset }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Order Fills', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/orders/{order_id}/fills',
      orderId: orderId,
      connectionId: connectionId,
      limit: limit,
      offset: offset,
      action: 'getOrderFills'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getOrderFillsApiV1BrokersDataOrdersOrderIdFillsGet({ orderId: orderId, ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Canonical unwrap: AxiosResponse.data.data or Pydantic-like data
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      const result = (responseData as any).data;
      
      if (withEnvelope === true) {
        const warnings = (responseData as any).warnings;
        const meta = (responseData as any).meta;
        const envelope: any = { data: result };
        if (Array.isArray(warnings)) envelope.warnings = warnings;
        if (meta) envelope.meta = meta;
        return envelope;
      }
      
      const finalResult = result;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/{order_id}/fills', { orderId, connectionId, limit, offset }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Order Fills completed', {
        request_id: requestId,
        action: 'getOrderFills'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Order Fills failed', error, {
        request_id: requestId,
        action: 'getOrderFills'
      });
      
      throw this._handleError(error, requestId);
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

   * @param orderId {string}
   * @param connectionId {string}
   * @param limit {number}
   * @param offset {number}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {OrderEventResponse[]}
   * 
   * Generated from: GET /api/v1/brokers/data/orders/{order_id}/events
   * @methodId get_order_events_api_v1_brokers_data_orders__order_id__events_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.getOrderEvents('example');
   * ```
   */
  async getOrderEvents(orderId: string, connectionId?: string, limit?: number, offset?: number, withEnvelope?: boolean): Promise<OrderEventResponse[]> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { orderId, connectionId, limit, offset }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/{order_id}/events', { orderId, connectionId, limit, offset }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Order Events', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/orders/{order_id}/events',
      orderId: orderId,
      connectionId: connectionId,
      limit: limit,
      offset: offset,
      action: 'getOrderEvents'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getOrderEventsApiV1BrokersDataOrdersOrderIdEventsGet({ orderId: orderId, ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Canonical unwrap: AxiosResponse.data.data or Pydantic-like data
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      const result = (responseData as any).data;
      
      if (withEnvelope === true) {
        const warnings = (responseData as any).warnings;
        const meta = (responseData as any).meta;
        const envelope: any = { data: result };
        if (Array.isArray(warnings)) envelope.warnings = warnings;
        if (meta) envelope.meta = meta;
        return envelope;
      }
      
      const finalResult = result;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/{order_id}/events', { orderId, connectionId, limit, offset }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Order Events completed', {
        request_id: requestId,
        action: 'getOrderEvents'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Order Events failed', error, {
        request_id: requestId,
        action: 'getOrderEvents'
      });
      
      throw this._handleError(error, requestId);
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

   * @param brokerId {string}
   * @param connectionId {string}
   * @param limit {number}
   * @param offset {number}
   * @param createdAfter {string}
   * @param createdBefore {string}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {OrderGroupResponse[]}
   * 
   * Generated from: GET /api/v1/brokers/data/orders/groups
   * @methodId get_order_groups_api_v1_brokers_data_orders_groups_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.getOrderGroups();
   * ```
   */
  async getOrderGroups(brokerId?: string, connectionId?: string, limit?: number, offset?: number, createdAfter?: string, createdBefore?: string, withEnvelope?: boolean): Promise<OrderGroupResponse[]> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { brokerId, connectionId, limit, offset, createdAfter, createdBefore }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/groups', { brokerId, connectionId, limit, offset, createdAfter, createdBefore }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Order Groups', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/orders/groups',
      brokerId: brokerId,
      connectionId: connectionId,
      limit: limit,
      offset: offset,
      createdAfter: createdAfter,
      createdBefore: createdBefore,
      action: 'getOrderGroups'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getOrderGroupsApiV1BrokersDataOrdersGroupsGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(createdAfter !== undefined ? { createdAfter: createdAfter } : {}), ...(createdBefore !== undefined ? { createdBefore: createdBefore } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Canonical unwrap: AxiosResponse.data.data or Pydantic-like data
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      const result = (responseData as any).data;
      
      if (withEnvelope === true) {
        const warnings = (responseData as any).warnings;
        const meta = (responseData as any).meta;
        const envelope: any = { data: result };
        if (Array.isArray(warnings)) envelope.warnings = warnings;
        if (meta) envelope.meta = meta;
        return envelope;
      }
      
      const finalResult = result;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/groups', { brokerId, connectionId, limit, offset, createdAfter, createdBefore }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Order Groups completed', {
        request_id: requestId,
        action: 'getOrderGroups'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Order Groups failed', error, {
        request_id: requestId,
        action: 'getOrderGroups'
      });
      
      throw this._handleError(error, requestId);
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

   * @param brokerId {string}
   * @param connectionId {string}
   * @param accountId {string}
   * @param symbol {string}
   * @param positionId {string}
   * @param limit {number}
   * @param offset {number}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {PositionLotResponse[]}
   * 
   * Generated from: GET /api/v1/brokers/data/positions/lots
   * @methodId get_position_lots_api_v1_brokers_data_positions_lots_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.getPositionLots();
   * ```
   */
  async getPositionLots(brokerId?: string, connectionId?: string, accountId?: string, symbol?: string, positionId?: string, limit?: number, offset?: number, withEnvelope?: boolean): Promise<PositionLotResponse[]> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { brokerId, connectionId, accountId, symbol, positionId, limit, offset }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions/lots', { brokerId, connectionId, accountId, symbol, positionId, limit, offset }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Position Lots', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/positions/lots',
      brokerId: brokerId,
      connectionId: connectionId,
      accountId: accountId,
      symbol: symbol,
      positionId: positionId,
      limit: limit,
      offset: offset,
      action: 'getPositionLots'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getPositionLotsApiV1BrokersDataPositionsLotsGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountId !== undefined ? { accountId: accountId } : {}), ...(symbol !== undefined ? { symbol: symbol } : {}), ...(positionId !== undefined ? { positionId: positionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Canonical unwrap: AxiosResponse.data.data or Pydantic-like data
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      const result = (responseData as any).data;
      
      if (withEnvelope === true) {
        const warnings = (responseData as any).warnings;
        const meta = (responseData as any).meta;
        const envelope: any = { data: result };
        if (Array.isArray(warnings)) envelope.warnings = warnings;
        if (meta) envelope.meta = meta;
        return envelope;
      }
      
      const finalResult = result;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions/lots', { brokerId, connectionId, accountId, symbol, positionId, limit, offset }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Position Lots completed', {
        request_id: requestId,
        action: 'getPositionLots'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Position Lots failed', error, {
        request_id: requestId,
        action: 'getPositionLots'
      });
      
      throw this._handleError(error, requestId);
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

   * @param lotId {string}
   * @param connectionId {string}
   * @param limit {number}
   * @param offset {number}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {PositionLotFillResponse[]}
   * 
   * Generated from: GET /api/v1/brokers/data/positions/lots/{lot_id}/fills
   * @methodId get_position_lot_fills_api_v1_brokers_data_positions_lots__lot_id__fills_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.getPositionLotFills('example');
   * ```
   */
  async getPositionLotFills(lotId: string, connectionId?: string, limit?: number, offset?: number, withEnvelope?: boolean): Promise<PositionLotFillResponse[]> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { lotId, connectionId, limit, offset }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions/lots/{lot_id}/fills', { lotId, connectionId, limit, offset }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Position Lot Fills', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/data/positions/lots/{lot_id}/fills',
      lotId: lotId,
      connectionId: connectionId,
      limit: limit,
      offset: offset,
      action: 'getPositionLotFills'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getPositionLotFillsApiV1BrokersDataPositionsLotsLotIdFillsGet({ lotId: lotId, ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Canonical unwrap: AxiosResponse.data.data or Pydantic-like data
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      const result = (responseData as any).data;
      
      if (withEnvelope === true) {
        const warnings = (responseData as any).warnings;
        const meta = (responseData as any).meta;
        const envelope: any = { data: result };
        if (Array.isArray(warnings)) envelope.warnings = warnings;
        if (meta) envelope.meta = meta;
        return envelope;
      }
      
      const finalResult = result;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions/lots/{lot_id}/fills', { lotId, connectionId, limit, offset }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Position Lot Fills completed', {
        request_id: requestId,
        action: 'getPositionLotFills'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Position Lot Fills failed', error, {
        request_id: requestId,
        action: 'getPositionLotFills'
      });
      
      throw this._handleError(error, requestId);
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

   * @param body {any}
   * @param connectionId {string}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {OrderActionResult}
   * 
   * Generated from: POST /api/v1/brokers/orders
   * @methodId place_order_api_v1_brokers_orders_post
   * @category brokers
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.placeOrder();
   * ```
   */
  async placeOrder(body?: any, connectionId?: string, withEnvelope?: boolean): Promise<OrderActionResult> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { body, connectionId }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('POST', '/api/v1/brokers/orders', { body, connectionId }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Place Order', {
      request_id: requestId,
      method: 'POST',
      path: '/api/v1/brokers/orders',
      body: body,
      connectionId: connectionId,
      action: 'placeOrder'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.placeOrderApiV1BrokersOrdersPost({ ...(body !== undefined ? { body: body } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Canonical unwrap: AxiosResponse.data.data or Pydantic-like data
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      const result = (responseData as any).data;
      
      if (withEnvelope === true) {
        const warnings = (responseData as any).warnings;
        const meta = (responseData as any).meta;
        const envelope: any = { data: result };
        if (Array.isArray(warnings)) envelope.warnings = warnings;
        if (meta) envelope.meta = meta;
        return envelope;
      }
      
      const finalResult = result;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('POST', '/api/v1/brokers/orders', { body, connectionId }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Place Order completed', {
        request_id: requestId,
        action: 'placeOrder'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Place Order failed', error, {
        request_id: requestId,
        action: 'placeOrder'
      });
      
      throw this._handleError(error, requestId);
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

   * @param orderId {string}
   * @param body {any}
   * @param accountNumber {string}
   * @param connectionId {string}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {OrderActionResult}
   * 
   * Generated from: DELETE /api/v1/brokers/orders/{order_id}
   * @methodId cancel_order_api_v1_brokers_orders__order_id__delete
   * @category brokers
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.cancelOrder('example');
   * ```
   */
  async cancelOrder(orderId: string, body?: any, accountNumber?: string, connectionId?: string, withEnvelope?: boolean): Promise<OrderActionResult> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { orderId, body, accountNumber, connectionId }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('DELETE', '/api/v1/brokers/orders/{order_id}', { orderId, body, accountNumber, connectionId }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Cancel Order', {
      request_id: requestId,
      method: 'DELETE',
      path: '/api/v1/brokers/orders/{order_id}',
      orderId: orderId,
      body: body,
      accountNumber: accountNumber,
      connectionId: connectionId,
      action: 'cancelOrder'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.cancelOrderApiV1BrokersOrdersOrderIdDelete({ orderId: orderId, ...(body !== undefined ? { body: body } : {}), ...(accountNumber !== undefined ? { accountNumber: accountNumber } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Canonical unwrap: AxiosResponse.data.data or Pydantic-like data
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      const result = (responseData as any).data;
      
      if (withEnvelope === true) {
        const warnings = (responseData as any).warnings;
        const meta = (responseData as any).meta;
        const envelope: any = { data: result };
        if (Array.isArray(warnings)) envelope.warnings = warnings;
        if (meta) envelope.meta = meta;
        return envelope;
      }
      
      const finalResult = result;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('DELETE', '/api/v1/brokers/orders/{order_id}', { orderId, body, accountNumber, connectionId }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Cancel Order completed', {
        request_id: requestId,
        action: 'cancelOrder'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Cancel Order failed', error, {
        request_id: requestId,
        action: 'cancelOrder'
      });
      
      throw this._handleError(error, requestId);
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

   * @param orderId {string}
   * @param body {any}
   * @param accountNumber {string}
   * @param connectionId {string}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {OrderActionResult}
   * 
   * Generated from: PATCH /api/v1/brokers/orders/{order_id}
   * @methodId modify_order_api_v1_brokers_orders__order_id__patch
   * @category brokers
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.modifyOrder('example');
   * ```
   */
  async modifyOrder(orderId: string, body?: any, accountNumber?: string, connectionId?: string, withEnvelope?: boolean): Promise<OrderActionResult> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { orderId, body, accountNumber, connectionId }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('PATCH', '/api/v1/brokers/orders/{order_id}', { orderId, body, accountNumber, connectionId }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Modify Order', {
      request_id: requestId,
      method: 'PATCH',
      path: '/api/v1/brokers/orders/{order_id}',
      orderId: orderId,
      body: body,
      accountNumber: accountNumber,
      connectionId: connectionId,
      action: 'modifyOrder'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.modifyOrderApiV1BrokersOrdersOrderIdPatch({ orderId: orderId, ...(body !== undefined ? { body: body } : {}), ...(accountNumber !== undefined ? { accountNumber: accountNumber } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Canonical unwrap: AxiosResponse.data.data or Pydantic-like data
      const responseData = (response && typeof response === 'object' && 'data' in response) ? (response as any).data : response;
      if (!(responseData && typeof responseData === 'object' && 'data' in responseData)) {
        throw new Error('Unexpected response shape: missing data');
      }
      const result = (responseData as any).data;
      
      if (withEnvelope === true) {
        const warnings = (responseData as any).warnings;
        const meta = (responseData as any).meta;
        const envelope: any = { data: result };
        if (Array.isArray(warnings)) envelope.warnings = warnings;
        if (meta) envelope.meta = meta;
        return envelope;
      }
      
      const finalResult = result;
      
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('PATCH', '/api/v1/brokers/orders/{order_id}', { orderId, body, accountNumber, connectionId }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Modify Order completed', {
        request_id: requestId,
        action: 'modifyOrder'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Modify Order failed', error, {
        request_id: requestId,
        action: 'modifyOrder'
      });
      
      throw this._handleError(error, requestId);
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

}
