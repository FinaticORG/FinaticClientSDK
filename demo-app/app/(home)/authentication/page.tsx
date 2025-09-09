'use client';

import React, { useState } from 'react';
import { useFinatic } from '@/app/(home)/providers/FinaticProvider';

export default function AuthenticationPage() {
  const { finatic, isLoading, addLog } = useFinatic();
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [authStatus, setAuthStatus] = useState<any>(null);

  const handleCheckAuth = () => {
    if (!finatic) return;
    addLog('info', 'Checking authentication status...');
    try {
      const isAuthed = finatic.isAuthed();
      const currentUserId = finatic.getUserId();
      const status = {
        isAuthed,
        userId: currentUserId,
        timestamp: new Date().toISOString()
      };
      setAuthStatus(status);
      addLog('success', `Authentication check: ${isAuthed ? 'Authenticated' : 'Not authenticated'}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to check authentication';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleSetUserId = async () => {
    if (!finatic || !userId.trim()) return;
    addLog('info', `Setting user ID: ${userId}`);
    try {
      await finatic.setUserId(userId.trim());
      addLog('success', `User ID set to: ${userId}`);
      setUserId('');
      // Refresh auth status
      handleCheckAuth();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to set user ID';
      setError(msg);
      addLog('error', msg);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Authentication</h1>
          <p className="text-gray-600 mt-1">Test authentication and user management methods</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${finatic?.isAuthed() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {finatic?.isAuthed() ? '✅ Authenticated' : '❌ Not Authenticated'}
          </div>
        </div>
      </div>

      {/* Authentication Status Card */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Authentication Status</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleCheckAuth} 
              disabled={isLoading || !finatic} 
              className="btn btn-primary"
            >
              🔍 Check Authentication Status
            </button>
            <div className="text-sm text-gray-600">
              Tests: <code className="bg-gray-100 px-2 py-1 rounded">isAuthed()</code> and <code className="bg-gray-100 px-2 py-1 rounded">getUserId()</code>
            </div>
          </div>
          
          {authStatus && (
            <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Status:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Fully Authenticated</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${authStatus.isAuthed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {authStatus.isAuthed ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium text-gray-700">User ID</span>
                  <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {authStatus.userId || 'Not set'}
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Last checked: {new Date(authStatus.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User ID Management Card */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">User ID Management</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input 
              type="text" 
              placeholder="Enter user ID" 
              value={userId} 
              onChange={(e) => setUserId(e.target.value)} 
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
            />
            <button 
              onClick={handleSetUserId} 
              disabled={isLoading || !finatic || !userId.trim()} 
              className="btn btn-primary"
            >
              🔧 Set User ID
            </button>
          </div>
          
          <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <span className="font-medium">Method:</span> <code>setUserId(userId: string)</code> • 
              <span className="font-medium">Purpose:</span> Set user ID for current session
            </p>
          </div>
        </div>
      </div>

      {/* Method Reference Card */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Available Methods</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="p-3 bg-gray-50/50 rounded-lg">
              <div className="font-mono text-sm font-medium text-gray-900">isAuthed()</div>
              <div className="text-xs text-gray-600 mt-1">Check if user is fully authenticated</div>
              <div className="text-xs text-gray-500 mt-1">Returns: boolean</div>
            </div>
            <div className="p-3 bg-gray-50/50 rounded-lg">
              <div className="font-mono text-sm font-medium text-gray-900">getUserId()</div>
              <div className="text-xs text-gray-600 mt-1">Get current user ID</div>
              <div className="text-xs text-gray-500 mt-1">Returns: string | null</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50/50 rounded-lg">
              <div className="font-mono text-sm font-medium text-gray-900">setUserId(userId)</div>
              <div className="text-xs text-gray-600 mt-1">Set user ID for current session</div>
              <div className="text-xs text-gray-500 mt-1">Returns: Promise&lt;void&gt;</div>
            </div>
            <div className="p-3 bg-gray-50/50 rounded-lg">
              <div className="font-mono text-sm font-medium text-gray-900">init(token, userId?, options?)</div>
              <div className="text-xs text-gray-600 mt-1">Initialize the SDK (static method)</div>
              <div className="text-xs text-gray-500 mt-1">Returns: Promise&lt;FinaticConnect&gt;</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-6">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <h3 className="text-lg font-semibold text-red-900">Error</h3>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
        </div>
      )}
    </div>
  );
}
