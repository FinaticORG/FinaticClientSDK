'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFinatic } from '@/app/providers/FinaticProvider';

export function TradingPageComponent() {
  const { finatic, sdkAdapter, addLog, isMockMode } = useFinatic();

  // Broker and account selection
  const [selectedBroker, setSelectedBroker] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [brokers, setBrokers] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [activeAccounts, setActiveAccounts] = useState<any[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);

  // Order form state
  const [customOrder, setCustomOrder] = useState<{
    symbol: string;
    orderQty: number;
    action: 'buy' | 'sell';
    orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
    assetType: 'equity' | 'equity_option' | 'crypto' | 'forex' | 'future' | 'future_option';
    timeInForce: 'day' | 'gtc' | 'gtd' | 'ioc' | 'fok';
    price?: number;
    stopPrice?: number;
    expireTime?: string;
  }>({
    symbol: '',
    orderQty: 1,
    action: 'buy',
    orderType: 'market',
    assetType: 'equity',
    timeInForce: 'day',
  });

  // Broker-specific extras (JSON)
  const [customExtrasText, setCustomExtrasText] = useState<string>('{}');
  const [placingCustom, setPlacingCustom] = useState<boolean>(false);
  const [customResponse, setCustomResponse] = useState<any>(null);
  const [isOrdersPlaygroundOpen, setIsOrdersPlaygroundOpen] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState<'place' | 'cancel' | 'modify'>('place');

  // Cancel order state
  const [cancelOrderId, setCancelOrderId] = useState<string>('');
  const [cancellingOrder, setCancellingOrder] = useState<boolean>(false);
  const [cancelResponse, setCancelResponse] = useState<any>(null);

  // Modify order state
  const [modifyOrderId, setModifyOrderId] = useState<string>('');
  const [modifyOrder, setModifyOrder] = useState<{
    symbol: string;
    orderQty: number;
    action: 'buy' | 'sell';
    orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
    assetType: 'equity' | 'equity_option' | 'crypto' | 'forex' | 'future' | 'future_option';
    timeInForce: 'day' | 'gtc' | 'gtd' | 'ioc' | 'fok';
    price?: number;
    stopPrice?: number;
    expireTime?: string;
  }>({
    symbol: '',
    orderQty: 1,
    action: 'buy',
    orderType: 'market',
    assetType: 'equity',
    timeInForce: 'day',
  });
  const [modifyExtrasText, setModifyExtrasText] = useState<string>('{}');
  const [modifyingOrder, setModifyingOrder] = useState<boolean>(false);
  const [modifyResponse, setModifyResponse] = useState<any>(null);

  // Load supported brokers
  useEffect(() => {
    let cancelled = false;
    async function loadBrokers() {
      try {
        if (!sdkAdapter) return;
        const list = await sdkAdapter.getBrokerList();
        if (!cancelled) setBrokers(list);
      } catch (err) {
        console.error('Failed to load brokers:', err);
      }
    }
    void loadBrokers();
    return () => {
      cancelled = true;
    };
  }, [sdkAdapter]);

  // Load active broker connections
  useEffect(() => {
    if (!sdkAdapter) return;
    let cancelled = false;
    async function loadConnections() {
      try {
        if (!sdkAdapter) return;
        const list = await sdkAdapter.getBrokerConnections();
        if (!cancelled) {
          setConnections(list);
        }
      } catch (err) {
        console.error('Failed to load connections:', err);
      }
    }
    void loadConnections();
    return () => {
      cancelled = true;
    };
  }, [sdkAdapter]);

  // Load active accounts
  useEffect(() => {
    if (!sdkAdapter) return;
    let cancelled = false;
    async function loadActiveAccounts() {
      try {
        if (!sdkAdapter) return;
        const all = await sdkAdapter.getActiveAccounts();
        if (!cancelled) {
          setActiveAccounts(all || []);
        }
      } catch (err) {
        console.error('Failed to load active accounts:', err);
      }
    }
    void loadActiveAccounts();
    return () => {
      cancelled = true;
    };
  }, [sdkAdapter]);

  // Filter available accounts based on mode and selected broker
  const filteredAccounts = useMemo(() => {
    if (!selectedBroker) return [];

    const normalizedSelectedBroker = String(selectedBroker).toLowerCase().trim();

    // Create a map of connection_id -> broker_id from connections
    // Also create a set of connected connection IDs for the selected broker
    const connectionToBrokerMap = new Map<string, string>();
    const connectedConnectionIds = new Set<string>();

    connections.forEach((c: any) => {
      const connectionId = c?.id || c?.connection_id || '';
      const brokerId = String(c?.broker_id || c?.broker || '').toLowerCase().trim();
      const isConnected = c?.status === 'connected' || c?.status === 'active' || Boolean(c?.is_active || c?.active);

      if (connectionId) {
        connectionToBrokerMap.set(connectionId, brokerId);
        if (isConnected && brokerId === normalizedSelectedBroker) {
          connectedConnectionIds.add(connectionId);
        }
      }
    });

    // Filter accounts based on their user_broker_connection_id
    return activeAccounts.filter((a: any) => {
      const accountConnectionId = a?.user_broker_connection_id || a?.connection_id || '';
      
      // In sandbox mode, show all accounts for the selected broker
      if (isMockMode) {
        // Match account to broker via connection
        const accountBrokerId = connectionToBrokerMap.get(accountConnectionId);
        return accountBrokerId === normalizedSelectedBroker;
      }

      // In live mode, only show accounts from connected brokers
      // Check if this account's connection is in the connected set for the selected broker
      return connectedConnectionIds.has(accountConnectionId);
    });
  }, [selectedBroker, activeAccounts, connections, isMockMode]);

  // Update available accounts when filtered accounts change
  useEffect(() => {
    setAvailableAccounts(filteredAccounts);
    // Always auto-select first account when accounts change
    if (filteredAccounts.length > 0) {
      const firstAccount = filteredAccounts[0];
      const accountId =
        firstAccount.broker_provided_account_id ||
        firstAccount.account_id ||
        '';
      setSelectedAccountId(String(accountId));
    } else {
      // Clear selection if no accounts available
      setSelectedAccountId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredAccounts]); // Only depend on filteredAccounts, not selectedAccountId

  // Get selected account details
  const selectedAccount = useMemo(() => {
    return availableAccounts.find(
      (a: any) =>
        String(a.broker_provided_account_id || a.account_id) === selectedAccountId
    );
  }, [availableAccounts, selectedAccountId]);

  // Check if broker is connected
  const isBrokerConnected = useMemo(() => {
    if (!selectedBroker) return false;
    return connections.some((c: any) => {
      // Normalize broker IDs for comparison (handle case sensitivity and format differences)
      const connectionBrokerId = String(c?.broker_id || c?.broker || '').toLowerCase().trim();
      const selectedBrokerId = String(selectedBroker).toLowerCase().trim();
      
      // Check if status is 'connected' (the actual field name from BrokerConnection type)
      const isConnected = c?.status === 'connected' || c?.status === 'active' || Boolean(c?.is_active || c?.active);
      
      return connectionBrokerId === selectedBrokerId && isConnected;
    });
  }, [selectedBroker, connections]);

  // Build the payload that will be sent (for preview)
  const orderPayloadPreview = useMemo(() => {
    if (!selectedBroker || !selectedAccountId) return null;

    const accountNumber =
      selectedAccount?.broker_provided_account_id ||
      selectedAccount?.account_id ||
      selectedAccountId;

    let extras: any = {};
    try {
      extras = customExtrasText ? JSON.parse(customExtrasText) : {};
    } catch {
      // Invalid JSON, return null to indicate error
      return null;
    }

    const payload: any = {
      broker: selectedBroker,
      order: {
        orderType: customOrder.orderType,
        assetType: customOrder.assetType,
        action: customOrder.action,
        timeInForce: customOrder.timeInForce,
        accountNumber: accountNumber,
        symbol: customOrder.symbol,
        orderQty: customOrder.orderQty,
      },
    };

    // Add optional fields
    if (customOrder.price !== undefined) {
      payload.order.price = customOrder.price;
    }
    if (customOrder.stopPrice !== undefined) {
      payload.order.stopPrice = customOrder.stopPrice;
    }
    if (customOrder.expireTime) {
      payload.order.expireTime = customOrder.expireTime;
    }

    // Merge broker-specific extras into order object
    if (extras && Object.keys(extras).length > 0) {
      payload.order = { ...payload.order, ...extras };
    }

    return payload;
  }, [
    selectedBroker,
    selectedAccountId,
    selectedAccount,
    customOrder,
    customExtrasText,
  ]);

  // Place custom order
  const placeCustomOrder = async () => {
    if (!sdkAdapter && !finatic) {
      addLog('error', 'SDK not initialized');
      return;
    }
    if (!selectedBroker) {
      addLog('error', 'Select a broker first');
      return;
    }
    if (!selectedAccountId) {
      addLog('error', 'Select an account first');
      return;
    }

    // In live mode, verify broker is connected
    if (!isMockMode && !isBrokerConnected) {
      addLog('error', 'Broker must be connected to place orders in live mode');
      return;
    }

    let extras: any = {};
    try {
      extras = customExtrasText ? JSON.parse(customExtrasText) : {};
    } catch {
      addLog('error', 'Invalid JSON in extras');
      return;
    }

    setPlacingCustom(true);
    setCustomResponse(null);

    try {
      // Build order payload matching order_place_query_params_request.py structure
      const accountNumber =
        selectedAccount?.broker_provided_account_id ||
        selectedAccount?.account_id ||
        selectedAccountId;

      const orderPayload: any = {
        broker: selectedBroker,
        order: {
          orderType: customOrder.orderType,
          assetType: customOrder.assetType,
          action: customOrder.action,
          timeInForce: customOrder.timeInForce,
          accountNumber: accountNumber,
          symbol: customOrder.symbol,
          orderQty: customOrder.orderQty,
        },
      };

      // Add optional fields
      if (customOrder.price !== undefined) {
        orderPayload.order.price = customOrder.price;
      }
      if (customOrder.stopPrice !== undefined) {
        orderPayload.order.stopPrice = customOrder.stopPrice;
      }
      if (customOrder.expireTime) {
        orderPayload.order.expireTime = customOrder.expireTime;
      }

      // Merge broker-specific extras into order object
      if (extras && Object.keys(extras).length > 0) {
        orderPayload.order = { ...orderPayload.order, ...extras };
      }

      // Use SDK adapter's placeOrder method
      // The payload is already in the correct format: { broker: '...', order: {...} }
      let response;
      if (sdkAdapter?.placeOrder) {
        // SDK adapter expects the discriminated union format
        response = await sdkAdapter.placeOrder(orderPayload);
      } else if (finatic) {
        // FinaticConnect.placeOrder expects BrokerOrderParams (discriminated union)
        // which is { broker: '...', order: {...} }
        const orderParams: any = {
          broker: orderPayload.broker as 'robinhood' | 'tasty_trade' | 'ninja_trader',
          order: orderPayload.order,
        };
        response = await finatic.placeOrder(orderParams);
      } else {
        throw new Error('SDK not available');
      }

      setCustomResponse(response);
      addLog('success', `Order placed successfully - ${response?.message || 'ok'}`);
    } catch (e: any) {
      const errorMsg = e?.message || 'Order failed';
      setCustomResponse({ error: errorMsg });
      addLog('error', errorMsg);
    } finally {
      setPlacingCustom(false);
    }
  };

  // Cancel order
  const cancelOrder = async () => {
    if (!sdkAdapter && !finatic) {
      addLog('error', 'SDK not initialized');
      return;
    }
    if (!selectedBroker) {
      addLog('error', 'Select a broker first');
      return;
    }
    if (!selectedAccountId) {
      addLog('error', 'Select an account first');
      return;
    }
    if (!cancelOrderId) {
      addLog('error', 'Enter an order ID to cancel');
      return;
    }

    // In live mode, verify broker is connected
    if (!isMockMode && !isBrokerConnected) {
      addLog('error', 'Broker must be connected to cancel orders in live mode');
      return;
    }

    setCancellingOrder(true);
    setCancelResponse(null);

    try {
      const accountNumber =
        selectedAccount?.broker_provided_account_id ||
        selectedAccount?.account_id ||
        selectedAccountId;

      const cancelPayload: any = {
        broker: selectedBroker,
        orderId: cancelOrderId,
        accountNumber: accountNumber,
      };

      let response;
      if (sdkAdapter?.cancelOrder) {
        response = await sdkAdapter.cancelOrder(cancelPayload);
      } else {
        throw new Error('Cancel order not available');
      }

      setCancelResponse(response);
      addLog('success', `Order cancelled successfully - ${response?.message || 'ok'}`);
    } catch (e: any) {
      const errorMsg = e?.message || 'Cancel failed';
      setCancelResponse({ error: errorMsg });
      addLog('error', errorMsg);
    } finally {
      setCancellingOrder(false);
    }
  };

  // Build the payload for modify order (for preview)
  const modifyOrderPayloadPreview = useMemo(() => {
    if (!selectedBroker || !selectedAccountId || !modifyOrderId) return null;

    const accountNumber =
      selectedAccount?.broker_provided_account_id ||
      selectedAccount?.account_id ||
      selectedAccountId;

    let extras: any = {};
    try {
      extras = modifyExtrasText ? JSON.parse(modifyExtrasText) : {};
    } catch {
      // Invalid JSON, return null to indicate error
      return null;
    }

    const payload: any = {
      broker: selectedBroker,
      order: {
        orderId: modifyOrderId,
        orderType: modifyOrder.orderType,
        assetType: modifyOrder.assetType,
        action: modifyOrder.action,
        timeInForce: modifyOrder.timeInForce,
        accountNumber: accountNumber,
        symbol: modifyOrder.symbol,
        orderQty: modifyOrder.orderQty,
      },
    };

    // Add optional fields
    if (modifyOrder.price !== undefined) {
      payload.order.price = modifyOrder.price;
    }
    if (modifyOrder.stopPrice !== undefined) {
      payload.order.stopPrice = modifyOrder.stopPrice;
    }
    if (modifyOrder.expireTime) {
      payload.order.expireTime = modifyOrder.expireTime;
    }

    // Merge broker-specific extras into order object
    if (extras && Object.keys(extras).length > 0) {
      payload.order = { ...payload.order, ...extras };
    }

    return payload;
  }, [
    selectedBroker,
    selectedAccountId,
    selectedAccount,
    modifyOrderId,
    modifyOrder,
    modifyExtrasText,
  ]);

  // Modify order
  const modifyExistingOrder = async () => {
    if (!sdkAdapter && !finatic) {
      addLog('error', 'SDK not initialized');
      return;
    }
    if (!selectedBroker) {
      addLog('error', 'Select a broker first');
      return;
    }
    if (!selectedAccountId) {
      addLog('error', 'Select an account first');
      return;
    }
    if (!modifyOrderId) {
      addLog('error', 'Enter an order ID to modify');
      return;
    }

    // In live mode, verify broker is connected
    if (!isMockMode && !isBrokerConnected) {
      addLog('error', 'Broker must be connected to modify orders in live mode');
      return;
    }

    let extras: any = {};
    try {
      extras = modifyExtrasText ? JSON.parse(modifyExtrasText) : {};
    } catch {
      addLog('error', 'Invalid JSON in extras');
      return;
    }

    setModifyingOrder(true);
    setModifyResponse(null);

    try {
      const accountNumber =
        selectedAccount?.broker_provided_account_id ||
        selectedAccount?.account_id ||
        selectedAccountId;

      const modifyPayload: any = {
        broker: selectedBroker,
        order: {
          orderId: modifyOrderId,
          orderType: modifyOrder.orderType,
          assetType: modifyOrder.assetType,
          action: modifyOrder.action,
          timeInForce: modifyOrder.timeInForce,
          accountNumber: accountNumber,
          symbol: modifyOrder.symbol,
          orderQty: modifyOrder.orderQty,
        },
      };

      // Add optional fields
      if (modifyOrder.price !== undefined) {
        modifyPayload.order.price = modifyOrder.price;
      }
      if (modifyOrder.stopPrice !== undefined) {
        modifyPayload.order.stopPrice = modifyOrder.stopPrice;
      }
      if (modifyOrder.expireTime) {
        modifyPayload.order.expireTime = modifyOrder.expireTime;
      }

      // Merge broker-specific extras into order object
      if (extras && Object.keys(extras).length > 0) {
        modifyPayload.order = { ...modifyPayload.order, ...extras };
      }

      let response;
      if (sdkAdapter?.modifyOrder) {
        response = await sdkAdapter.modifyOrder(modifyPayload);
      } else {
        throw new Error('Modify order not available');
      }

      setModifyResponse(response);
      addLog('success', `Order modified successfully - ${response?.message || 'ok'}`);
    } catch (e: any) {
      const errorMsg = e?.message || 'Modify failed';
      setModifyResponse({ error: errorMsg });
      addLog('error', errorMsg);
    } finally {
      setModifyingOrder(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders Playground</h1>
          <p className="text-muted-foreground">
            Compose and place orders to connected broker accounts
          </p>
        </div>
        {!isMockMode && (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            Live Mode
          </Badge>
        )}
        {isMockMode && (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
            Sandbox Mode
          </Badge>
        )}
      </div>

      {/* Orders Playground */}
      <Card className="bg-card border-border">
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
            onClick={() => setIsOrdersPlaygroundOpen(!isOrdersPlaygroundOpen)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="text-left">
                <CardTitle className="text-foreground">Orders Playground</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Compose and place any order. Response shown on the right.
                </CardDescription>
              </div>
              {isOrdersPlaygroundOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </Button>
        </CardHeader>
        {isOrdersPlaygroundOpen && (
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="place">Place Order</TabsTrigger>
                <TabsTrigger value="cancel">Cancel Order</TabsTrigger>
                <TabsTrigger value="modify">Modify Order</TabsTrigger>
              </TabsList>

              {/* Place Order Tab */}
              <TabsContent value="place" className="space-y-6">
                {/* Broker and Account Selection */}
                <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-foreground">Broker</Label>
                <Select value={selectedBroker} onValueChange={setSelectedBroker}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select a broker" />
                  </SelectTrigger>
                  <SelectContent>
                    {brokers.map((b: any) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.display_name || b.name || b.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedBroker && (
                  <div className="flex items-center gap-2">
                    {!isMockMode && isBrokerConnected && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Connected
                      </span>
                    )}
                    {!isMockMode && !isBrokerConnected && (
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">
                        Not connected. Connect it first to place orders in live mode.
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Account</Label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue
                      placeholder={
                        availableAccounts.length
                          ? 'Select an account'
                          : selectedBroker
                            ? 'No accounts available'
                            : 'Select broker first'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAccounts.map((a: any) => {
                      const accountId = String(
                        a.broker_provided_account_id || a.account_id || ''
                      );
                      const accountName =
                        a.account_name ||
                        a.broker_provided_account_id ||
                        a.account_id ||
                        'Unknown Account';
                      return (
                        <SelectItem key={accountId} value={accountId}>
                          {accountName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {selectedAccount && (
                  <p className="text-xs text-muted-foreground">
                    Account ID: {selectedAccount.broker_provided_account_id || selectedAccount.account_id}
                  </p>
                )}
              </div>
            </div>

            {selectedBroker && availableAccounts.length === 0 && !isMockMode && (
              <div className="rounded-md border border-yellow-500/20 bg-yellow-500/10 p-3">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  No accounts available for this broker. Make sure the broker is connected and has active accounts.
                </p>
              </div>
            )}

            {/* Order Form */}
            {selectedBroker && availableAccounts.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-foreground">Symbol</Label>
                      <Input
                        className="bg-input border-border text-foreground w-full"
                        value={customOrder.symbol}
                        onChange={e => setCustomOrder(p => ({ ...p, symbol: e.target.value }))}
                        placeholder="AAPL"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-foreground">Quantity</Label>
                      <Input
                        type="number"
                        className="bg-input border-border text-foreground w-full"
                        value={customOrder.orderQty}
                        onChange={e =>
                          setCustomOrder(p => ({ ...p, orderQty: Number(e.target.value) }))
                        }
                        min="1"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-foreground">Side</Label>
                      <Select
                        value={customOrder.action}
                        onValueChange={v => setCustomOrder(p => ({ ...p, action: v as any }))}
                      >
                        <SelectTrigger className="bg-input border-border text-foreground w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buy">Buy</SelectItem>
                          <SelectItem value="sell">Sell</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-foreground">Order Type</Label>
                      <Select
                        value={customOrder.orderType}
                        onValueChange={v => setCustomOrder(p => ({ ...p, orderType: v as any }))}
                      >
                        <SelectTrigger className="bg-input border-border text-foreground w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="market">Market</SelectItem>
                          <SelectItem value="limit">Limit</SelectItem>
                          <SelectItem value="stop">Stop</SelectItem>
                          <SelectItem value="stop_limit">Stop Limit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-foreground">Asset Type</Label>
                      <Select
                        value={customOrder.assetType}
                        onValueChange={v => setCustomOrder(p => ({ ...p, assetType: v as any }))}
                      >
                        <SelectTrigger className="bg-input border-border text-foreground w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equity">Equity</SelectItem>
                          <SelectItem value="equity_option">Equity Option</SelectItem>
                          <SelectItem value="crypto">Crypto</SelectItem>
                          <SelectItem value="forex">Forex</SelectItem>
                          <SelectItem value="future">Future</SelectItem>
                          <SelectItem value="future_option">Future Option</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-foreground">Time In Force</Label>
                      <Select
                        value={customOrder.timeInForce}
                        onValueChange={v => setCustomOrder(p => ({ ...p, timeInForce: v as any }))}
                      >
                        <SelectTrigger className="bg-input border-border text-foreground w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="gtc">GTC (Good Till Cancel)</SelectItem>
                          <SelectItem value="gtd">GTD (Good Till Date)</SelectItem>
                          <SelectItem value="ioc">IOC (Immediate Or Cancel)</SelectItem>
                          <SelectItem value="fok">FOK (Fill Or Kill)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(customOrder.orderType === 'limit' || customOrder.orderType === 'stop_limit') && (
                      <div className="space-y-1">
                        <Label className="text-foreground">Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          className="bg-input border-border text-foreground w-full"
                          value={customOrder.price ?? ''}
                          onChange={e =>
                            setCustomOrder(p => ({
                              ...p,
                              price: e.target.value ? Number(e.target.value) : undefined,
                            }))
                          }
                          placeholder="0.00"
                        />
                      </div>
                    )}
                    {(customOrder.orderType === 'stop' || customOrder.orderType === 'stop_limit') && (
                      <div className="space-y-1">
                        <Label className="text-foreground">Stop Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          className="bg-input border-border text-foreground w-full"
                          value={customOrder.stopPrice ?? ''}
                          onChange={e =>
                            setCustomOrder(p => ({
                              ...p,
                              stopPrice: e.target.value ? Number(e.target.value) : undefined,
                            }))
                          }
                          placeholder="0.00"
                        />
                      </div>
                    )}
                    {customOrder.timeInForce === 'gtd' && (
                      <div className="space-y-1">
                        <Label className="text-foreground">Expire Time (ISO 8601)</Label>
                        <Input
                          type="datetime-local"
                          className="bg-input border-border text-foreground w-full"
                          value={
                            customOrder.expireTime
                              ? new Date(customOrder.expireTime).toISOString().slice(0, 16)
                              : ''
                          }
                          onChange={e => {
                            if (e.target.value) {
                              const date = new Date(e.target.value);
                              setCustomOrder(p => ({
                                ...p,
                                expireTime: date.toISOString(),
                              }));
                            } else {
                              setCustomOrder(p => ({ ...p, expireTime: undefined }));
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-foreground">Broker-Specific Extras (JSON)</Label>
                    <Textarea
                      className="bg-input border-border text-foreground min-h-24 font-mono text-xs"
                      value={customExtrasText}
                      onChange={e => setCustomExtrasText(e.target.value)}
                      placeholder='{"extendedHours": false, "marketHours": "regular_hours"}'
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional broker-specific fields (e.g., extendedHours for Robinhood, accountSpec for NinjaTrader)
                    </p>
                  </div>
                  
                  {/* Payload Preview */}
                  {orderPayloadPreview && (
                    <details className="rounded-md border border-border/60 bg-muted/10">
                      <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/20">
                        View Payload
                      </summary>
                      <div className="border-t border-border/60 p-3">
                        <pre className="whitespace-pre-wrap break-words text-xs text-foreground font-mono overflow-auto max-h-64">
                          {JSON.stringify(orderPayloadPreview, null, 2)}
                        </pre>
                      </div>
                    </details>
                  )}
                  {orderPayloadPreview === null && customExtrasText && (
                    <div className="rounded-md border border-yellow-500/20 bg-yellow-500/10 p-2">
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        Invalid JSON in extras field. Please fix the JSON syntax.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={placeCustomOrder}
                      disabled={
                        !selectedBroker ||
                        !selectedAccountId ||
                        !customOrder.symbol ||
                        placingCustom ||
                        (!isMockMode && !isBrokerConnected) ||
                        orderPayloadPreview === null
                      }
                      className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
                    >
                      {placingCustom ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Placing...
                        </>
                      ) : (
                        <>Place Order</>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Response</Label>
                  <div className="rounded-md border border-border/60 bg-muted/10 p-3 max-h-96 overflow-auto text-xs text-foreground">
                    {customResponse ? (
                      <pre className="whitespace-pre-wrap break-words font-mono">
                        {JSON.stringify(customResponse, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-muted-foreground">No response yet.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
              </TabsContent>

              {/* Cancel Order Tab */}
              <TabsContent value="cancel" className="space-y-6">
                {/* Broker and Account Selection */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground">Broker</Label>
                    <Select value={selectedBroker} onValueChange={setSelectedBroker}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Select a broker" />
                      </SelectTrigger>
                      <SelectContent>
                        {brokers.map((b: any) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.display_name || b.name || b.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedBroker && (
                      <div className="flex items-center gap-2">
                        {!isMockMode && isBrokerConnected && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Connected
                          </span>
                        )}
                        {!isMockMode && !isBrokerConnected && (
                          <span className="text-xs text-yellow-600 dark:text-yellow-400">
                            Not connected. Connect it first to cancel orders in live mode.
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Account</Label>
                    <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue
                          placeholder={
                            availableAccounts.length
                              ? 'Select an account'
                              : selectedBroker
                                ? 'No accounts available'
                                : 'Select broker first'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAccounts.map((a: any) => {
                          const accountId = String(
                            a.broker_provided_account_id || a.account_id || ''
                          );
                          const accountName =
                            a.account_name ||
                            a.broker_provided_account_id ||
                            a.account_id ||
                            'Unknown Account';
                          return (
                            <SelectItem key={accountId} value={accountId}>
                              {accountName}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {selectedAccount && (
                      <p className="text-xs text-muted-foreground">
                        Account ID: {selectedAccount.broker_provided_account_id || selectedAccount.account_id}
                      </p>
                    )}
                  </div>
                </div>

                {selectedBroker && availableAccounts.length === 0 && !isMockMode && (
                  <div className="rounded-md border border-yellow-500/20 bg-yellow-500/10 p-3">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      No accounts available for this broker. Make sure the broker is connected and has active accounts.
                    </p>
                  </div>
                )}

                {selectedBroker && availableAccounts.length > 0 && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-foreground">Order ID</Label>
                        <Input
                          className="bg-input border-border text-foreground"
                          value={cancelOrderId}
                          onChange={e => setCancelOrderId(e.target.value)}
                          placeholder="Enter order ID to cancel"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the broker-provided order ID that you want to cancel
                        </p>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={cancelOrder}
                          disabled={
                            !selectedBroker ||
                            !selectedAccountId ||
                            !cancelOrderId ||
                            cancellingOrder ||
                            (!isMockMode && !isBrokerConnected)
                          }
                          variant="destructive"
                          className="h-9 px-4"
                        >
                          {cancellingOrder ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>Cancel Order</>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Response</Label>
                      <div className="rounded-md border border-border/60 bg-muted/10 p-3 max-h-96 overflow-auto text-xs text-foreground">
                        {cancelResponse ? (
                          <pre className="whitespace-pre-wrap break-words font-mono">
                            {JSON.stringify(cancelResponse, null, 2)}
                          </pre>
                        ) : (
                          <div className="text-muted-foreground">No response yet.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Modify Order Tab */}
              <TabsContent value="modify" className="space-y-6">
                {/* Broker and Account Selection */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground">Broker</Label>
                    <Select value={selectedBroker} onValueChange={setSelectedBroker}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Select a broker" />
                      </SelectTrigger>
                      <SelectContent>
                        {brokers.map((b: any) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.display_name || b.name || b.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedBroker && (
                      <div className="flex items-center gap-2">
                        {!isMockMode && isBrokerConnected && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Connected
                          </span>
                        )}
                        {!isMockMode && !isBrokerConnected && (
                          <span className="text-xs text-yellow-600 dark:text-yellow-400">
                            Not connected. Connect it first to modify orders in live mode.
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Account</Label>
                    <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue
                          placeholder={
                            availableAccounts.length
                              ? 'Select an account'
                              : selectedBroker
                                ? 'No accounts available'
                                : 'Select broker first'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAccounts.map((a: any) => {
                          const accountId = String(
                            a.broker_provided_account_id || a.account_id || ''
                          );
                          const accountName =
                            a.account_name ||
                            a.broker_provided_account_id ||
                            a.account_id ||
                            'Unknown Account';
                          return (
                            <SelectItem key={accountId} value={accountId}>
                              {accountName}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {selectedAccount && (
                      <p className="text-xs text-muted-foreground">
                        Account ID: {selectedAccount.broker_provided_account_id || selectedAccount.account_id}
                      </p>
                    )}
                  </div>
                </div>

                {selectedBroker && availableAccounts.length === 0 && !isMockMode && (
                  <div className="rounded-md border border-yellow-500/20 bg-yellow-500/10 p-3">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      No accounts available for this broker. Make sure the broker is connected and has active accounts.
                    </p>
                  </div>
                )}

                {selectedBroker && availableAccounts.length > 0 && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-foreground">Order ID</Label>
                        <Input
                          className="bg-input border-border text-foreground"
                          value={modifyOrderId}
                          onChange={e => setModifyOrderId(e.target.value)}
                          placeholder="Enter order ID to modify"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the broker-provided order ID that you want to modify
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-foreground">Symbol</Label>
                          <Input
                            className="bg-input border-border text-foreground w-full"
                            value={modifyOrder.symbol}
                            onChange={e => setModifyOrder(p => ({ ...p, symbol: e.target.value }))}
                            placeholder="AAPL"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Quantity</Label>
                          <Input
                            type="number"
                            className="bg-input border-border text-foreground w-full"
                            value={modifyOrder.orderQty}
                            onChange={e =>
                              setModifyOrder(p => ({ ...p, orderQty: Number(e.target.value) }))
                            }
                            min="1"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Side</Label>
                          <Select
                            value={modifyOrder.action}
                            onValueChange={v => setModifyOrder(p => ({ ...p, action: v as any }))}
                          >
                            <SelectTrigger className="bg-input border-border text-foreground w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="buy">Buy</SelectItem>
                              <SelectItem value="sell">Sell</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Order Type</Label>
                          <Select
                            value={modifyOrder.orderType}
                            onValueChange={v => setModifyOrder(p => ({ ...p, orderType: v as any }))}
                          >
                            <SelectTrigger className="bg-input border-border text-foreground w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="market">Market</SelectItem>
                              <SelectItem value="limit">Limit</SelectItem>
                              <SelectItem value="stop">Stop</SelectItem>
                              <SelectItem value="stop_limit">Stop Limit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Asset Type</Label>
                          <Select
                            value={modifyOrder.assetType}
                            onValueChange={v => setModifyOrder(p => ({ ...p, assetType: v as any }))}
                          >
                            <SelectTrigger className="bg-input border-border text-foreground w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equity">Equity</SelectItem>
                              <SelectItem value="equity_option">Equity Option</SelectItem>
                              <SelectItem value="crypto">Crypto</SelectItem>
                              <SelectItem value="forex">Forex</SelectItem>
                              <SelectItem value="future">Future</SelectItem>
                              <SelectItem value="future_option">Future Option</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground">Time In Force</Label>
                          <Select
                            value={modifyOrder.timeInForce}
                            onValueChange={v => setModifyOrder(p => ({ ...p, timeInForce: v as any }))}
                          >
                            <SelectTrigger className="bg-input border-border text-foreground w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="day">Day</SelectItem>
                              <SelectItem value="gtc">GTC (Good Till Cancel)</SelectItem>
                              <SelectItem value="gtd">GTD (Good Till Date)</SelectItem>
                              <SelectItem value="ioc">IOC (Immediate Or Cancel)</SelectItem>
                              <SelectItem value="fok">FOK (Fill Or Kill)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {(modifyOrder.orderType === 'limit' || modifyOrder.orderType === 'stop_limit') && (
                          <div className="space-y-1">
                            <Label className="text-foreground">Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              className="bg-input border-border text-foreground w-full"
                              value={modifyOrder.price ?? ''}
                              onChange={e =>
                                setModifyOrder(p => ({
                                  ...p,
                                  price: e.target.value ? Number(e.target.value) : undefined,
                                }))
                              }
                              placeholder="0.00"
                            />
                          </div>
                        )}
                        {(modifyOrder.orderType === 'stop' || modifyOrder.orderType === 'stop_limit') && (
                          <div className="space-y-1">
                            <Label className="text-foreground">Stop Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              className="bg-input border-border text-foreground w-full"
                              value={modifyOrder.stopPrice ?? ''}
                              onChange={e =>
                                setModifyOrder(p => ({
                                  ...p,
                                  stopPrice: e.target.value ? Number(e.target.value) : undefined,
                                }))
                              }
                              placeholder="0.00"
                            />
                          </div>
                        )}
                        {modifyOrder.timeInForce === 'gtd' && (
                          <div className="space-y-1">
                            <Label className="text-foreground">Expire Time (ISO 8601)</Label>
                            <Input
                              type="datetime-local"
                              className="bg-input border-border text-foreground w-full"
                              value={
                                modifyOrder.expireTime
                                  ? new Date(modifyOrder.expireTime).toISOString().slice(0, 16)
                                  : ''
                              }
                              onChange={e => {
                                if (e.target.value) {
                                  const date = new Date(e.target.value);
                                  setModifyOrder(p => ({
                                    ...p,
                                    expireTime: date.toISOString(),
                                  }));
                                } else {
                                  setModifyOrder(p => ({ ...p, expireTime: undefined }));
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-foreground">Broker-Specific Extras (JSON)</Label>
                        <Textarea
                          className="bg-input border-border text-foreground min-h-24 font-mono text-xs"
                          value={modifyExtrasText}
                          onChange={e => setModifyExtrasText(e.target.value)}
                          placeholder='{"extendedHours": false, "marketHours": "regular_hours"}'
                        />
                        <p className="text-xs text-muted-foreground">
                          Optional broker-specific fields (e.g., extendedHours for Robinhood, accountSpec for NinjaTrader)
                        </p>
                      </div>
                      
                      {/* Payload Preview */}
                      {modifyOrderPayloadPreview && (
                        <details className="rounded-md border border-border/60 bg-muted/10">
                          <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/20">
                            View Payload
                          </summary>
                          <div className="border-t border-border/60 p-3">
                            <pre className="whitespace-pre-wrap break-words text-xs text-foreground font-mono overflow-auto max-h-64">
                              {JSON.stringify(modifyOrderPayloadPreview, null, 2)}
                            </pre>
                          </div>
                        </details>
                      )}
                      {modifyOrderPayloadPreview === null && modifyExtrasText && (
                        <div className="rounded-md border border-yellow-500/20 bg-yellow-500/10 p-2">
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">
                            Invalid JSON in extras field. Please fix the JSON syntax.
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-1">
                        <Button
                          onClick={modifyExistingOrder}
                          disabled={
                            !selectedBroker ||
                            !selectedAccountId ||
                            !modifyOrderId ||
                            !modifyOrder.symbol ||
                            modifyingOrder ||
                            (!isMockMode && !isBrokerConnected) ||
                            modifyOrderPayloadPreview === null
                          }
                          className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
                        >
                          {modifyingOrder ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Modifying...
                            </>
                          ) : (
                            <>Modify Order</>
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Response</Label>
                      <div className="rounded-md border border-border/60 bg-muted/10 p-3 max-h-96 overflow-auto text-xs text-foreground">
                        {modifyResponse ? (
                          <pre className="whitespace-pre-wrap break-words font-mono">
                            {JSON.stringify(modifyResponse, null, 2)}
                          </pre>
                        ) : (
                          <div className="text-muted-foreground">No response yet.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
