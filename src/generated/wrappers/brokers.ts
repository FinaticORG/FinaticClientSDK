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
import type { BrokerConnectionRequest } from '../models';
import type { BrokerConnectionUpdateRequest } from '../models';
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
   *    * Get all available brokers.
   * 
   * This is a fast operation that returns a cached list of available brokers.
   * The list is loaded once at startup and never changes during runtime.
   * 
   * Returns
   * -------
   * FinaticResponse[list[BrokerInfo]]
   *     list of available brokers with their metadata.
   * 
   * Generated from: GET /api/v1/brokers/
   */
  async getBrokers(): Promise<any[]> {
    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, {  }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
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
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.getBrokersApiV1BrokersGet({ headers: { 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/', {  }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Get Brokers completed', {
        request_id: requestId,
        action: 'getBrokers'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
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
   * Connect Broker
   * 
   *    * Connect to a broker or reconnect to an existing connection.
   * 
   * This endpoint handles both new connections and reconnections:
   * - New connections: Provide broker_id, credentials, and permissions
   * - Reconnections: Provide connection_id, broker_id, credentials, and permissions
   * 
   * For reconnections, the connection must be in "needs_reauth" status.
   * 
   * Generated from: POST /api/v1/brokers/connect
   */
  async connectBroker(body: BrokerConnectionRequest): Promise<any> {
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
      // validateParams(validationSchema, { body }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('POST', '/api/v1/brokers/connect', { body }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Connect Broker', {
      request_id: requestId,
      method: 'POST',
      path: '/api/v1/brokers/connect',
      body: body,
      action: 'connectBroker'
    });

    try {
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.connectBrokerApiV1BrokersConnectPost({ brokerConnectionRequest: body,  }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('POST', '/api/v1/brokers/connect', { body }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Connect Broker completed', {
        request_id: requestId,
        action: 'connectBroker'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
      this.logger.error('Connect Broker failed', error, {
        request_id: requestId,
        action: 'connectBroker'
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
   *    * List all broker connections for the current user.
   * 
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns connections that the user has any permissions for.
   * 
   * Generated from: GET /api/v1/brokers/connections
   */
  async listBrokerConnections(): Promise<any[]> {
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
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
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
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.listBrokerConnectionsApiV1BrokersConnectionsGet({ headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/connections', {  }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('List Broker Connections completed', {
        request_id: requestId,
        action: 'listBrokerConnections'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
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
   * Update Connection
   * 
   *    * Update a broker connection's permissions.
   * 
   * Generated from: PUT /api/v1/brokers/connections/{connection_id}
   */
  async updateConnection(connectionId: string, body: BrokerConnectionUpdateRequest): Promise<UserBrokerConnections> {
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
      // validateParams(validationSchema, { connectionId, body }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('PUT', '/api/v1/brokers/connections/{connection_id}', { connectionId, body }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Update Connection', {
      request_id: requestId,
      method: 'PUT',
      path: '/api/v1/brokers/connections/{connection_id}',
      connectionId: connectionId,
      body: body,
      action: 'updateConnection'
    });

    try {
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.updateConnectionApiV1BrokersConnectionsConnectionIdPut({ connectionId: connectionId, brokerConnectionUpdateRequest: body,  }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('PUT', '/api/v1/brokers/connections/{connection_id}', { connectionId, body }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Update Connection completed', {
        request_id: requestId,
        action: 'updateConnection'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
      this.logger.error('Update Connection failed', error, {
        request_id: requestId,
        action: 'updateConnection'
      });
      
      throw this._handleError(error, requestId);
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Delete Connection
   * 
   *    * Delete a broker connection.
   * 
   * Generated from: DELETE /api/v1/brokers/connections/{connection_id}
   */
  async deleteConnection(connectionId: string): Promise<any> {
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
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('DELETE', '/api/v1/brokers/connections/{connection_id}', { connectionId }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Delete Connection', {
      request_id: requestId,
      method: 'DELETE',
      path: '/api/v1/brokers/connections/{connection_id}',
      connectionId: connectionId,
      action: 'deleteConnection'
    });

    try {
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.deleteConnectionApiV1BrokersConnectionsConnectionIdDelete({ connectionId: connectionId,  }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('DELETE', '/api/v1/brokers/connections/{connection_id}', { connectionId }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Delete Connection completed', {
        request_id: requestId,
        action: 'deleteConnection'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
      this.logger.error('Delete Connection failed', error, {
        request_id: requestId,
        action: 'deleteConnection'
      });
      
      throw this._handleError(error, requestId);
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Disconnect Broker
   * 
   *    * Disconnect a broker connection.
   * 
   * Generated from: DELETE /api/v1/brokers/disconnect/{connection_id}
   */
  async disconnectBroker(connectionId: string): Promise<any> {
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
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('DELETE', '/api/v1/brokers/disconnect/{connection_id}', { connectionId }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Disconnect Broker', {
      request_id: requestId,
      method: 'DELETE',
      path: '/api/v1/brokers/disconnect/{connection_id}',
      connectionId: connectionId,
      action: 'disconnectBroker'
    });

    try {
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.disconnectBrokerApiV1BrokersDisconnectConnectionIdDelete({ connectionId: connectionId,  }, { headers: { 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('DELETE', '/api/v1/brokers/disconnect/{connection_id}', { connectionId }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Disconnect Broker completed', {
        request_id: requestId,
        action: 'disconnectBroker'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
      this.logger.error('Disconnect Broker failed', error, {
        request_id: requestId,
        action: 'disconnectBroker'
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
   *    * Remove a company's access to a broker connection.
   * 
   * If the company is the only one with access, the entire connection is deleted.
   * If other companies have access, only the company's access is removed.
   * 
   * Generated from: DELETE /api/v1/brokers/disconnect-company/{connection_id}
   */
  async disconnectCompanyFromBroker(connectionId: string): Promise<any> {
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
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
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
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.disconnectCompanyFromBrokerApiV1BrokersDisconnectCompanyConnectionIdDelete({ connectionId: connectionId,  }, { headers: { 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('DELETE', '/api/v1/brokers/disconnect-company/{connection_id}', { connectionId }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Disconnect Company From Broker completed', {
        request_id: requestId,
        action: 'disconnectCompanyFromBroker'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
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
   *    * Get orders for all authorized broker connections.
   * 
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns orders from connections the company has read access to.
   * 
   * Generated from: GET /api/v1/brokers/data/orders
   */
  async getOrders(brokerId?: any, connectionId?: any, accountId?: any, symbol?: any, orderStatus?: any, side?: any, assetType?: any, limit?: number, offset?: number, createdAfter?: any, createdBefore?: any, withMetadata?: boolean): Promise<any[]> {
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
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
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
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.getOrdersApiV1BrokersDataOrdersGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountId !== undefined ? { accountId: accountId } : {}), ...(symbol !== undefined ? { symbol: symbol } : {}), ...(orderStatus !== undefined ? { orderStatus: orderStatus } : {}), ...(side !== undefined ? { side: side } : {}), ...(assetType !== undefined ? { assetType: assetType } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(createdAfter !== undefined ? { createdAfter: createdAfter } : {}), ...(createdBefore !== undefined ? { createdBefore: createdBefore } : {}), ...(withMetadata !== undefined ? { withMetadata: withMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      // Transform to metadata structure if withMetadata is true
      let finalResult = result;
      if (withMetadata === true) {
        // If result has response_data (snake_case from API), transform it
        if (result && typeof result === 'object' && 'response_data' in result) {
          const dataArray = Array.isArray(result.response_data) ? result.response_data : [];
          const metadata: any = {};
          
          // Extract pagination if present
          if (result.pagination && typeof result.pagination === 'object') {
            metadata.pagination = result.pagination;
            if (result.pagination.has_more !== undefined) {
              metadata.has_more = result.pagination.has_more;
            }
          }
          
          // Extract warnings if present
          if (result.warnings && Array.isArray(result.warnings)) {
            metadata.warnings = result.warnings;
          }
          
          // Extract errors if present
          if (result.errors && Array.isArray(result.errors)) {
            metadata.errors = result.errors;
          }
          
          this.logger.debug('getOrders returning metadata structure from response_data', {
            data_length: dataArray.length,
            has_pagination: !!metadata.pagination,
            has_warnings: !!metadata.warnings,
            has_errors: !!metadata.errors,
          });
          
          finalResult = { data: dataArray, metadata };
        } else if (result && typeof result === 'object' && 'data' in result && 'metadata' in result && Array.isArray(result.data)) {
          // If result already has data and metadata structure, return as-is
          this.logger.debug('getOrders returning metadata structure from unwrapped result', {
            data_length: result.data?.length,
            has_metadata: !!result.metadata,
          });
          finalResult = result;
        } else {
          // Otherwise, return array (or empty array if not an array)
          finalResult = Array.isArray(result) ? result : [];
          this.logger.debug('getOrders returning array (no metadata structure found)', {
            array_length: finalResult.length,
            result_type: typeof result,
            result_keys: result && typeof result === 'object' ? Object.keys(result) : [],
          });
        }
      } else {
        // If withMetadata is false or undefined, return array (or empty array if not an array)
        finalResult = Array.isArray(result) ? result : [];
      }
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders', { brokerId, connectionId, accountId, symbol, orderStatus, side, assetType, limit, offset, createdAfter, createdBefore, withMetadata }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Get Orders completed', {
        request_id: requestId,
        action: 'getOrders'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
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
   *    * Get positions for all authorized broker connections.
   * 
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns positions from connections the company has read access to.
   * 
   * Generated from: GET /api/v1/brokers/data/positions
   */
  async getPositions(brokerId?: any, connectionId?: any, accountId?: any, symbol?: any, side?: any, assetType?: any, positionStatus?: any, limit?: number, offset?: number, updatedAfter?: any, updatedBefore?: any, withMetadata?: boolean): Promise<any[]> {
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
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
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
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.getPositionsApiV1BrokersDataPositionsGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountId !== undefined ? { accountId: accountId } : {}), ...(symbol !== undefined ? { symbol: symbol } : {}), ...(side !== undefined ? { side: side } : {}), ...(assetType !== undefined ? { assetType: assetType } : {}), ...(positionStatus !== undefined ? { positionStatus: positionStatus } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(updatedAfter !== undefined ? { updatedAfter: updatedAfter } : {}), ...(updatedBefore !== undefined ? { updatedBefore: updatedBefore } : {}), ...(withMetadata !== undefined ? { withMetadata: withMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      // Transform to metadata structure if withMetadata is true
      let finalResult = result;
      if (withMetadata === true) {
        // If result has response_data (snake_case from API), transform it
        if (result && typeof result === 'object' && 'response_data' in result) {
          const dataArray = Array.isArray(result.response_data) ? result.response_data : [];
          const metadata: any = {};
          
          // Extract pagination if present
          if (result.pagination && typeof result.pagination === 'object') {
            metadata.pagination = result.pagination;
            if (result.pagination.has_more !== undefined) {
              metadata.has_more = result.pagination.has_more;
            }
          }
          
          // Extract warnings if present
          if (result.warnings && Array.isArray(result.warnings)) {
            metadata.warnings = result.warnings;
          }
          
          // Extract errors if present
          if (result.errors && Array.isArray(result.errors)) {
            metadata.errors = result.errors;
          }
          
          this.logger.debug('getPositions returning metadata structure from response_data', {
            data_length: dataArray.length,
            has_pagination: !!metadata.pagination,
            has_warnings: !!metadata.warnings,
            has_errors: !!metadata.errors,
          });
          
          finalResult = { data: dataArray, metadata };
        } else if (result && typeof result === 'object' && 'data' in result && 'metadata' in result && Array.isArray(result.data)) {
          // If result already has data and metadata structure, return as-is
          this.logger.debug('getPositions returning metadata structure from unwrapped result', {
            data_length: result.data?.length,
            has_metadata: !!result.metadata,
          });
          finalResult = result;
        } else {
          // Otherwise, return array (or empty array if not an array)
          finalResult = Array.isArray(result) ? result : [];
          this.logger.debug('getPositions returning array (no metadata structure found)', {
            array_length: finalResult.length,
            result_type: typeof result,
            result_keys: result && typeof result === 'object' ? Object.keys(result) : [],
          });
        }
      } else {
        // If withMetadata is false or undefined, return array (or empty array if not an array)
        finalResult = Array.isArray(result) ? result : [];
      }
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions', { brokerId, connectionId, accountId, symbol, side, assetType, positionStatus, limit, offset, updatedAfter, updatedBefore, withMetadata }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Get Positions completed', {
        request_id: requestId,
        action: 'getPositions'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
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
   *    * Get balances for all authorized broker connections.
   * 
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns balances from connections the company has read access to.
   * 
   * Generated from: GET /api/v1/brokers/data/balances
   */
  async getBalances(brokerId?: any, connectionId?: any, accountId?: any, isEndOfDaySnapshot?: any, limit?: number, offset?: number, balanceCreatedAfter?: any, balanceCreatedBefore?: any, withMetadata?: boolean): Promise<any[]> {
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
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
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
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.getBalancesApiV1BrokersDataBalancesGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountId !== undefined ? { accountId: accountId } : {}), ...(isEndOfDaySnapshot !== undefined ? { isEndOfDaySnapshot: isEndOfDaySnapshot } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(balanceCreatedAfter !== undefined ? { balanceCreatedAfter: balanceCreatedAfter } : {}), ...(balanceCreatedBefore !== undefined ? { balanceCreatedBefore: balanceCreatedBefore } : {}), ...(withMetadata !== undefined ? { withMetadata: withMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      // Transform to metadata structure if withMetadata is true
      let finalResult = result;
      if (withMetadata === true) {
        // If result has response_data (snake_case from API), transform it
        if (result && typeof result === 'object' && 'response_data' in result) {
          const dataArray = Array.isArray(result.response_data) ? result.response_data : [];
          const metadata: any = {};
          
          // Extract pagination if present
          if (result.pagination && typeof result.pagination === 'object') {
            metadata.pagination = result.pagination;
            if (result.pagination.has_more !== undefined) {
              metadata.has_more = result.pagination.has_more;
            }
          }
          
          // Extract warnings if present
          if (result.warnings && Array.isArray(result.warnings)) {
            metadata.warnings = result.warnings;
          }
          
          // Extract errors if present
          if (result.errors && Array.isArray(result.errors)) {
            metadata.errors = result.errors;
          }
          
          this.logger.debug('getBalances returning metadata structure from response_data', {
            data_length: dataArray.length,
            has_pagination: !!metadata.pagination,
            has_warnings: !!metadata.warnings,
            has_errors: !!metadata.errors,
          });
          
          finalResult = { data: dataArray, metadata };
        } else if (result && typeof result === 'object' && 'data' in result && 'metadata' in result && Array.isArray(result.data)) {
          // If result already has data and metadata structure, return as-is
          this.logger.debug('getBalances returning metadata structure from unwrapped result', {
            data_length: result.data?.length,
            has_metadata: !!result.metadata,
          });
          finalResult = result;
        } else {
          // Otherwise, return array (or empty array if not an array)
          finalResult = Array.isArray(result) ? result : [];
          this.logger.debug('getBalances returning array (no metadata structure found)', {
            array_length: finalResult.length,
            result_type: typeof result,
            result_keys: result && typeof result === 'object' ? Object.keys(result) : [],
          });
        }
      } else {
        // If withMetadata is false or undefined, return array (or empty array if not an array)
        finalResult = Array.isArray(result) ? result : [];
      }
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/balances', { brokerId, connectionId, accountId, isEndOfDaySnapshot, limit, offset, balanceCreatedAfter, balanceCreatedBefore, withMetadata }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Get Balances completed', {
        request_id: requestId,
        action: 'getBalances'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
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
   *    * Get accounts for all authorized broker connections.
   * 
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns accounts from connections the company has read access to.
   * 
   * Generated from: GET /api/v1/brokers/data/accounts
   */
  async getAccounts(brokerId?: any, connectionId?: any, accountType?: any, status?: any, currency?: any, limit?: number, offset?: number, withMetadata?: any): Promise<any[]> {
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
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
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
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.getAccountsApiV1BrokersDataAccountsGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountType !== undefined ? { accountType: accountType } : {}), ...(status !== undefined ? { status: status } : {}), ...(currency !== undefined ? { currency: currency } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(withMetadata !== undefined ? { withMetadata: withMetadata } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      // Transform to metadata structure if withMetadata is true
      let finalResult = result;
      if (withMetadata === true) {
        // If result has response_data (snake_case from API), transform it
        if (result && typeof result === 'object' && 'response_data' in result) {
          const dataArray = Array.isArray(result.response_data) ? result.response_data : [];
          const metadata: any = {};
          
          // Extract pagination if present
          if (result.pagination && typeof result.pagination === 'object') {
            metadata.pagination = result.pagination;
            if (result.pagination.has_more !== undefined) {
              metadata.has_more = result.pagination.has_more;
            }
          }
          
          // Extract warnings if present
          if (result.warnings && Array.isArray(result.warnings)) {
            metadata.warnings = result.warnings;
          }
          
          // Extract errors if present
          if (result.errors && Array.isArray(result.errors)) {
            metadata.errors = result.errors;
          }
          
          this.logger.debug('getAccounts returning metadata structure from response_data', {
            data_length: dataArray.length,
            has_pagination: !!metadata.pagination,
            has_warnings: !!metadata.warnings,
            has_errors: !!metadata.errors,
          });
          
          finalResult = { data: dataArray, metadata };
        } else if (result && typeof result === 'object' && 'data' in result && 'metadata' in result && Array.isArray(result.data)) {
          // If result already has data and metadata structure, return as-is
          this.logger.debug('getAccounts returning metadata structure from unwrapped result', {
            data_length: result.data?.length,
            has_metadata: !!result.metadata,
          });
          finalResult = result;
        } else {
          // Otherwise, return array (or empty array if not an array)
          finalResult = Array.isArray(result) ? result : [];
          this.logger.debug('getAccounts returning array (no metadata structure found)', {
            array_length: finalResult.length,
            result_type: typeof result,
            result_keys: result && typeof result === 'object' ? Object.keys(result) : [],
          });
        }
      } else {
        // If withMetadata is false or undefined, return array (or empty array if not an array)
        finalResult = Array.isArray(result) ? result : [];
      }
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/accounts', { brokerId, connectionId, accountType, status, currency, limit, offset, withMetadata }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Get Accounts completed', {
        request_id: requestId,
        action: 'getAccounts'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
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
   *    * Get order fills for a specific order.
   * 
   * This endpoint returns all execution fills for the specified order.
   * 
   * Generated from: GET /api/v1/brokers/data/orders/{order_id}/fills
   */
  async getOrderFills(orderId: string, connectionId?: any, limit?: number, offset?: number): Promise<any[]> {
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
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
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
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.getOrderFillsApiV1BrokersDataOrdersOrderIdFillsGet({ orderId: orderId, ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/{order_id}/fills', { orderId, connectionId, limit, offset }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Get Order Fills completed', {
        request_id: requestId,
        action: 'getOrderFills'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
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
   *    * Get order events for a specific order.
   * 
   * This endpoint returns all lifecycle events for the specified order.
   * 
   * Generated from: GET /api/v1/brokers/data/orders/{order_id}/events
   */
  async getOrderEvents(orderId: string, connectionId?: any, limit?: number, offset?: number): Promise<any[]> {
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
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
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
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.getOrderEventsApiV1BrokersDataOrdersOrderIdEventsGet({ orderId: orderId, ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/{order_id}/events', { orderId, connectionId, limit, offset }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Get Order Events completed', {
        request_id: requestId,
        action: 'getOrderEvents'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
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
   *    * Get order groups.
   * 
   * This endpoint returns order groups that contain multiple orders.
   * 
   * Generated from: GET /api/v1/brokers/data/orders/groups
   */
  async getOrderGroups(brokerId?: any, connectionId?: any, limit?: number, offset?: number, createdAfter?: any, createdBefore?: any): Promise<any[]> {
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
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
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
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.getOrderGroupsApiV1BrokersDataOrdersGroupsGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}), ...(createdAfter !== undefined ? { createdAfter: createdAfter } : {}), ...(createdBefore !== undefined ? { createdBefore: createdBefore } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/orders/groups', { brokerId, connectionId, limit, offset, createdAfter, createdBefore }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Get Order Groups completed', {
        request_id: requestId,
        action: 'getOrderGroups'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
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
   *    * Get position lots (tax lots for positions).
   * 
   * This endpoint returns tax lots for positions, which are used for tax reporting.
   * Each lot tracks when a position was opened/closed and at what prices.
   * 
   * Generated from: GET /api/v1/brokers/data/positions/lots
   */
  async getPositionLots(brokerId?: any, connectionId?: any, accountId?: any, symbol?: any, positionId?: any, limit?: number, offset?: number): Promise<any[]> {
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
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
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
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.getPositionLotsApiV1BrokersDataPositionsLotsGet({ ...(brokerId !== undefined ? { brokerId: brokerId } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(accountId !== undefined ? { accountId: accountId } : {}), ...(symbol !== undefined ? { symbol: symbol } : {}), ...(positionId !== undefined ? { positionId: positionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions/lots', { brokerId, connectionId, accountId, symbol, positionId, limit, offset }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Get Position Lots completed', {
        request_id: requestId,
        action: 'getPositionLots'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
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
   *    * Get position lot fills for a specific lot.
   * 
   * This endpoint returns all fills associated with a specific position lot.
   * 
   * Generated from: GET /api/v1/brokers/data/positions/lots/{lot_id}/fills
   */
  async getPositionLotFills(lotId: string, connectionId?: any, limit?: number, offset?: number): Promise<any[]> {
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
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
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
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.getPositionLotFillsApiV1BrokersDataPositionsLotsLotIdFillsGet({ lotId: lotId, ...(connectionId !== undefined ? { connectionId: connectionId } : {}), ...(limit !== undefined ? { limit: limit } : {}), ...(offset !== undefined ? { offset: offset } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/data/positions/lots/{lot_id}/fills', { lotId, connectionId, limit, offset }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Get Position Lot Fills completed', {
        request_id: requestId,
        action: 'getPositionLotFills'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
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
   * Sandbox Callback
   * 
   *    * Handle sandbox authentication callback.
   * 
   * This endpoint handles the completion of sandbox authentication flows.
   * It creates sandbox connections with mock data instead of real broker connections.
   * 
   * Generated from: GET /api/v1/brokers/sandbox-callback/{broker_id}
   */
  async sandboxCallback(brokerId: string): Promise<any> {
    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { brokerId }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/sandbox-callback/{broker_id}', { brokerId }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Sandbox Callback', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/sandbox-callback/{broker_id}',
      brokerId: brokerId,
      action: 'sandboxCallback'
    });

    try {
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.sandboxCallbackApiV1BrokersSandboxCallbackBrokerIdGet({ brokerId: brokerId,  }, { headers: { 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/sandbox-callback/{broker_id}', { brokerId }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Sandbox Callback completed', {
        request_id: requestId,
        action: 'sandboxCallback'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
      this.logger.error('Sandbox Callback failed', error, {
        request_id: requestId,
        action: 'sandboxCallback'
      });
      
      throw this._handleError(error, requestId);
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Oauth Callback Tastytrade
   * 
   *    * Handle OAuth callback for TastyTrade sandbox authentication.
   * 
   * This endpoint serves as the redirect URI for TastyTrade OAuth flows in sandbox mode.
   * It captures all query parameters from the callback URL and completes the authentication
   * process with TastyTrade. All authentication data is passed via URL query parameters
   * as per OAuth 2.0 specification.
   * 
   * Parameters
   * ----------
   * request : Request
   *     FastAPI request object containing the callback URL with OAuth parameters
   * 
   * Returns
   * -------
   * HTMLResponse
   *     Returns HTML that closes the popup and notifies the parent window
   * 
   * Generated from: GET /api/v1/brokers/callback/tastytrade
   */
  async oauthCallbackTastytrade(): Promise<any> {
    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, {  }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/callback/tastytrade', {  }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Oauth Callback Tastytrade', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/callback/tastytrade',
      action: 'oauthCallbackTastytrade'
    });

    try {
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.oauthCallbackTastytradeApiV1BrokersCallbackTastytradeGet({ headers: { 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/callback/tastytrade', {  }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Oauth Callback Tastytrade completed', {
        request_id: requestId,
        action: 'oauthCallbackTastytrade'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
      this.logger.error('Oauth Callback Tastytrade failed', error, {
        request_id: requestId,
        action: 'oauthCallbackTastytrade'
      });
      
      throw this._handleError(error, requestId);
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Oauth Callback
   * 
   *    * Handle OAuth callback for broker authentication.
   * 
   * This endpoint serves as the redirect URI for OAuth flows. It captures
   * all query parameters from the callback URL and completes the authentication
   * process with the specified broker. All authentication data is passed via
   * URL query parameters as per OAuth 2.0 specification.
   * 
   * Parameters
   * ----------
   * broker_id : str
   *     The ID of the broker handling the OAuth callback
   * request : Request
   *     FastAPI request object containing the callback URL with OAuth parameters
   * 
   * Returns
   * -------
   * HTMLResponse
   *     Returns HTML that closes the popup and notifies the parent window
   * 
   * Generated from: GET /api/v1/brokers/callback/{broker_id}
   */
  async oauthCallback(brokerId: string): Promise<any> {
    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { brokerId }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/brokers/callback/{broker_id}', { brokerId }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Oauth Callback', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/brokers/callback/{broker_id}',
      brokerId: brokerId,
      action: 'oauthCallback'
    });

    try {
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.oauthCallbackApiV1BrokersCallbackBrokerIdGet({ brokerId: brokerId,  }, { headers: { 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/brokers/callback/{broker_id}', { brokerId }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Oauth Callback completed', {
        request_id: requestId,
        action: 'oauthCallback'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
      this.logger.error('Oauth Callback failed', error, {
        request_id: requestId,
        action: 'oauthCallback'
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
   *    * Create a new order via the specified broker connection.
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
   * 
   * Generated from: POST /api/v1/brokers/orders
   */
  async placeOrder(body?: any, connectionId?: any): Promise<any> {
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
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
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
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.placeOrderApiV1BrokersOrdersPost({ ...(body !== undefined ? { body: body } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('POST', '/api/v1/brokers/orders', { body, connectionId }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Place Order completed', {
        request_id: requestId,
        action: 'placeOrder'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
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
   *    * Cancel an existing order.
   * 
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Requires trading permissions for the company.
   * 
   * Generated from: DELETE /api/v1/brokers/orders/{order_id}
   */
  async cancelOrder(orderId: string, body?: any, accountNumber?: any, connectionId?: any): Promise<any> {
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
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
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
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.cancelOrderApiV1BrokersOrdersOrderIdDelete({ orderId: orderId, ...(body !== undefined ? { body: body } : {}), ...(accountNumber !== undefined ? { accountNumber: accountNumber } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('DELETE', '/api/v1/brokers/orders/{order_id}', { orderId, body, accountNumber, connectionId }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Cancel Order completed', {
        request_id: requestId,
        action: 'cancelOrder'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
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
   *    * Modify an existing order.
   * 
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Requires trading permissions for the company.
   * 
   * Generated from: PATCH /api/v1/brokers/orders/{order_id}
   */
  async modifyOrder(orderId: string, body?: any, accountNumber?: any, connectionId?: any): Promise<any> {
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
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
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
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.modifyOrderApiV1BrokersOrdersOrderIdPatch({ orderId: orderId, ...(body !== undefined ? { body: body } : {}), ...(accountNumber !== undefined ? { accountNumber: accountNumber } : {}), ...(connectionId !== undefined ? { connectionId: connectionId } : {}) }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      const result = (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data)
        ? response.data.data  // FinaticResponse wrapper: { data: { data: ... } }
        : (response && typeof response === 'object' && 'data' in response)
        ? response.data       // Axios-style wrapper: { data: ... }
        : response;           // Direct response
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('PATCH', '/api/v1/brokers/orders/{order_id}', { orderId, body, accountNumber, connectionId }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Modify Order completed', {
        request_id: requestId,
        action: 'modifyOrder'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
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
