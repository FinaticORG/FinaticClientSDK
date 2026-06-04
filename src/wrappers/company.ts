/**
 * Hand-maintained company wrapper over the OpenAPI-generated client in ``src/openapi/``.
 */

import { CompanyApi } from '../openapi/api/company-api';

import type { Configuration } from '../openapi/configuration';
import type { SdkConfig } from '../config';
import { generateRequestId } from '../utils/request-id';
import { retryApiCall } from '../utils/retry';
import { getLogger, type Logger } from '../utils/logger';
import { handleError } from '../utils/error-handling';
import { getCache, generateCacheKey } from '../utils/cache';
import { applyResponseInterceptors, applyErrorInterceptors } from '../utils/interceptors';
import { unwrapAxiosResponse } from '../utils/response-utils';
import { convertToPlainObject } from '../utils/plain-object';

import type { Accounts } from '../openapi/models';

// Always import PaginatedData since method bodies may reference it (even if unreachable)
import { PaginatedData } from '../utils/pagination';

/**
 * Standard FinaticResponse type for all API responses.
 *
 * Generic response structure with success, error, and warning fields.
 */
export interface FinaticResponse<T> {
  _id?: string;
  /**
   * Success payload containing data and optional meta
   */
  success: {
    data: T;
    meta?: { [key: string]: any } | null;
  };
  error?: { [key: string]: any } | null;
  warning?: Array<{ [key: string]: any }> | null;
}

// Phase 2C: Input type definitions (output types use FinaticResponse<DataType> pattern - no interfaces needed)
export interface GetCompanyParams {
  /** Company ID */
  companyId: string;
}

/**
 * Company wrapper functions.
 * Provides simplified method names and response unwrapping.
 *
 * @deprecated New browser workflows should use `V1Wrapper`/`finatic.v1`.
 * Company API key flows are server-side and should not be normalized into
 * new browser-safe v1 code.
 */
export class CompanyWrapper {
  protected api: CompanyApi;
  protected config?: Configuration;
  protected sdkConfig?: SdkConfig;
  protected logger: Logger;
  protected sessionId?: string;
  protected companyId?: string;
  protected csrfToken?: string;

  constructor(api: CompanyApi, config?: Configuration, sdkConfig?: SdkConfig) {
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
   * Get Company
   * 
   * Get public company details by ID (no user check, no sensitive data).
   * @param params.companyId {string} Company ID
   * @returns {Promise<FinaticResponse<Accounts>>} Standard response with success/Error/Warning structure
   * 
   * Generated from: GET /api/beta/company/{company_id}
   * @methodId get_company_api_beta_company__company_id__get
   * @category company
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.getCompany({
    companyId: 'example-id'
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
  async getCompany(params: GetCompanyParams): Promise<FinaticResponse<Accounts>> {
    // Use params object (required parameters present)
    const resolvedParams: GetCompanyParams = params; // Generate request ID
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
      const cacheKey = generateCacheKey(
        'GET',
        '/api/beta/company/{company_id}',
        resolvedParams,
        this.sdkConfig
      );
      const cached = cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Cache hit', { request_id: requestId, cache_key: cacheKey });
        return cached as FinaticResponse<Accounts>;
      }
    }

    // Structured logging (Phase 2B: pino)
    this.logger.debug('Get Company', {
      request_id: requestId,
      method: 'GET',
      path: '/api/beta/company/{company_id}',
      params: resolvedParams,
      action: 'getCompany',
    });

    try {
      const response = await retryApiCall(
        async () => {
          const apiResponse = await this.api.getCompanyApiBetaCompanyCompanyIdGet(
            { companyId: resolvedParams.companyId ?? null },
            { headers: { 'x-request-id': requestId } }
          );
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
      if (
        hasPagination &&
        standardResponse.success?.data &&
        Array.isArray(standardResponse.success.data) &&
        standardResponse.success.meta
      ) {
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
            this.getCompany.bind(this),
            resolvedParams,
            this
          );
          standardResponse.success.data = paginatedData;
        }
      }

      if (cache && this.sdkConfig?.cacheEnabled && shouldCache) {
        const cacheKey = generateCacheKey(
          'GET',
          '/api/beta/company/{company_id}',
          resolvedParams,
          this.sdkConfig
        );
        cache.set(cacheKey, standardResponse, this.sdkConfig.cacheTtl || 300);
      }

      this.logger.debug('Get Company completed', {
        request_id: requestId,
        action: 'getCompany',
      });

      // Phase 2C: Return standard response structure (plain objects with _id fields removed)
      // Type assertion to final return type (handles both paginated and non-paginated responses)
      return standardResponse as FinaticResponse<Accounts>;
    } catch (error) {
      try {
        await applyErrorInterceptors(error, this.sdkConfig);
      } catch {
        void 0;
      }

      this.logger.error('Get Company failed', error, {
        request_id: requestId,
        action: 'getCompany',
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
        if (
          errorResponseData &&
          typeof errorResponseData === 'object' &&
          'error' in errorResponseData
        ) {
          errorMessage = errorResponseData.error?.message || errorMessage;
          errorCode = errorResponseData.error?.code || errorCode;
          errorStatus = errorResponseData.error?.status || errorStatus;
        } else {
          errorMessage = axiosError.response?.statusText || axiosError.message || errorMessage;
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
      const errorResponse: FinaticResponse<Accounts> = {
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
