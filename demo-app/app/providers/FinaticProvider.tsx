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
import { SdkType, SdkAdapter, createSdkAdapter } from '@/lib/sdk-adapter';
// Removed: import { useEnvironmentConfig } from './EnvironmentConfigProvider';

export type { SdkType };

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
  // SDK adapter - this is the new way to interact with the SDK
  sdkAdapter: SdkAdapter | null;
  isLoading: boolean;
  error: string | null;
  isMockMode: boolean;
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
  // SDK adapter state
  sdkType: SdkType;
  setSdkType: (sdkType: SdkType) => void;
}

const FinaticContext = createContext<FinaticContextValue | undefined>(undefined);

export function FinaticProvider({ children }: { children: React.ReactNode }) {
  // Simplified: No longer using mode/environment config

  const [finatic, setFinatic] = useState<FinaticConnect | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<string>('Not initialized');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [storedUserId, setStoredUserIdState] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const apiBaseUrlRef = useRef<string | null>(null);
  const lastCheckedAuthRef = useRef<{
    finatic: FinaticConnect | null;
    sdkAdapter: SdkAdapter | null;
    sdkType: SdkType;
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

  // SDK type state management with localStorage persistence
  const [sdkType, setSdkTypeState] = useState<SdkType>(() => {
    if (typeof window === 'undefined') return 'client';
    try {
      return (localStorage.getItem('finatic_sdk_type') as SdkType) || 'client';
    } catch {
      return 'client';
    }
  });

  const setSdkType = useCallback((newSdkType: SdkType) => {
    console.log('🔄 Setting SDK type to:', newSdkType);
    setSdkTypeState(newSdkType);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('finatic_sdk_type', newSdkType);
        console.log('✅ SDK type saved to localStorage:', newSdkType);
      } catch (e) {
        console.warn('Failed to save SDK type to localStorage:', e);
      }
    }
  }, []);

  // SDK adapter state
  const [sdkAdapter, setSdkAdapterState] = useState<SdkAdapter | null>(null);

  // Track last finatic instance we created adapter for
  const lastFinaticForAdapterRef = useRef<FinaticConnect | null>(null);
  const lastSdkTypeForAdapterRef = useRef<SdkType | null>(null);

  // Initialize adapter based on SDK type and client instance
  // This will re-run when finatic instance changes (after reinitialization)
  useEffect(() => {
    // Check if we need to recreate the adapter
    // Use instance ID comparison for more reliable change detection
    const currentInstanceId = finatic ? (finatic as any).__instanceId : null;
    const previousInstanceId = lastFinaticForAdapterRef.current
      ? (lastFinaticForAdapterRef.current as any).__instanceId
      : null;
    const finaticChanged = currentInstanceId !== previousInstanceId;
    const sdkTypeChanged = lastSdkTypeForAdapterRef.current !== sdkType;
    const needsRecreate = finaticChanged || sdkTypeChanged;

    if (!needsRecreate && sdkAdapter) {
      // Adapter is still valid, no need to recreate
      console.log('⏭️ Skipping adapter recreation - instance unchanged', {
        currentInstanceId,
        previousInstanceId,
      });
      return;
    }

    try {
      if (sdkType === 'client' && finatic) {
        console.log('🔄 Initializing Client SDK adapter');
        console.log('🔄 Current finatic instance ID:', currentInstanceId);
        console.log('🔄 Previous finatic instance ID:', previousInstanceId);
        console.log('🔄 Instance changed?', finaticChanged);
        console.log('🔄 Finatic object reference:', finatic);

        const adapter = createSdkAdapter('client', finatic);
        setSdkAdapterState(adapter);
        // CRITICAL: Store the finatic reference BEFORE setting the adapter state
        // This ensures the ref is updated synchronously
        lastFinaticForAdapterRef.current = finatic;
        lastSdkTypeForAdapterRef.current = sdkType;
        console.log(
          '✅ Client SDK adapter initialized with finatic instance ID:',
          currentInstanceId
        );
        console.log('✅ Stored finatic reference in ref:', lastFinaticForAdapterRef.current);
      } else if (sdkType === 'python') {
        console.log('🔄 Initializing Python Server SDK adapter');
        const adapter = createSdkAdapter('python');
        setSdkAdapterState(adapter);
        lastFinaticForAdapterRef.current = null; // Not applicable for server SDKs
        lastSdkTypeForAdapterRef.current = sdkType;
        console.log('✅ Python Server SDK adapter initialized');
      } else if (sdkType === 'node') {
        console.log('🔄 Initializing Node Server SDK adapter');
        const adapter = createSdkAdapter('node');
        setSdkAdapterState(adapter);
        lastFinaticForAdapterRef.current = null; // Not applicable for server SDKs
        lastSdkTypeForAdapterRef.current = sdkType;
        console.log('✅ Node Server SDK adapter initialized');
      } else if (sdkType === 'client' && !finatic) {
        // Clear adapter if client SDK is selected but finatic instance is not ready
        if (sdkAdapter) {
          setSdkAdapterState(null);
          lastFinaticForAdapterRef.current = null;
          lastSdkTypeForAdapterRef.current = null;
          console.log('⚠️ Client SDK selected but finatic instance not ready yet');
        }
      } else {
        // Clear adapter if no valid configuration
        if (sdkAdapter) {
          setSdkAdapterState(null);
          lastFinaticForAdapterRef.current = null;
          lastSdkTypeForAdapterRef.current = null;
          console.log('⚠️ No adapter created - unknown SDK type or not ready');
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize SDK adapter:', error);
      setSdkAdapterState(null);
      lastFinaticForAdapterRef.current = null;
      lastSdkTypeForAdapterRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkType, finatic]); // Only reinitialize when SDK type or finatic instance changes, not mode/environment

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, { type, message, timestamp: new Date().toLocaleTimeString() }]);
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
      setUsage(prev => {
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
      setUsage(prev => {
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
    // Always use sdkAdapter when available (it wraps both client and server SDKs)
    // For client SDK, sdkAdapter provides isAuthenticated() wrapper around finatic.isAuthed()
    const authSource = sdkAdapter || finatic;

    if (!authSource) {
      setIsAuthed(false);
      setCurrentUserId(null);
      return;
    }

    try {
      // Check for isAuthenticated() method (sdkAdapter) or isAuthed() method (finatic directly)
      let authed = false;
      if (typeof authSource.isAuthenticated === 'function') {
        authed = await authSource.isAuthenticated();
      } else if (typeof (authSource as any).isAuthed === 'function') {
        // Direct finatic instance uses isAuthed()
        authed = (authSource as any).isAuthed();
      }
      
      const uid = typeof authSource.getUserId === 'function' ? await authSource.getUserId() : null;

      console.log('🔍 checkAuth() - authed:', authed, 'typeof:', typeof authed);
      console.log('🔍 checkAuth() - uid:', uid, 'typeof:', typeof uid);
      console.log(
        '🔍 checkAuth() - authSource:',
        authSource === sdkAdapter ? 'sdkAdapter' : 'finatic'
      );

      setIsAuthed(authed);
      setCurrentUserId(uid);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthed(false);
      setCurrentUserId(null);
    }
  }, [finatic, sdkAdapter, sdkType]);

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
    const oldInstanceId = lastFinaticForAdapterRef.current
      ? (lastFinaticForAdapterRef.current as any).__instanceId
      : null;
    if (oldInstanceId) {
      addLog('info', `🗑️ Clearing old instance ID: ${oldInstanceId}`);
    }

    // CRITICAL: Close any existing portal before clearing the instance
    // This ensures the portal doesn't hold references to the old instance
    const oldFinatic = lastFinaticForAdapterRef.current;
    if (oldFinatic && typeof (oldFinatic as any).closePortal === 'function') {
      try {
        addLog('info', '🔍 Closing existing portal before clearing instance...');
        await (oldFinatic as any).closePortal();
        // Small delay to ensure portal is fully closed
        await new Promise(resolve => setTimeout(resolve, 100));
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

    // Clear SDK adapter (which may hold references to the old SDK)
    setSdkAdapterState(null);

    // Clear adapter tracking refs to ensure new adapter is created with new finatic instance
    lastFinaticForAdapterRef.current = null;
    lastSdkTypeForAdapterRef.current = null;

    // Clear auth check tracking ref
    lastCheckedAuthRef.current = null;

    // Clear error state
    setError(null);

    // Reset session info
    setSessionInfo('Not initialized');

    // Clear API base URL ref
    apiBaseUrlRef.current = null;

    // Clear mock mode
    setIsMockMode(false);

    addLog('success', '✅ SDK state fully cleared - old instance removed');
  }, [addLog]);

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
      await new Promise(resolve => setTimeout(resolve, 0));

      setIsLoading(true);
      addLog('info', `🔄 Reinitializing SDK`);

      const useMocks = process.env.NEXT_PUBLIC_FINATIC_USE_MOCKS === 'true';
      const mockApiOnly = process.env.NEXT_PUBLIC_FINATIC_MOCK_API_ONLY === 'true';
      setIsMockMode(useMocks || mockApiOnly);

      const existingUserId = getStoredUserId();
      if (existingUserId) {
        addLog('info', `Found stored userId: ${existingUserId}`);
      }

      // Handle server SDK initialization
      if (sdkType === 'python' || sdkType === 'node') {
        const baseUrl = sdkType === 'python' ? 'http://localhost:8002' : 'http://localhost:8003';
        addLog('info', `Initializing ${sdkType} server SDK`);
        apiBaseUrlRef.current = baseUrl;

        try {
          // Initialize server SDK by starting a session
          // Pass stored user ID if available for auto-attachment
          // Get stored user ID directly from localStorage like the auth page does
          const directStoredUserId = localStorage.getItem('finatic_user_id');
          console.log('🔍 storedUserId from state:', storedUserId);
          console.log('🔍 directStoredUserId from localStorage:', directStoredUserId);
          const requestBody = directStoredUserId ? { user_id: directStoredUserId } : {};
          console.log('🔍 Request body being sent:', requestBody);
          const response = await fetch(`${baseUrl}/api/session/start`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            throw new Error(
              `Server SDK initialization failed: ${response.status} ${response.statusText}`
            );
          }

          const sessionData = await response.json();
          if (!sessionData.success) {
            throw new Error(
              `Server SDK initialization failed: ${sessionData.error || 'Unknown error'}`
            );
          }

          addLog('success', `${sdkType} server SDK session started`);
          setSessionInfo(
            `${sdkType.charAt(0).toUpperCase() + sdkType.slice(1)} Server SDK - Session started`
          );

          // If we started with a user ID, check authentication status
          if (directStoredUserId) {
            addLog(
              'info',
              `Session started with user ID: ${directStoredUserId}, checking authentication...`
            );
            // Trigger authentication check
            setTimeout(() => {
              checkAuth();
            }, 100);
          }

          // Client SDK instance already cleared in clearSDKState() at start of initializeSDK
          // Server SDK doesn't use finatic instance, so it remains null

          setIsLoading(false);
          return; // Early return for server SDKs
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to initialize server SDK';
          addLog('error', `Failed to initialize ${sdkType} server SDK: ${msg}`);
          setError(msg);
          setSessionInfo(`Failed to initialize ${sdkType} server SDK`);

          // Client SDK instance already cleared in clearSDKState() at start of initializeSDK
          // Error state already managed above

          setIsLoading(false);
          return;
        }
      }

      if (useMocks) {
        addLog('info', 'Initializing SDK in MOCK mode');
        setSessionInfo('Mock Mode - No real API calls');
        const mockApiUrl = process.env.NEXT_PUBLIC_FINATIC_API_URL || 'http://localhost:8000';
        apiBaseUrlRef.current = mockApiUrl;
        const initStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const mockFinatic = await FinaticConnect.init(
          'mock-token',
          existingUserId || 'mock-user-123',
          {
            baseUrl: mockApiUrl,
          }
        );
        const wrapped = new Proxy(mockFinatic as unknown as Record<string, unknown>, {
          get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            if (typeof value === 'function') {
              return function wrappedMethod(this: unknown, ...args: unknown[]) {
                const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
                try {
                  const result = (value as Function).apply(target, args);
                  if (result && typeof (result as Promise<unknown>).then === 'function') {
                    return (result as Promise<unknown>)
                      .then(res => {
                        const duration =
                          (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
                          start;
                        const bytes = estimateBytes(res);
                        recordMethodCall(String(prop), duration, bytes, false);
                        return res;
                      })
                      .catch(err => {
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
        setFinatic(wrapped as unknown as FinaticConnect);
        const initDuration =
          (typeof performance !== 'undefined' ? performance.now() : Date.now()) - initStart;
        recordMethodCall('FinaticConnect.init', initDuration, 0, false);
        addLog('success', `✅ SDK fully reinitialized in MOCK mode`);
        addLog('info', `New SDK instance created using API URL: ${mockApiUrl}`);
        return;
      }

      if (mockApiOnly) {
        addLog('info', 'Initializing SDK in MOCK API ONLY mode');
        setSessionInfo('Mock API Only Mode - Mock API calls, real portal');
        const mockOnlyApiUrl = process.env.NEXT_PUBLIC_FINATIC_API_URL || 'http://localhost:8000';
        apiBaseUrlRef.current = mockOnlyApiUrl;
        const initStart = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const mockFinatic = await FinaticConnect.init(
          'mock-token',
          existingUserId || 'mock-user-123',
          {
            baseUrl: mockOnlyApiUrl,
          }
        );
        const wrapped = new Proxy(mockFinatic as unknown as Record<string, unknown>, {
          get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            if (typeof value === 'function') {
              return function wrappedMethod(this: unknown, ...args: unknown[]) {
                const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
                try {
                  const result = (value as Function).apply(target, args);
                  if (result && typeof (result as Promise<unknown>).then === 'function') {
                    return (result as Promise<unknown>)
                      .then(res => {
                        const duration =
                          (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
                          start;
                        const bytes = estimateBytes(res);
                        recordMethodCall(String(prop), duration, bytes, false);
                        return res;
                      })
                      .catch(err => {
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
        setFinatic(wrapped as unknown as FinaticConnect);
        const initDuration =
          (typeof performance !== 'undefined' ? performance.now() : Date.now()) - initStart;
        recordMethodCall('FinaticConnect.init', initDuration, 0, false);
        addLog('success', `✅ SDK fully reinitialized in MOCK API ONLY mode`);
        addLog('info', `New SDK instance created using API URL: ${mockOnlyApiUrl}`);
        return;
      }

      addLog('info', 'Initializing SDK in REAL mode');

      const apiUrl = process.env.NEXT_PUBLIC_FINATIC_API_URL || 'http://localhost:8000';

      addLog('info', `Using API URL: ${apiUrl}`);
      apiBaseUrlRef.current = apiUrl;
      const initStart = typeof performance !== 'undefined' ? performance.now() : Date.now();

      // Get token from API
      const response = await fetch('/api/getToken');
      if (!response.ok) {
        addLog('error', 'Failed to get token from /api/getToken');
        throw new Error('Failed to get token');
      }
      const responseData = await response.json();
      // Handle new FinaticResponse structure: success.data.one_time_token
      const token = responseData.success?.data?.one_time_token;
      if (!token) {
        addLog('error', 'No token found in API response');
        console.error('Response data:', responseData);
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
                    .then(res => {
                      const duration =
                        (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
                        start;
                      const bytes = estimateBytes(res);
                      recordMethodCall(String(prop), duration, bytes, false);
                      return res;
                    })
                    .catch(err => {
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
      console.log('🔍 New finatic instance:', {
        instanceId,
        tokenPrefix: token.substring(0, 20),
        object: wrapped,
      });

      // Set the new instance - this should trigger the adapter to recreate
      setFinatic(wrapped as unknown as FinaticConnect);

      // Force a state update by using a callback to ensure React processes it
      // We'll use a small delay to let React batch and process the state update
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify the instance was created with the new token by checking a property
      // This ensures we're using the new instance, not the old one
      try {
        // SDK uses isAuthed() method, not isAuthenticated()
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
      addLog('info', `🔄 State updated - adapter should reinitialize with new instance`);
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
  }, [addLog, getStoredUserId, estimateBytes, recordMethodCall, sdkType, clearSDKState]);

  // Load storedUserId from localStorage after mount to prevent hydration mismatch
  useEffect(() => {
    const userId = getStoredUserId();
    if (userId) {
      setStoredUserIdState(userId);
    }
  }, []);

  // Initialize SDK only on mount
  useEffect(() => {
    void initializeSDK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Re-initialize when SDK type changes
  useEffect(() => {
    if (isInitializingRef.current) return; // Skip if already initializing
    void initializeSDK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkType]); // Only depend on sdkType, not initializeSDK function

  // Removed: Re-initialize when mode or environment changes (no longer using mode/environment)

  // Check authentication when SDK is ready (finatic or sdkAdapter changes)
  // Only check when the SDK instance actually changes, not when checkAuth function reference changes
  useEffect(() => {
    // Check if we've already checked auth for this exact SDK instance
    const currentInstance = { finatic, sdkAdapter, sdkType };
    const lastInstance = lastCheckedAuthRef.current;

    // Only check if the instance actually changed
    if (
      lastInstance &&
      lastInstance.finatic === currentInstance.finatic &&
      lastInstance.sdkAdapter === currentInstance.sdkAdapter &&
      lastInstance.sdkType === currentInstance.sdkType
    ) {
      return; // Already checked auth for this instance
    }

    // Only check auth if we have a valid SDK instance
    if (sdkType === 'client' && finatic) {
      lastCheckedAuthRef.current = currentInstance;
      void checkAuth();
    } else if ((sdkType === 'python' || sdkType === 'node') && sdkAdapter) {
      lastCheckedAuthRef.current = currentInstance;
      void checkAuth();
    } else {
      // No valid SDK instance, clear auth state
      setIsAuthed(false);
      setCurrentUserId(null);
      lastCheckedAuthRef.current = currentInstance;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finatic, sdkAdapter, sdkType]); // Intentionally exclude checkAuth to prevent loops

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
      sdkAdapter,
      isLoading,
      error,
      isMockMode,
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
      sdkType,
      setSdkType,
    }),
    [
      finatic,
      sdkAdapter,
      isLoading,
      error,
      isMockMode,
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
      sdkType,
      setSdkType,
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
