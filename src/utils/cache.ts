/**
 * Response caching utility with browser-compatible Map-based cache (Phase 2B).
 *
 * Generated - do not edit directly.
 */

import type { SdkConfig } from '../config';

interface CacheEntry {
  value: any;
  expires: number;
}

interface BrowserCache {
  get(key: string): any | undefined;
  set(key: string, value: any, ttl?: number): boolean;
  del(key: string): number;
  clear(): void;
  keys(): string[];
  has(key: string): boolean;
}

class MapBasedCache implements BrowserCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private defaultTtl: number;
  private cleanupInterval: number | null = null;

  constructor(maxSize: number = 1000, defaultTtl: number = 300) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
    this.startCleanup();
  }

  private startCleanup(): void {
    // Clean up expired entries every minute
    if (typeof window !== 'undefined') {
      this.cleanupInterval = window.setInterval(() => {
        this.cleanup();
      }, 60000);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires < now) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  private evictLRU(): void {
    if (this.cache.size < this.maxSize) {
      return;
    }

    // Simple LRU: remove oldest entry (first in Map)
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
    }
  }

  get(key: string): any | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: any, ttl?: number): boolean {
    // Evict if at max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const expires = Date.now() + (ttl || this.defaultTtl) * 1000;
    this.cache.set(key, { value, expires });
    return true;
  }

  del(key: string): number {
    return this.cache.delete(key) ? 1 : 0;
  }

  clear(): void {
    this.cache.clear();
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    // Check if expired
    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  destroy(): void {
    if (this.cleanupInterval !== null && typeof window !== 'undefined') {
      window.clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

let _cacheInstance: BrowserCache | null = null;

/**
 * Get or create cache instance.
 */
export function getCache(config?: SdkConfig): BrowserCache | null {
  if (!config?.cacheEnabled) {
    return null;
  }

  if (_cacheInstance) {
    return _cacheInstance;
  }

  _cacheInstance = new MapBasedCache(config.cacheMaxSize || 1000, config.cacheTtl || 300);

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
      .map((k) => `${k}=${JSON.stringify(query[k])}`)
      .join('&');
    parts.push(`query:${queryStr}`);
  }
  if (include.includes('body')) {
    parts.push(`body:${JSON.stringify(params['body'] || {})}`);
  }

  return `finatic:${parts.join('|')}`;
}
