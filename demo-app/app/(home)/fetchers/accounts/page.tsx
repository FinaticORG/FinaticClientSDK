'use client';

import React, { useState } from 'react';
import { BrokerDataAccount, PaginatedResult } from '@finatic/client';
import { useFinatic } from '@/app/(home)/providers/FinaticProvider';

export default function AccountsPage() {
  const { finatic, isLoading, addLog } = useFinatic();
  const [error, setError] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<BrokerDataAccount[]>([]);
  const [accountsPage, setAccountsPage] = useState<PaginatedResult<BrokerDataAccount[]> | null>(null);
  const [accountsFilters, setAccountsFilters] = useState({
    broker_id: '',
    account_type: '',
    status: '',
    currency: ''
  });
  const [accountsPageNum, setAccountsPageNum] = useState(1);
  const [accountsPageSize, setAccountsPageSize] = useState(10);

  const handleGetAccountsPage = async () => {
    if (!finatic) return;
    addLog('info', `Fetching accounts page ${accountsPageNum} (size ${accountsPageSize})...`);
    try {
      const filters = Object.fromEntries(
        Object.entries(accountsFilters).filter(([_, value]) => value !== '')
      );

      const result = await finatic.getAccounts({
        page: accountsPageNum,
        perPage: accountsPageSize,
        filter: filters
      });
      setAccountsPage(result);
      setAccounts(result.data || []);
      addLog('success', `Fetched accounts page ${result.currentPage} (${result.data ? result.data.length : 0} items)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch accounts page';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleGetAllAccounts = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching all accounts...');
    try {
      const filters = Object.fromEntries(
        Object.entries(accountsFilters).filter(([_, value]) => value !== '')
      );
      const result = await finatic.getAllAccounts(filters);
      setAccounts(result);
      setAccountsPage(null);
      addLog('success', `Fetched all accounts (${result.length} items)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch all accounts';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleNextAccountsPage = async () => {
    if (!finatic || !accountsPage || !accountsPage.hasNext) return;
    addLog('info', 'Fetching next accounts page...');
    try {
      const nextResult = await accountsPage.nextPage();
      if (nextResult) {
        setAccountsPage(nextResult);
        setAccounts(nextResult.data || []);
        setAccountsPageNum(nextResult.currentPage);
        addLog('success', `Fetched accounts page ${nextResult.currentPage} (${nextResult.data ? nextResult.data.length : 0} items)`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch next accounts page';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handlePreviousAccountsPage = async () => {
    if (!finatic || !accountsPage || !accountsPage.hasPrevious) return;
    addLog('info', 'Fetching previous accounts page...');
    try {
      const prevResult = await accountsPage.previousPage();
      if (prevResult) {
        setAccountsPage(prevResult);
        setAccounts(prevResult.data || []);
        setAccountsPageNum(prevResult.currentPage);
        addLog('success', `Fetched accounts page ${prevResult.currentPage} (${prevResult.data ? prevResult.data.length : 0} items)`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch previous accounts page';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleFirstAccountsPage = async () => {
    if (!finatic || !accountsPage) return;
    addLog('info', 'Fetching first accounts page...');
    try {
      const firstResult = await accountsPage.firstPage();
      if (firstResult) {
        setAccountsPage(firstResult);
        setAccounts(firstResult.data || []);
        setAccountsPageNum(firstResult.currentPage);
        addLog('success', `Fetched first accounts page (${firstResult.data ? firstResult.data.length : 0} items)`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch first accounts page';
      setError(msg);
      addLog('error', msg);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600 mt-1">Manage and view your brokerage accounts</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${accounts.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Broker ID</label>
            <input 
              type="text" 
              placeholder="Enter broker ID" 
              value={accountsFilters.broker_id} 
              onChange={(e) => setAccountsFilters({ ...accountsFilters, broker_id: e.target.value })} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Account Type</label>
            <select 
              value={accountsFilters.account_type} 
              onChange={(e) => setAccountsFilters({ ...accountsFilters, account_type: e.target.value })} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Account Types</option>
              <option value="margin">Margin</option>
              <option value="cash">Cash</option>
              <option value="crypto_wallet">Crypto Wallet</option>
              <option value="live">Live</option>
              <option value="sim">Sim</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select 
              value={accountsFilters.status} 
              onChange={(e) => setAccountsFilters({ ...accountsFilters, status: e.target.value })} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Currency</label>
            <input 
              type="text" 
              placeholder="e.g., USD, EUR" 
              value={accountsFilters.currency} 
              onChange={(e) => setAccountsFilters({ ...accountsFilters, currency: e.target.value })} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
            />
          </div>
        </div>
      </div>

      {/* Actions Card */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Fetch Methods</h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Page Size:</label>
            <input 
              type="number" 
              min={1} 
              max={1000} 
              value={accountsPageSize} 
              onChange={(e) => setAccountsPageSize(parseInt(e.target.value) || 10)} 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
            />
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleGetAccountsPage} 
              disabled={isLoading || !finatic} 
              className="btn btn-primary btn-sm"
            >
              📄 Get First Page
            </button>
            <button 
              onClick={handleGetAllAccounts} 
              disabled={isLoading || !finatic} 
              className="btn btn-secondary btn-sm"
            >
              📚 Get All
            </button>
          </div>
        </div>
        
        <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <span className="font-medium">Page Size:</span> 1-1000 (default: 10) • 
            <span className="font-medium">Get First Page:</span> Returns PaginatedResult • 
            <span className="font-medium">Get All:</span> Returns array
          </p>
        </div>
      </div>

      {/* Pagination Controls */}
      {accountsPage && (
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg"></div>
              <h3 className="text-lg font-semibold text-gray-900">Pagination</h3>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="font-medium">Page {accountsPage.currentPage}</span>
              <span>•</span>
              <span>{accountsPage.data ? accountsPage.data.length : 0} items</span>
              <span>•</span>
              <span className={accountsPage.hasNext ? 'text-green-600' : 'text-gray-400'}>
                {accountsPage.hasNext ? 'Has Next' : 'Last Page'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <button 
              onClick={handleFirstAccountsPage} 
              disabled={isLoading || !finatic || !accountsPage.hasPrevious} 
              className="btn btn-outline btn-sm"
            >
              ⏮️ First
            </button>
            <button 
              onClick={handlePreviousAccountsPage} 
              disabled={isLoading || !finatic || !accountsPage.hasPrevious} 
              className="btn btn-outline btn-sm"
            >
              ⬅️ Previous
            </button>
            <div className="px-4 py-2 bg-gray-100 rounded-lg">
              <span className="font-mono text-sm font-medium">Page {accountsPage.currentPage}</span>
            </div>
            <button 
              onClick={handleNextAccountsPage} 
              disabled={isLoading || !finatic || !accountsPage.hasNext} 
              className="btn btn-outline btn-sm"
            >
              Next ➡️
            </button>
          </div>
          
          <div className="mt-4 bg-green-50/50 border border-green-200/50 rounded-lg p-3">
            <p className="text-xs text-green-700">
              <span className="font-medium">Navigation methods:</span> 
              PaginatedResult.nextPage(), .previousPage(), .firstPage()
            </p>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
            <h3 className="text-lg font-semibold text-gray-900">Account Data</h3>
          </div>
        </div>
        
        {accounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👤</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
            <p className="text-gray-600">Try adjusting your filters or fetch accounts to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/50">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Account Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cash Balance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Buying Power</th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-200/30">
                {accounts.map((account, index) => (
                  <tr key={account.id} className={`hover:bg-gray-50/50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white/30' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-medium text-gray-900">{account.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{account.account_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        account.account_type === 'margin' ? 'bg-blue-100 text-blue-800' :
                        account.account_type === 'cash' ? 'bg-green-100 text-green-800' :
                        account.account_type === 'crypto_wallet' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {account.account_type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        account.status === 'active' ? 'bg-green-100 text-green-800' :
                        account.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {account.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-medium text-gray-900">
                        {account.cash_balance != null ? `$${account.cash_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-medium text-gray-900">
                        {account.buying_power != null ? `$${account.buying_power.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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


