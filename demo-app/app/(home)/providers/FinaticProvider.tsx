'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  FinaticConnect,
} from '@finatic/client';

type LogEntry = {
  type: 'info' | 'error' | 'success';
  message: string;
  timestamp: string;
};

interface FinaticContextValue {
  finatic: FinaticConnect | null;
  isLoading: boolean;
  error: string | null;
  isMockMode: boolean;
  sessionInfo: string;
  logs: LogEntry[];
  addLog: (type: LogEntry['type'], message: string) => void;
  reinitialize: () => Promise<void>;
  reinitializeWithEnvironment: (environment: 'sandbox' | 'live') => Promise<void>;
  storedUserId: string | null;
  setStoredUserId: (userId: string) => void;
  clearStoredUserId: () => void;
  currentEnvironment: 'sandbox' | 'live';
  setCurrentEnvironment: (env: 'sandbox' | 'live') => void;
}

const FinaticContext = createContext<FinaticContextValue | undefined>(undefined);

export function FinaticProvider({ children }: { children: React.ReactNode }) {
  const [finatic, setFinatic] = useState<FinaticConnect | null>(null);
  
  // Debug: Log when finatic state changes
  useEffect(() => {
    console.log('Finatic state changed:', finatic ? 'SDK Instance Set' : 'SDK Instance Null');
  }, [finatic]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<string>('Not initialized');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [storedUserId, setStoredUserIdState] = useState<string | null>(null);
  const [currentEnvironment, setCurrentEnvironment] = useState<'sandbox' | 'live'>('sandbox');

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

  const initializeSDKWithEnvironment = useCallback(async (environment: 'sandbox' | 'live') => {
    console.log(`[DEBUG] initializeSDKWithEnvironment called with: ${environment}`);
    try {
      setIsLoading(true);
      setError(null);
      
      // Update current environment state first
      setCurrentEnvironment(environment);
      console.log(`[DEBUG] Environment state updated to: ${environment}`);

      const useMocks = process.env.NEXT_PUBLIC_FINATIC_USE_MOCKS === 'true';
      const mockApiOnly = process.env.NEXT_PUBLIC_FINATIC_MOCK_API_ONLY === 'true';
      setIsMockMode(useMocks || mockApiOnly);
      console.log(`[DEBUG] Mock settings - useMocks: ${useMocks}, mockApiOnly: ${mockApiOnly}`);

      const existingUserId = getStoredUserId();
      if (existingUserId) {
        addLog('info', `Found stored userId: ${existingUserId}`);
        console.log(`[DEBUG] Found stored userId: ${existingUserId}`);
      }

      if (useMocks) {
        console.log(`[DEBUG] Using mocks, skipping real initialization`);
        addLog('info', 'Initializing SDK in MOCK mode');
        setSessionInfo('Mock Mode - No real API calls');
        const apiUrl = process.env.NEXT_PUBLIC_FINATIC_API_URL || 'http://localhost:8000';
        const mockFinatic = await FinaticConnect.init('mock-token', existingUserId || 'mock-user-123', {
          baseUrl: apiUrl,
        });
        setFinatic(mockFinatic);
        addLog('success', 'SDK initialized in MOCK mode');
        return;
      }

      if (mockApiOnly) {
        console.log(`[DEBUG] Using mock API only, skipping real initialization`);
        addLog('info', 'Initializing SDK in MOCK API ONLY mode');
        setSessionInfo('Mock API Only Mode - Mock API calls, real portal');
        const apiUrl = process.env.NEXT_PUBLIC_FINATIC_API_URL || 'http://localhost:8000';
        const mockFinatic = await FinaticConnect.init('mock-token', existingUserId || 'mock-user-123', {
          baseUrl: apiUrl,
        });
        setFinatic(mockFinatic);
        addLog('success', 'SDK initialized in MOCK API ONLY mode');
        return;
      }

      console.log(`[DEBUG] Starting real initialization for ${environment} environment`);

      const envType = environment.toUpperCase();
      
      addLog('info', `Initializing SDK in ${envType} mode`);
      const apiUrl = process.env.NEXT_PUBLIC_FINATIC_API_URL || 'http://localhost:8000';
      addLog('info', `Using API URL: ${apiUrl}`);
      
      // Send environment parameter to API route
      console.log(`[DEBUG] About to request token for ${environment}`);
      addLog('info', `Requesting ${environment} API key from server...`);
      const response = await fetch('/api/getToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ environment }),
      });
      
      console.log(`[DEBUG] Token request response status: ${response.status}`);
      if (!response.ok) {
        addLog('error', 'Failed to get token from /api/getToken');
        throw new Error('Failed to get token');
      }
      const responseData = await response.json();
      console.log(`[DEBUG] Token response data:`, responseData);
      const token = responseData.data?.one_time_token;
      if (!token) {
        addLog('error', 'No token found in API response');
        throw new Error('No token found in API response');
      }
      console.log(`[DEBUG] Got token: ${token.substring(0, 8)}...`);

      // Note: We no longer pass sandbox option to init - it's auto-detected from API key
      console.log(`[DEBUG] About to call FinaticConnect.init`);
      addLog('info', `Calling FinaticConnect.init with token: ${token.substring(0, 8)}...`);
      const realFinatic = await FinaticConnect.init(token, existingUserId || undefined, {
        baseUrl: apiUrl,
      });
      console.log(`[DEBUG] FinaticConnect.init returned:`, realFinatic);
      addLog('info', `FinaticConnect.init completed successfully`);
      
      try {
        console.log(`[DEBUG] About to set finatic state`);
        setFinatic(realFinatic);
        console.log(`[DEBUG] setFinatic called`);
        addLog('info', `SDK instance set in React state`);
        
        // Get environment info from SDK to confirm detection worked
        console.log(`[DEBUG] About to get environment info`);
        const envInfo = realFinatic.getEnvironmentInfo();
        console.log(`[DEBUG] Environment info:`, envInfo);
        const detectedMode = envInfo.mode.toUpperCase();
        addLog('info', `Environment detected as: ${detectedMode}`);
        
        setSessionInfo(`${detectedMode} Mode - Authenticated${existingUserId ? ` (User: ${existingUserId})` : ''}`);
        addLog('success', `SDK initialized in ${envType} mode, detected as ${detectedMode}`);
        console.log(`[DEBUG] SDK initialization completed successfully`);
      } catch (envError) {
        console.error(`[DEBUG] Error in environment detection:`, envError);
        addLog('error', `Error getting environment info: ${envError}`);
        // Still set the SDK instance even if environment detection fails
        setFinatic(realFinatic);
        setSessionInfo(`${envType} Mode - Authenticated${existingUserId ? ` (User: ${existingUserId})` : ''}`);
        addLog('success', `SDK initialized in ${envType} mode (environment detection failed)`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[DEBUG] SDK initialization error:`, err);
      addLog('error', `Failed to initialize SDK: ${msg}`);
      setError(msg);
      setSessionInfo('Failed to initialize');
    } finally {
      setIsLoading(false);
      console.log(`[DEBUG] initializeSDKWithEnvironment completed, isLoading set to false`);
    }
  }, [addLog, getStoredUserId]);

  const initializeSDK = useCallback(async () => {
    await initializeSDKWithEnvironment(currentEnvironment);
  }, [initializeSDKWithEnvironment, currentEnvironment]);

  useEffect(() => {
    setStoredUserIdState(getStoredUserId());
    void initializeSDK();
  }, [getStoredUserId, initializeSDK, currentEnvironment]); // Add currentEnvironment to dependencies

  const value = useMemo<FinaticContextValue>(() => ({
    finatic,
    isLoading,
    error,
    isMockMode,
    sessionInfo,
    logs,
    addLog,
    reinitialize: initializeSDK,
    reinitializeWithEnvironment: initializeSDKWithEnvironment,
    storedUserId,
    setStoredUserId,
    clearStoredUserId,
    currentEnvironment,
    setCurrentEnvironment,
  }), [finatic, isLoading, error, isMockMode, sessionInfo, logs, addLog, initializeSDK, initializeSDKWithEnvironment, storedUserId, setStoredUserId, clearStoredUserId, currentEnvironment, setCurrentEnvironment]);

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


