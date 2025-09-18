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
  storedUserId: string | null;
  setStoredUserId: (userId: string) => void;
  clearStoredUserId: () => void;
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
        const mockFinatic = await FinaticConnect.init('mock-token', existingUserId || 'mock-user-123', {
          baseUrl: apiUrl,
        });
        setFinatic(mockFinatic);
        addLog('success', 'SDK initialized in MOCK mode');
        return;
      }

      if (mockApiOnly) {
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

      addLog('info', 'Initializing SDK in REAL mode');
      const apiUrl = process.env.NEXT_PUBLIC_FINATIC_API_URL || 'http://localhost:8000';
      addLog('info', `Using API URL: ${apiUrl}`);
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
      setFinatic(realFinatic);
      setSessionInfo(`Real Mode - Authenticated${existingUserId ? ` (User: ${existingUserId})` : ''}`);
      addLog('success', 'SDK initialized in REAL mode');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      addLog('error', `Failed to initialize SDK: ${msg}`);
      setError(msg);
      setSessionInfo('Failed to initialize');
    } finally {
      setIsLoading(false);
    }
  }, [addLog, getStoredUserId]);

  useEffect(() => {
    setStoredUserIdState(getStoredUserId());
    void initializeSDK();
  }, [getStoredUserId, initializeSDK]);

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
  }), [finatic, isLoading, error, isMockMode, sessionInfo, logs, addLog, initializeSDK, storedUserId, setStoredUserId, clearStoredUserId]);

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


