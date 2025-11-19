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
import { unwrapAxiosResponse } from '../utils/response-utils';
import { coerceEnumValue } from '../utils/enum-coercion';

import type { PortalUrlResponse } from '../models';
import type { SessionResponseData } from '../models';
import type { SessionStartRequest } from '../models';
import type { SessionUserResponse } from '../models';
import type { TokenResponseData } from '../models';


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
export interface InitSessionParams {
  xApiKey: string;
}

export interface StartSessionParams {
  OneTimeToken: string;
  body: SessionStartRequest;
}

export interface GetPortalUrlParams {
  // No parameters
}

export interface GetSessionUserParams {
  sessionId: string;
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
   * @param xApiKey {string} 
   * @returns {Promise<FinaticResponse<TokenResponseData>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: POST /api/v1/session/init
   * @methodId init_session_api_v1_session_init_post
   * @category session
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.initSession();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   */
  async initSession(xApiKey: string): Promise<FinaticResponse<TokenResponseData>> {
    // Construct params object from individual parameters
    const params: InitSessionParams = {
    xApiKey: xApiKey
  };    // Generate request ID
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
        return cached as FinaticResponse<TokenResponseData>;
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
      
      // Unwrap axios response immediately - get FinaticResponse object
      const responseData = unwrapAxiosResponse(response);
      if (!(responseData && typeof responseData === 'object' && 'success' in responseData)) {
        throw new Error('Unexpected response shape: missing success field');
      }
      
      // Axios already parses JSON to plain objects - return directly
      const standardResponse: FinaticResponse<TokenResponseData> = responseData as FinaticResponse<TokenResponseData>;
      
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
      const errorResponse: FinaticResponse<TokenResponseData> = {
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
   * Start Session
   * 
   * Start a session with a one-time token.
   * @param OneTimeToken {string} 
   * @param body {SessionStartRequest} 
   * @returns {Promise<FinaticResponse<SessionResponseData>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: POST /api/v1/session/start
   * @methodId start_session_api_v1_session_start_post
   * @category session
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.startSession();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   */
  async startSession(OneTimeToken: string, body: SessionStartRequest): Promise<FinaticResponse<SessionResponseData>> {
    // Construct params object from individual parameters
    const params: StartSessionParams = {
    OneTimeToken: OneTimeToken,
    body: body
  };    // Generate request ID
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
        return cached as FinaticResponse<SessionResponseData>;
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
      
      // Unwrap axios response immediately - get FinaticResponse object
      const responseData = unwrapAxiosResponse(response);
      if (!(responseData && typeof responseData === 'object' && 'success' in responseData)) {
        throw new Error('Unexpected response shape: missing success field');
      }
      
      // Axios already parses JSON to plain objects - return directly
      const standardResponse: FinaticResponse<SessionResponseData> = responseData as FinaticResponse<SessionResponseData>;
      
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
      const errorResponse: FinaticResponse<SessionResponseData> = {
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
   * Get Portal Url
   * 
   * Get a portal URL with token for a session.
   *
   * The session must be in ACTIVE or AUTHENTICATING state and the request must come from the same device
   * that initiated the session. Device info is automatically validated from the request.
   * @param No parameters required for this method
   * @returns {Promise<FinaticResponse<PortalUrlResponse>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/session/portal
   * @methodId get_portal_url_api_v1_session_portal_get
   * @category session
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getPortalUrl();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   */
  async getPortalUrl(): Promise<FinaticResponse<PortalUrlResponse>> {
    // No parameters - use empty params object
    const params: GetPortalUrlParams = {};    // Authentication check
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
      const cacheKey = generateCacheKey('GET', '/api/v1/session/portal', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as FinaticResponse<PortalUrlResponse>;
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
          const apiResponse = await this.api.getPortalUrlApiV1SessionPortalGet({ sessionId: this.sessionId! }, { headers: { 'x-session-id': this.sessionId, 'x-company-id': this.companyId, 'x-csrf-token': this.csrfToken, 'x-request-id': requestId } });
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
      
      // Axios already parses JSON to plain objects - return directly
      const standardResponse: FinaticResponse<PortalUrlResponse> = responseData as FinaticResponse<PortalUrlResponse>;
      
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
      const errorResponse: FinaticResponse<PortalUrlResponse> = {
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
   * - Validates that header session_id matches path session_id
   * @param sessionId {string} 
   * @returns {Promise<FinaticResponse<SessionUserResponse>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/v1/session/{session_id}/user
   * @methodId get_session_user_api_v1_session__session_id__user_get
   * @category session
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.getSessionUser(sessionId: 'sess_1234567890abcdef');
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   */
  async getSessionUser(sessionId: string): Promise<FinaticResponse<SessionUserResponse>> {
    // Construct params object from individual parameters
    const params: GetSessionUserParams = {
    sessionId: sessionId
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
      const cacheKey = generateCacheKey('GET', '/api/v1/session/{session_id}/user', params, this.sdkConfig);
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as FinaticResponse<SessionUserResponse>;
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
          const apiResponse = await this.api.getSessionUserApiV1SessionSessionIdUserGet({ sessionId: sessionId, xSessionId: sessionId }, { headers: { 'x-request-id': requestId } });
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
      
      // Axios already parses JSON to plain objects - return directly
      const standardResponse: FinaticResponse<SessionUserResponse> = responseData as FinaticResponse<SessionUserResponse>;
      
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
      const errorResponse: FinaticResponse<SessionUserResponse> = {
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
