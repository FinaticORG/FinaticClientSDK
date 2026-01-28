'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import * as environmentUtils from '@/lib/utils';
import type { EnvironmentMode, EnvironmentType } from '@/lib/utils';

interface EnvironmentConfigContextValue {
  mode: EnvironmentMode;
  environment: EnvironmentType;
  setMode: (mode: EnvironmentMode) => void;
  setEnvironment: (env: EnvironmentType) => void;
  setRuntime: (mode: EnvironmentMode, env: EnvironmentType) => void;
  getApiKey: () => string | undefined;
  getApiUrl: () => string | undefined;
  getPublicApiUrl: () => string | undefined;
}

const EnvironmentConfigContext = createContext<EnvironmentConfigContextValue | undefined>(undefined);

const STORAGE_KEY_MODE = 'finatic_env_mode';
const STORAGE_KEY_ENVIRONMENT = 'finatic_env_type';

export function EnvironmentConfigProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<EnvironmentMode>(() => {
    if (typeof window === 'undefined') return 'live';
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MODE);
      return (stored === 'sandbox' || stored === 'live' ? stored : 'live') as EnvironmentMode;
    } catch {
      return 'live';
    }
  });

  const [environment, setEnvironmentState] = useState<EnvironmentType>(() => {
    if (typeof window === 'undefined') return 'dev';
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ENVIRONMENT);
      return (stored === 'dev' || stored === 'staging' || stored === 'prod' ? stored : 'dev') as EnvironmentType;
    } catch {
      return 'dev';
    }
  });

  // Persist to localStorage
  const setMode = useCallback((newMode: EnvironmentMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_MODE, newMode);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, []);

  const setEnvironment = useCallback((newEnv: EnvironmentType) => {
    setEnvironmentState(newEnv);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_ENVIRONMENT, newEnv);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, []);

  const setRuntime = useCallback((newMode: EnvironmentMode, newEnv: EnvironmentType) => {
    setModeState(newMode);
    setEnvironmentState(newEnv);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_MODE, newMode);
        localStorage.setItem(STORAGE_KEY_ENVIRONMENT, newEnv);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, []);

  // Get API key based on mode (server-side only, returns undefined for client)
  const getApiKey = useCallback((): string | undefined => {
    if (typeof window !== 'undefined') return undefined; // Client-side can't access server env vars
    
    return environmentUtils.getApiKey(mode, environment);
  }, [mode, environment]);

  // Get API URL based on mode and environment (server-side only)
  const getApiUrl = useCallback((): string | undefined => {
    if (typeof window !== 'undefined') return undefined; // Client-side can't access server env vars
    
    return environmentUtils.getApiUrl(environment, 'http://localhost:8000');
  }, [environment]);

  // Get public API URL based on mode and environment (available client-side)
  const getPublicApiUrl = useCallback((): string | undefined => {
    if (typeof window !== 'undefined') {
      // Client-side: check if it's in window (set via runtime config)
      return (
        (window as any).__FINATIC_PUBLIC_API_URL__ ||
        environmentUtils.getPublicApiUrl(environment, 'http://localhost:8000')
      );
    }
    
    // Server-side
    return environmentUtils.getPublicApiUrl(environment, 'http://localhost:8000');
  }, [environment]);

  return (
    <EnvironmentConfigContext.Provider
      value={{
        mode,
        environment,
        setMode,
        setEnvironment,
        setRuntime,
        getApiKey,
        getApiUrl,
        getPublicApiUrl,
      }}
    >
      {children}
    </EnvironmentConfigContext.Provider>
  );
}

export function useEnvironmentConfig() {
  const context = useContext(EnvironmentConfigContext);
  if (context === undefined) {
    throw new Error('useEnvironmentConfig must be used within EnvironmentConfigProvider');
  }
  return context;
}
