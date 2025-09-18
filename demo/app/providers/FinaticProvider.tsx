'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  FinaticConnect,
} from '@finatic/client';

type LogEntry = {
  type: 'info' | 'error' | 'success';
  message: string;
  timestamp: string;
};

type MethodStats = {
  count: number;
  totalDurationMs: number;
  lastDurationMs: number;
  errorCount: number;
  totalBytes: number;
};

type RouteStats = {
  count: number;
  totalDurationMs: number;
  lastDurationMs: number;
  lastStatus: number | null;
  method: string;
  totalBytes: number;
};

type UsageStats = {
  day: string; // YYYY-MM-DD
  startedAt: string;
  lastSavedAt: string | null;
  lastClearedAt: string | null;
  totals: {
    apiRequests: number;
    methodCalls: number;
    errors: number;
    totalBytes: number;
  };
  methods: Record<string, MethodStats>;
  routes: Record<string, RouteStats>;
};

const USAGE_STORAGE_KEY = 'finatic_usage_v1';

interface FinaticContextValue {
  finatic: FinaticConnect | null;
  isLoading: boolean;
  error: string | null;
  isMockMode: boolean;
  sessionInfo: string;
  logs: LogEntry[];
  addLog: (type: LogEntry['type'], message: string) => void;
  reinitialize: () => Promise<void>;
  storedUserId: string | null;
  setStoredUserId: (userId: string) => void;
  clearStoredUserId: () => void;
  usage: UsageStats;
  clearUsage: () => void;
}

const FinaticContext = createContext<FinaticContextValue | undefined>(undefined);

