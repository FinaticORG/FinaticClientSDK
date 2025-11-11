import { Logger, LoggerExtra, LoggerMetadata, LoggerOptions, LogLevel, LogVerbosity } from './logger.types';

const LOG_LEVEL_ORDER: Record<Exclude<LogLevel, 'silent'>, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const LEVEL_TO_CONSOLE: Record<Exclude<LogLevel, 'silent'>, keyof Console> = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  debug: 'debug',
};

const DEFAULT_LOGGER_NAME = 'FinaticLogger';

const parseLogLevel = (value: unknown, fallback: LogLevel): LogLevel => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.toLowerCase().trim() as LogLevel;
  if (normalized === 'silent' || normalized === 'error' || normalized === 'warn' || normalized === 'info' || normalized === 'debug') {
    return normalized;
  }

  return fallback;
};

const parseVerbosity = (value: unknown, fallback: LogVerbosity): LogVerbosity => {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return fallback;
  }

  const numeric = typeof value === 'number' ? value : Number.parseInt(value, 10);
  if (Number.isNaN(numeric)) {
    return fallback;
  }

  if (numeric <= 0) {
    return 0;
  }

  if (numeric >= 3) {
    return 3;
  }

  return numeric as LogVerbosity;
};

const resolveEnv = (key: string): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env && typeof process.env[key] === 'string') {
      return process.env[key];
    }
  } catch {
    // ignore
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
    if (metaEnv && typeof metaEnv[key] === 'string') {
      return metaEnv[key];
    }
  } catch {
    // ignore
  }

  try {
    if (typeof globalThis !== 'undefined') {
      const value = (globalThis as Record<string, unknown>)[key];
      if (typeof value === 'string') {
        return value;
      }
    }
  } catch {
    // ignore
  }

  return undefined;
};

const resolveDefaultLogLevel = (explicitLevel?: LogLevel): LogLevel => {
  if (explicitLevel) {
    return explicitLevel;
  }

  const envLevel =
    resolveEnv('FINATIC_LOG_LEVEL') ||
    resolveEnv('VITE_FINATIC_LOG_LEVEL') ||
    resolveEnv('NEXT_PUBLIC_FINATIC_LOG_LEVEL') ||
    resolveEnv('NEXT_FINATIC_LOG_LEVEL') ||
    resolveEnv('REACT_APP_FINATIC_LOG_LEVEL') ||
    resolveEnv('NUXT_PUBLIC_FINATIC_LOG_LEVEL') ||
    resolveEnv('NX_FINATIC_LOG_LEVEL');

  if (envLevel) {
    return parseLogLevel(envLevel, 'debug');
  }

  const isProd = (() => {
    try {
      if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
        return true;
      }
    } catch {
      // ignore
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD) {
        return true;
      }
    } catch {
      // ignore
    }

    return false;
  })();

  return isProd ? 'error' : 'debug';
};

const resolveVerbosity = (): LogVerbosity => {
  const envVerbosity =
    resolveEnv('FINATIC_LOG_VERBOSITY') ||
    resolveEnv('VITE_FINATIC_LOG_VERBOSITY') ||
    resolveEnv('NEXT_PUBLIC_FINATIC_LOG_VERBOSITY') ||
    resolveEnv('NEXT_FINATIC_LOG_VERBOSITY') ||
    resolveEnv('REACT_APP_FINATIC_LOG_VERBOSITY') ||
    resolveEnv('NUXT_PUBLIC_FINATIC_LOG_VERBOSITY') ||
    resolveEnv('NX_FINATIC_LOG_VERBOSITY');

  if (envVerbosity) {
    return parseVerbosity(envVerbosity, 1);
  }

  return 1;
};

const resolveBaseMetadata = (): LoggerMetadata => {
  const base: LoggerMetadata = {
    timestamp: new Date().toISOString(),
  };

  try {
    if (typeof globalThis !== 'undefined') {
      if (typeof (globalThis as Window).location !== 'undefined') {
        base.host = (globalThis as Window).location.hostname;
      }
      if (typeof (globalThis as Window).navigator !== 'undefined') {
        base.user_agent = (globalThis as Window).navigator.userAgent;
      }
    }
  } catch {
    // ignore
  }

  try {
    if (typeof process !== 'undefined') {
      base.pid = process.pid;
    }
  } catch {
    // ignore
  }

  return base;
};

const normalizeError = (error: unknown): Record<string, unknown> | undefined => {
  if (!error) {
    return undefined;
  }

  if (error instanceof Error) {
    return {
      type: error.name,
      message: error.message,
      stacktrace: error.stack,
    };
  }

  if (typeof error === 'object') {
    return { ...(error as Record<string, unknown>) };
  }

  return {
    type: 'Error',
    message: String(error),
  };
};

