/**
 * Error handling utility (Phase 2A/2B).
 *
 * Generated - do not edit directly.
 */

export interface ParsedFinaticError {
  type?: string;
  code?: string;
  message: string;
  traceId?: string;
  details?: any;
  fields?: Array<{ path: string; message: string; code?: string }>;
}

export class FinaticError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public requestId?: string,
    public originalError?: any,
    public finatic?: ParsedFinaticError
  ) {
    super(message);
    this.name = 'FinaticError';
  }
}

export class ApiError extends FinaticError {
  constructor(
    message: string,
    statusCode: number,
    requestId?: string,
    originalError?: any,
    finatic?: ParsedFinaticError
  ) {
    super(message, statusCode, requestId, originalError, finatic);
    this.name = 'ApiError';
  }
}

export class ValidationError extends FinaticError {
  constructor(
    message: string,
    requestId?: string,
    originalError?: any,
    finatic?: ParsedFinaticError
  ) {
    super(message, 422, requestId, originalError, finatic);
    this.name = 'ValidationError';
  }
}

function extractFinaticError(error: any): ParsedFinaticError | undefined {
  const data = error?.response?.data || error?.data || error;
  if (!data) return undefined;
  const err = data.error || data;
  const meta = data.meta || {};
  const message = err?.message || data?.message || error?.message;
  const traceId = err?.trace_id || meta?.trace_id;
  if (!message && !err) return undefined;
  return {
    type: err?.type,
    code: err?.code,
    message: message || 'Unknown error',
    traceId,
    details: err?.details,
    fields: Array.isArray(err?.fields)
      ? err.fields.map((f: any) => ({
          path: String(f.path || ''),
          message: String(f.message || ''),
          code: f.code,
        }))
      : undefined,
  };
}

/**
 * Handle and transform errors from API calls.
 */
export function handleError(error: any, requestId?: string): Error {
  const statusCode = error?.response?.status || error?.statusCode || error?.status;
  const finatic = extractFinaticError(error);
  const message = finatic?.message || error?.message || error?.toString() || 'Unknown error';

  if (statusCode === 422) {
    return new ValidationError(message, finatic?.traceId || requestId, error, finatic);
  } else if (statusCode && statusCode >= 400) {
    return new ApiError(message, statusCode, finatic?.traceId || requestId, error, finatic);
  }

  return new FinaticError(message, statusCode, finatic?.traceId || requestId, error, finatic);
}
