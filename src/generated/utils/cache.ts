/**
 * Response caching utility with node-cache (Phase 2B).
 * 
 * Generated - do not edit directly.
 */

// @ts-ignore - node-cache types available via @types/node-cache
import NodeCache from 'node-cache';
import type { SdkConfig } from '../config';

let _cacheInstance: NodeCache | null = null;

/**
 * Get or create cache instance.
 */
export function getCache(config?: SdkConfig): NodeCache | null {
  if (!config?.cacheEnabled) {
    return null;
  }
  
  if (_cacheInstance) {
    return _cacheInstance;
  }
  
  _cacheInstance = new NodeCache({
    stdTTL: config.cacheTtl || 300,
    maxKeys: config.cacheMaxSize || 1000,
    useClones: false,
  });
  
  return _cacheInstance;
}

/**
 * Generate cache key from method and parameters.
 */
export function generateCacheKey(
  method: string,
  path: string,
  params: Record<string, any>,
  config?: SdkConfig
): string {
  const include = config?.cacheKeyInclude || ['method', 'path', 'query', 'body'];
  const parts: string[] = [];
  
  if (include.includes('method')) parts.push(`method:${method}`);
  if (include.includes('path')) parts.push(`path:${path}`);
  if (include.includes('query')) {
    const query = params['query'] || params;
    const queryStr = Object.keys(query)
      .sort()
      .map(k => `${k}=${JSON.stringify(query[k])}`)
      .join('&');
    parts.push(`query:${queryStr}`);
  }
  if (include.includes('body')) {
    parts.push(`body:${JSON.stringify(params['body'] || {})}`);
  }
  
  return `finatic:${parts.join('|')}`;
}
