'use client';

import React, { useState } from 'react';
import { BrokerDataOrder, PaginatedResult } from '@finatic/client';
import { useFinatic } from '@/app/(home)/providers/FinaticProvider';

export default function OrdersPage() {
  const { finatic, isLoading, addLog } = useFinatic();
  const [error, setError] = useState<string | null>(null);

  const [orders, setOrders] = useState<BrokerDataOrder[]>([]);
  const [ordersPage, setOrdersPage] = useState<PaginatedResult<BrokerDataOrder[]> | null>(null);
  const [ordersFilters, setOrdersFilters] = useState({
    broker_id: '',
    symbol: '',
    status: '',
    side: '',
    asset_type: ''
  });
  const [ordersPageNum, setOrdersPageNum] = useState(1);
  const [ordersPageSize, setOrdersPageSize] = useState(10);

  const handleGetOrdersPage = async () => {
    if (!finatic) return;
    addLog('info', `Fetching orders page ${ordersPageNum} (size ${ordersPageSize})...`);
    try {
      const filters = Object.fromEntries(
        Object.entries(ordersFilters).filter(([_, value]) => value !== '')
      );
      const result = await finatic.getOrders({
        page: ordersPageNum,
        perPage: ordersPageSize,
        filter: filters
      });
      setOrdersPage(result);
      setOrders(result.data || []);
      addLog('success', `Fetched orders page ${result.currentPage} (${result.data ? result.data.length : 0} items)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch orders page';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleGetAllOrders = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching all orders...');
    try {
      const filters = Object.fromEntries(
        Object.entries(ordersFilters).filter(([_, value]) => value !== '')
      );
      const result = await finatic.getAllOrders(filters);
      setOrders(result);
      setOrdersPage(null);
      addLog('success', `Fetched all orders (${result.length} items)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch all orders';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleNextOrdersPage = async () => {
    if (!finatic || !ordersPage || !ordersPage.hasNext) return;
    addLog('info', 'Fetching next orders page...');
    try {
      const nextResult = await ordersPage.nextPage();
      if (nextResult) {
        setOrdersPage(nextResult);
        setOrders(nextResult.data || []);
        setOrdersPageNum(nextResult.currentPage);
        addLog('success', `Fetched orders page ${nextResult.currentPage} (${nextResult.data ? result.data.length : 0} items)`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch next orders page';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handlePreviousOrdersPage = async () => {
    if (!finatic || !ordersPage || !ordersPage.hasPrevious) return;
    addLog('info', 'Fetching previous orders page...');
    try {
      const prevResult = await ordersPage.previousPage();
      if (prevResult) {
        setOrdersPage(prevResult);
        setOrders(prevResult.data || []);
        setOrdersPageNum(prevResult.currentPage);
        addLog('success', `Fetched orders page ${prevResult.currentPage} (${prevResult.data ? prevResult.data.length : 0} items)`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch previous orders page';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleFirstOrdersPage = async () => {
    if (!finatic || !ordersPage) return;
    addLog('info', 'Fetching first orders page...');
    try {
      const firstResult = await ordersPage.firstPage();
      if (firstResult) {
        setOrdersPage(firstResult);
        setOrders(firstResult.data || []);
        setOrdersPageNum(firstResult.currentPage);
        addLog('success', `Fetched first orders page (${firstResult.data ? firstResult.data.length : 0} items)`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch first orders page';
      setError(msg);
      addLog('error', msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Orders</h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <input type="text" placeholder="Broker ID" value={ordersFilters.broker_id} onChange={(e) => setOrdersFilters({ ...ordersFilters, broker_id: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <input type="text" placeholder="Symbol" value={ordersFilters.symbol} onChange={(e) => setOrdersFilters({ ...ordersFilters, symbol: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <select value={ordersFilters.status} onChange={(e) => setOrdersFilters({ ...ordersFilters, status: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            <option value="filled">Filled</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
            <option value="partially_filled">Partially Filled</option>
          </select>
          <select value={ordersFilters.side} onChange={(e) => setOrdersFilters({ ...ordersFilters, side: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="">All Sides</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
          <select value={ordersFilters.asset_type} onChange={(e) => setOrdersFilters({ ...ordersFilters, asset_type: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="">All Asset Types</option>
            <option value="stock">Stock</option>
            <option value="option">Option</option>
            <option value="crypto">Crypto</option>
            <option value="future">Future</option>
          </select>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Test Base Methods</h3>
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-blue-700">Page Size:</label>
              <input type="number" min={1} max={1000} value={ordersPageSize} onChange={(e) => setOrdersPageSize(parseInt(e.target.value) || 10)} className="border border-blue-300 rounded-md px-2 py-1 text-sm w-20" />
            </div>
            <button onClick={handleGetOrdersPage} disabled={isLoading || !finatic} className="btn btn-primary btn-sm">Get First Page</button>
            <button onClick={handleGetAllOrders} disabled={isLoading || !finatic} className="btn btn-secondary btn-sm">Get All (Convenience)</button>
          </div>
          <div className="text-xs text-blue-700">Page Size: 1-1000 (default: 10), Get First Page returns PaginatedResult, Get All returns array</div>
        </div>

        {ordersPage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <h3 className="text-sm font-medium text-green-900 mb-2">Test PaginatedResult Navigation Methods</h3>
            <div className="flex items-center space-x-2">
              <button onClick={handleFirstOrdersPage} disabled={isLoading || !finatic || !ordersPage.hasPrevious} className="btn btn-outline btn-sm">First</button>
              <button onClick={handlePreviousOrdersPage} disabled={isLoading || !finatic || !ordersPage.hasPrevious} className="btn btn-outline btn-sm">Previous</button>
              <span className="text-sm text-gray-600 px-2">Page {ordersPage.currentPage}</span>
              <button onClick={handleNextOrdersPage} disabled={isLoading || !finatic || !ordersPage.hasNext} className="btn btn-outline btn-sm">Next</button>
            </div>
            <div className="text-xs text-green-700 mt-2">These test the PaginatedResult.nextPage(), .previousPage(), .firstPage() methods</div>
          </div>
        )}

        {ordersPage && (
          <div className="bg-gray-50 rounded-md p-3 mb-4">
            <div className="text-sm text-gray-600">Page {ordersPage.currentPage} • {ordersPage.hasNext ? ' Has Next' : ' Last Page'} • {ordersPage.hasPrevious ? ' Has Previous' : ' First Page'} • {ordersPage.data ? ordersPage.data.length : 0} items</div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Side</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.symbol || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.order_type || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.side || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.quantity || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.price != null ? `$${order.price.toFixed(2)}` : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.status || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</td>
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


