'use client';

import React, { useState } from 'react';
import { BrokerDataAccount, BrokerDataOrder, BrokerDataPosition } from '@finatic/client';
import { useFinatic } from '@/app/(home)/providers/FinaticProvider';

export default function ConveniencePage() {
  const { finatic, isLoading, addLog } = useFinatic();
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [openPositions, setOpenPositions] = useState<BrokerDataPosition[]>([]);
  const [filledOrders, setFilledOrders] = useState<BrokerDataOrder[]>([]);
  const [pendingOrders, setPendingOrders] = useState<BrokerDataOrder[]>([]);
  const [activeAccounts, setActiveAccounts] = useState<BrokerDataAccount[]>([]);
  const [ordersBySymbol, setOrdersBySymbol] = useState<BrokerDataOrder[]>([]);
  const [positionsBySymbol, setPositionsBySymbol] = useState<BrokerDataPosition[]>([]);
  const [ordersByBroker, setOrdersByBroker] = useState<BrokerDataOrder[]>([]);
  const [positionsByBroker, setPositionsByBroker] = useState<BrokerDataPosition[]>([]);
  
  // Form state
  const [symbolFilter, setSymbolFilter] = useState('');
  const [brokerFilter, setBrokerFilter] = useState('');

  // Open positions
  const handleGetOpenPositions = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching open positions...');
    try {
      const positions = await finatic.getOpenPositions();
      setOpenPositions(positions);
      addLog('success', `Fetched ${positions.length} open positions`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch open positions';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Filled orders
  const handleGetFilledOrders = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching filled orders...');
    try {
      const orders = await finatic.getFilledOrders();
      setFilledOrders(orders);
      addLog('success', `Fetched ${orders.length} filled orders`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch filled orders';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Pending orders
  const handleGetPendingOrders = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching pending orders...');
    try {
      const orders = await finatic.getPendingOrders();
      setPendingOrders(orders);
      addLog('success', `Fetched ${orders.length} pending orders`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch pending orders';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Active accounts
  const handleGetActiveAccounts = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching active accounts...');
    try {
      const accounts = await finatic.getActiveAccounts();
      setActiveAccounts(accounts);
      addLog('success', `Fetched ${accounts.length} active accounts`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch active accounts';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Orders by symbol
  const handleGetOrdersBySymbol = async () => {
    if (!finatic || !symbolFilter.trim()) return;
    addLog('info', `Fetching orders for symbol: ${symbolFilter}`);
    try {
      const orders = await finatic.getOrdersBySymbol(symbolFilter.trim().toUpperCase());
      setOrdersBySymbol(orders);
      addLog('success', `Fetched ${orders.length} orders for ${symbolFilter}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch orders by symbol';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Positions by symbol
  const handleGetPositionsBySymbol = async () => {
    if (!finatic || !symbolFilter.trim()) return;
    addLog('info', `Fetching positions for symbol: ${symbolFilter}`);
    try {
      const positions = await finatic.getPositionsBySymbol(symbolFilter.trim().toUpperCase());
      setPositionsBySymbol(positions);
      addLog('success', `Fetched ${positions.length} positions for ${symbolFilter}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch positions by symbol';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Orders by broker
  const handleGetOrdersByBroker = async () => {
    if (!finatic || !brokerFilter.trim()) return;
    addLog('info', `Fetching orders for broker: ${brokerFilter}`);
    try {
      const orders = await finatic.getOrdersByBroker(brokerFilter.trim());
      setOrdersByBroker(orders);
      addLog('success', `Fetched ${orders.length} orders for ${brokerFilter}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch orders by broker';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Positions by broker
  const handleGetPositionsByBroker = async () => {
    if (!finatic || !brokerFilter.trim()) return;
    addLog('info', `Fetching positions for broker: ${brokerFilter}`);
    try {
      const positions = await finatic.getPositionsByBroker(brokerFilter.trim());
      setPositionsByBroker(positions);
      addLog('success', `Fetched ${positions.length} positions for ${brokerFilter}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch positions by broker';
      setError(msg);
      addLog('error', msg);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Convenience Methods</h1>
          <p className="text-gray-600 mt-1">Test filtered data access and helper methods</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Convenience Methods
          </div>
        </div>
      </div>

      {/* Filtered Data Access */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Filtered Data Access</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-3">
            <button 
              onClick={handleGetOpenPositions} 
              disabled={isLoading || !finatic} 
              className="btn btn-primary btn-sm w-full"
            >
              📊 Open Positions
            </button>
            <div className="text-xs text-gray-600 text-center">
              {openPositions.length} positions
            </div>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={handleGetFilledOrders} 
              disabled={isLoading || !finatic} 
              className="btn btn-primary btn-sm w-full"
            >
              ✅ Filled Orders
            </button>
            <div className="text-xs text-gray-600 text-center">
              {filledOrders.length} orders
            </div>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={handleGetPendingOrders} 
              disabled={isLoading || !finatic} 
              className="btn btn-primary btn-sm w-full"
            >
              ⏳ Pending Orders
            </button>
            <div className="text-xs text-gray-600 text-center">
              {pendingOrders.length} orders
            </div>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={handleGetActiveAccounts} 
              disabled={isLoading || !finatic} 
              className="btn btn-primary btn-sm w-full"
            >
              👤 Active Accounts
            </button>
            <div className="text-xs text-gray-600 text-center">
              {activeAccounts.length} accounts
            </div>
          </div>
        </div>
      </div>

      {/* Symbol-based Filtering */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Symbol-based Filtering</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input 
              type="text" 
              placeholder="Enter symbol (e.g., AAPL, TSLA)" 
              value={symbolFilter} 
              onChange={(e) => setSymbolFilter(e.target.value.toUpperCase())} 
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
            />
            <button 
              onClick={handleGetOrdersBySymbol} 
              disabled={isLoading || !finatic || !symbolFilter.trim()} 
              className="btn btn-primary"
            >
              📋 Orders by Symbol
            </button>
            <button 
              onClick={handleGetPositionsBySymbol} 
              disabled={isLoading || !finatic || !symbolFilter.trim()} 
              className="btn btn-secondary"
            >
              📊 Positions by Symbol
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50/50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-1">Orders by Symbol</div>
              <div className="text-xs text-gray-600">{ordersBySymbol.length} orders for {symbolFilter || 'N/A'}</div>
            </div>
            <div className="bg-gray-50/50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-1">Positions by Symbol</div>
              <div className="text-xs text-gray-600">{positionsBySymbol.length} positions for {symbolFilter || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Broker-based Filtering */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Broker-based Filtering</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input 
              type="text" 
              placeholder="Enter broker ID (e.g., robinhood, tasty_trade)" 
              value={brokerFilter} 
              onChange={(e) => setBrokerFilter(e.target.value)} 
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
            />
            <button 
              onClick={handleGetOrdersByBroker} 
              disabled={isLoading || !finatic || !brokerFilter.trim()} 
              className="btn btn-primary"
            >
              📋 Orders by Broker
            </button>
            <button 
              onClick={handleGetPositionsByBroker} 
              disabled={isLoading || !finatic || !brokerFilter.trim()} 
              className="btn btn-secondary"
            >
              📊 Positions by Broker
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50/50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-1">Orders by Broker</div>
              <div className="text-xs text-gray-600">{ordersByBroker.length} orders for {brokerFilter || 'N/A'}</div>
            </div>
            <div className="bg-gray-50/50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-1">Positions by Broker</div>
              <div className="text-xs text-gray-600">{positionsByBroker.length} positions for {brokerFilter || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Method Reference */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Available Methods</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Filtered Data Access</h4>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50/50 rounded-lg">
                <div className="font-mono text-sm font-medium text-gray-900">getOpenPositions()</div>
                <div className="text-xs text-gray-600 mt-1">Get only open positions</div>
              </div>
              <div className="p-3 bg-gray-50/50 rounded-lg">
                <div className="font-mono text-sm font-medium text-gray-900">getFilledOrders()</div>
                <div className="text-xs text-gray-600 mt-1">Get only filled orders</div>
              </div>
              <div className="p-3 bg-gray-50/50 rounded-lg">
                <div className="font-mono text-sm font-medium text-gray-900">getPendingOrders()</div>
                <div className="text-xs text-gray-600 mt-1">Get only pending orders</div>
              </div>
              <div className="p-3 bg-gray-50/50 rounded-lg">
                <div className="font-mono text-sm font-medium text-gray-900">getActiveAccounts()</div>
                <div className="text-xs text-gray-600 mt-1">Get only active accounts</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Symbol & Broker Filtering</h4>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50/50 rounded-lg">
                <div className="font-mono text-sm font-medium text-gray-900">getOrdersBySymbol(symbol)</div>
                <div className="text-xs text-gray-600 mt-1">Get orders for specific symbol</div>
              </div>
              <div className="p-3 bg-gray-50/50 rounded-lg">
                <div className="font-mono text-sm font-medium text-gray-900">getPositionsBySymbol(symbol)</div>
                <div className="text-xs text-gray-600 mt-1">Get positions for specific symbol</div>
              </div>
              <div className="p-3 bg-gray-50/50 rounded-lg">
                <div className="font-mono text-sm font-medium text-gray-900">getOrdersByBroker(brokerId)</div>
                <div className="text-xs text-gray-600 mt-1">Get orders for specific broker</div>
              </div>
              <div className="p-3 bg-gray-50/50 rounded-lg">
                <div className="font-mono text-sm font-medium text-gray-900">getPositionsByBroker(brokerId)</div>
                <div className="text-xs text-gray-600 mt-1">Get positions for specific broker</div>
              </div>
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
