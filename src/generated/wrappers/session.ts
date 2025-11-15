/**
 * Generated wrapper functions for session operations (Phase 2A).
 * 
 * This file is regenerated on each run - do not edit directly.
 * For custom logic, edit src/custom/wrappers/session.ts instead.
 */

import { SessionApi } from '../api/session-api';
import type { Configuration } from '../configuration';
import type { SdkConfig } from '../config';
import { generateRequestId } from '../utils/request-id';
import { retryApiCall } from '../utils/retry';
import { getLogger, type Logger } from '../utils/logger';
import { handleError } from '../utils/error-handling';
import { getCache, generateCacheKey } from '../utils/cache';
import { applyRequestInterceptors, applyResponseInterceptors, applyErrorInterceptors } from '../utils/interceptors';
import type { DirectAuthRequest } from '../models';
import type { FinaticapiApiV1RoutersSessionSessionRouterTestWebhookRequest } from '../models';
import type { PortalUrlResponse } from '../models';
import type { SessionLinkRequest } from '../models';
import type { SessionResponseData } from '../models';
import type { SessionStartRequest } from '../models';
import type { SessionUserResponse } from '../models';
import type { TestWebhookResponse } from '../models';
import type { TokenData } from '../models';
import type { TokenResponseData } from '../models';


/**
 * Session wrapper functions.
 * Provides simplified method names and response unwrapping.
 */
export class SessionWrapper {
  protected api: SessionApi;
  protected config?: Configuration;
  protected sdkConfig?: SdkConfig;
  protected logger: Logger;
  protected sessionId?: string;
  protected companyId?: string;
  protected csrfToken?: string;

