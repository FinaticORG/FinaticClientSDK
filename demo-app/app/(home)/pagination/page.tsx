'use client';

import React, { useState } from 'react';
import { BrokerDataAccount, BrokerDataOrder, BrokerDataPosition, PaginatedResult } from '@finatic/client';
import { useFinatic } from '@/app/(home)/providers/FinaticProvider';

export default function PaginationPage() {
  const { finatic, isLoading, addLog } = useFinatic();
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [ordersPage, setOrdersPage] = useState<PaginatedResult<BrokerDataOrder[]> | null>(null);
  const [positionsPage, setPositionsPage] = useState<PaginatedResult<BrokerDataPosition[]> | null>(null);
  const [accountsPage, setAccountsPage] = useState<PaginatedResult<BrokerDataAccount[]> | null>(null);
  
  // Pagination settings
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Results state
  const [orders, setOrders] = useState<BrokerDataOrder[]>([]);
  const [positions, setPositions] = useState<BrokerDataPosition[]>([]);
  const [accounts, setAccounts] = useState<BrokerDataAccount[]>([]);

  // Get specific page
  const handleGetOrdersPage = async () => {
    if (!finatic) return;
    addLog('info', `Fetching orders page ${currentPage} (size ${pageSize})...`);
    try {
      const result = await finatic.getOrdersPage(currentPage, pageSize);
      setOrdersPage(result);
      setOrders(result.data || []);
      addLog('success', `Fetched orders page ${result.currentPage} (${result.data?.length || 0} items)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch orders page';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleGetPositionsPage = async () => {
    if (!finatic) return;
    addLog('info', `Fetching positions page ${currentPage} (size ${pageSize})...`);
    try {
      const result = await finatic.getPositionsPage(currentPage, pageSize);
      setPositionsPage(result);
      setPositions(result.data || []);
      addLog('success', `Fetched positions page ${result.currentPage} (${result.data?.length || 0} items)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch positions page';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleGetAccountsPage = async () => {
    if (!finatic) return;
    addLog('info', `Fetching accounts page ${currentPage} (size ${pageSize})...`);
    try {
      const result = await finatic.getAccountsPage(currentPage, pageSize);
      setAccountsPage(result);
      setAccounts(result.data || []);
      addLog('success', `Fetched accounts page ${result.currentPage} (${result.data?.length || 0} items)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch accounts page';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Next page navigation
  const handleNextOrdersPage = async () => {
    if (!finatic || !ordersPage || !ordersPage.hasNext) return;
    addLog('info', 'Fetching next orders page...');
    try {
      const nextResult = await finatic.getNextOrdersPage(ordersPage);
      if (nextResult) {
        setOrdersPage(nextResult);
        setOrders(nextResult.data || []);
        setCurrentPage(nextResult.currentPage);
        addLog('success', `Fetched next orders page ${nextResult.currentPage} (${nextResult.data?.length || 0} items)`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch next orders page';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleNextPositionsPage = async () => {
    if (!finatic || !positionsPage || !positionsPage.hasNext) return;
    addLog('info', 'Fetching next positions page...');
    try {
      const nextResult = await finatic.getNextPositionsPage(positionsPage);
      if (nextResult) {
        setPositionsPage(nextResult);
        setPositions(nextResult.data || []);
        setCurrentPage(nextResult.currentPage);
        addLog('success', `Fetched next positions page ${nextResult.currentPage} (${nextResult.data?.length || 0} items)`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch next positions page';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleNextAccountsPage = async () => {
    if (!finatic || !accountsPage || !accountsPage.hasNext) return;
    addLog('info', 'Fetching next accounts page...');
    try {
      const nextResult = await finatic.getNextAccountsPage(accountsPage);
      if (nextResult) {
        setAccountsPage(nextResult);
        setAccounts(nextResult.data || []);
        setCurrentPage(nextResult.currentPage);
        addLog('success', `Fetched next accounts page ${nextResult.currentPage} (${nextResult.data?.length || 0} items)`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch next accounts page';
      setError(msg);
      addLog('error', msg);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagination Methods</h1>
          <p className="text-gray-600 mt-1">Test pagination helper methods and navigation</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Pagination Testing
          </div>
        </div>
      </div>

      {/* Pagination Settings */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Pagination Settings</h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Page Size:</label>
            <input 
              type="number" 
              min={1} 
              max={1000} 
              value={pageSize} 
              onChange={(e) => setPageSize(parseInt(e.target.value) || 10)} 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Page:</label>
            <input 
              type="number" 
              min={1} 
              value={currentPage} 
              onChange={(e) => setCurrentPage(parseInt(e.target.value) || 1)} 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>
        </div>
      </div>

      {/* Orders Pagination */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Orders Pagination</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {orders.length} items
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleGetOrdersPage} 
              disabled={isLoading || !finatic} 
              className="btn btn-primary"
            >
              📄 Get Orders Page
            </button>
            {ordersPage && ordersPage.hasNext && (
              <button 
                onClick={handleNextOrdersPage} 
                disabled={isLoading || !finatic} 
                className="btn btn-secondary"
              >
                ➡️ Next Page
              </button>
            )}
          </div>
          
          {ordersPage && (
            <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                Page {ordersPage.currentPage} of {ordersPage.totalPages} • 
                {ordersPage.hasNext ? ' Has next page' : ' Last page'} • 
                {ordersPage.hasPrevious ? ' Has previous page' : ' First page'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Positions Pagination */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Positions Pagination</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {positions.length} items
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleGetPositionsPage} 
              disabled={isLoading || !finatic} 
              className="btn btn-primary"
            >
              📊 Get Positions Page
            </button>
            {positionsPage && positionsPage.hasNext && (
              <button 
                onClick={handleNextPositionsPage} 
                disabled={isLoading || !finatic} 
                className="btn btn-secondary"
              >
                ➡️ Next Page
              </button>
            )}
          </div>
          
          {positionsPage && (
            <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                Page {positionsPage.currentPage} of {positionsPage.totalPages} • 
                {positionsPage.hasNext ? ' Has next page' : ' Last page'} • 
                {positionsPage.hasPrevious ? ' Has previous page' : ' First page'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Accounts Pagination */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Accounts Pagination</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            {accounts.length} items
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleGetAccountsPage} 
              disabled={isLoading || !finatic} 
              className="btn btn-primary"
            >
              👤 Get Accounts Page
            </button>
            {accountsPage && accountsPage.hasNext && (
              <button 
                onClick={handleNextAccountsPage} 
                disabled={isLoading || !finatic} 
                className="btn btn-secondary"
              >
                ➡️ Next Page
              </button>
            )}
          </div>
          
          {accountsPage && (
            <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                Page {accountsPage.currentPage} of {accountsPage.totalPages} • 
                {accountsPage.hasNext ? ' Has next page' : ' Last page'} • 
                {accountsPage.hasPrevious ? ' Has previous page' : ' First page'}
              </p>
            </div>
          )}
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
            <h4 className="font-medium text-gray-900">Page Methods</h4>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50/50 rounded-lg">
                <div className="font-mono text-sm font-medium text-gray-900">getOrdersPage(page, perPage, filter?)</div>
                <div className="text-xs text-gray-600 mt-1">Get specific page of orders</div>
              </div>
              <div className="p-3 bg-gray-50/50 rounded-lg">
                <div className="font-mono text-sm font-medium text-gray-900">getPositionsPage(page, perPage, filter?)</div>
                <div className="text-xs text-gray-600 mt-1">Get specific page of positions</div>
              </div>
              <div className="p-3 bg-gray-50/50 rounded-lg">
                <div className="font-mono text-sm font-medium text-gray-900">getAccountsPage(page, perPage, filter?)</div>
                <div className="text-xs text-gray-600 mt-1">Get specific page of accounts</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Next Page Methods</h4>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50/50 rounded-lg">
                <div className="font-mono text-sm font-medium text-gray-900">getNextOrdersPage(previousResult)</div>
                <div className="text-xs text-gray-600 mt-1">Get next page of orders</div>
              </div>
              <div className="p-3 bg-gray-50/50 rounded-lg">
                <div className="font-mono text-sm font-medium text-gray-900">getNextPositionsPage(previousResult)</div>
                <div className="text-xs text-gray-600 mt-1">Get next page of positions</div>
              </div>
              <div className="p-3 bg-gray-50/50 rounded-lg">
                <div className="font-mono text-sm font-medium text-gray-900">getNextAccountsPage(previousResult)</div>
                <div className="text-xs text-gray-600 mt-1">Get next page of accounts</div>
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
