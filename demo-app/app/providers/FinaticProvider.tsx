'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FinaticConnect } from '@finatic/client';
import { useEnvironmentConfig } from '@/app/providers/EnvironmentConfigProvider';

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
  sessionInfo: string;
  logs: LogEntry[];
  addLog: (type: LogEntry['type'], message: string) => void;
  clearLogs: () => void;
  reinitialize: () => Promise<void>;
  storedUserId: string | null;
  setStoredUserId: (userId: string) => void;
  clearStoredUserId: () => void;
  usage: UsageStats;
  clearUsage: () => void;
  // Global authentication state
  isAuthed: boolean;
  currentUserId: string | null;
  checkAuth: () => Promise<void>;
  setAuthState: (isAuthenticated: boolean, userId: string | null) => void;
}

const FinaticContext = createContext<FinaticContextValue | undefined>(undefined);

export function FinaticProvider({ children }: { children: React.ReactNode }) {
  const { mode, environment, getPublicApiUrl } = useEnvironmentConfig();

  const [finatic, setFinatic] = useState<FinaticConnect | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<string>('Not initialized');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [storedUserId, setStoredUserIdState] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const apiBaseUrlRef = useRef<string | null>(null);
  const lastCheckedAuthRef = useRef<{
    finatic: FinaticConnect | null;
  } | null>(null);
  const isInitializingRef = useRef<boolean>(false);
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
    setLogs((prev) => [...prev, { type, message, timestamp: new Date().toLocaleTimeString() }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const getStoredUserId = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('finatic_user_id');
  }, []);

  const setStoredUserId = useCallback((userId: string) => {
    if (typeof window === 'undefined') return;
    console.log('🔍 setStoredUserId called with:', userId);
    localStorage.setItem('finatic_user_id', userId);
    setStoredUserIdState(userId);
    console.log('🔍 localStorage set, new value:', localStorage.getItem('finatic_user_id'));
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
    // Deprecated - side effects are now in useEffect([usage])
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

  const recordMethodCall = useCallback(
    (methodName: string, durationMs: number, bytes: number, isError = false) => {
      setUsage((prev) => {
        const rolled = ensureDayRollover(prev);
        const existing =
          rolled.methods[methodName] ||
          ({
            count: 0,
            totalDurationMs: 0,
            lastDurationMs: 0,
            errorCount: 0,
            totalBytes: 0,
          } as MethodStats);
        const next: UsageStats = {
          ...rolled,
          lastSavedAt: new Date().toISOString(),
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
        return next;
      });
    },
    [ensureDayRollover]
  );

  const recordApiRequest = useCallback(
    (path: string, method: string, status: number, durationMs: number, bytes: number) => {
      setUsage((prev) => {
        const rolled = ensureDayRollover(prev);
        const key = `${method.toUpperCase()} ${path}`;
        const existing =
          rolled.routes[key] ||
          ({
            count: 0,
            totalDurationMs: 0,
            lastDurationMs: 0,
            lastStatus: null,
            method: method.toUpperCase(),
            totalBytes: 0,
          } as RouteStats);
        const next: UsageStats = {
          ...rolled,
          lastSavedAt: new Date().toISOString(),
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
        return next;
      });
    },
    [ensureDayRollover]
  );

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
      return cleared;
    });
  }, []);

  const checkAuth = useCallback(async () => {
    if (!finatic) {
      setIsAuthed(false);
      setCurrentUserId(null);
      return;
    }

    try {
      const authed = finatic.isAuthed();
      const uid = finatic.getUserId() ?? null;

      setIsAuthed(authed);
      setCurrentUserId(uid);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthed(false);
      setCurrentUserId(null);
    }
  }, [finatic]);

  // Method to directly set authentication state after portal confirmation
  const setAuthState = useCallback(
    (isAuthenticated: boolean, userId: string | null) => {
      console.log('🔍 setAuthState() called with:', { isAuthenticated, userId });
      setIsAuthed(isAuthenticated);
      setCurrentUserId(userId);
      if (isAuthenticated && userId) {
        addLog('success', `Authentication state updated - User: ${userId}`);
      }
    },
    [addLog]
  );

  // Full cleanup function to clear all SDK-related state
  // This ensures the old SDK instance is completely cleared before creating a new one
  const clearSDKState = useCallback(async () => {
    addLog('info', '🔄 Clearing old SDK instance and all related state...');

    // Store the old instance ID for logging before clearing
    const oldInstanceId = finatic ? (finatic as any).__instanceId : null;
    if (oldInstanceId) {
      addLog('info', `🗑️ Clearing old instance ID: ${oldInstanceId}`);
    }

    // CRITICAL: Close any existing portal before clearing the instance
    // This ensures the portal doesn't hold references to the old instance
    if (finatic && typeof (finatic as any).closePortal === 'function') {
      try {
        addLog('info', '🔍 Closing existing portal before clearing instance...');
        await (finatic as any).closePortal();
        // Small delay to ensure portal is fully closed
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        addLog(
          'info',
          `🔍 Error closing portal (may not be open): ${err instanceof Error ? err.message : 'Unknown'}`
        );
      }
    }

    // Clear the SDK instance (triggers garbage collection of old instance)
    // This is critical - the old FinaticConnect instance must be nulled before creating new one
    setFinatic(null);

    // Clear auth check tracking ref
    lastCheckedAuthRef.current = null;

    // Clear error state
    setError(null);

    // Reset session info
    setSessionInfo('Not initialized');

    // Clear API base URL ref
    apiBaseUrlRef.current = null;

    addLog('success', '✅ SDK state fully cleared - old instance removed');
  }, [addLog, finatic]);

  const initializeSDK = useCallback(async () => {
    // Prevent concurrent initialization
    if (isInitializingRef.current) {
      console.log('⏸️ SDK initialization already in progress, skipping...');
      return;
    }

    try {
      isInitializingRef.current = true;

      // FULL CLEANUP: Clear everything before reinitializing
      // This ensures the old SDK instance is completely destroyed and garbage collected
      await clearSDKState();

      // Small delay to ensure state updates are processed before creating new instance
      // This guarantees the old instance is fully cleared
      await new Promise((resolve) => setTimeout(resolve, 0));

      setIsLoading(true);
      addLog('info', `🔄 Reinitializing SDK`);

      const publicApiUrl = getPublicApiUrl() || 'http://localhost:8000';

      const existingUserId = getStoredUserId();
      if (existingUserId) {
        addLog('info', `Found stored userId: ${existingUserId}`);
      }

      addLog('info', 'Initializing SDK');
      addLog('info', `Using mode/environment: ${mode}/${environment}`);

      const apiUrl = publicApiUrl;

      addLog('info', `Using API URL: ${apiUrl}`);
      apiBaseUrlRef.current = apiUrl;
      const initStart = typeof performance !== 'undefined' ? performance.now() : Date.now();

      // Get token from API
      const response = await fetch(
        `/api/getToken?${new URLSearchParams({ mode, environment }).toString()}`
      );
      if (!response.ok) {
        addLog('error', 'Failed to get token from /api/getToken');
        throw new Error('Failed to get token');
      }
      const responseData = await response.json();

      // Handle the actual API response structure: { success: { data: { one_time_token: ... } } }
      const token = responseData.success?.data?.one_time_token || responseData.data?.one_time_token;
      if (!token) {
        addLog(
          'error',
          `No token found in API response. Response: ${JSON.stringify(responseData, null, 2)}`
        );
        throw new Error('No token found in API response');
      }

      addLog(
        'info',
        `🔑 Got new token: ${token.substring(0, 20)}..., creating new FinaticConnect instance...`
      );
      addLog('info', `🔑 Token full: ${token}`);

      // Create a unique identifier for this instance to track it
      const instanceId = `finatic_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      addLog('info', `🆔 New instance ID: ${instanceId}`);

      const realFinatic = await FinaticConnect.init(token, existingUserId || undefined, {
        baseUrl: apiUrl,
      });

      // Add instance ID to the finatic object for tracking
      (realFinatic as any).__instanceId = instanceId;
      (realFinatic as any).__token = token.substring(0, 20) + '...';

      addLog('info', `✅ New FinaticConnect instance created with ID: ${instanceId}`);

      // Wrap finatic with a Proxy to track method calls and durations
      const wrapped = new Proxy(realFinatic as unknown as Record<string, unknown>, {
        get(target, prop, receiver) {
          const value = Reflect.get(target, prop, receiver);
          if (typeof value === 'function') {
            return function wrappedMethod(this: unknown, ...args: unknown[]) {
              const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
              try {
                const result = (value as Function).apply(target, args);
                if (result && typeof (result as Promise<unknown>).then === 'function') {
                  return (result as Promise<unknown>)
                    .then((res) => {
                      const duration =
                        (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
                        start;
                      const bytes = estimateBytes(res);
                      recordMethodCall(String(prop), duration, bytes, false);
                      return res;
                    })
                    .catch((err) => {
                      const duration =
                        (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
                        start;
                      recordMethodCall(String(prop), duration, 0, true);
                      throw err;
                    });
                }
                const duration =
                  (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
                const bytes = estimateBytes(result);
                recordMethodCall(String(prop), duration, bytes, false);
                return result;
              } catch (err) {
                const duration =
                  (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
                recordMethodCall(String(prop), duration, 0, true);
                throw err;
              }
            };
          }
          return value;
        },
      });

      // CRITICAL: Set the new finatic instance - this will trigger adapter reinitialization
      addLog('info', `🔄 Setting new finatic instance in state with ID: ${instanceId}`);

      // Set the new instance - this should trigger the adapter to recreate
      setFinatic(wrapped as unknown as FinaticConnect);

      // Force a state update by using a callback to ensure React processes it
      // We'll use a small delay to let React batch and process the state update
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify the instance was created with the new token by checking a property
      // This ensures we're using the new instance, not the old one
      try {
        const testAuth = (wrapped as unknown as FinaticConnect).isAuthed();
        addLog('info', `🔍 Verified new instance (${instanceId}) isAuthed() = ${testAuth}`);

        const sessionId = (wrapped as any).sessionId;
        addLog('info', `🔍 Instance sessionId: ${sessionId}`);

        // Force close any existing portal to ensure it uses the new instance
        try {
          if (typeof (wrapped as any).closePortal === 'function') {
            addLog('info', '🔍 Closing any existing portal to ensure fresh start...');
            await (wrapped as any).closePortal();
          }
        } catch (portalErr) {
          // Portal might not be open, that's fine
          addLog('info', '🔍 No existing portal to close (or already closed)');
        }

        // Check authentication status right after init - if SDK is already authenticated, set auth state
        try {
          const isAuth = (wrapped as unknown as FinaticConnect).isAuthed();
          addLog('info', `🔍 Checking auth status after init: isAuthed() = ${isAuth}`);
          
          if (isAuth) {
            // SDK is already authenticated, get user ID and set auth state
            const userId = (wrapped as unknown as FinaticConnect).getUserId();
            addLog('info', `🔍 SDK is authenticated, userId: ${userId}`);
            
            if (userId) {
              setAuthState(true, userId);
              setStoredUserId(userId);
              addLog('success', `✅ Authentication state set after init - User: ${userId}`);
            } else {
              // Authenticated but no user ID yet
              setAuthState(true, null);
              addLog('info', '✅ Authentication state set after init (no user ID yet)');
            }
          } else {
            // Not authenticated, clear auth state
            setAuthState(false, null);
            addLog('info', '🔍 SDK is not authenticated after init');
          }
        } catch (authErr) {
          addLog('error', `⚠️ Error checking auth status after init: ${authErr instanceof Error ? authErr.message : 'Unknown error'}`);
        }
      } catch (err) {
        addLog(
          'error',
          `⚠️ Could not verify new instance: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
      }

      setSessionInfo(
        `Real Mode - Authenticated${existingUserId ? ` (User: ${existingUserId})` : ''}`
      );
      const initDuration =
        (typeof performance !== 'undefined' ? performance.now() : Date.now()) - initStart;
      recordMethodCall('FinaticConnect.init', initDuration, 0, false);
      addLog('success', `✅ SDK fully reinitialized in REAL mode`);
      addLog('info', `New SDK instance created using API URL: ${apiUrl}`);
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
      isInitializingRef.current = false;
    }
  }, [
    addLog,
    getStoredUserId,
    estimateBytes,
    recordMethodCall,
    clearSDKState,
    setAuthState,
    setStoredUserId,
    mode,
    environment,
    getPublicApiUrl,
  ]);

  // Load storedUserId from localStorage after mount to prevent hydration mismatch
  // Also clean up old SDK type preference since we only use client SDK now
  useEffect(() => {
    const userId = getStoredUserId();
    if (userId) {
      setStoredUserIdState(userId);
    }
    // Clean up old SDK type preference
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('finatic_sdk_type');
      } catch {
        // Ignore errors
      }
    }
  }, []);

  // Initialize SDK only on mount
  useEffect(() => {
    void initializeSDK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Re-initialize when mode or environment changes
  useEffect(() => {
    if (isInitializingRef.current) return;
    void initializeSDK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, environment]);

  // Check authentication when SDK is ready (finatic changes)
  // Only check when the SDK instance actually changes, not when checkAuth function reference changes
  useEffect(() => {
    // Check if we've already checked auth for this exact SDK instance
    const currentInstance = { finatic };
    const lastInstance = lastCheckedAuthRef.current;

    // Only check if the instance actually changed
    if (
      lastInstance &&
      lastInstance.finatic === currentInstance.finatic
    ) {
      return; // Already checked auth for this instance
    }

    // Only check auth if we have a valid SDK instance
    if (finatic) {
      lastCheckedAuthRef.current = currentInstance;
      void checkAuth();
    } else {
      // No valid SDK instance, clear auth state
      setIsAuthed(false);
      setCurrentUserId(null);
      lastCheckedAuthRef.current = currentInstance;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finatic]); // Intentionally exclude checkAuth to prevent loops

  // Persist usage and emit event AFTER state updates to avoid re-entrant updates during render
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
      emitUsageUpdated();
    } catch {}
  }, [usage, emitUsageUpdated]);

  // Instrument global fetch once; decide whether to record using apiBaseUrlRef
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const originalFetch = window.fetch.bind(window);
    const instrumentedFetch: typeof window.fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit
    ) => {
      const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
      let url: string;
      let method = (
        init?.method ||
        (typeof input === 'object' && 'method' in input ? (input as Request).method : 'GET') ||
        'GET'
      ).toUpperCase();
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
          const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
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
          const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
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

  const value = useMemo<FinaticContextValue>(
    () => ({
      finatic,
      isLoading,
      error,
      sessionInfo,
      logs,
      addLog,
      clearLogs,
      reinitialize: initializeSDK,
      storedUserId,
      setStoredUserId,
      clearStoredUserId,
      usage,
      clearUsage,
      isAuthed,
      currentUserId,
      checkAuth,
      setAuthState,
    }),
    [
      finatic,
      isLoading,
      error,
      sessionInfo,
      logs,
      addLog,
      clearLogs,
      initializeSDK,
      storedUserId,
      setStoredUserId,
      clearStoredUserId,
      usage,
      clearUsage,
      isAuthed,
      currentUserId,
      checkAuth,
      setAuthState,
    ]
  );

  return <FinaticContext.Provider value={value}>{children}</FinaticContext.Provider>;
}

export function useFinatic() {
  const ctx = useContext(FinaticContext);
  if (!ctx) {
    throw new Error('useFinatic must be used within a FinaticProvider');
  }
  return ctx;
}
