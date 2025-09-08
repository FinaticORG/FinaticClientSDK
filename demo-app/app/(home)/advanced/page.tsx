'use client';

import React, { useState } from 'react';
import { useFinatic } from '@/app/(home)/providers/FinaticProvider';

export default function AdvancedPage() {
  const { finatic, isLoading, addLog } = useFinatic();
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string>('');

  const handleTestAdvanced = async () => {
    if (!finatic) return;
    addLog('info', 'Running advanced tests...');
    try {
      const results = {
        openPositions: await finatic.getOpenPositions(),
        filledOrders: await finatic.getFilledOrders(),
        pendingOrders: await finatic.getPendingOrders(),
        activeAccounts: await finatic.getActiveAccounts(),
        brokerList: await finatic.getBrokerList(),
        connections: await finatic.getBrokerConnections(),
      };
      setRawResponse(JSON.stringify(results, null, 2));
      addLog('success', 'Advanced tests completed successfully.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to run advanced tests';
      setError(msg);
      addLog('error', msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Advanced Testing</h2>
        <div className="space-y-4">
          <button onClick={handleTestAdvanced} disabled={isLoading || !finatic} className="btn btn-primary">Run Advanced Tests</button>
          {rawResponse && (
            <div className="mt-4">
              <h3 className="text-md font-medium text-gray-900 mb-2">Raw Response:</h3>
              <pre className="bg-gray-50 rounded-md p-4 overflow-auto text-sm">{rawResponse}</pre>
            </div>
          )}
          {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
}


