/**
 * Finatic Client SDK Configuration
 */

export interface SdkConfig {
  /** Named Finatic environment preset */
  environment: FinaticEnvironment;
  /** Account-first v1 API environment sent as X-Finatic-Environment */
  apiEnvironment: FinaticApiEnvironment;

  /** Base URL for API requests */
  baseUrl: string;

  /** API key for authentication */
  apiKey?: string;

  /** Request timeout in milliseconds */
  timeout: number;

  /** Custom headers to include in all requests */
  headers: Record<string, string>;

  /** Log level */
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'silent';

  /** Enable structured JSON logging */
  structuredLogging: boolean;

  /** Include request/response bodies in logs (debug only) */
  logRequestBody: boolean;
  logResponseBody: boolean;

  /** Log request IDs for tracing */
  logRequestId: boolean;

  /** Enable input validation */
  validationEnabled: boolean;

  /** Throw errors on validation failure (vs. log warnings) */
  validationStrict: boolean;

  /** Session storage key (localStorage/sessionStorage) */
  sessionStorageKey: string;

  /** Portal iframe configuration */
  portalConfig: {
    baseUrl: string;
    autoOpenOnError: boolean;
    iframeStyle: Record<string, string>;
  };
}

export type FinaticEnvironment = 'production' | 'staging' | 'development' | 'sandbox' | 'custom';
export type FinaticApiEnvironment = 'live' | 'sandbox';

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

export const defaultConfig: SdkConfig = {
  environment: 'production',
  apiEnvironment: process.env['FINATIC_API_ENVIRONMENT'] === 'sandbox' ? 'sandbox' : 'live',
  baseUrl: process.env['FINATIC_API_URL'] || 'https://api.finatic.dev',
  ...(process.env['FINATIC_API_KEY'] ? { apiKey: process.env['FINATIC_API_KEY'] } : {}),
  timeout: parseInt(process.env['FINATIC_TIMEOUT'] || '30000', 10),
  headers: {},
  logLevel: (process.env['FINATIC_LOG_LEVEL'] || 'error') as SdkConfig['logLevel'],
  structuredLogging: process.env['FINATIC_STRUCTURED_LOGGING'] === 'true',
  logRequestBody: process.env['FINATIC_LOG_REQUEST_BODY'] === 'true',
  logResponseBody: process.env['FINATIC_LOG_RESPONSE_BODY'] === 'true',
  logRequestId: process.env['FINATIC_LOG_REQUEST_ID'] !== 'false',
  validationEnabled: process.env['FINATIC_VALIDATION_ENABLED'] !== 'false',
  validationStrict: process.env['FINATIC_VALIDATION_STRICT'] === 'true',
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
    return { ...config, environment };
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

export function getConfig(overrides?: SdkConfigOverrides): SdkConfig {
  const config: SdkConfig = applyEnvironmentPreset({ ...defaultConfig }, overrides);

  if (overrides) {
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
