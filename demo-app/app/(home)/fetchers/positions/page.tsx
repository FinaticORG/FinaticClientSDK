'use client';

import React, { useState } from 'react';
import { BrokerDataPosition, PaginatedResult } from '@finatic/client';
import { useFinatic } from '@/app/(home)/providers/FinaticProvider';

export default function PositionsPage() {
  const { finatic, isLoading, addLog } = useFinatic();
  const [error, setError] = useState<string | null>(null);

  const [positions, setPositions] = useState<BrokerDataPosition[]>([]);
  const [positionsPage, setPositionsPage] = useState<PaginatedResult<BrokerDataPosition[]> | null>(null);
  const [positionsFilters, setPositionsFilters] = useState({
    broker_id: '',
    symbol: '',
    position_status: '',
    side: ''
  });
  const [positionsPageNum, setPositionsPageNum] = useState(1);
  const [positionsPageSize, setPositionsPageSize] = useState(10);

  const handleGetPositionsPage = async () => {
    if (!finatic) return;
    addLog('info', `Fetching positions page ${positionsPageNum} (size ${positionsPageSize})...`);
    try {
      const filters = Object.fromEntries(
        Object.entries(positionsFilters).filter(([_, value]) => value !== '')
      );
      const result = await finatic.getPositions({
        page: positionsPageNum,
        perPage: positionsPageSize,
        filter: filters
      });
      setPositionsPage(result);
      setPositions(result.data || []);
      addLog('success', `Fetched positions page ${result.currentPage} (${result.data ? result.data.length : 0} items)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch positions page';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleGetAllPositions = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching all positions...');
    try {
      const filters = Object.fromEntries(
        Object.entries(positionsFilters).filter(([_, value]) => value !== '')
      );
      const result = await finatic.getAllPositions(filters);
      setPositions(result);
      setPositionsPage(null);
      addLog('success', `Fetched all positions (${result.length} items)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch all positions';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleNextPositionsPage = async () => {
    if (!finatic || !positionsPage || !positionsPage.hasNext) return;
    addLog('info', 'Fetching next positions page...');
    try {
      const nextResult = await positionsPage.nextPage();
      if (nextResult) {
        setPositionsPage(nextResult);
        setPositions(nextResult.data || []);
        setPositionsPageNum(nextResult.currentPage);
        addLog('success', `Fetched positions page ${nextResult.currentPage} (${nextResult.data ? nextResult.data.length : 0} items)`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch next positions page';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handlePreviousPositionsPage = async () => {
    if (!finatic || !positionsPage || !positionsPage.hasPrevious) return;
    addLog('info', 'Fetching previous positions page...');
    try {
      const prevResult = await positionsPage.previousPage();
      if (prevResult) {
        setPositionsPage(prevResult);
        setPositions(prevResult.data || []);
        setPositionsPageNum(prevResult.currentPage);
        addLog('success', `Fetched positions page ${prevResult.currentPage} (${prevResult.data ? prevResult.data.length : 0} items)`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch previous positions page';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleFirstPositionsPage = async () => {
    if (!finatic || !positionsPage) return;
    addLog('info', 'Fetching first positions page...');
    try {
      const firstResult = await positionsPage.firstPage();
      if (firstResult) {
        setPositionsPage(firstResult);
        setPositions(firstResult.data || []);
        setPositionsPageNum(firstResult.currentPage);
        addLog('success', `Fetched first positions page (${firstResult.data ? firstResult.data.length : 0} items)`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch first positions page';
      setError(msg);
      addLog('error', msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Positions</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <input type="text" placeholder="Broker ID" value={positionsFilters.broker_id} onChange={(e) => setPositionsFilters({ ...positionsFilters, broker_id: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <input type="text" placeholder="Symbol" value={positionsFilters.symbol} onChange={(e) => setPositionsFilters({ ...positionsFilters, symbol: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <select value={positionsFilters.position_status} onChange={(e) => setPositionsFilters({ ...positionsFilters, position_status: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          <select value={positionsFilters.side} onChange={(e) => setPositionsFilters({ ...positionsFilters, side: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="">All Sides</option>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Test Base Methods</h3>
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-blue-700">Page Size:</label>
              <input type="number" min={1} max={1000} value={positionsPageSize} onChange={(e) => setPositionsPageSize(parseInt(e.target.value) || 10)} className="border border-blue-300 rounded-md px-2 py-1 text-sm w-20" />
            </div>
            <button onClick={handleGetPositionsPage} disabled={isLoading || !finatic} className="btn btn-primary btn-sm">Get First Page</button>
            <button onClick={handleGetAllPositions} disabled={isLoading || !finatic} className="btn btn-secondary btn-sm">Get All (Convenience)</button>
          </div>
          <div className="text-xs text-blue-700">Page Size: 1-1000 (default: 10), Get First Page returns PaginatedResult, Get All returns array</div>
        </div>

        {positionsPage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <h3 className="text-sm font-medium text-green-900 mb-2">Test PaginatedResult Navigation Methods</h3>
            <div className="flex items-center space-x-2">
              <button onClick={handleFirstPositionsPage} disabled={isLoading || !finatic || !positionsPage.hasPrevious} className="btn btn-outline btn-sm">First</button>
              <button onClick={handlePreviousPositionsPage} disabled={isLoading || !finatic || !positionsPage.hasPrevious} className="btn btn-outline btn-sm">Previous</button>
              <span className="text-sm text-gray-600 px-2">Page {positionsPage.currentPage}</span>
              <button onClick={handleNextPositionsPage} disabled={isLoading || !finatic || !positionsPage.hasNext} className="btn btn-outline btn-sm">Next</button>
            </div>
            <div className="text-xs text-green-700 mt-2">These test the PaginatedResult.nextPage(), .previousPage(), .firstPage() methods</div>
          </div>
        )}

        {positionsPage && (
          <div className="bg-gray-50 rounded-md p-3 mb-4">
            <div className="text-sm text-gray-600">Page {positionsPage.currentPage} • {positionsPage.hasNext ? ' Has Next' : ' Last Page'} • {positionsPage.hasPrevious ? ' Has Previous' : ' First Page'} • {positionsPage.data ? positionsPage.data.length : 0} items</div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Side</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {positions.map((position) => (
                <tr key={position.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{position.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{position.symbol || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{position.asset_type || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{position.side || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{position.quantity || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{position.average_price != null ? `$${position.average_price.toFixed(2)}` : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{position.market_value != null ? `$${position.market_value.toFixed(2)}` : 'N/A'}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${position.unrealized_gain_loss != null && position.unrealized_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>{position.unrealized_gain_loss != null ? `$${position.unrealized_gain_loss.toFixed(2)}` : 'N/A'}</td>
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


