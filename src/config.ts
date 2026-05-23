/**
 * Finatic Client SDK Configuration
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * CENTRALIZED CONFIGURATION - Adjust all SDK settings here
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This file contains all configurable options for the SDK.
 * Modify values here to customize SDK behavior.
 *
 * Generated - do not edit directly.
 * For configuration overrides, subclass or wrap ``SdkConfig`` in application code.
 */

export interface SdkConfig {
  /** Named Finatic environment preset */
  environment: FinaticEnvironment;

  // ═══════════════════════════════════════════════════════════════════════
  // API Configuration
  // ═══════════════════════════════════════════════════════════════════════

  /** Base URL for API requests */
  baseUrl: string;

  /** API key for authentication */
  apiKey?: string;

  /** Request timeout in milliseconds */
  timeout: number;

  /** Custom headers to include in all requests */
  headers: Record<string, string>;

  // ═══════════════════════════════════════════════════════════════════════
  // Retry Configuration
  // ═══════════════════════════════════════════════════════════════════════

  /** Enable retry logic */
  retryEnabled: boolean;

  /** Maximum number of retry attempts */
  retryCount: number;

  /** Initial retry delay in milliseconds */
  retryDelay: number;

  /** Maximum retry delay in milliseconds */
  retryMaxDelay: number;

  /** Exponential backoff multiplier */
  retryMultiplier: number;

  /** HTTP status codes that trigger retry */
  retryOnStatus: number[];

  /** Enable retry on network errors */
  retryOnNetworkError: boolean;

  // ═══════════════════════════════════════════════════════════════════════
  // Logging Configuration
  // ═══════════════════════════════════════════════════════════════════════

  /** Log level: 'debug' | 'info' | 'warn' | 'error' | 'silent' */
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'silent';

  /** Enable structured JSON logging */
  structuredLogging: boolean;

  /** Include request/response bodies in logs (debug only) */
  logRequestBody: boolean;
  logResponseBody: boolean;

  /** Log request IDs for tracing */
  logRequestId: boolean;

  // ═══════════════════════════════════════════════════════════════════════
  // Validation Configuration
  // ═══════════════════════════════════════════════════════════════════════

  /** Enable input validation */
  validationEnabled: boolean;

  /** Throw errors on validation failure (vs. log warnings) */
  validationStrict: boolean;

  // ═══════════════════════════════════════════════════════════════════════
  // Caching Configuration
  // ═══════════════════════════════════════════════════════════════════════

  /** Enable response caching */
  cacheEnabled: boolean;

  /** Default cache TTL in seconds */
  cacheTtl: number;

  /** Maximum cache size (number of entries) */
  cacheMaxSize: number;

  /** Cache keys to include in cache key generation */
  cacheKeyInclude: string[];

  // ═══════════════════════════════════════════════════════════════════════
  // Rate Limiting Configuration
  // ═══════════════════════════════════════════════════════════════════════

  /** Enable rate limit detection and handling */
  rateLimitEnabled: boolean;

  /** Automatically retry on 429 (rate limit) */
  rateLimitAutoRetry: boolean;

  /** Custom rate limit handler function */
  rateLimitHandler?: (retryAfter: number) => Promise<void>;

  // ═══════════════════════════════════════════════════════════════════════
  // Interceptor Configuration
  // ═══════════════════════════════════════════════════════════════════════

  /** Enable request interceptors */
  requestInterceptorsEnabled: boolean;

  /** Enable response interceptors */
  responseInterceptorsEnabled: boolean;

  // ═══════════════════════════════════════════════════════════════════════
  // Session Management Configuration (Client SDK)
  // ═══════════════════════════════════════════════════════════════════════

  /** Session storage key (localStorage/sessionStorage) */
  sessionStorageKey: string;

  /** Portal iframe configuration */
  portalConfig: {
    /** Portal base URL */
    baseUrl: string;
    /** Auto-open portal on auth errors */
    autoOpenOnError: boolean;
    /** Portal iframe styling */
    iframeStyle: Record<string, string>;
  };
}

export type FinaticEnvironment = 'production' | 'staging' | 'development' | 'sandbox' | 'custom';

export type SdkConfigOverrides = Partial<Omit<SdkConfig, 'portalConfig'>> & {
  portalConfig?: Partial<SdkConfig['portalConfig']> & {
    iframeStyle?: Record<string, string>;
  };
};

export interface FinaticEnvironmentPreset {
  baseUrl: string;
  portalBaseUrl: string;
}

export const environmentPresets: Record<
  Exclude<FinaticEnvironment, 'custom'>,
  FinaticEnvironmentPreset
> = {
  production: {
    baseUrl: 'https://api.finatic.dev',
    portalBaseUrl: 'https://portal.finatic.dev',
  },
  staging: {
    baseUrl: 'https://staging-api.finatic.dev',
    portalBaseUrl: 'https://staging-portal.finatic.dev',
  },
  development: {
    baseUrl: 'http://localhost:8000',
    portalBaseUrl: 'http://localhost:3000',
  },
  sandbox: {
    baseUrl: 'https://sandbox-api.finatic.dev',
    portalBaseUrl: 'https://sandbox-portal.finatic.dev',
  },
};

