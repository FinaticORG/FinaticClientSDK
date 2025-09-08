export class BaseError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'UNKNOWN_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ApiError extends BaseError {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: Record<string, any>
  ) {
    super(message, `API_ERROR_${status}`);
    this.name = 'ApiError';
  }
}

export class SessionError extends ApiError {
  constructor(message: string, details?: Record<string, any>) {
    super(400, message, details);
    this.name = 'SessionError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string, details?: Record<string, any>) {
    super(401, message, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string, details?: Record<string, any>) {
    super(403, message, details);
    this.name = 'AuthorizationError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string, details?: Record<string, any>) {
    super(429, message, details);
    this.name = 'RateLimitError';
  }
}

export class TokenError extends BaseError {
  constructor(message: string) {
    super(message, 'TOKEN_ERROR');
    this.name = 'TokenError';
  }
}

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NetworkError extends BaseError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class SecurityError extends BaseError {
  constructor(message: string) {
    super(message, 'SECURITY_ERROR');
    this.name = 'SecurityError';
  }
}

export class CompanyAccessError extends ApiError {
  constructor(message: string, details?: Record<string, any>) {
    super(403, message, details);
    this.name = 'CompanyAccessError';
  }
}

export class OrderError extends ApiError {
  constructor(message: string, details?: Record<string, any>) {
    super(500, message, details);
    this.name = 'OrderError';
  }
}

export class OrderValidationError extends ApiError {
  constructor(message: string, details?: Record<string, any>) {
    super(400, message, details);
    this.name = 'OrderValidationError';
  }
}

export class TradingNotEnabledError extends ApiError {
  constructor(message: string, details?: Record<string, any>) {
    super(403, message, details);
    this.name = 'TradingNotEnabledError';
  }
}