const shouldLog = (requestedLevel: Exclude<LogLevel, 'silent'>, currentLevel: LogLevel): boolean => {
  if (currentLevel === 'silent') {
    return false;
  }

  const currentOrder = LOG_LEVEL_ORDER[currentLevel];
  const requestedOrder = LOG_LEVEL_ORDER[requestedLevel];

  return requestedOrder <= currentOrder;
};

const buildPayload = (
  name: string,
  level: Exclude<LogLevel, 'silent'>,
  message: string,
  defaultMetadata: LoggerMetadata | undefined,
  extra: LoggerExtra | undefined,
  verbosity: LogVerbosity,
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    message,
  };

  if (verbosity >= 1 && extra) {
    if (extra.module) {
      payload.module = extra.module;
    }
    if (extra.function) {
      payload.function = extra.function;
    }
  }

  if (verbosity >= 2) {
    if (extra?.duration_ms !== undefined) {
      payload.duration_ms = extra.duration_ms;
    }
    if (extra?.event) {
      payload.event = extra.event;
    }
    if (extra?.error) {
      payload.error = normalizeError(extra.error);
    }
  }

  if (verbosity >= 3) {
    payload.level = level.toUpperCase();
    payload.name = name;
    const baseMetadata = resolveBaseMetadata();
    const mergedMetadata: LoggerMetadata = {
      ...baseMetadata,
      ...(defaultMetadata || {}),
      ...(extra?.metadata || {}),
    };
    if (Object.keys(mergedMetadata).length > 0) {
      payload.metadata = mergedMetadata;
    }
  }

  const restKeys = ['module', 'function', 'event', 'duration_ms', 'error', 'metadata'];
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      if (!restKeys.includes(key) && value !== undefined) {
        payload[key] = value;
      }
    });
  }

  return payload;
};

const consoleWrite = (
  consoleLevel: keyof Console,
  name: string,
  level: Exclude<LogLevel, 'silent'>,
  message: string,
  payload: Record<string, unknown>,
): void => {
  if (typeof console === 'undefined' || typeof console[consoleLevel] !== 'function') {
    return;
  }

  const prefix = `${level.toUpperCase()}: ${name} || ${message}`;
  console[consoleLevel](prefix, payload);
};

export const setupLogger = (nameOrOptions: string | LoggerOptions, level?: LogLevel, defaultMetadata?: LoggerMetadata): Logger => {
  const options: LoggerOptions =
    typeof nameOrOptions === 'string'
      ? {
          name: nameOrOptions,
          level,
          defaultMetadata,
        }
      : nameOrOptions;

  const loggerName = options.name || DEFAULT_LOGGER_NAME;
  let currentLevel: LogLevel = resolveDefaultLogLevel(options.level);
  const loggerDefaultMetadata = options.defaultMetadata;
  const verbosity = resolveVerbosity();

  const log = (requestedLevel: Exclude<LogLevel, 'silent'>, message: string, extra?: LoggerExtra) => {
    if (!shouldLog(requestedLevel, currentLevel)) {
      return;
    }

    const payload = buildPayload(loggerName, requestedLevel, message, loggerDefaultMetadata, extra, verbosity);
    consoleWrite(LEVEL_TO_CONSOLE[requestedLevel], loggerName, requestedLevel, message, payload);
  };

  return {
    getLevel: () => currentLevel,
    setLevel: (nextLevel: LogLevel) => {
      currentLevel = nextLevel;
    },
    debug: (message: string, extra?: LoggerExtra) => log('debug', message, extra),
    info: (message: string, extra?: LoggerExtra) => log('info', message, extra),
    warn: (message: string, extra?: LoggerExtra) => log('warn', message, extra),
    error: (message: string, extra?: LoggerExtra) => log('error', message, extra),
    exception: (message: string, error: unknown, extra?: LoggerExtra) => {
      log('error', message, {
        ...extra,
        error,
        event: extra?.event || 'exception',
      });
    },
  };
};

export const buildLoggerExtra = (metadata: LoggerMetadata): LoggerExtra => ({
  metadata,
});

export const logStartEnd =
  (logger: Logger) =>
  <Args extends unknown[], ReturnType>(fn: (...args: Args) => ReturnType | Promise<ReturnType>) =>
  async (...args: Args): Promise<ReturnType> => {
    const start = Date.now();
    const functionName = fn.name || 'anonymous';
    logger.debug('START', { module: 'logStartEnd', function: functionName, event: 'start' });

    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      logger.info('END', { module: 'logStartEnd', function: functionName, event: 'end', duration_ms: duration });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.exception('EXCEPTION', error, {
        module: 'logStartEnd',
        function: functionName,
        duration_ms: duration,
      });
      throw error;
    }
  };