/**
 * Default configuration values.
 * Override via environment variables or custom config.
 */
export const defaultConfig: SdkConfig = {
  environment: 'production',

  // API Configuration
  baseUrl: process.env['FINATIC_API_URL'] || 'https://api.finatic.dev',
  ...(process.env['FINATIC_API_KEY'] ? { apiKey: process.env['FINATIC_API_KEY'] } : {}),
  timeout: parseInt(process.env['FINATIC_TIMEOUT'] || '30000', 10),
  headers: {},

  // Retry Configuration
  retryEnabled: process.env['FINATIC_RETRY_ENABLED'] !== 'false',
  retryCount: parseInt(process.env['FINATIC_RETRY_COUNT'] || '3', 10),
  retryDelay: parseInt(process.env['FINATIC_RETRY_DELAY'] || '1000', 10),
  retryMaxDelay: parseInt(process.env['FINATIC_RETRY_MAX_DELAY'] || '10000', 10),
  retryMultiplier: parseFloat(process.env['FINATIC_RETRY_MULTIPLIER'] || '2'),
  retryOnStatus: [429, 500, 502, 503, 504],
  retryOnNetworkError: process.env['FINATIC_RETRY_ON_NETWORK_ERROR'] !== 'false',

  // Logging Configuration
  logLevel: (process.env['FINATIC_LOG_LEVEL'] || 'error') as SdkConfig['logLevel'],
  structuredLogging: process.env['FINATIC_STRUCTURED_LOGGING'] === 'true',
  logRequestBody: process.env['FINATIC_LOG_REQUEST_BODY'] === 'true',
  logResponseBody: process.env['FINATIC_LOG_RESPONSE_BODY'] === 'true',
  logRequestId: process.env['FINATIC_LOG_REQUEST_ID'] !== 'false',

  // Validation Configuration
  validationEnabled: process.env['FINATIC_VALIDATION_ENABLED'] !== 'false',
  validationStrict: process.env['FINATIC_VALIDATION_STRICT'] === 'true',

  // Caching Configuration
  cacheEnabled: process.env['FINATIC_CACHE_ENABLED'] === 'true',
  cacheTtl: parseInt(process.env['FINATIC_CACHE_TTL'] || '300', 10),
  cacheMaxSize: parseInt(process.env['FINATIC_CACHE_MAX_SIZE'] || '1000', 10),
  cacheKeyInclude: ['method', 'path', 'query', 'body'],

  // Rate Limiting Configuration
  rateLimitEnabled: process.env['FINATIC_RATE_LIMIT_ENABLED'] !== 'false',
  rateLimitAutoRetry: process.env['FINATIC_RATE_LIMIT_AUTO_RETRY'] !== 'false',

  // Interceptor Configuration
  requestInterceptorsEnabled: process.env['FINATIC_REQUEST_INTERCEPTORS'] !== 'false',
  responseInterceptorsEnabled: process.env['FINATIC_RESPONSE_INTERCEPTORS'] !== 'false',

  // Client SDK Session Configuration
  sessionStorageKey: 'finatic_session',
  portalConfig: {
    baseUrl: process.env['FINATIC_PORTAL_URL'] || 'https://portal.finatic.dev',
    autoOpenOnError: process.env['FINATIC_PORTAL_AUTO_OPEN'] !== 'false',
    iframeStyle: {
      border: 'none',
      width: '100%',
      height: '100%',
    },
  },
};

function applyEnvironmentPreset(config: SdkConfig, overrides?: SdkConfigOverrides): SdkConfig {
  if (!overrides?.environment) {
    return config;
  }

  const environment = overrides?.environment ?? config.environment;
  const preset = environment !== 'custom' ? environmentPresets[environment] : undefined;

  if (!preset) {
    return {
      ...config,
      environment,
    };
  }

  return {
    ...config,
    environment,
    baseUrl: overrides?.baseUrl ?? preset.baseUrl,
    portalConfig: {
      ...config.portalConfig,
      baseUrl: overrides?.portalConfig?.baseUrl ?? preset.portalBaseUrl,
    },
  };
}

/**
 * Get configuration with environment variable overrides.
 */
export function getConfig(overrides?: SdkConfigOverrides): SdkConfig {
  const config: SdkConfig = applyEnvironmentPreset({ ...defaultConfig }, overrides);

  if (overrides) {
    // Only assign defined values (not undefined)
    for (const [key, value] of Object.entries(overrides)) {
      if (value !== undefined) {
        if (key === 'portalConfig') {
          config.portalConfig = {
            ...config.portalConfig,
            ...(value as Partial<SdkConfig['portalConfig']>),
            iframeStyle: {
              ...config.portalConfig.iframeStyle,
              ...((value as Partial<SdkConfig['portalConfig']>).iframeStyle ?? {}),
            },
          };
        } else {
          (config as any)[key] = value;
        }
      }
    }
  }

  return config;
}
