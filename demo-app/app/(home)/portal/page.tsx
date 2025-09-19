'use client';

import React, { useState } from 'react';
import { useFinatic } from '@/app/(home)/providers/FinaticProvider';

export default function PortalPage() {
  const { finatic, storedUserId, setStoredUserId, clearStoredUserId, addLog } = useFinatic();
  const [portalUrl, setPortalUrl] = useState('');
  const [portalError, setPortalError] = useState('');
  const [portalEvents, setPortalEvents] = useState<Array<{ type: string; data: any; timestamp: string }>>([]);
  const [selectedBrokers, setSelectedBrokers] = useState<string[]>([]);
  const [customBrokers, setCustomBrokers] = useState<string>('');
  const [emailParam, setEmailParam] = useState<string>('');

  const handleOpenPortal = async () => {
    if (!finatic) return;
    addLog('info', 'Opening portal...');
    setPortalUrl('');
    setPortalError('');
    setPortalEvents([]);
    
    // Prepare broker filter
    const brokerFilter = customBrokers.trim() 
      ? customBrokers.split(',').map(b => b.trim()).filter(Boolean)
      : selectedBrokers;
    
    if (brokerFilter.length > 0) {
      addLog('info', `Filtering portal to show brokers: ${brokerFilter.join(', ')}`);
    }
    
    addLog('info', 'Opening portal with StockAlgos theme');
    
    try {
      const portalOptions: any = {
        brokers: brokerFilter.length > 0 ? brokerFilter : undefined,
        theme: { preset: 'stockAlgos' },  // Use StockAlgos theme
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
      };

      // Add email parameter if provided
      if (emailParam.trim()) {
        portalOptions.email = emailParam.trim();
        addLog('info', `Opening portal with email prefill: ${emailParam.trim()}`);
      }

      await finatic.openPortal(portalOptions);
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
          
          {/* Portal Options Summary */}
          {(emailParam.trim() || selectedBrokers.length > 0 || customBrokers.trim()) && (
            <div className="bg-gray-50/50 border border-gray-200/50 rounded-lg p-3 text-left">
              <p className="text-sm font-medium text-gray-700 mb-2">Portal Options:</p>
              <div className="space-y-1 text-xs text-gray-600">
                {emailParam.trim() && (
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                    <span>Email prefill: <span className="font-mono">{emailParam}</span></span>
                  </div>
                )}
                {(selectedBrokers.length > 0 || customBrokers.trim()) && (
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>Broker filter: {customBrokers.trim() 
                      ? customBrokers.split(',').map(b => b.trim()).filter(Boolean).join(', ')
                      : selectedBrokers.join(', ')
                    }</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
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

      {/* Broker Filtering Card */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Broker Filtering</h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Filter which brokers are shown in the portal. You can use broker names or aliases.
          </p>
          
          {/* Predefined Broker Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Brokers (including aliases):
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                'robinhood',
                'tasty_trade', 
                'ninja_trader',
                'tradovate', // Alias
                'interactive_brokers', // Alias
                'ib', // Short alias
                'td_ameritrade', // Alias
                'charles_schwab', // Alias
                'fidelity', // Alias
                'webull', // Alias
                'ally_invest', // Alias
              ].map((broker) => (
                <label key={broker} className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBrokers.includes(broker)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBrokers(prev => [...prev, broker]);
                      } else {
                        setSelectedBrokers(prev => prev.filter(b => b !== broker));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{broker}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Custom Broker Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Broker Names (comma-separated):
            </label>
            <input
              type="text"
              value={customBrokers}
              onChange={(e) => setCustomBrokers(e.target.value)}
              placeholder="e.g., tradovate, ib, schwab"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Override the checkboxes above. Leave empty to use selected brokers.
            </p>
          </div>
          
          {/* Current Filter Display */}
          {(selectedBrokers.length > 0 || customBrokers.trim()) && (
            <div className="bg-gray-50/50 border border-gray-200/50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Current Filter:</p>
              <p className="text-sm text-gray-600">
                {customBrokers.trim() 
                  ? customBrokers.split(',').map(b => b.trim()).filter(Boolean).join(', ')
                  : selectedBrokers.join(', ')
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Email Parameter Testing Card */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Email Parameter Testing</h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Test the new email parameter functionality. When you provide an email, it will be prefilled in the portal's authentication form.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address (optional):
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                value={emailParam}
                onChange={(e) => setEmailParam(e.target.value)}
                placeholder="Enter email address to prefill in portal"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setEmailParam('')}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to test without email prefill, or enter an email to test the prefill functionality.
            </p>
          </div>
          
          {/* Email Parameter Status */}
          {emailParam.trim() && (
            <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700">Email Parameter Active</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Portal will open with email prefilled: <span className="font-mono">{emailParam}</span>
              </p>
            </div>
          )}
          
          {/* Quick Test Buttons */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Quick Test Emails:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'demo@example.com',
                'test@finatic.dev',
                'user@company.com',
                'john.doe@email.com'
              ].map((email) => (
                <button
                  key={email}
                  onClick={() => setEmailParam(email)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border border-gray-300 transition-colors"
                >
                  {email}
                </button>
              ))}
            </div>
          </div>
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


