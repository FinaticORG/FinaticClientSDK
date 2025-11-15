/**
 * Retry utility with p-retry package (Phase 2B).
 * 
 * Generated - do not edit directly.
 */

// @ts-ignore - p-retry provides its own types but TypeScript may not resolve them
import pRetry, { AbortError } from 'p-retry';
import type { SdkConfig } from '../config';

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryMaxDelay?: number;
  retryMultiplier?: number;
  retryOnStatus?: number[];
  retryOnNetworkError?: boolean;
  onFailedAttempt?: (error: Error) => void;
}

/**
 * Retry an async function with exponential backoff using p-retry.
 */
export async function retryApiCall<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
  config?: SdkConfig
): Promise<T> {
  const opts = {
    maxRetries: config?.retryCount ?? options.maxRetries ?? 3,
    retryDelay: config?.retryDelay ?? options.retryDelay ?? 1000,
    retryMaxDelay: config?.retryMaxDelay ?? options.retryMaxDelay ?? 10000,
    retryMultiplier: config?.retryMultiplier ?? options.retryMultiplier ?? 2,
    retryOnStatus: config?.retryOnStatus ?? options.retryOnStatus ?? [429, 500, 502, 503, 504],
    retryOnNetworkError: config?.retryOnNetworkError ?? options.retryOnNetworkError ?? true,
    onFailedAttempt: options.onFailedAttempt,
  };
  
  return await pRetry(
    async () => {
      try {
        return await fn();
      } catch (error: any) {
        // Check if we should retry based on status code
        const statusCode = error?.response?.status || error?.statusCode || error?.status;
        
        // Don't retry if status code doesn't match retry list
        if (statusCode && !opts.retryOnStatus.includes(statusCode)) {
          throw new AbortError(error);
        }
        
        // Check for network errors
        if (!statusCode && !opts.retryOnNetworkError) {
          throw new AbortError(error);
        }
        
        // Re-throw to trigger retry
        throw error;
      }
    },
    {
      retries: opts.maxRetries,
      minTimeout: opts.retryDelay,
      maxTimeout: opts.retryMaxDelay,
      factor: opts.retryMultiplier,
      onFailedAttempt: opts.onFailedAttempt,
    }
  );
}
