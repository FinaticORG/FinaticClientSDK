'use client';

import React, { useState } from 'react';
import { BrokerInfo, BrokerConnection, DisconnectCompanyResponse } from '@finatic/client';
import { useFinatic } from '@/app/(home)/providers/FinaticProvider';

export default function BrokerManagementPage() {
  const { finatic, isLoading, addLog } = useFinatic();
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [brokerList, setBrokerList] = useState<BrokerInfo[]>([]);
  const [brokerConnections, setBrokerConnections] = useState<BrokerConnection[]>([]);
  const [disconnectResult, setDisconnectResult] = useState<DisconnectCompanyResponse | null>(null);
  
  // Form state
  const [connectionIdToDisconnect, setConnectionIdToDisconnect] = useState('');

  // Get broker list
  const handleGetBrokerList = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching broker list...');
    try {
      const brokers = await finatic.getBrokerList();
      setBrokerList(brokers);
      addLog('success', `Fetched ${brokers.length} brokers`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch broker list';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Get broker connections
  const handleGetBrokerConnections = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching broker connections...');
    try {
      const connections = await finatic.getBrokerConnections();
      setBrokerConnections(connections);
      addLog('success', `Fetched ${connections.length} broker connections`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch broker connections';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Disconnect company
  const handleDisconnectCompany = async () => {
    if (!finatic || !connectionIdToDisconnect.trim()) return;
    addLog('info', `Disconnecting company: ${connectionIdToDisconnect}`);
    try {
      const result = await finatic.disconnectCompany(connectionIdToDisconnect.trim());
      setDisconnectResult(result);
      addLog('success', `Company disconnected: ${result.response_data?.action || 'Unknown action'}`);
      setConnectionIdToDisconnect('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to disconnect company';
      setError(msg);
      addLog('error', msg);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Broker Management</h1>
          <p className="text-gray-600 mt-1">Test broker information and connection management methods</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {brokerList.length} brokers, {brokerConnections.length} connections
          </div>
        </div>
      </div>

      {/* Broker List Section */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Broker List</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {brokerList.length} brokers
          </span>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={handleGetBrokerList} 
            disabled={isLoading || !finatic} 
            className="btn btn-primary"
          >
            🏢 Get Broker List
          </button>
          
          {brokerList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brokerList.map((broker) => (
                <div key={broker.id} className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
                  <div className="flex items-center space-x-3 mb-2">
                    {broker.logo_url && (
                      <img src={broker.logo_url} alt={broker.name} className="w-8 h-8 rounded" />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">{broker.name}</h4>
                      <p className="text-sm text-gray-600">{broker.display_name}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{broker.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {broker.features.map((feature, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    ID: {broker.id} • Auth: {broker.auth_type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Broker Connections Section */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Broker Connections</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {brokerConnections.length} connections
          </span>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={handleGetBrokerConnections} 
            disabled={isLoading || !finatic} 
            className="btn btn-primary"
          >
            🔗 Get Broker Connections
          </button>
          
          {brokerConnections.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/50">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Broker</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connected</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Synced</th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-gray-200/30">
                  {brokerConnections.map((connection) => (
                    <tr key={connection.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{connection.broker_name}</div>
                        <div className="text-sm text-gray-500">ID: {connection.broker_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          connection.status === 'active' ? 'bg-green-100 text-green-800' :
                          connection.status === 'inactive' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {connection.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(connection.permissions).map(([key, value]) => (
                            <span key={key} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {key}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(connection.connected_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {connection.last_synced ? new Date(connection.last_synced).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Disconnect Company Section */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Disconnect Company</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input 
              type="text" 
              placeholder="Enter connection ID to disconnect" 
              value={connectionIdToDisconnect} 
              onChange={(e) => setConnectionIdToDisconnect(e.target.value)} 
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200" 
            />
            <button 
              onClick={handleDisconnectCompany} 
              disabled={isLoading || !finatic || !connectionIdToDisconnect.trim()} 
              className="btn btn-danger"
            >
              🚫 Disconnect
            </button>
          </div>
          
          {disconnectResult && (
            <div className="bg-green-50/50 border border-green-200/50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-green-700 font-medium">Disconnect Successful</span>
              </div>
              <div className="mt-2 text-sm text-green-700">
                Action: {disconnectResult.response_data?.action || 'Unknown'}
              </div>
            </div>
          )}
          
          <div className="bg-red-50/50 border border-red-200/50 rounded-lg p-3">
            <p className="text-xs text-red-700">
              <span className="font-medium">Warning:</span> This will disconnect the company from the broker connection. 
              Use a valid connection ID from the connections list above.
            </p>
          </div>
        </div>
      </div>

      {/* Method Reference */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Available Methods</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="p-3 bg-gray-50/50 rounded-lg">
              <div className="font-mono text-sm font-medium text-gray-900">getBrokerList()</div>
              <div className="text-xs text-gray-600 mt-1">Get list of supported brokers</div>
              <div className="text-xs text-gray-500 mt-1">Returns: Promise&lt;BrokerInfo[]&gt;</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50/50 rounded-lg">
              <div className="font-mono text-sm font-medium text-gray-900">getBrokerConnections()</div>
              <div className="text-xs text-gray-600 mt-1">Get user's broker connections</div>
              <div className="text-xs text-gray-500 mt-1">Returns: Promise&lt;BrokerConnection[]&gt;</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50/50 rounded-lg">
              <div className="font-mono text-sm font-medium text-gray-900">disconnectCompany(id)</div>
              <div className="text-xs text-gray-600 mt-1">Disconnect broker connection</div>
              <div className="text-xs text-gray-500 mt-1">Returns: Promise&lt;DisconnectCompanyResponse&gt;</div>
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
