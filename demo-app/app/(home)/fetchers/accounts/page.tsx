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
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Accounts</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <input type="text" placeholder="Broker ID" value={accountsFilters.broker_id} onChange={(e) => setAccountsFilters({ ...accountsFilters, broker_id: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <select value={accountsFilters.account_type} onChange={(e) => setAccountsFilters({ ...accountsFilters, account_type: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="">All Account Types</option>
            <option value="margin">Margin</option>
            <option value="cash">Cash</option>
            <option value="crypto_wallet">Crypto Wallet</option>
            <option value="live">Live</option>
            <option value="sim">Sim</option>
          </select>
          <select value={accountsFilters.status} onChange={(e) => setAccountsFilters({ ...accountsFilters, status: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input type="text" placeholder="Currency" value={accountsFilters.currency} onChange={(e) => setAccountsFilters({ ...accountsFilters, currency: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Test Base Methods</h3>
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-blue-700">Page Size:</label>
              <input type="number" min={1} max={1000} value={accountsPageSize} onChange={(e) => setAccountsPageSize(parseInt(e.target.value) || 10)} className="border border-blue-300 rounded-md px-2 py-1 text-sm w-20" />
            </div>
            <button onClick={handleGetAccountsPage} disabled={isLoading || !finatic} className="btn btn-primary btn-sm">Get First Page</button>
            <button onClick={handleGetAllAccounts} disabled={isLoading || !finatic} className="btn btn-secondary btn-sm">Get All (Convenience)</button>
          </div>
          <div className="text-xs text-blue-700">Page Size: 1-1000 (default: 10), Get First Page returns PaginatedResult, Get All returns array</div>
        </div>

        {accountsPage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <h3 className="text-sm font-medium text-green-900 mb-2">Test PaginatedResult Navigation Methods</h3>
            <div className="flex items-center space-x-2">
              <button onClick={handleFirstAccountsPage} disabled={isLoading || !finatic || !accountsPage.hasPrevious} className="btn btn-outline btn-sm">First</button>
              <button onClick={handlePreviousAccountsPage} disabled={isLoading || !finatic || !accountsPage.hasPrevious} className="btn btn-outline btn-sm">Previous</button>
              <span className="text-sm text-gray-600 px-2">Page {accountsPage.currentPage}</span>
              <button onClick={handleNextAccountsPage} disabled={isLoading || !finatic || !accountsPage.hasNext} className="btn btn-outline btn-sm">Next</button>
            </div>
            <div className="text-xs text-green-700 mt-2">These test the PaginatedResult.nextPage(), .previousPage(), .firstPage() methods</div>
          </div>
        )}

        {accountsPage && (
          <div className="bg-gray-50 rounded-md p-3 mb-4">
            <div className="text-sm text-gray-600">Page {accountsPage.currentPage} • {accountsPage.hasNext ? ' Has Next' : ' Last Page'} • {accountsPage.hasPrevious ? ' Has Previous' : ' First Page'} • {accountsPage.data ? accountsPage.data.length : 0} items</div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cash Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buying Power</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.account_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.account_type || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.status || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.cash_balance != null ? `$${account.cash_balance.toFixed(2)}` : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.buying_power != null ? `$${account.buying_power.toFixed(2)}` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && <div className="text-sm text-red-600 mt-4">{error}</div>}
      </div>
    </div>
  );
}


