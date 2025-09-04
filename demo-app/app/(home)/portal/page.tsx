'use client';

import React, { useState } from 'react';
import { useFinatic } from '@/app/(home)/providers/FinaticProvider';

export default function PortalPage() {
  const { finatic, storedUserId, setStoredUserId, clearStoredUserId, addLog } = useFinatic();
  const [portalUrl, setPortalUrl] = useState('');
  const [portalError, setPortalError] = useState('');
  const [portalEvents, setPortalEvents] = useState<Array<{ type: string; data: any; timestamp: string }>>([]);

  const handleOpenPortal = async () => {
    if (!finatic) return;
    addLog('info', 'Opening portal...');
    setPortalUrl('');
    setPortalError('');
    setPortalEvents([]);
    try {
      await finatic.openPortal({
        onSuccess: (userId: string) => {
          addLog('success', `Portal opened successfully for user: ${userId}`);
          setPortalUrl('Portal opened successfully');
          setStoredUserId(userId);
          addLog('info', `Stored userId in localStorage: ${userId}`);
          setPortalEvents((prev) => [...prev, { type: 'portal-success', data: { userId }, timestamp: new Date().toLocaleTimeString() }]);
        },
        onError: (error: Error) => {
          setPortalError(error.message);
          addLog('error', error.message);
          setPortalEvents((prev) => [...prev, { type: 'portal-error', data: { message: error.message }, timestamp: new Date().toLocaleTimeString() }]);
        },
        onClose: () => {
          addLog('info', 'Portal closed');
          setPortalEvents((prev) => [...prev, { type: 'portal-close', data: {}, timestamp: new Date().toLocaleTimeString() }]);
        },
        onEvent: (type: string, data: any) => {
          addLog('info', `Portal event: ${type} - ${JSON.stringify(data)}`);
          setPortalEvents((prev) => [...prev, { type, data, timestamp: new Date().toLocaleTimeString() }]);
        },
      });
    } catch (err: any) {
      setPortalError(err.message || 'Unknown error');
      addLog('error', err.message || 'Unknown error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portal</h1>
          <p className="text-gray-600 mt-1">Manage authentication and connection status</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${finatic?.isAuthed() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {finatic?.isAuthed() ? '✅ Authenticated' : '❌ Not Authenticated'}
          </div>
        </div>
      </div>

      {/* Authentication Status Card */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Authentication Status</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">SDK Initialized</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${finatic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {finatic ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Fully Authenticated</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${finatic?.isAuthed() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {finatic?.isAuthed() ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">User ID</span>
              <span className="text-sm font-mono text-gray-900 bg-white px-2 py-1 rounded border">
                {finatic?.getUserId() || 'Not authenticated'}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Access Token</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${finatic?.isAuthed() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {finatic?.isAuthed() ? '✅ Present' : '❌ Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Refresh Token</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${finatic?.isAuthed() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {finatic?.isAuthed() ? '✅ Present' : '❌ Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Session Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${finatic?.isAuthed() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {finatic?.isAuthed() ? '✅ Active' : '❌ Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Local Storage Management Card */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Local Storage</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-700">Stored User ID</span>
              <div className="text-xs text-gray-500 mt-1">Enables automatic login for future sessions</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono text-gray-900 bg-white px-3 py-1 rounded border">
                {storedUserId || 'None stored'}
              </div>
              <div className={`text-xs mt-1 ${storedUserId ? 'text-green-600' : 'text-gray-500'}`}>
                Auto-login: {storedUserId ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
          
          {storedUserId && (
            <div className="border border-red-200/50 bg-red-50/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-red-700">Clear Stored Data</span>
                  <div className="text-xs text-red-600 mt-1">Remove stored userId and disable auto-login</div>
                </div>
                <button onClick={() => { clearStoredUserId(); }} className="btn btn-danger btn-sm">
                  🗑️ Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Portal Action Card */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Portal Connection</h3>
        </div>
        
        <div className="text-center space-y-4">
          <p className="text-gray-600">Test the portal functionality using the actual SDK method</p>
          <button 
            onClick={handleOpenPortal} 
            className="btn btn-primary"
            disabled={!finatic}
          >
            🚪 Open Portal
          </button>
          
          {portalUrl && (
            <div className="bg-green-50/50 border border-green-200/50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-green-700 font-medium">{portalUrl}</span>
              </div>
            </div>
          )}
          
          {portalError && (
            <div className="bg-red-50/50 border border-red-200/50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-red-700 font-medium">Error: {portalError}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <span className="font-medium">Auto Refresh:</span> Sessions automatically refresh at 16 hours to extend the 24-hour lifetime
          </p>
        </div>
      </div>

      {/* Portal Events */}
      {portalEvents.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg"></div>
            <h3 className="text-lg font-semibold text-gray-900">Portal Events</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {portalEvents.length} event{portalEvents.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {portalEvents.map((event, index) => (
              <div key={index} className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 font-mono">
                    {event.type}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">{event.timestamp}</span>
                </div>
                <div className="bg-white rounded-md p-3 border">
                  <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


