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
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Portal</h2>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Authentication Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">SDK Initialized:</span>
              <span className={`text-sm font-medium ${finatic ? 'text-green-600' : 'text-red-600'}`}>{finatic ? '✅ Yes' : '❌ No'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Fully Authenticated:</span>
              <span className={`text-sm font-medium ${finatic?.isAuthed() ? 'text-green-600' : 'text-red-600'}`}>{finatic?.isAuthed() ? '✅ Yes' : '❌ No'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">User ID:</span>
              <span className="text-sm text-blue-700 font-mono">{finatic?.getUserId() || 'Not authenticated'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Access Token:</span>
              <span className="text-sm text-blue-700 font-mono">{finatic?.isAuthed() ? '✅ Present' : '❌ Missing'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Refresh Token:</span>
              <span className="text-sm text-blue-700 font-mono">{finatic?.isAuthed() ? '✅ Present' : '❌ Missing'}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">Local Storage Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">Stored User ID:</span>
              <span className="text-sm text-green-700 font-mono">{storedUserId || 'None stored'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">Auto-login:</span>
              <span className={`text-sm font-medium ${storedUserId ? 'text-green-600' : 'text-gray-500'}`}>{storedUserId ? '✅ Enabled' : '❌ Disabled'}</span>
            </div>
            {storedUserId && (
              <div className="mt-3 pt-2 border-t border-green-200">
                <button onClick={() => { clearStoredUserId(); }} className="btn btn-danger btn-sm">Clear Stored User ID</button>
                <p className="text-xs text-green-600 mt-1">This will remove the stored userId and disable auto-login for future sessions.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-2">Session Management</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-700">Session Status:</span>
              <span className={`text-sm font-medium ${finatic?.isAuthed() ? 'text-green-600' : 'text-red-600'}`}>{finatic?.isAuthed() ? '✅ Active' : '❌ Inactive'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-700">Auto Refresh:</span>
              <span className="text-sm font-medium text-green-600">✅ Enabled (at 16 hours)</span>
            </div>
            <p className="text-xs text-yellow-600 mt-2">Sessions automatically refresh at 16 hours to extend the 24-hour lifetime</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">Test the portal functionality using the actual SDK method.</p>
        <button onClick={handleOpenPortal} className="btn btn-primary mb-4">Open Portal</button>
        {portalUrl && <div className="mt-2 text-green-700 text-sm">{portalUrl}</div>}
        {portalError && <div className="mt-2 text-red-700 text-sm">Error: {portalError}</div>}

        {portalEvents.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-900 mb-3">Portal Events Received</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {portalEvents.map((event, index) => (
                <div key={index} className="bg-gray-50 rounded-md p-3 border">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-sm font-medium text-blue-600">{event.type}</span>
                    <span className="text-xs text-gray-500">{event.timestamp}</span>
                  </div>
                  <pre className="text-xs text-gray-700 bg-white p-2 rounded border overflow-x-auto">{JSON.stringify(event.data, null, 2)}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


