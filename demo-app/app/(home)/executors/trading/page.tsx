'use client';

import React, { useMemo, useState } from 'react';
import { BrokerConnection, BrokerDataAccount } from '@finatic/client';
import { useFinatic } from '@/app/(home)/providers/FinaticProvider';

type Side = 'buy' | 'sell';
type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
type Tif = 'day' | 'gtc' | 'gtd' | 'ioc' | 'fok';
type AssetType = 'Equity' | 'Equity Option' | 'Crypto' | 'Futures' | 'Futures Option';

export default function TradingPage() {
  const { finatic, isLoading, addLog } = useFinatic();

  const [brokerConnections, setBrokerConnections] = useState<BrokerConnection[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<BrokerDataAccount[]>([]);
  const [selectedBrokerId, setSelectedBrokerId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');

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

  const [placedOrder, setPlacedOrder] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedAccount = useMemo(() => availableAccounts.find((a) => a.id === selectedAccountId), [availableAccounts, selectedAccountId]);

  const handleGetBrokerConnections = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching broker connections...');
    try {
      const connections = await finatic.getBrokerConnections();
      setBrokerConnections(connections);
      setSelectedBrokerId('');
      setSelectedAccountId('');
      addLog('success', `Fetched ${connections.length} broker connections.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch broker connections';
      setError(msg);
      addLog('error', msg);
    }
  };

  const handleGetAvailableAccounts = async () => {
    if (!finatic || !selectedBrokerId) return;
    addLog('info', `Fetching available accounts for broker ${selectedBrokerId}...`);
    try {
      const accounts = await finatic.getAllAccounts({ broker_id: selectedBrokerId });
      setAvailableAccounts(accounts);
      addLog('success', `Fetched ${accounts.length} available accounts.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch available accounts';
      setError(msg);
      addLog('error', msg);
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Trading</h2>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Broker Connections</h3>
          <div className="space-y-2">
            <button onClick={handleGetBrokerConnections} disabled={isLoading || !finatic} className="btn btn-primary btn-sm">Get Broker Connections</button>
            {brokerConnections.length > 0 && (
              <div className="mt-3">
                <label className="text-sm font-medium text-blue-700">Select Broker:</label>
                <select value={selectedBrokerId} onChange={(e) => { setSelectedBrokerId(e.target.value); setSelectedAccountId(''); setAvailableAccounts([]); }} className="border border-blue-300 rounded-md px-3 py-2 text-sm w-full">
                  <option value="">Select a Broker</option>
                  {brokerConnections.map((conn) => (
                    <option key={conn.id} value={conn.broker_id}>{conn.metadata?.nickname || conn.broker_id} (ID: {conn.broker_id})</option>
                  ))}
                </select>
                {selectedBrokerId && (
                  <button onClick={handleGetAvailableAccounts} disabled={isLoading || !finatic || !selectedBrokerId} className="btn btn-primary btn-sm mt-2">Get Available Accounts</button>
                )}
                {availableAccounts.length > 0 && (
                  <div className="mt-3">
                    <label className="text-sm font-medium text-blue-700">Select Account:</label>
                    <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} className="border border-blue-300 rounded-md px-3 py-2 text-sm w-full">
                      <option value="">Select an Account</option>
                      {availableAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>{acc.account_name} (ID: {acc.account_id})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-green-900 mb-2">Trading Context Management</h3>
          <div className="flex items-center space-x-4">
            <button onClick={() => { applyContextIfSelected(); addLog('success', 'Applied broker/account context'); }} disabled={!finatic} className="btn btn-success btn-sm">Apply Context</button>
            <button onClick={() => { finatic?.clearTradingContext(); addLog('info', 'Cleared trading context'); }} disabled={!finatic} className="btn btn-danger btn-sm">Clear Context</button>
          </div>
          {finatic && (
            <div className="mt-3 p-3 bg-white border border-green-300 rounded-md">
              <div className="text-xs font-medium text-green-800 mb-2">Current Trading Context:</div>
              <pre className="text-xs text-green-700 bg-green-50 p-2 rounded border overflow-x-auto">{JSON.stringify(finatic.getTradingContext(), null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <input type="text" placeholder="Symbol" value={orderForm.symbol} onChange={(e) => setOrderForm({ ...orderForm, symbol: e.target.value.toUpperCase() })} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <input type="number" min={1} placeholder="Quantity" value={orderForm.quantity} onChange={(e) => setOrderForm({ ...orderForm, quantity: Number(e.target.value) })} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <select value={orderForm.side} onChange={(e) => setOrderForm({ ...orderForm, side: e.target.value as Side })} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
          <select value={orderForm.orderType} onChange={(e) => setOrderForm({ ...orderForm, orderType: e.target.value as OrderType })} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="market">Market</option>
            <option value="limit">Limit</option>
            <option value="stop">Stop</option>
            <option value="stop_limit">Stop Limit</option>
          </select>
          {orderForm.orderType !== 'market' && (
            <input type="number" step="0.01" placeholder="Price" value={orderForm.price} onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          )}
          {(orderForm.orderType === 'stop' || orderForm.orderType === 'stop_limit') && (
            <input type="number" step="0.01" placeholder="Stop Price" value={orderForm.stopPrice} onChange={(e) => setOrderForm({ ...orderForm, stopPrice: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          )}
          <select value={orderForm.timeInForce} onChange={(e) => setOrderForm({ ...orderForm, timeInForce: e.target.value as Tif })} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="day">Day</option>
            <option value="gtc">GTC</option>
            <option value="gtd">GTD</option>
            <option value="ioc">IOC</option>
            <option value="fok">FOK</option>
          </select>
          <select value={orderForm.assetType} onChange={(e) => setOrderForm({ ...orderForm, assetType: e.target.value as AssetType })} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="Equity">Equity</option>
            <option value="Equity Option">Equity Option</option>
            <option value="Crypto">Crypto</option>
            <option value="Futures">Futures</option>
            <option value="Futures Option">Futures Option</option>
          </select>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <button onClick={handlePlaceOrder} disabled={isLoading || !finatic || !orderForm.symbol} className="btn btn-primary">Place Order</button>
        </div>

        {placedOrder && (
          <div className="bg-gray-50 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Order Response</h3>
            <pre className="text-xs text-gray-700 overflow-x-auto">{JSON.stringify(placedOrder, null, 2)}</pre>
          </div>
        )}

        {error && <div className="text-sm text-red-600 mt-4">{error}</div>}
      </div>
    </div>
  );
}


