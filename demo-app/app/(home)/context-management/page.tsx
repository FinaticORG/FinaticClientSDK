'use client';

import React, { useState } from 'react';
import { TradingContext } from '@finatic/client';
import { useFinatic } from '@/app/(home)/providers/FinaticProvider';

export default function ContextManagementPage() {
  const { finatic, isLoading, addLog } = useFinatic();
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [selectedBroker, setSelectedBroker] = useState<'robinhood' | 'tasty_trade' | 'ninja_trader' | ''>('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountId, setAccountId] = useState('');
  
  // Context state
  const [currentContext, setCurrentContext] = useState<TradingContext | null>(null);

  // Set broker
  const handleSetBroker = () => {
    if (!finatic || !selectedBroker) return;
    addLog('info', `Setting broker context: ${selectedBroker}`);
    try {
      finatic.setBroker(selectedBroker);
      addLog('success', `Broker context set to: ${selectedBroker}`);
      updateCurrentContext();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to set broker context';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Set account
  const handleSetAccount = () => {
    if (!finatic || !accountNumber.trim()) return;
    addLog('info', `Setting account context: ${accountNumber}`);
    try {
      finatic.setAccount(accountNumber.trim(), accountId.trim() || undefined);
      addLog('success', `Account context set to: ${accountNumber}`);
      updateCurrentContext();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to set account context';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Clear context
  const handleClearContext = () => {
    if (!finatic) return;
    addLog('info', 'Clearing trading context');
    try {
      finatic.clearTradingContext();
      addLog('success', 'Trading context cleared');
      updateCurrentContext();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to clear trading context';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Update current context
  const updateCurrentContext = () => {
    if (!finatic) return;
    try {
      const context = finatic.getTradingContext();
      setCurrentContext(context);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get trading context';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Refresh context display
  const handleRefreshContext = () => {
    updateCurrentContext();
    addLog('info', 'Refreshed trading context display');
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trading Context Management</h1>
          <p className="text-gray-600 mt-1">Test trading context methods for broker and account selection</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Context Management
          </div>
        </div>
      </div>

      {/* Set Broker Context */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Set Broker Context</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <select 
              value={selectedBroker} 
              onChange={(e) => setSelectedBroker(e.target.value as 'robinhood' | 'tasty_trade' | 'ninja_trader' | '')} 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a Broker</option>
              <option value="robinhood">Robinhood</option>
              <option value="tasty_trade">TastyTrade</option>
              <option value="ninja_trader">NinjaTrader</option>
            </select>
            <button 
              onClick={handleSetBroker} 
              disabled={isLoading || !finatic || !selectedBroker} 
              className="btn btn-primary"
            >
              🏢 Set Broker
            </button>
          </div>
          
          <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <span className="font-medium">Method:</span> <code>setBroker(broker)</code> • 
              <span className="font-medium">Purpose:</span> Set broker context for trading operations
            </p>
          </div>
        </div>
      </div>

      {/* Set Account Context */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Set Account Context</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
              <input 
                type="text" 
                placeholder="Enter account number" 
                value={accountNumber} 
                onChange={(e) => setAccountNumber(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account ID (Optional)</label>
              <input 
                type="text" 
                placeholder="Enter account ID" 
                value={accountId} 
                onChange={(e) => setAccountId(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleSetAccount} 
              disabled={isLoading || !finatic || !accountNumber.trim()} 
              className="btn btn-primary"
            >
              👤 Set Account
            </button>
            <div className="text-sm text-gray-600">
              Tests: <code className="bg-gray-100 px-2 py-1 rounded">setAccount(accountNumber, accountId?)</code>
            </div>
          </div>
          
          <div className="bg-green-50/50 border border-green-200/50 rounded-lg p-3">
            <p className="text-xs text-green-700">
              <span className="font-medium">Method:</span> <code>setAccount(accountNumber, accountId?)</code> • 
              <span className="font-medium">Purpose:</span> Set account context for trading operations
            </p>
          </div>
        </div>
      </div>

      {/* Clear Context */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Clear Trading Context</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleClearContext} 
              disabled={isLoading || !finatic} 
              className="btn btn-danger"
            >
              🗑️ Clear Context
            </button>
            <div className="text-sm text-gray-600">
              Tests: <code className="bg-gray-100 px-2 py-1 rounded">clearTradingContext()</code>
            </div>
          </div>
          
          <div className="bg-red-50/50 border border-red-200/50 rounded-lg p-3">
            <p className="text-xs text-red-700">
              <span className="font-medium">Method:</span> <code>clearTradingContext()</code> • 
              <span className="font-medium">Purpose:</span> Clear all trading context (broker and account)
            </p>
          </div>
        </div>
      </div>

      {/* Current Context Display */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Current Trading Context</h3>
          <button 
            onClick={handleRefreshContext} 
            disabled={isLoading || !finatic} 
            className="btn btn-outline btn-sm"
          >
            🔄 Refresh
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Current Context:</span>
              <span className="text-xs text-gray-500">Updated: {new Date().toLocaleTimeString()}</span>
            </div>
            <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap bg-white p-3 rounded border">
              {currentContext ? JSON.stringify(currentContext, null, 2) : 'No context set'}
            </pre>
          </div>
          
          <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <span className="font-medium">Method:</span> <code>getTradingContext()</code> • 
              <span className="font-medium">Purpose:</span> Get current trading context (broker and account)
            </p>
          </div>
        </div>
      </div>

      {/* Method Reference */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Available Methods</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="p-3 bg-gray-50/50 rounded-lg">
              <div className="font-mono text-sm font-medium text-gray-900">setBroker(broker)</div>
              <div className="text-xs text-gray-600 mt-1">Set broker context for trading</div>
              <div className="text-xs text-gray-500 mt-1">Parameters: 'robinhood' | 'tasty_trade' | 'ninja_trader'</div>
            </div>
            <div className="p-3 bg-gray-50/50 rounded-lg">
              <div className="font-mono text-sm font-medium text-gray-900">setAccount(accountNumber, accountId?)</div>
              <div className="text-xs text-gray-600 mt-1">Set account context for trading</div>
              <div className="text-xs text-gray-500 mt-1">accountId is optional</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50/50 rounded-lg">
              <div className="font-mono text-sm font-medium text-gray-900">getTradingContext()</div>
              <div className="text-xs text-gray-600 mt-1">Get current trading context</div>
              <div className="text-xs text-gray-500 mt-1">Returns: TradingContext</div>
            </div>
            <div className="p-3 bg-gray-50/50 rounded-lg">
              <div className="font-mono text-sm font-medium text-gray-900">clearTradingContext()</div>
              <div className="text-xs text-gray-600 mt-1">Clear all trading context</div>
              <div className="text-xs text-gray-500 mt-1">Returns: void</div>
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
