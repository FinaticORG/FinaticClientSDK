'use client';

import React from 'react';
import { useFinatic } from '../providers/FinaticProvider';

export function EnvironmentSelector() {
  const { 
    currentEnvironment, 
    setCurrentEnvironment, 
    reinitializeWithEnvironment, 
    isLoading,
    isMockMode,
    addLog 
  } = useFinatic();

  const handleEnvironmentChange = async (newEnv: 'sandbox' | 'live') => {
    if (newEnv === currentEnvironment || isLoading) return;
    
    addLog('info', `Switching to ${newEnv.toUpperCase()} environment...`);
    // Don't call setCurrentEnvironment here - let reinitializeWithEnvironment handle it
    await reinitializeWithEnvironment(newEnv);
  };

  if (isMockMode) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-blue-800 font-medium">Mock Mode Active</span>
        </div>
        <p className="text-blue-600 text-sm mt-1">Environment selection disabled in mock mode</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-2"></div>
        Environment Selection
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Sandbox Option */}
        <button
          onClick={() => handleEnvironmentChange('sandbox')}
          disabled={isLoading}
          className={`
            relative p-4 rounded-lg border-2 transition-all duration-200 text-left
            ${currentEnvironment === 'sandbox' 
              ? 'border-orange-500 bg-orange-50 shadow-md' 
              : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-25'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-900">🧪 Sandbox</span>
            {currentEnvironment === 'sandbox' && (
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Test environment with mock data
          </p>
          <div className="text-xs text-gray-500 mt-1">
            Uses: <code className="bg-gray-100 px-1 rounded">fntc_sandbox_*</code>
          </div>
        </button>

        {/* Live Option */}
        <button
          onClick={() => handleEnvironmentChange('live')}
          disabled={isLoading}
          className={`
            relative p-4 rounded-lg border-2 transition-all duration-200 text-left
            ${currentEnvironment === 'live' 
              ? 'border-green-500 bg-green-50 shadow-md' 
              : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-25'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-900">🚀 Production</span>
            {currentEnvironment === 'live' && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Live environment with real data
          </p>
          <div className="text-xs text-gray-500 mt-1">
            Uses: <code className="bg-gray-100 px-1 rounded">fntc_live_*</code>
          </div>
        </button>
      </div>

      {isLoading && (
        <div className="mt-3 flex items-center justify-center text-sm text-gray-600">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mr-2"></div>
          Switching environments...
        </div>
      )}
    </div>
  );
}
