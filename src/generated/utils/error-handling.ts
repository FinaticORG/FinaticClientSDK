/**
 * Error handling utility (Phase 2A).
 * 
 * Generated - do not edit directly.
 */

export class FinaticError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public requestId?: string,
    public originalError?: any
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
    originalError?: any
  ) {
    super(message, statusCode, requestId, originalError);
    this.name = 'ApiError';
  }
}

export class ValidationError extends FinaticError {
  constructor(message: string, requestId?: string, originalError?: any) {
    super(message, 422, requestId, originalError);
    this.name = 'ValidationError';
  }
}

/**
 * Handle and transform errors from API calls.
 */
export function handleError(error: any, requestId?: string): Error {
  // Extract status code
  const statusCode = error?.response?.status || error?.statusCode || error?.status;
  
  // Extract error message
  let message = error?.message || error?.toString() || 'Unknown error';
  
  // Try to extract message from response
  if (error?.response?.data) {
    const data = error.response.data;
    if (data.detail) {
      message = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
    } else if (data.message) {
      message = data.message;
    }
  }
  
  // Create appropriate error type
  if (statusCode === 422) {
    return new ValidationError(message, requestId, error);
  } else if (statusCode && statusCode >= 400) {
    return new ApiError(message, statusCode, requestId, error);
  }
  
  return new FinaticError(message, statusCode, requestId, error);
}
