'use client';

import React, { useState } from 'react';
import { BrokerDataAccount, BrokerDataOrder, BrokerDataPosition, PaginatedResult, OrdersFilter, PositionsFilter, AccountsFilter } from '@finatic/client';
import { useFinatic } from '@/app/(home)/providers/FinaticProvider';

export default function DataAccessPage() {
  const { finatic, isLoading, addLog } = useFinatic();
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [accounts, setAccounts] = useState<BrokerDataAccount[]>([]);
  const [orders, setOrders] = useState<BrokerDataOrder[]>([]);
  const [positions, setPositions] = useState<BrokerDataPosition[]>([]);
  
  // Pagination state
  const [accountsPage, setAccountsPage] = useState<PaginatedResult<BrokerDataAccount[]> | null>(null);
  const [ordersPage, setOrdersPage] = useState<PaginatedResult<BrokerDataOrder[]> | null>(null);
  const [positionsPage, setPositionsPage] = useState<PaginatedResult<BrokerDataPosition[]> | null>(null);
  
  // Filter state
  const [accountsFilters, setAccountsFilters] = useState<AccountsFilter>({});
  const [ordersFilters, setOrdersFilters] = useState<OrdersFilter>({});
  const [positionsFilters, setPositionsFilters] = useState<PositionsFilter>({});
  
  // Pagination settings
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Accounts methods
  const handleGetAccounts = async () => {
    if (!finatic) return;
    addLog('info', `Fetching accounts (page ${currentPage}, size ${pageSize})...`);
    try {
      const result = await finatic.getAccounts({
        page: currentPage,
        perPage: pageSize,
        filter: accountsFilters
      });
      setAccountsPage(result);
      setAccounts(result.data || []);
      addLog('success', `Fetched accounts page ${result.currentPage} (${result.data?.length || 0} items)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch accounts';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleGetAllAccounts = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching all accounts...');
    try {
      const result = await finatic.getAllAccounts(accountsFilters);
      setAccounts(result);
      setAccountsPage(null);
      addLog('success', `Fetched all accounts (${result.length} items)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch all accounts';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Orders methods
  const handleGetOrders = async () => {
    if (!finatic) return;
    addLog('info', `Fetching orders (page ${currentPage}, size ${pageSize})...`);
    try {
      const result = await finatic.getOrders({
        page: currentPage,
        perPage: pageSize,
        filter: ordersFilters
      });
      setOrdersPage(result);
      setOrders(result.data || []);
      addLog('success', `Fetched orders page ${result.currentPage} (${result.data?.length || 0} items)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleGetAllOrders = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching all orders...');
    try {
      const result = await finatic.getAllOrders(ordersFilters);
      setOrders(result);
      setOrdersPage(null);
      addLog('success', `Fetched all orders (${result.length} items)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch all orders';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Positions methods
  const handleGetPositions = async () => {
    if (!finatic) return;
    addLog('info', `Fetching positions (page ${currentPage}, size ${pageSize})...`);
    try {
      const result = await finatic.getPositions({
        page: currentPage,
        perPage: pageSize,
        filter: positionsFilters
      });
      setPositionsPage(result);
      setPositions(result.data || []);
      addLog('success', `Fetched positions page ${result.currentPage} (${result.data?.length || 0} items)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch positions';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleGetAllPositions = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching all positions...');
    try {
      const result = await finatic.getAllPositions(positionsFilters);
      setPositions(result);
      setPositionsPage(null);
      addLog('success', `Fetched all positions (${result.length} items)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch all positions';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Pagination navigation
  const handleNextPage = async (type: 'accounts' | 'orders' | 'positions') => {
    if (!finatic) return;
    const currentPage = type === 'accounts' ? accountsPage : type === 'orders' ? ordersPage : positionsPage;
    if (!currentPage || !currentPage.hasNext) return;
    
    addLog('info', `Fetching next ${type} page...`);
    try {
      const nextResult = await currentPage.nextPage();
      if (nextResult) {
        if (type === 'accounts') {
          setAccountsPage(nextResult);
          setAccounts(nextResult.data || []);
        } else if (type === 'orders') {
          setOrdersPage(nextResult);
          setOrders(nextResult.data || []);
        } else {
          setPositionsPage(nextResult);
          setPositions(nextResult.data || []);
        }
        addLog('success', `Fetched ${type} page ${nextResult.currentPage} (${nextResult.data?.length || 0} items)`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Failed to fetch next ${type} page`;
      setError(msg);
      addLog('error', msg);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Access</h1>
          <p className="text-gray-600 mt-1">Test all data fetching methods with pagination and filtering</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {accounts.length + orders.length + positions.length} total items
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
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Page:</label>
            <input 
              type="number" 
              min={1} 
              value={currentPage} 
              onChange={(e) => setCurrentPage(parseInt(e.target.value) || 1)} 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
            />
          </div>
        </div>
      </div>

      {/* Accounts Section */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Accounts</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {accounts.length} items
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button onClick={handleGetAccounts} disabled={isLoading || !finatic} className="btn btn-primary btn-sm">
              📄 Get Page
            </button>
            <button onClick={handleGetAllAccounts} disabled={isLoading || !finatic} className="btn btn-secondary btn-sm">
              📚 Get All
            </button>
            {accountsPage && accountsPage.hasNext && (
              <button onClick={() => handleNextPage('accounts')} disabled={isLoading || !finatic} className="btn btn-outline btn-sm">
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

      {/* Orders Section */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {orders.length} items
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button onClick={handleGetOrders} disabled={isLoading || !finatic} className="btn btn-primary btn-sm">
              📄 Get Page
            </button>
            <button onClick={handleGetAllOrders} disabled={isLoading || !finatic} className="btn btn-secondary btn-sm">
              📚 Get All
            </button>
            {ordersPage && ordersPage.hasNext && (
              <button onClick={() => handleNextPage('orders')} disabled={isLoading || !finatic} className="btn btn-outline btn-sm">
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

      {/* Positions Section */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Positions</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            {positions.length} items
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button onClick={handleGetPositions} disabled={isLoading || !finatic} className="btn btn-primary btn-sm">
              📄 Get Page
            </button>
            <button onClick={handleGetAllPositions} disabled={isLoading || !finatic} className="btn btn-secondary btn-sm">
              📚 Get All
            </button>
            {positionsPage && positionsPage.hasNext && (
              <button onClick={() => handleNextPage('positions')} disabled={isLoading || !finatic} className="btn btn-outline btn-sm">
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

      {/* Method Reference */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Available Methods</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Accounts</h4>
            <div className="space-y-1 text-sm">
              <div className="font-mono text-xs">getAccounts(params?)</div>
              <div className="font-mono text-xs">getAllAccounts(filter?)</div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Orders</h4>
            <div className="space-y-1 text-sm">
              <div className="font-mono text-xs">getOrders(params?)</div>
              <div className="font-mono text-xs">getAllOrders(filter?)</div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Positions</h4>
            <div className="space-y-1 text-sm">
              <div className="font-mono text-xs">getPositions(params?)</div>
              <div className="font-mono text-xs">getAllPositions(filter?)</div>
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