export function FinaticProvider({ children }: { children: React.ReactNode }) {
  const [finatic, setFinatic] = useState<FinaticConnect | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<string>('Not initialized');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [storedUserId, setStoredUserIdState] = useState<string | null>(null);
  const apiBaseUrlRef = useRef<string | null>(null);
  const [usage, setUsage] = useState<UsageStats>(() => {
    if (typeof window === 'undefined') {
      const now = new Date();
      const day = now.toISOString().slice(0, 10);
      return {
        day,
        startedAt: now.toISOString(),
        lastSavedAt: null,
        lastClearedAt: null,
        totals: { apiRequests: 0, methodCalls: 0, errors: 0, totalBytes: 0 },
        methods: {},
        routes: {},
      };
    }
    try {
      const raw = localStorage.getItem(USAGE_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as UsageStats;
      }
    } catch {}
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    return {
      day,
      startedAt: now.toISOString(),
      lastSavedAt: null,
      lastClearedAt: null,
      totals: { apiRequests: 0, methodCalls: 0, errors: 0, totalBytes: 0 },
      methods: {},
      routes: {},
    };
  });

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    setLogs((prev) => [
      ...prev,
      { type, message, timestamp: new Date().toLocaleTimeString() },
    ]);
  }, []);

  const getStoredUserId = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('finatic_user_id');
  }, []);

  const setStoredUserId = useCallback((userId: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('finatic_user_id', userId);
    setStoredUserIdState(userId);
  }, []);

  const clearStoredUserId = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('finatic_user_id');
    setStoredUserIdState(null);
  }, []);

  const emitUsageUpdated = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.dispatchEvent(new CustomEvent('finatic-usage-updated'));
    } catch {}
  }, []);

  const persistUsage = useCallback((next: UsageStats) => {
    if (typeof window === 'undefined') return;
    try {
      const updated = { ...next, lastSavedAt: new Date().toISOString() };
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(updated));
      setUsage(updated);
      emitUsageUpdated();
    } catch {}
  }, []);

  const ensureDayRollover = useCallback((current: UsageStats): UsageStats => {
    const today = new Date().toISOString().slice(0, 10);
    if (current.day === today) return current;
    return {
      day: today,
      startedAt: new Date().toISOString(),
      lastSavedAt: null,
      lastClearedAt: current.lastClearedAt,
      totals: { apiRequests: 0, methodCalls: 0, errors: 0, totalBytes: 0 },
      methods: {},
      routes: {},
    };
  }, []);

  const estimateBytes = useCallback((value: unknown): number => {
    try {
      if (value == null) return 0;
      if (typeof value === 'string') {
        return new TextEncoder().encode(value).length;
      }
      if (value instanceof Blob) return value.size;
      if (typeof value === 'object') {
        return new TextEncoder().encode(JSON.stringify(value)).length;
      }
      return 0;
    } catch {
      return 0;
    }
  }, []);

  const recordMethodCall = useCallback((methodName: string, durationMs: number, bytes: number, isError = false) => {
    setUsage((prev) => {
      const rolled = ensureDayRollover(prev);
      const existing = rolled.methods[methodName] || { count: 0, totalDurationMs: 0, lastDurationMs: 0, errorCount: 0, totalBytes: 0 } as MethodStats;
      const next: UsageStats = {
        ...rolled,
        totals: {
          apiRequests: rolled.totals.apiRequests,
          methodCalls: rolled.totals.methodCalls + 1,
          errors: rolled.totals.errors + (isError ? 1 : 0),
          totalBytes: rolled.totals.totalBytes + (bytes || 0),
        },
        methods: {
          ...rolled.methods,
          [methodName]: {
            count: existing.count + 1,
            totalDurationMs: existing.totalDurationMs + durationMs,
            lastDurationMs: durationMs,
            errorCount: existing.errorCount + (isError ? 1 : 0),
            totalBytes: existing.totalBytes + (bytes || 0),
          },
        },
      };
      // persist will set lastSavedAt and state
      if (typeof window !== 'undefined') {
        try {
          const toSave = { ...next, lastSavedAt: new Date().toISOString() };
          localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(toSave));
          emitUsageUpdated();
          return toSave;
        } catch {
          return next;
        }
      }
      return next;
    });
  }, [ensureDayRollover]);

  const recordApiRequest = useCallback((path: string, method: string, status: number, durationMs: number, bytes: number) => {
    setUsage((prev) => {
      const rolled = ensureDayRollover(prev);
      const key = `${method.toUpperCase()} ${path}`;
      const existing = rolled.routes[key] || { count: 0, totalDurationMs: 0, lastDurationMs: 0, lastStatus: null, method: method.toUpperCase(), totalBytes: 0 } as RouteStats;
      const next: UsageStats = {
        ...rolled,
        totals: {
          apiRequests: rolled.totals.apiRequests + 1,
          methodCalls: rolled.totals.methodCalls,
          errors: rolled.totals.errors + (status >= 400 ? 1 : 0),
          totalBytes: rolled.totals.totalBytes + (bytes || 0),
        },
        routes: {
          ...rolled.routes,
          [key]: {
            count: existing.count + 1,
            totalDurationMs: existing.totalDurationMs + durationMs,
            lastDurationMs: durationMs,
            lastStatus: status,
            method: method.toUpperCase(),
            totalBytes: existing.totalBytes + (bytes || 0),
          },
        },
      };
      if (typeof window !== 'undefined') {
        try {
          const toSave = { ...next, lastSavedAt: new Date().toISOString() };
          localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(toSave));
          emitUsageUpdated();
          return toSave;
        } catch {
          return next;
        }
      }
      return next;
    });
  }, [ensureDayRollover]);

  const clearUsage = useCallback(() => {
    setUsage(() => {
      const now = new Date();
      const day = now.toISOString().slice(0, 10);
      const cleared: UsageStats = {
        day,
        startedAt: now.toISOString(),
        lastSavedAt: now.toISOString(),
        lastClearedAt: now.toISOString(),
        totals: { apiRequests: 0, methodCalls: 0, errors: 0, totalBytes: 0 },
        methods: {},
        routes: {},
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(cleared));
          emitUsageUpdated();
        } catch {}
      }
      return cleared;
    });
  }, [emitUsageUpdated]);

  const initializeSDK = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const useMocks = process.env.NEXT_PUBLIC_FINATIC_USE_MOCKS === 'true';
      const mockApiOnly = process.env.NEXT_PUBLIC_FINATIC_MOCK_API_ONLY === 'true';
      setIsMockMode(useMocks || mockApiOnly);

      const existingUserId = getStoredUserId();
      if (existingUserId) {
        addLog('info', `Found stored userId: ${existingUserId}`);
      }

      if (useMocks) {
        addLog('info', 'Initializing SDK in MOCK mode');
        setSessionInfo('Mock Mode - No real API calls');
        const apiUrl = process.env.NEXT_PUBLIC_FINATIC_API_URL || 'http://localhost:8000';
        apiBaseUrlRef.current = apiUrl;
        const initStart = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const mockFinatic = await FinaticConnect.init('mock-token', existingUserId || 'mock-user-123', {
          baseUrl: apiUrl,
        });
        const wrapped = new Proxy(mockFinatic as unknown as Record<string, unknown>, {
          get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            if (typeof value === 'function') {
              return function wrappedMethod(this: unknown, ...args: unknown[]) {
                const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
                try {
                  const result = (value as Function).apply(target, args);
                  if (result && typeof (result as Promise<unknown>).then === 'function') {
                    return (result as Promise<unknown>)
                      .then((res) => {
                        const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
                        const bytes = estimateBytes(res);
                        recordMethodCall(String(prop), duration, bytes, false);
                        return res;
                      })
                      .catch((err) => {
                        const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
                        recordMethodCall(String(prop), duration, 0, true);
                        throw err;
                      });
                  }
                  const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
                  const bytes = estimateBytes(result);
                  recordMethodCall(String(prop), duration, bytes, false);
                  return result;
                } catch (err) {
                  const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
                  recordMethodCall(String(prop), duration, 0, true);
                  throw err;
                }
              };
            }
            return value;
          },
        });
        setFinatic(wrapped as unknown as FinaticConnect);
        const initDuration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - initStart;
        recordMethodCall('FinaticConnect.init', initDuration, 0, false);
        addLog('success', 'SDK initialized in MOCK mode');
        return;
      }

      if (mockApiOnly) {
        addLog('info', 'Initializing SDK in MOCK API ONLY mode');
        setSessionInfo('Mock API Only Mode - Mock API calls, real portal');
        const apiUrl = process.env.NEXT_PUBLIC_FINATIC_API_URL || 'http://localhost:8000';
        apiBaseUrlRef.current = apiUrl;
        const initStart = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const mockFinatic = await FinaticConnect.init('mock-token', existingUserId || 'mock-user-123', {
          baseUrl: apiUrl,
        });
        const wrapped = new Proxy(mockFinatic as unknown as Record<string, unknown>, {
          get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            if (typeof value === 'function') {
              return function wrappedMethod(this: unknown, ...args: unknown[]) {
                const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
                try {
                  const result = (value as Function).apply(target, args);
                  if (result && typeof (result as Promise<unknown>).then === 'function') {
                    return (result as Promise<unknown>)
                      .then((res) => {
                        const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
                        const bytes = estimateBytes(res);
                        recordMethodCall(String(prop), duration, bytes, false);
                        return res;
                      })
                      .catch((err) => {
                        const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
                        recordMethodCall(String(prop), duration, 0, true);
                        throw err;
                      });
                  }
                  const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
                  const bytes = estimateBytes(result);
                  recordMethodCall(String(prop), duration, bytes, false);
                  return result;
                } catch (err) {
                  const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
                  recordMethodCall(String(prop), duration, 0, true);
                  throw err;
                }
              };
            }
            return value;
          },
        });
        setFinatic(wrapped as unknown as FinaticConnect);
        const initDuration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - initStart;
        recordMethodCall('FinaticConnect.init', initDuration, 0, false);
        addLog('success', 'SDK initialized in MOCK API ONLY mode');
        return;
      }

      addLog('info', 'Initializing SDK in REAL mode');
      const apiUrl = process.env.NEXT_PUBLIC_FINATIC_API_URL || 'http://localhost:8000';
      addLog('info', `Using API URL: ${apiUrl}`);
      apiBaseUrlRef.current = apiUrl;
      const initStart = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const response = await fetch('/api/getToken');
      if (!response.ok) {
        addLog('error', 'Failed to get token from /api/getToken');
        throw new Error('Failed to get token');
      }
      const responseData = await response.json();
      const token = responseData.data?.one_time_token;
      if (!token) {
        addLog('error', 'No token found in API response');
        throw new Error('No token found in API response');
      }

      const realFinatic = await FinaticConnect.init(token, existingUserId || undefined, {
        baseUrl: apiUrl,
      });
      // Wrap finatic with a Proxy to track method calls and durations
      const wrapped = new Proxy(realFinatic as unknown as Record<string, unknown>, {
        get(target, prop, receiver) {
          const value = Reflect.get(target, prop, receiver);
          if (typeof value === 'function') {
            return function wrappedMethod(this: unknown, ...args: unknown[]) {
              const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
              try {
                const result = (value as Function).apply(target, args);
                if (result && typeof (result as Promise<unknown>).then === 'function') {
                  return (result as Promise<unknown>)
                    .then((res) => {
                      const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
                      const bytes = estimateBytes(res);
                      recordMethodCall(String(prop), duration, bytes, false);
                      return res;
                    })
                    .catch((err) => {
                      const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
                      recordMethodCall(String(prop), duration, 0, true);
                      throw err;
                    });
                }
                const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
                const bytes = estimateBytes(result);
                recordMethodCall(String(prop), duration, bytes, false);
                return result;
              } catch (err) {
                const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
                recordMethodCall(String(prop), duration, 0, true);
                throw err;
              }
            };
          }
          return value;
        },
      });
      setFinatic(wrapped as unknown as FinaticConnect);
      setSessionInfo(`Real Mode - Authenticated${existingUserId ? ` (User: ${existingUserId})` : ''}`);
      const initDuration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - initStart;
      recordMethodCall('FinaticConnect.init', initDuration, 0, false);
      addLog('success', 'SDK initialized in REAL mode');
    } catch (err) {
      try {
        const initDuration = 0; // keep zero if error before timing start
        recordMethodCall('FinaticConnect.init', initDuration, 0, true);
      } catch {}
      const msg = err instanceof Error ? err.message : 'Unknown error';
      addLog('error', `Failed to initialize SDK: ${msg}`);
      setError(msg);
      setSessionInfo('Failed to initialize');
    } finally {
      setIsLoading(false);
    }
  }, [addLog, getStoredUserId, estimateBytes, recordMethodCall]);

  useEffect(() => {
    setStoredUserIdState(getStoredUserId());
    void initializeSDK();
  }, [getStoredUserId, initializeSDK]);

  // Instrument global fetch once; decide whether to record using apiBaseUrlRef
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const originalFetch = window.fetch.bind(window);
    const instrumentedFetch: typeof window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      let url: string;
      let method = (init?.method || (typeof input === 'object' && 'method' in input ? (input as Request).method : 'GET') || 'GET').toUpperCase();
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else {
        url = (input as Request).url;
      }
      // Only track requests targeting the SDK base URL. Ignore local Next.js /api/*.
      const localApiPrefix = `${window.location.origin}/api/`;
      const base = apiBaseUrlRef.current;
      const isSdkCall = !!base && url.startsWith(base);
      const isLocalNextApi = url.startsWith(localApiPrefix) || url.startsWith('/api/');
      try {
        const response = await originalFetch(input as any, init as any);
        if (isSdkCall && !isLocalNextApi) {
          const end = (typeof performance !== 'undefined' ? performance.now() : Date.now());
          const duration = end - start;
          let bytes = 0;
          try {
            const contentLength = response.headers.get('content-length');
            if (contentLength) {
              bytes = parseInt(contentLength, 10) || 0;
            } else {
              const cloned = response.clone();
              const buf = await cloned.arrayBuffer();
              bytes = buf.byteLength;
            }
          } catch {}
          const path = (() => {
            try {
              const u = new URL(url, window.location.origin);
              return u.pathname;
            } catch {
              return url;
            }
          })();
          recordApiRequest(path, method, response.status, duration, bytes);
        }
        return response;
      } catch (err) {
        if (isSdkCall && !isLocalNextApi) {
          const end = (typeof performance !== 'undefined' ? performance.now() : Date.now());
          const duration = end - start;
          const path = (() => {
            try {
              const u = new URL(url, window.location.origin);
              return u.pathname;
            } catch {
              return url;
            }
          })();
          // Treat network errors as 0 status for counting
          recordApiRequest(path, method, 0, duration, 0);
        }
        throw err;
      }
    };
    window.fetch = instrumentedFetch;
    return () => {
      window.fetch = originalFetch;
    };
  }, [recordApiRequest]);

  const value = useMemo<FinaticContextValue>(() => ({
    finatic,
    isLoading,
    error,
    isMockMode,
    sessionInfo,
    logs,
    addLog,
    reinitialize: initializeSDK,
    storedUserId,
    setStoredUserId,
    clearStoredUserId,
    usage,
    clearUsage,
  }), [finatic, isLoading, error, isMockMode, sessionInfo, logs, addLog, initializeSDK, storedUserId, setStoredUserId, clearStoredUserId, usage, clearUsage]);

  return (
    <FinaticContext.Provider value={value}>{children}</FinaticContext.Provider>
  );
}

export function useFinatic() {
  const ctx = useContext(FinaticContext);
  if (!ctx) {
    throw new Error('useFinatic must be used within a FinaticProvider');
  }
  return ctx;
}


