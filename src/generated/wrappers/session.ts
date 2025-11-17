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
import { coerceEnumValue } from '../utils/enum-coercion';
import { convertToPlainObject } from '../utils/plain-object';

import type { DirectAuthRequest } from '../models';
import type { FinaticapiApiV1RoutersSessionSessionRouterTestWebhookRequest } from '../models';
import type { PortalUrlResponse } from '../models';
import type { SessionResponseData } from '../models';
import type { SessionStartRequest } from '../models';
import type { SessionUserResponse } from '../models';
import type { TestWebhookResponse as ApiTestWebhookResponse } from '../models';
import type { TokenData } from '../models';
import type { TokenResponseData } from '../models';

// Phase 2C: Input/Output type definitions
export interface InitSessionParams {
  xApiKey: string;
}

export interface InitSessionResponse {
  success: {
    data: TokenResponseData;
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

export interface StartSessionParams {
  OneTimeToken: string;
  body: SessionStartRequest;
}

export interface StartSessionResponse {
  success: {
    data: SessionResponseData;
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

export interface GetPortalUrlParams {
  // No parameters
}

export interface GetPortalUrlResponse {
  success: {
    data: PortalUrlResponse;
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

export interface GetSessionUserParams {
  sessionId: string;
}

export interface GetSessionUserResponse {
  success: {
    data: SessionUserResponse;
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

export interface AuthenticateSessionParams {
  sessionId: string;
  userId: string;
}

export interface AuthenticateSessionResponse {
  success: {
    data: TokenData;
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

export interface RefreshSessionParams {
  // No parameters
}

export interface RefreshSessionResponse {
  success: {
    data: SessionResponseData;
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

export interface TestWebhookParams {
  eventType: string;
  sampleData?: Record<string, any>;
}

export interface TestWebhookResponse {
  success: {
    data: ApiTestWebhookResponse;
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

   * @param params {InitSessionParams} Input parameters object
   * @returns {Promise<InitSessionResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: POST /api/v1/session/init
   * @methodId init_session_api_v1_session_init_post
   * @category session
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.initSession({
    xApiKey: 'example'
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
  async initSession(params: InitSessionParams): Promise<InitSessionResponse> {
    // Phase 2C: Extract individual params from input params object
    const xApiKey = params.xApiKey;

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
      const cacheKey = generateCacheKey('POST', '/api/v1/session/init', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as InitSessionResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Init Session', {
      request_id: requestId,
      method: 'POST',
      path: '/api/v1/session/init',
      params: params,
      action: 'initSession'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.initSessionApiV1SessionInitPost({ xApiKey: xApiKey }, { headers: { 'x-request-id': requestId } });
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
      const standardResponse: InitSessionResponse = {
        success: {
          data: convertToPlainObject(apiData) as TokenResponseData,
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
        const cacheKey = generateCacheKey('POST', '/api/v1/session/init', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Init Session completed', {
        request_id: requestId,
        action: 'initSession'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Init Session failed', error, {
        request_id: requestId,
        action: 'initSession'
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
      const errorResponse: InitSessionResponse = {
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
   * Start Session
   * 
   * Start a session with a one-time token.

   * @param params {StartSessionParams} Input parameters object
   * @returns {Promise<StartSessionResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: POST /api/v1/session/start
   * @methodId start_session_api_v1_session_start_post
   * @category session
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.startSession({
    OneTimeToken: 'example',
    body: {}
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
  async startSession(params: StartSessionParams): Promise<StartSessionResponse> {
    // Phase 2C: Extract individual params from input params object
    const OneTimeToken = params.OneTimeToken;
    const body = params.body;

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
      const cacheKey = generateCacheKey('POST', '/api/v1/session/start', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as StartSessionResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Start Session', {
      request_id: requestId,
      method: 'POST',
      path: '/api/v1/session/start',
      params: params,
      action: 'startSession'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.startSessionApiV1SessionStartPost({ oneTimeToken: OneTimeToken, sessionStartRequest: body }, { headers: { 'x-request-id': requestId } });
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
      const standardResponse: StartSessionResponse = {
        success: {
          data: convertToPlainObject(apiData) as SessionResponseData,
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
        const cacheKey = generateCacheKey('POST', '/api/v1/session/start', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Start Session completed', {
        request_id: requestId,
        action: 'startSession'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Start Session failed', error, {
        request_id: requestId,
        action: 'startSession'
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
      const errorResponse: StartSessionResponse = {
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
   * Get Portal Url
   * 
   * Get a portal URL with token for a session.
   *
   * The session must be in ACTIVE or AUTHENTICATING state and the request must come from the same device
   * that initiated the session. Device info is automatically validated from the request.

   * @param params {GetPortalUrlParams} Input parameters object (empty for methods with no parameters)
   * @returns {Promise<GetPortalUrlResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/session/portal
   * @methodId get_portal_url_api_v1_session_portal_get
   * @category session
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getPortalUrl({});
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   */
  async getPortalUrl(params: GetPortalUrlParams): Promise<GetPortalUrlResponse> {
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
      const cacheKey = generateCacheKey('GET', '/api/v1/session/portal', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as GetPortalUrlResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Portal Url', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/session/portal',
      params: params,
      action: 'getPortalUrl'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getPortalUrlApiV1SessionPortalGet({ sessionId: this.sessionId! }, { headers: { 'x-request-id': requestId } });
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
      const standardResponse: GetPortalUrlResponse = {
        success: {
          data: convertToPlainObject(apiData) as PortalUrlResponse,
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
        const cacheKey = generateCacheKey('GET', '/api/v1/session/portal', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Portal Url completed', {
        request_id: requestId,
        action: 'getPortalUrl'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Portal Url failed', error, {
        request_id: requestId,
        action: 'getPortalUrl'
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
      const errorResponse: GetPortalUrlResponse = {
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

   * @param params {GetSessionUserParams} Input parameters object
   * @returns {Promise<GetSessionUserResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/session/{session_id}/user
   * @methodId get_session_user_api_v1_session__session_id__user_get
   * @category session
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.getSessionUser({
    sessionId: 'id-123'
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
  async getSessionUser(params: GetSessionUserParams): Promise<GetSessionUserResponse> {
    // Phase 2C: Extract individual params from input params object
    const sessionId = params.sessionId;

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
      const cacheKey = generateCacheKey('GET', '/api/v1/session/{session_id}/user', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as GetSessionUserResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Session User', {
      request_id: requestId,
      method: 'GET',
      path: '/api/v1/session/{session_id}/user',
      params: params,
      action: 'getSessionUser'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getSessionUserApiV1SessionSessionIdUserGet({ sessionId: sessionId, companyId: this.companyId! }, { headers: { 'x-request-id': requestId } });
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
      const standardResponse: GetSessionUserResponse = {
        success: {
          data: convertToPlainObject(apiData) as SessionUserResponse,
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
        const cacheKey = generateCacheKey('GET', '/api/v1/session/{session_id}/user', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Get Session User completed', {
        request_id: requestId,
        action: 'getSessionUser'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Get Session User failed', error, {
        request_id: requestId,
        action: 'getSessionUser'
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
      const errorResponse: GetSessionUserResponse = {
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
   * Authenticate Session
   * 
   *

   * @param params {AuthenticateSessionParams} Input parameters object
   * @returns {Promise<AuthenticateSessionResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: POST /api/v1/session/authenticate
   * @methodId authenticate_session_api_v1_session_authenticate_post
   * @category session
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.authenticateSession({
    sessionId: 'id-123',
    userId: 'id-123'
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
  async authenticateSession(params: AuthenticateSessionParams): Promise<AuthenticateSessionResponse> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Phase 2C: Extract individual params from input params object
    const sessionId = params.sessionId;
    const userId = params.userId;

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
      const cacheKey = generateCacheKey('POST', '/api/v1/session/authenticate', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as AuthenticateSessionResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Authenticate Session', {
      request_id: requestId,
      method: 'POST',
      path: '/api/v1/session/authenticate',
      params: params,
      action: 'authenticateSession'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.authenticateSessionApiV1SessionAuthenticatePost({ directAuthRequest: { session_id: sessionId, user_id: userId } }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
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
      const standardResponse: AuthenticateSessionResponse = {
        success: {
          data: convertToPlainObject(apiData) as TokenData,
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
        const cacheKey = generateCacheKey('POST', '/api/v1/session/authenticate', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Authenticate Session completed', {
        request_id: requestId,
        action: 'authenticateSession'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Authenticate Session failed', error, {
        request_id: requestId,
        action: 'authenticateSession'
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
      const errorResponse: AuthenticateSessionResponse = {
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
   * Refresh Session
   * 
   * Refresh an existing session by extending its expiration time.
   *
   * This endpoint allows users to extend their session before it expires.
   * The session will be extended by the default duration (24 hours).

   * @param params {RefreshSessionParams} Input parameters object (empty for methods with no parameters)
   * @returns {Promise<RefreshSessionResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: POST /api/v1/session/refresh
   * @methodId refresh_session_api_v1_session_refresh_post
   * @category session
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.refreshSession({});
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   */
  async refreshSession(params: RefreshSessionParams): Promise<RefreshSessionResponse> {
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
      const cacheKey = generateCacheKey('POST', '/api/v1/session/refresh', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as RefreshSessionResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Refresh Session', {
      request_id: requestId,
      method: 'POST',
      path: '/api/v1/session/refresh',
      params: params,
      action: 'refreshSession'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.refreshSessionApiV1SessionRefreshPost({ sessionId: this.sessionId!, companyId: this.companyId! }, { headers: { 'x-request-id': requestId } });
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
      const standardResponse: RefreshSessionResponse = {
        success: {
          data: convertToPlainObject(apiData) as SessionResponseData,
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
        const cacheKey = generateCacheKey('POST', '/api/v1/session/refresh', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Refresh Session completed', {
        request_id: requestId,
        action: 'refreshSession'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Refresh Session failed', error, {
        request_id: requestId,
        action: 'refreshSession'
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
      const errorResponse: RefreshSessionResponse = {
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
   * Test Webhook
   * 
   * Send a test webhook for the specified event type to the company's configured endpoints.

   * @param params {TestWebhookParams} Input parameters object
   * @returns {Promise<TestWebhookResponse>} Standard response with success/Error/Warning structure
   * 
   * Generated from: POST /api/v1/session/webhook/test
   * @methodId test_webhook_api_v1_session_webhook_test_post
   * @category session
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.testWebhook({
    eventType: 'example'
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
   * const result = await finatic.testWebhook({
    eventType: 'example',
    sampleData: 'example'
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
  async testWebhook(params: TestWebhookParams): Promise<TestWebhookResponse> {
    // Authentication check
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Phase 2C: Extract individual params from input params object
    const eventType = params.eventType;
    const sampleData = params.sampleData;

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
      const cacheKey = generateCacheKey('POST', '/api/v1/session/webhook/test', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as TestWebhookResponse;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Test Webhook', {
      request_id: requestId,
      method: 'POST',
      path: '/api/v1/session/webhook/test',
      params: params,
      action: 'testWebhook'
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.testWebhookApiV1SessionWebhookTestPost({ finaticapiApiV1RoutersSessionSessionRouterTestWebhookRequest: { event_type: eventType, ...(sampleData !== undefined ? { sample_data: sampleData } : {}) } }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
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
      const standardResponse: TestWebhookResponse = {
        success: {
          data: convertToPlainObject(apiData) as ApiTestWebhookResponse,
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
        const cacheKey = generateCacheKey('POST', '/api/v1/session/webhook/test', params, this.sdkConfig);
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }
      
      this.logger.debug('Test Webhook completed', {
        request_id: requestId,
        action: 'testWebhook'
      });
      
      // Phase 2C: Return standard response structure (already plain objects)
      return standardResponse;
      
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {}
      
      this.logger.error('Test Webhook failed', error, {
        request_id: requestId,
        action: 'testWebhook'
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
      const errorResponse: TestWebhookResponse = {
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
