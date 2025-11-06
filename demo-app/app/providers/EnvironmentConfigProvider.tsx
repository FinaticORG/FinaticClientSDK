'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type EnvironmentMode = 'sandbox' | 'live';
export type EnvironmentType = 'dev' | 'staging' | 'prod';

interface EnvironmentConfigContextValue {
  mode: EnvironmentMode;
  environment: EnvironmentType;
  setMode: (mode: EnvironmentMode) => void;
  setEnvironment: (env: EnvironmentType) => void;
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

  // Get API key based on mode (server-side only, returns undefined for client)
  const getApiKey = useCallback((): string | undefined => {
    if (typeof window !== 'undefined') return undefined; // Client-side can't access server env vars
    
    const apiKeyEnvVar = mode === 'sandbox' ? 'FINATIC_API_KEY_SANDBOX' : 'FINATIC_API_KEY_LIVE';
    return process.env[apiKeyEnvVar] || process.env.FINATIC_API_KEY;
  }, [mode]);

  // Get API URL based on mode and environment (server-side only)
  const getApiUrl = useCallback((): string | undefined => {
    if (typeof window !== 'undefined') return undefined; // Client-side can't access server env vars
    
    const apiUrlEnvVar = `FINATIC_API_URL_${environment.toUpperCase()}`;
    return process.env[apiUrlEnvVar] || process.env.FINATIC_API_URL || 'http://localhost:8000';
  }, [mode, environment]);

  // Get public API URL based on mode and environment (available client-side)
  const getPublicApiUrl = useCallback((): string | undefined => {
    const publicApiUrlEnvVar = `NEXT_PUBLIC_FINATIC_API_URL_${environment.toUpperCase()}`;
    
    if (typeof window !== 'undefined') {
      // Client-side: check if it's in window (set via runtime config)
      return (window as any).__FINATIC_PUBLIC_API_URL__ || process.env[publicApiUrlEnvVar] || process.env.NEXT_PUBLIC_FINATIC_API_URL;
    }
    
    // Server-side
    return process.env[publicApiUrlEnvVar] || process.env.NEXT_PUBLIC_FINATIC_API_URL || 'http://localhost:8000';
  }, [environment]);

  return (
    <EnvironmentConfigContext.Provider
      value={{
        mode,
        environment,
        setMode,
        setEnvironment,
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