  constructor(api: SessionApi, config?: Configuration, sdkConfig?: SdkConfig) {
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
   * Init Session
   * 
   *    * Initialize a new session with company API key.
   * 
   * Generated from: POST /api/v1/session/init
   */
  async initSession(xApiKey: string): Promise<TokenResponseData> {
    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { xApiKey }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('POST', '/api/v1/session/init', { xApiKey }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Init Session', {
      request_id: requestId,
      method: 'POST',
      path: '/api/v1/session/init',
      xApiKey: xApiKey,
      action: 'initSession'
    });

    try {
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.initSessionApiV1SessionInitPost({ xApiKey: xApiKey }, { headers: { 'x-request-id': requestId } });
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
        const cacheKey = generateCacheKey('POST', '/api/v1/session/init', { xApiKey }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Init Session completed', {
        request_id: requestId,
        action: 'initSession'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
      this.logger.error('Init Session failed', error, {
        request_id: requestId,
        action: 'initSession'
      });
      
      throw this._handleError(error, requestId);
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Start Session
   * 
   *    * Start a session with a one-time token.
   * 
   * Generated from: POST /api/v1/session/start
   */
  async startSession(OneTimeToken: string, body: SessionStartRequest): Promise<SessionResponseData> {
    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { OneTimeToken, body }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('POST', '/api/v1/session/start', { OneTimeToken, body }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Start Session', {
      request_id: requestId,
      method: 'POST',
      path: '/api/v1/session/start',
      OneTimeToken: OneTimeToken,
      body: body,
      action: 'startSession'
    });

    try {
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.startSessionApiV1SessionStartPost({ oneTimeToken: OneTimeToken, sessionStartRequest: body }, { headers: { 'x-request-id': requestId } });
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
        const cacheKey = generateCacheKey('POST', '/api/v1/session/start', { OneTimeToken, body }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Start Session completed', {
        request_id: requestId,
        action: 'startSession'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
      this.logger.error('Start Session failed', error, {
        request_id: requestId,
        action: 'startSession'
      });
      
      throw this._handleError(error, requestId);
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Get Portal Url
   * 
   *    * Get a portal URL with token for a session.
   * 
   * The session must be in ACTIVE or AUTHENTICATING state and the request must come from the same device
   * that initiated the session. Device info is automatically validated from the request.
   * 
   * Generated from: GET /api/v1/session/portal
   */
  async getPortalUrl(): Promise<PortalUrlResponse> {
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
    const shouldCache = !true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/session/portal', {  }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Portal Url', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/session/portal',
      action: 'getPortalUrl'
    });

    try {
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.getPortalUrlApiV1SessionPortalGet({ sessionId: this.sessionId! }, { headers: { 'x-request-id': requestId } });
          const result = apiResponse;
          // Apply response interceptors (Phase 2B)
          return await applyResponseInterceptors(result, this.sdkConfig);
        },
        {},
        this.sdkConfig
      );
      
      // Unwrap FinaticResponse if present, otherwise use response directly
      // OpenAPI generator returns responses directly, but may be wrapped in FinaticResponse
      // Handle multiple response structures from different unwrapping scenarios
      let result;
      if (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'data' in response.data) {
        // FinaticResponse wrapper from axios: { data: { success: true, data: { portal_url: "..." } } }
        result = response.data.data;
      } else if (response && typeof response === 'object' && 'data' in response && response.data && typeof response.data === 'object' && 'portal_url' in response.data) {
        // FinaticResponse already unwrapped: { data: { portal_url: "..." } }
        result = response.data;
      } else if (response && typeof response === 'object' && 'portal_url' in response) {
        // PortalUrlResponse directly: { portal_url: "..." }
        result = response;
      } else if (response && typeof response === 'object' && 'data' in response) {
        // Fallback: { data: ... }
        result = response.data;
      } else {
        // Direct response
        result = response;
      }
      
      // Validate result structure
      if (!result || typeof result !== 'object' || !('portal_url' in result)) {
        throw new Error('Failed to unwrap portal URL response: expected PortalUrlResponse with portal_url property');
      }
      

      const finalResult = result;
      

      // Store in cache (Phase 2B)
      // Portal URLs are single-use tokens - must NOT be cached
      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey('GET', '/api/v1/session/portal', {  }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Get Portal Url completed', {
        request_id: requestId,
        action: 'getPortalUrl'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
      this.logger.error('Get Portal Url failed', error, {
        request_id: requestId,
        action: 'getPortalUrl'
      });
      
      throw this._handleError(error, requestId);
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Get Session User
   * 
   *    * Get user information and fresh tokens for a completed session.
   * 
   * This endpoint is designed for server SDKs to retrieve user information
   * and authentication tokens after successful OTP verification.
   * 
   * 
   * Security:
   * - Requires valid session in ACTIVE state
   * - Validates device fingerprint binding
   * - Generates fresh tokens (not returning stored ones)
   * - Only accessible to authenticated sessions with user_id
   * 
   * Generated from: GET /api/v1/session/{session_id}/user
   */
  async getSessionUser(sessionId: string): Promise<SessionUserResponse> {
    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { sessionId }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('GET', '/api/v1/session/{session_id}/user', { sessionId }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Session User', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/session/{session_id}/user',
      sessionId: sessionId,
      action: 'getSessionUser'
    });

    try {
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.getSessionUserApiV1SessionSessionIdUserGet({ sessionId: sessionId, companyId: this.companyId! }, { headers: { 'x-request-id': requestId } });
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
        const cacheKey = generateCacheKey('GET', '/api/v1/session/{session_id}/user', { sessionId }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Get Session User completed', {
        request_id: requestId,
        action: 'getSessionUser'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
      this.logger.error('Get Session User failed', error, {
        request_id: requestId,
        action: 'getSessionUser'
      });
      
      throw this._handleError(error, requestId);
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Authenticate Session
   * 
   * 
   * 
   * Generated from: POST /api/v1/session/authenticate
   */
  async authenticateSession(body: DirectAuthRequest): Promise<TokenData> {
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
      const cacheKey = generateCacheKey('POST', '/api/v1/session/authenticate', { body }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Authenticate Session', {
      request_id: requestId,
      method: 'POST',
      path: '/api/v1/session/authenticate',
      body: body,
      action: 'authenticateSession'
    });

    try {
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.authenticateSessionApiV1SessionAuthenticatePost({ directAuthRequest: body,  }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
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
        const cacheKey = generateCacheKey('POST', '/api/v1/session/authenticate', { body }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Authenticate Session completed', {
        request_id: requestId,
        action: 'authenticateSession'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
      this.logger.error('Authenticate Session failed', error, {
        request_id: requestId,
        action: 'authenticateSession'
      });
      
      throw this._handleError(error, requestId);
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Refresh Session
   * 
   *    * Refresh an existing session by extending its expiration time.
   * 
   * This endpoint allows users to extend their session before it expires.
   * The session will be extended by the default duration (24 hours).
   * 
   * Generated from: POST /api/v1/session/refresh
   */
  async refreshSession(): Promise<SessionResponseData> {
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
      const cacheKey = generateCacheKey('POST', '/api/v1/session/refresh', {  }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Refresh Session', {
      request_id: requestId,
      method: 'POST',
      path: '/api/v1/session/refresh',
      action: 'refreshSession'
    });

    try {
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.refreshSessionApiV1SessionRefreshPost({ sessionId: this.sessionId!, companyId: this.companyId! }, { headers: { 'x-request-id': requestId } });
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
        const cacheKey = generateCacheKey('POST', '/api/v1/session/refresh', {  }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Refresh Session completed', {
        request_id: requestId,
        action: 'refreshSession'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
      this.logger.error('Refresh Session failed', error, {
        request_id: requestId,
        action: 'refreshSession'
      });
      
      throw this._handleError(error, requestId);
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Test Webhook
   * 
   *    * Send a test webhook for the specified event type to the company's configured endpoints.
   * 
   * Generated from: POST /api/v1/session/webhook/test
   */
  async testWebhook(body: FinaticapiApiV1RoutersSessionSessionRouterTestWebhookRequest): Promise<TestWebhookResponse> {
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
      const cacheKey = generateCacheKey('POST', '/api/v1/session/webhook/test', { body }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Test Webhook', {
      request_id: requestId,
      method: 'POST',
      path: '/api/v1/session/webhook/test',
      body: body,
      action: 'testWebhook'
    });

    try {
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.testWebhookApiV1SessionWebhookTestPost({ finaticapiApiV1RoutersSessionSessionRouterTestWebhookRequest: body,  }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
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
        const cacheKey = generateCacheKey('POST', '/api/v1/session/webhook/test', { body }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Test Webhook completed', {
        request_id: requestId,
        action: 'testWebhook'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
      this.logger.error('Test Webhook failed', error, {
        request_id: requestId,
        action: 'testWebhook'
      });
      
      throw this._handleError(error, requestId);
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Link User To Session
   * 
   *    * Link Supabase user to existing session.
   * 
   * This endpoint is called after successful Supabase OTP authentication
   * to associate the authenticated user with the portal session.
   * 
   * Generated from: POST /api/v1/session/link-user
   */
  async linkUserToSession(body: SessionLinkRequest, sessionId: string): Promise<any> {
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
      // validateParams(validationSchema, { body, sessionId }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    // Portal URLs are single-use tokens - must NOT be cached
    const shouldCache = !false;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('POST', '/api/v1/session/link-user', { body, sessionId }, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Link User To Session', {
      request_id: requestId,
      method: 'POST',
      path: '/api/v1/session/link-user',
      body: body,
      sessionId: sessionId,
      action: 'linkUserToSession'
    });

    try {
      // Full retry logic (Phase 2B: p-retry)
      const response = await retryApiCall(
        async () => {
          // Apply request interceptors (Phase 2B)
          // Public API methods already handle calling the function, so await directly
          const apiResponse = await this.api.linkUserToSessionApiV1SessionLinkUserPost({ sessionLinkRequest: body, sessionId: sessionId,  }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
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
        const cacheKey = generateCacheKey('POST', '/api/v1/session/link-user', { body, sessionId }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      // Structured logging (Phase 2B)
      this.logger.debug('Link User To Session completed', {
        request_id: requestId,
        action: 'linkUserToSession'
      });
      
      return finalResult;
      
    } catch (error) {
      // Error handling with interceptors (Phase 2B)
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch (interceptorError) {
        // If interceptor throws, use original error
      }
      
      this.logger.error('Link User To Session failed', error, {
        request_id: requestId,
        action: 'linkUserToSession'
      });
      
      throw this._handleError(error, requestId);
    }

    // TODO Phase 2C: Add complex validation schemas (unions, enums, nested)
    // TODO Phase 2C: Add orphaned method detection
    // TODO Phase 2C: Add advanced convenience methods
  }

  /**
   * Session management convenience methods.
   * These methods wrap the underlying API calls and manage session state.
   */
  
  /**
   * Initialize a session by getting a one-time token.
   * Convenience method that wraps the underlying initSession wrapper.
   * @param apiKey - Company API key
   * @returns One-time token for session initialization
   */
  async initializeSession(apiKey: string): Promise<string> {
    const response = await this.initSession(apiKey);
    return response.one_time_token || '';
  }

  /**
   * Start a session with a one-time token.
   * Convenience method that wraps the underlying startSession wrapper and manages session state.
   * @param userId - Optional user ID for direct authentication
   * @param oneTimeToken - Optional one-time token (will initialize if not provided and apiKey in config)
   * @returns Session response with session_id and company_id
   */
  async startSessionWithToken(userId?: string, oneTimeToken?: string): Promise<{ session_id: string; company_id: string }> {
    // If no token provided, initialize first
    let token = oneTimeToken;
    if (!token && this.config?.apiKey) {
      // apiKey can be string | Promise<string> | function, so we need to resolve it
      const apiKeyValue = typeof this.config.apiKey === 'string' 
        ? this.config.apiKey 
        : typeof this.config.apiKey === 'function'
        ? await (this.config.apiKey as (name: string) => string | Promise<string>)('apiKey')
        : await this.config.apiKey;
      token = await this.initializeSession(apiKeyValue);
    } else if (!token) {
      throw new Error('One-time token required. Call initializeSession() first or provide apiKey in config.');
    }
    
    // Conditionally include user_id only when defined (exactOptionalPropertyTypes)
    const requestBody = userId !== undefined ? { user_id: userId } : {};
    const response = await this.startSession(token, requestBody);
    const sessionId = response.session_id || '';
    const companyId = response.company_id || '';
    
    if (sessionId && companyId) {
      // csrf_token is not in SessionResponseData, use type assertion
      const csrfToken = (response as any).csrf_token || '';
      this.setSessionContext(sessionId, companyId, csrfToken);
    }
    
    return { session_id: sessionId || '', company_id: companyId || '' };
  }

  /**
   * Get portal URL for user authentication.
   * Convenience method that wraps the underlying getPortalUrl wrapper.
   * @param theme - Optional theme configuration
   * @param brokers - Optional list of broker IDs to filter
   * @param email - Optional email for pre-filling
   * @returns Portal URL
   */
  async getPortalUrlForAuth(theme?: any, brokers?: string[], email?: string): Promise<string> {
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSessionWithToken() first.');
    }
    
    // Note: getPortalUrl wrapper doesn't take parameters, but convenience method accepts them for future use
    const response = await this.getPortalUrl();
    return response.portal_url || '';
  }

  /**
   * Get session user information after portal authentication.
   * Convenience method that wraps the underlying getSessionUser wrapper.
   * @returns User information with user_id, company_id, and token_type
   */
  async getAuthenticatedUser(): Promise<{ user_id: string; company_id: string; token_type: string }> {
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSessionWithToken() first.');
    }
    
    const response = await this.getSessionUser(this.sessionId!);
    return {
      user_id: response.user_id || '',
      company_id: response.company_id || this.companyId || '',
      token_type: response.token_type || 'Bearer',
    };
  }
}
