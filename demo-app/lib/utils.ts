import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type EnvironmentMode = 'sandbox' | 'live';
export type EnvironmentType = 'dev' | 'staging' | 'prod';

const ENVIRONMENT_SUFFIX_MAP: Record<EnvironmentType, 'DEV' | 'STAGING' | 'PRODUCTION'> = {
  dev: 'DEV',
  staging: 'STAGING',
  prod: 'PRODUCTION',
};

export function getEnvironmentVariableSuffix(environment: EnvironmentType) {
  return ENVIRONMENT_SUFFIX_MAP[environment];
}

export function getApiKeyEnvVarName(mode: EnvironmentMode, environment: EnvironmentType) {
  const suffix = getEnvironmentVariableSuffix(environment);
  return mode === 'sandbox' ? `FINATIC_API_${suffix}_SANDBOX_KEY` : `FINATIC_API_${suffix}_KEY`;
}

export function getApiUrlEnvVarName(environment: EnvironmentType) {
  const suffix = getEnvironmentVariableSuffix(environment);
  return `FINATIC_${suffix}_API_URL`;
}

export function getPublicApiUrlEnvVarName(environment: EnvironmentType) {
  const suffix = getEnvironmentVariableSuffix(environment);
  return `NEXT_PUBLIC_FINATIC_${suffix}_API_URL`;
}

export function getApiKey(mode: EnvironmentMode, environment: EnvironmentType) {
  return process.env[getApiKeyEnvVarName(mode, environment)];
}

/** Default API URLs per environment when env vars are not set (display and runtime). */
export const DEFAULT_PUBLIC_API_URL_BY_ENVIRONMENT: Record<EnvironmentType, string> = {
  dev: 'http://localhost:8000',
  staging: 'https://api-staging.finatic.dev',
  prod: 'https://api.finatic.dev',
};

export function getApiUrl(environment: EnvironmentType, fallbackUrl: string) {
  return process.env[getApiUrlEnvVarName(environment)] || fallbackUrl;
}

export function getPublicApiUrl(environment: EnvironmentType, fallbackUrl: string) {
  const fromEnv = process.env[getPublicApiUrlEnvVarName(environment)];
  if (fromEnv) return fromEnv;
  return DEFAULT_PUBLIC_API_URL_BY_ENVIRONMENT[environment] ?? fallbackUrl;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
