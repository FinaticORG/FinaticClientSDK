'use client';

import React, { useState } from 'react';
import { BrokerConnection, BrokerDataAccount, OrderResponse } from '@finatic/client';
import { useFinatic } from '@/app/(home)/providers/FinaticProvider';

type Side = 'buy' | 'sell';
type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
type Tif = 'day' | 'gtc' | 'gtd' | 'ioc' | 'fok';
type AssetType = 'Equity' | 'Equity Option' | 'Crypto' | 'Futures' | 'Futures Option';

export default function TradingPage() {
  const { finatic, isLoading, addLog } = useFinatic();
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [brokerConnections, setBrokerConnections] = useState<BrokerConnection[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<BrokerDataAccount[]>([]);
  const [selectedBrokerId, setSelectedBrokerId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  
  // Order form state
  const [orderForm, setOrderForm] = useState({
    symbol: '',
    quantity: 1,
    side: 'buy' as Side,
    orderType: 'market' as OrderType,
    price: '',
    stopPrice: '',
    timeInForce: 'day' as Tif,
    assetType: 'Equity' as AssetType,
  });
  
  // Order management state
  const [placedOrder, setPlacedOrder] = useState<OrderResponse | null>(null);
  const [orderToCancel, setOrderToCancel] = useState('');
  const [orderToModify, setOrderToModify] = useState('');
  const [modifyPrice, setModifyPrice] = useState('');
  const [modifyQuantity, setModifyQuantity] = useState('');
  const [cancelResult, setCancelResult] = useState<OrderResponse | null>(null);
  const [modifyResult, setModifyResult] = useState<OrderResponse | null>(null);

  // Get broker connections
  const handleGetBrokerConnections = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching broker connections...');
    try {
      const connections = await finatic.getBrokerConnections();
      setBrokerConnections(connections);
      setSelectedBrokerId('');
      setSelectedAccountId('');
      addLog('success', `Fetched ${connections.length} broker connections`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch broker connections';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Get available accounts
  const handleGetAvailableAccounts = async () => {
    if (!finatic || !selectedBrokerId) return;
    addLog('info', `Fetching available accounts for broker ${selectedBrokerId}...`);
    try {
      const accounts = await finatic.getAllAccounts({ broker_id: selectedBrokerId });
      setAvailableAccounts(accounts);
      addLog('success', `Fetched ${accounts.length} available accounts`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch available accounts';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Apply trading context
  const applyContextIfSelected = () => {
    if (!finatic) return;
    if (selectedBrokerId) {
      let broker: 'robinhood' | 'tasty_trade' | 'ninja_trader';
      if (selectedBrokerId === 'robinhood') broker = 'robinhood';
      else if (selectedBrokerId === 'tasty_trade') broker = 'tasty_trade';
      else if (selectedBrokerId === 'ninja_trader') broker = 'ninja_trader';
      else return;
      finatic.setBroker(broker);
    }
    if (selectedAccount) {
      finatic.setAccount(selectedAccount.account_id, selectedAccount.id);
    }
  };

  const selectedAccount = availableAccounts.find((a) => a.id === selectedAccountId);

  // Place order
  const handlePlaceOrder = async () => {
    if (!finatic) return;
    addLog('info', `Placing order ${orderForm.side.toUpperCase()} ${orderForm.quantity} ${orderForm.symbol}`);
    try {
      setError(null);
      applyContextIfSelected();
      const orderRequest: any = {
        symbol: orderForm.symbol,
        quantity: Number(orderForm.quantity),
        side: orderForm.side,
        orderType: orderForm.orderType,
        timeInForce: orderForm.timeInForce,
        assetType: orderForm.assetType,
      };
      if (orderForm.price) orderRequest.price = Number(orderForm.price);
      if (orderForm.stopPrice) orderRequest.stopPrice = Number(orderForm.stopPrice);
      
      const response = await finatic.placeOrder(orderRequest);
      setPlacedOrder(response);
      addLog('success', `Order placed. ID: ${response.response_data?.orderId}`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to place order';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (!finatic || !orderToCancel.trim()) return;
    addLog('info', `Cancelling order: ${orderToCancel}`);
    try {
      const response = await finatic.cancelOrder(orderToCancel.trim());
      setCancelResult(response);
      addLog('success', `Order cancelled: ${orderToCancel}`);
      setOrderToCancel('');
    } catch (err: any) {
      const msg = err?.message || 'Failed to cancel order';
      setError(msg);
      addLog('error', msg);
    }
  };

  // Modify order
  const handleModifyOrder = async () => {
    if (!finatic || !orderToModify.trim()) return;
    addLog('info', `Modifying order: ${orderToModify}`);
    try {
      const modifications: any = {};
      if (modifyPrice) modifications.price = Number(modifyPrice);
      if (modifyQuantity) modifications.quantity = Number(modifyQuantity);
      
      const response = await finatic.modifyOrder(orderToModify.trim(), modifications);
      setModifyResult(response);
      addLog('success', `Order modified: ${orderToModify}`);
      setOrderToModify('');
      setModifyPrice('');
      setModifyQuantity('');
    } catch (err: any) {
      const msg = err?.message || 'Failed to modify order';
      setError(msg);
      addLog('error', msg);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trading Operations</h1>
          <p className="text-gray-600 mt-1">Test order placement, cancellation, and modification methods</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {brokerConnections.length} connections, {availableAccounts.length} accounts
          </div>
        </div>
      </div>

      {/* Broker & Account Selection */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Broker & Account Selection</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleGetBrokerConnections} 
              disabled={isLoading || !finatic} 
              className="btn btn-primary"
            >
              🔗 Get Broker Connections
            </button>
            <div className="text-sm text-gray-600">
              Tests: <code className="bg-gray-100 px-2 py-1 rounded">getBrokerConnections()</code>
            </div>
          </div>
          
          {brokerConnections.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Broker:</label>
                <select 
                  value={selectedBrokerId} 
                  onChange={(e) => { 
                    setSelectedBrokerId(e.target.value); 
                    setSelectedAccountId(''); 
                    setAvailableAccounts([]); 
                  }} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a Broker</option>
                  {brokerConnections.map((conn) => (
                    <option key={conn.id} value={conn.broker_id}>
                      {conn.metadata?.nickname || conn.broker_id} (ID: {conn.broker_id})
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedBrokerId && (
                <div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleGetAvailableAccounts} 
                      disabled={isLoading || !finatic || !selectedBrokerId} 
                      className="btn btn-primary btn-sm"
                    >
                      📊 Get Accounts
                    </button>
                    <div className="text-sm text-gray-600">
                      Tests: <code className="bg-gray-100 px-2 py-1 rounded">getAllAccounts()</code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {availableAccounts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Account:</label>
              <select 
                value={selectedAccountId} 
                onChange={(e) => setSelectedAccountId(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an Account</option>
                {availableAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_name} (ID: {acc.account_id})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Order Placement */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Place Order</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input 
              type="text" 
              placeholder="Symbol" 
              value={orderForm.symbol} 
              onChange={(e) => setOrderForm({ ...orderForm, symbol: e.target.value.toUpperCase() })} 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
            <input 
              type="number" 
              min={1} 
              placeholder="Quantity" 
              value={orderForm.quantity} 
              onChange={(e) => setOrderForm({ ...orderForm, quantity: Number(e.target.value) })} 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
            <select 
              value={orderForm.side} 
              onChange={(e) => setOrderForm({ ...orderForm, side: e.target.value as Side })} 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <select 
              value={orderForm.orderType} 
              onChange={(e) => setOrderForm({ ...orderForm, orderType: e.target.value as OrderType })} 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="market">Market</option>
              <option value="limit">Limit</option>
              <option value="stop">Stop</option>
              <option value="stop_limit">Stop Limit</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {orderForm.orderType !== 'market' && (
              <input 
                type="number" 
                step="0.01" 
                placeholder="Price" 
                value={orderForm.price} 
                onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })} 
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            )}
            {(orderForm.orderType === 'stop' || orderForm.orderType === 'stop_limit') && (
              <input 
                type="number" 
                step="0.01" 
                placeholder="Stop Price" 
                value={orderForm.stopPrice} 
                onChange={(e) => setOrderForm({ ...orderForm, stopPrice: e.target.value })} 
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            )}
            <select 
              value={orderForm.timeInForce} 
              onChange={(e) => setOrderForm({ ...orderForm, timeInForce: e.target.value as Tif })} 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="day">Day</option>
              <option value="gtc">GTC</option>
              <option value="gtd">GTD</option>
              <option value="ioc">IOC</option>
              <option value="fok">FOK</option>
            </select>
            <select 
              value={orderForm.assetType} 
              onChange={(e) => setOrderForm({ ...orderForm, assetType: e.target.value as AssetType })} 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Equity">Equity</option>
              <option value="Equity Option">Equity Option</option>
              <option value="Crypto">Crypto</option>
              <option value="Futures">Futures</option>
              <option value="Futures Option">Futures Option</option>
            </select>
          </div>
          
          <button 
            onClick={handlePlaceOrder} 
            disabled={isLoading || !finatic || !orderForm.symbol} 
            className="btn btn-primary"
          >
            📈 Place Order
          </button>
          
          <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <span className="font-medium">Method:</span> <code>placeOrder(order)</code> • 
              <span className="font-medium">Context:</span> Auto-applies selected broker/account context
            </p>
          </div>
        </div>
      </div>

      {/* Order Management */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Order Management</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cancel Order */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Cancel Order</h4>
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                placeholder="Order ID to cancel" 
                value={orderToCancel} 
                onChange={(e) => setOrderToCancel(e.target.value)} 
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              />
              <button 
                onClick={handleCancelOrder} 
                disabled={isLoading || !finatic || !orderToCancel.trim()} 
                className="btn btn-danger"
              >
                🚫 Cancel
              </button>
            </div>
            {cancelResult && (
              <div className="bg-green-50/50 border border-green-200/50 rounded-lg p-3">
                <div className="text-sm text-green-700">Order cancelled successfully</div>
              </div>
            )}
          </div>
          
          {/* Modify Order */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Modify Order</h4>
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Order ID to modify" 
                value={orderToModify} 
                onChange={(e) => setOrderToModify(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="New Price" 
                  value={modifyPrice} 
                  onChange={(e) => setModifyPrice(e.target.value)} 
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
                <input 
                  type="number" 
                  placeholder="New Qty" 
                  value={modifyQuantity} 
                  onChange={(e) => setModifyQuantity(e.target.value)} 
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
                <button 
                  onClick={handleModifyOrder} 
                  disabled={isLoading || !finatic || !orderToModify.trim()} 
                  className="btn btn-primary"
                >
                  ✏️ Modify
                </button>
              </div>
            </div>
            {modifyResult && (
              <div className="bg-green-50/50 border border-green-200/50 rounded-lg p-3">
                <div className="text-sm text-green-700">Order modified successfully</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Results */}
      {placedOrder && (
        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
            <h3 className="text-lg font-semibold text-gray-900">Order Response</h3>
          </div>
          
          <div className="bg-gray-50/50 rounded-lg p-4">
            <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(placedOrder, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Method Reference */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg"></div>
          <h3 className="text-lg font-semibold text-gray-900">Available Methods</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="p-3 bg-gray-50/50 rounded-lg">
              <div className="font-mono text-sm font-medium text-gray-900">placeOrder(order)</div>
              <div className="text-xs text-gray-600 mt-1">Place a new order</div>
              <div className="text-xs text-gray-500 mt-1">Returns: Promise&lt;OrderResponse&gt;</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50/50 rounded-lg">
              <div className="font-mono text-sm font-medium text-gray-900">cancelOrder(id, broker?)</div>
              <div className="text-xs text-gray-600 mt-1">Cancel an existing order</div>
              <div className="text-xs text-gray-500 mt-1">Returns: Promise&lt;OrderResponse&gt;</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50/50 rounded-lg">
              <div className="font-mono text-sm font-medium text-gray-900">modifyOrder(id, mods, broker?)</div>
              <div className="text-xs text-gray-600 mt-1">Modify an existing order</div>
              <div className="text-xs text-gray-500 mt-1">Returns: Promise&lt;OrderResponse&gt;</div>
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
