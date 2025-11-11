export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

export interface LoggerMetadata {
  [key: string]: unknown;
}

export interface LoggerExtra {
  metadata?: LoggerMetadata;
  module?: string;
  function?: string;
  event?: string;
  duration_ms?: number;
  error?: unknown;
  [key: string]: unknown;
}

export interface LoggerOptions {
  name: string;
  level?: LogLevel;
  defaultMetadata?: LoggerMetadata;
}

export interface Logger {
  getLevel: () => LogLevel;
  setLevel: (level: LogLevel) => void;
  debug: (message: string, extra?: LoggerExtra) => void;
  info: (message: string, extra?: LoggerExtra) => void;
  warn: (message: string, extra?: LoggerExtra) => void;
  error: (message: string, extra?: LoggerExtra) => void;
  exception: (message: string, error: unknown, extra?: LoggerExtra) => void;
}

export type LogVerbosity = 0 | 1 | 2 | 3;

