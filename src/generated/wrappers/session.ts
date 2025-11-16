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
   * Initialize a new session with company API key.

   * @param xApiKey {string}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {TokenResponseData}
   * 
   * Generated from: POST /api/v1/session/init
   * @methodId init_session_api_v1_session_init_post
   * @category session
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.initSession('example');
   * ```
   */
  async initSession(xApiKey: string, withEnvelope?: boolean): Promise<TokenResponseData> {
    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { xApiKey }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
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
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.initSessionApiV1SessionInitPost({ xApiKey: xApiKey }, { headers: { 'x-request-id': requestId } });
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
        const cacheKey = generateCacheKey('POST', '/api/v1/session/init', { xApiKey }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Init Session completed', {
        request_id: requestId,
        action: 'initSession'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
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
   * Start a session with a one-time token.

   * @param OneTimeToken {string}
   * @param body {SessionStartRequest}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {SessionResponseData}
   * 
   * Generated from: POST /api/v1/session/start
   * @methodId start_session_api_v1_session_start_post
   * @category session
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.startSession('example', {});
   * ```
   */
  async startSession(OneTimeToken: string, body: SessionStartRequest, withEnvelope?: boolean): Promise<SessionResponseData> {
    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { OneTimeToken, body }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
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
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.startSessionApiV1SessionStartPost({ oneTimeToken: OneTimeToken, sessionStartRequest: body }, { headers: { 'x-request-id': requestId } });
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
        const cacheKey = generateCacheKey('POST', '/api/v1/session/start', { OneTimeToken, body }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Start Session completed', {
        request_id: requestId,
        action: 'startSession'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
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
   * Get a portal URL with token for a session.
   *
   * The session must be in ACTIVE or AUTHENTICATING state and the request must come from the same device
   * that initiated the session. Device info is automatically validated from the request.

   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {PortalUrlResponse}
   * 
   * Generated from: GET /api/v1/session/portal
   * @methodId get_portal_url_api_v1_session_portal_get
   * @category session
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.getPortalUrl();
   * ```
   */
  async getPortalUrl(withEnvelope?: boolean): Promise<PortalUrlResponse> {
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
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getPortalUrlApiV1SessionPortalGet({ sessionId: this.sessionId! }, { headers: { 'x-request-id': requestId } });
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
        const cacheKey = generateCacheKey('GET', '/api/v1/session/portal', {  }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Portal Url completed', {
        request_id: requestId,
        action: 'getPortalUrl'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
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
   * Get user information and fresh tokens for a completed session.
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

   * @param sessionId {string}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {SessionUserResponse}
   * 
   * Generated from: GET /api/v1/session/{session_id}/user
   * @methodId get_session_user_api_v1_session__session_id__user_get
   * @category session
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.getSessionUser('example');
   * ```
   */
  async getSessionUser(sessionId: string, withEnvelope?: boolean): Promise<SessionUserResponse> {
    // Generate request ID
    const requestId = this._generateRequestId();

    // Input validation (Phase 2B: zod)
    if (this.sdkConfig?.validationEnabled) {
      // TODO: Generate validation schema from endpoint parameters
      // const validationSchema = z.object({ ... });
      // validateParams(validationSchema, { sessionId }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
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
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getSessionUserApiV1SessionSessionIdUserGet({ sessionId: sessionId, companyId: this.companyId! }, { headers: { 'x-request-id': requestId } });
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
        const cacheKey = generateCacheKey('GET', '/api/v1/session/{session_id}/user', { sessionId }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Session User completed', {
        request_id: requestId,
        action: 'getSessionUser'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
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

   * @param sessionId {string}
   * @param userId {string}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {TokenData}
   * 
   * Generated from: POST /api/v1/session/authenticate
   * @methodId authenticate_session_api_v1_session_authenticate_post
   * @category session
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.authenticateSession('example', 'example');
   * ```
   */
  async authenticateSession(sessionId: string, userId: string, withEnvelope?: boolean): Promise<TokenData> {
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
      // validateParams(validationSchema, { sessionId, userId }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('POST', '/api/v1/session/authenticate', { sessionId, userId }, this.sdkConfig);
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
      sessionId: sessionId,
      userId: userId,
      action: 'authenticateSession'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.authenticateSessionApiV1SessionAuthenticatePost({ directAuthRequest: { session_id: sessionId, user_id: userId },  }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
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
        const cacheKey = generateCacheKey('POST', '/api/v1/session/authenticate', { sessionId, userId }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Authenticate Session completed', {
        request_id: requestId,
        action: 'authenticateSession'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
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
   * Refresh an existing session by extending its expiration time.
   *
   * This endpoint allows users to extend their session before it expires.
   * The session will be extended by the default duration (24 hours).

   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {SessionResponseData}
   * 
   * Generated from: POST /api/v1/session/refresh
   * @methodId refresh_session_api_v1_session_refresh_post
   * @category session
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.refreshSession();
   * ```
   */
  async refreshSession(withEnvelope?: boolean): Promise<SessionResponseData> {
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
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.refreshSessionApiV1SessionRefreshPost({ sessionId: this.sessionId!, companyId: this.companyId! }, { headers: { 'x-request-id': requestId } });
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
        const cacheKey = generateCacheKey('POST', '/api/v1/session/refresh', {  }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Refresh Session completed', {
        request_id: requestId,
        action: 'refreshSession'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
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
   * Send a test webhook for the specified event type to the company's configured endpoints.

   * @param eventType {string}
   * @param sampleData {Record<string, any>}
   * @param withEnvelope {boolean} return unified envelope when true
   * @returns {TestWebhookResponse}
   * 
   * Generated from: POST /api/v1/session/webhook/test
   * @methodId test_webhook_api_v1_session_webhook_test_post
   * @category session
   * @example
   * ```typescript-client
   * // Example usage (auto-generated)
   * const result = await finatic.testWebhook('example');
   * ```
   */
  async testWebhook(eventType: string, sampleData?: Record<string, any>, withEnvelope?: boolean): Promise<TestWebhookResponse> {
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
      // validateParams(validationSchema, { eventType, sampleData }, this.sdkConfig);
    }

    // Check cache (Phase 2B: optional caching)
    const shouldCache = true;
    const cache = getCache(this.sdkConfig);
    if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
      const cacheKey = generateCacheKey('POST', '/api/v1/session/webhook/test', { eventType, sampleData }, this.sdkConfig);
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
      eventType: eventType,
      sampleData: sampleData,
      action: 'testWebhook'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.testWebhookApiV1SessionWebhookTestPost({ finaticapiApiV1RoutersSessionSessionRouterTestWebhookRequest: { event_type: eventType, ...( sampleData !== undefined ? { sample_data: sampleData } : {}) },  }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
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
        const cacheKey = generateCacheKey('POST', '/api/v1/session/webhook/test', { eventType, sampleData }, this.sdkConfig);
        cache.set(cacheKey, finalResult, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Test Webhook completed', {
        request_id: requestId,
        action: 'testWebhook'
      });
      
      return finalResult;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
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

}
