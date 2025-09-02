'use client';

import { useState, useEffect } from 'react';
import { 
  FinaticConnect, 
  BrokerDataAccount, 
  BrokerDataOrder, 
  BrokerDataPosition,
  PaginatedResult,
  BrokerConnection
} from '@finatic/client';

// Use SDK types for all state and props

type TabType = 'accounts' | 'orders' | 'positions' | 'portal' | 'advanced' | 'trading'; 

interface LogEntry {
  type: 'info' | 'error' | 'success';
  message: string;
  timestamp: string;
}

export default function Home() {
  const [finatic, setFinatic] = useState<FinaticConnect | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('accounts');
  
  // Global state
  const [isMockMode, setIsMockMode] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<string>('Not initialized');
  const [storedUserId, setStoredUserIdState] = useState<string | null>(null);

  // Accounts state
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

  // Orders state
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

  // Positions state
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

  // Advanced state
  const [rawResponse, setRawResponse] = useState<string>('');

  // Trading state
  const [orderForm, setOrderForm] = useState({
    symbol: '',
    quantity: 1,
    side: 'buy' as 'buy' | 'sell',
    orderType: 'market' as 'market' | 'limit' | 'stop' | 'stop_limit',
    price: '',
    stopPrice: '',
    timeInForce: 'day' as 'day' | 'gtc' | 'gtd' | 'ioc' | 'fok',
    assetType: 'Equity' as 'Equity' | 'Equity Option' | 'Crypto' | 'Futures' | 'Futures Option'
  });
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);
  const [cancelOrderId, setCancelOrderId] = useState<string>('');
  const [cancelOrderResponse, setCancelOrderResponse] = useState<any | null>(null);

  // New state for broker connections and accounts
  const [brokerConnections, setBrokerConnections] = useState<BrokerConnection[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<BrokerDataAccount[]>([]);
  const [selectedBrokerId, setSelectedBrokerId] = useState<string>('');
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');

  // Modify order state
  const [modifyOrderForm, setModifyOrderForm] = useState({
    orderId: '',
    symbol: '',
    quantity: 1,
    side: 'buy' as 'buy' | 'sell',
    orderType: 'market' as 'market' | 'limit' | 'stop' | 'stop_limit',
    price: '',
    stopPrice: '',
    timeInForce: 'day' as 'day' | 'gtc' | 'gtd' | 'ioc' | 'fok',
    assetType: 'Equity' as 'Equity' | 'Equity Option' | 'Crypto' | 'Futures' | 'Futures Option'
  });
  const [modifyOrderResponse, setModifyOrderResponse] = useState<any | null>(null);

  // Portal state
  const [portalUrl, setPortalUrl] = useState<string>('');
  const [portalError, setPortalError] = useState<string>('');
  const [portalEvents, setPortalEvents] = useState<Array<{type: string, data: any, timestamp: string}>>([]);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [consoleOpen, setConsoleOpen] = useState(true);

  // Local storage helpers for userId
  const getStoredUserId = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('finatic_user_id');
  };

  const setStoredUserId = (userId: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('finatic_user_id', userId);
    setStoredUserIdState(userId);
  };

  const clearStoredUserId = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('finatic_user_id');
    setStoredUserIdState(null);
  };

  // Helper to add a log
  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs((prev) => [
      ...prev,
      { type, message, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  useEffect(() => {
    // Initialize stored userId state from localStorage
    setStoredUserIdState(getStoredUserId());
    initializeSDK();
  }, []);

  const initializeSDK = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we're in mock mode
      const useMocks = process.env.NEXT_PUBLIC_FINATIC_USE_MOCKS === 'true';
      const mockApiOnly = process.env.NEXT_PUBLIC_FINATIC_MOCK_API_ONLY === 'true';
      setIsMockMode(useMocks || mockApiOnly);

      // Get stored userId from localStorage
      const storedUserId = getStoredUserId();
      if (storedUserId) {
        addLog('info', `Found stored userId: ${storedUserId}`);
      }

      if (useMocks) {
        addLog('info', '🔧 Initializing SDK in MOCK mode');
        setSessionInfo('Mock Mode - No real API calls');
        
        // Create mock instance with proper initialization
        const apiUrl = process.env.NEXT_PUBLIC_FINATIC_API_URL || 'http://localhost:8000';
        const mockFinatic = await FinaticConnect.init('mock-token', storedUserId || 'mock-user-123', {
          baseUrl: apiUrl
        });
        setFinatic(mockFinatic);
        addLog('success', 'SDK initialized in MOCK mode');
      } else if (mockApiOnly) {
        addLog('info', '🔧 Initializing SDK in MOCK API ONLY mode');
        setSessionInfo('Mock API Only Mode - Mock API calls, real portal');
        
        // Create mock instance with proper initialization
        const apiUrl = process.env.NEXT_PUBLIC_FINATIC_API_URL || 'http://localhost:8000';
        const mockFinatic = await FinaticConnect.init('mock-token', storedUserId || 'mock-user-123', {
          baseUrl: apiUrl
        });
        setFinatic(mockFinatic);
        addLog('success', 'SDK initialized in MOCK API ONLY mode');
      } else {
        addLog('info', '🚀 Initializing SDK in REAL mode');
        
        // Get the API URL from environment variable (defaults to localhost:8000 for dev)
        const apiUrl = process.env.NEXT_PUBLIC_FINATIC_API_URL || 'http://localhost:8000';
        addLog('info', `Using API URL: ${apiUrl}`);
        
        // Get token from API
        const response = await fetch('/api/getToken');
        if (!response.ok) {
          addLog('error', 'Failed to get token from /api/getToken');
          throw new Error('Failed to get token');
        }
        const responseData = await response.json();
        
        // Extract the one_time_token from the response
        const token = responseData.data?.one_time_token;
        if (!token) {
          addLog('error', 'No token found in API response');
          throw new Error('No token found in API response');
        }
        
        const realFinatic = await FinaticConnect.init(token, storedUserId || undefined, {
          baseUrl: apiUrl
        });
        setFinatic(realFinatic);
        setSessionInfo(`Real Mode - Authenticated${storedUserId ? ` (User: ${storedUserId})` : ''}`);
        addLog('success', 'SDK initialized in REAL mode');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      addLog('error', `Failed to initialize SDK: ${msg}`);
      setError(msg);
      setSessionInfo('Failed to initialize');
    } finally {
      setIsLoading(false);
    }
  };

  // Accounts handlers
  const handleGetAccountsPage = async () => {
    if (!finatic) return;
    addLog('info', `Fetching accounts page ${accountsPageNum} (size ${accountsPageSize})...`);
    try {
      setIsLoading(true);
      setError(null);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAllAccounts = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching all accounts...');
    try {
      setIsLoading(true);
      setError(null);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextAccountsPage = async () => {
    if (!finatic || !accountsPage || !accountsPage.hasNext) return;
    addLog('info', 'Fetching next accounts page...');
    try {
      setIsLoading(true);
      setError(null);
      
      const nextResult = await accountsPage.nextPage();
      if (nextResult) {
        setAccountsPage(nextResult);
        setAccounts(nextResult.data || []);
        setAccountsPageNum(nextResult.currentPage);
        addLog('success', `Fetched accounts page ${nextResult.currentPage} (${nextResult.data ? nextResult.data.length : 0} items)`);
      } else {
        addLog('info', 'No more accounts pages.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch next accounts page';
      setError(msg);
      addLog('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousAccountsPage = async () => {
    if (!finatic || !accountsPage || !accountsPage.hasPrevious) return;
    addLog('info', 'Fetching previous accounts page...');
    try {
      setIsLoading(true);
      setError(null);
      
      const prevResult = await accountsPage.previousPage();
      if (prevResult) {
        setAccountsPage(prevResult);
        setAccounts(prevResult.data || []);
        setAccountsPageNum(prevResult.currentPage);
        addLog('success', `Fetched accounts page ${prevResult.currentPage} (${prevResult.data ? prevResult.data.length : 0} items)`);
      } else {
        addLog('info', 'No previous accounts pages.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch previous accounts page';
      setError(msg);
      addLog('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirstAccountsPage = async () => {
    if (!finatic || !accountsPage) return;
    addLog('info', 'Fetching first accounts page...');
    try {
      setIsLoading(true);
      setError(null);
      
      const firstResult = await accountsPage.firstPage();
      if (firstResult) {
        setAccountsPage(firstResult);
        setAccounts(firstResult.data || []);
        setAccountsPageNum(firstResult.currentPage);
        addLog('success', `Fetched first accounts page (${firstResult.data ? firstResult.data.length : 0} items)`);
      } else {
        addLog('info', 'Failed to fetch first accounts page.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch first accounts page';
      setError(msg);
      addLog('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Orders handlers
  const handleGetOrdersPage = async () => {
    if (!finatic) return;
    addLog('info', `Fetching orders page ${ordersPageNum} (size ${ordersPageSize})...`);
    try {
      setIsLoading(true);
      setError(null);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAllOrders = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching all orders...');
    try {
      setIsLoading(true);
      setError(null);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextOrdersPage = async () => {
    if (!finatic || !ordersPage || !ordersPage.hasNext) return;
    addLog('info', 'Fetching next orders page...');
    try {
      setIsLoading(true);
      setError(null);
      
      const nextResult = await ordersPage.nextPage();
      if (nextResult) {
        setOrdersPage(nextResult);
        setOrders(nextResult.data || []);
        setOrdersPageNum(nextResult.currentPage);
        addLog('success', `Fetched orders page ${nextResult.currentPage} (${nextResult.data ? nextResult.data.length : 0} items)`);
      } else {
        addLog('info', 'No more orders pages.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch next orders page';
      setError(msg);
      addLog('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousOrdersPage = async () => {
    if (!finatic || !ordersPage || !ordersPage.hasPrevious) return;
    addLog('info', 'Fetching previous orders page...');
    try {
      setIsLoading(true);
      setError(null);
      
      const prevResult = await ordersPage.previousPage();
      if (prevResult) {
        setOrdersPage(prevResult);
        setOrders(prevResult.data || []);
        setOrdersPageNum(prevResult.currentPage);
        addLog('success', `Fetched orders page ${prevResult.currentPage} (${prevResult.data ? prevResult.data.length : 0} items)`);
      } else {
        addLog('info', 'No previous orders pages.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch previous orders page';
      setError(msg);
      addLog('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirstOrdersPage = async () => {
    if (!finatic || !ordersPage) return;
    addLog('info', 'Fetching first orders page...');
    try {
      setIsLoading(true);
      setError(null);
      
      const firstResult = await ordersPage.firstPage();
      if (firstResult) {
        setOrdersPage(firstResult);
        setOrders(firstResult.data || []);
        setOrdersPageNum(firstResult.currentPage);
        addLog('success', `Fetched first orders page (${firstResult.data ? firstResult.data.length : 0} items)`);
      } else {
        addLog('info', 'Failed to fetch first orders page.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch first orders page';
      setError(msg);
      addLog('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Positions handlers
  const handleGetPositionsPage = async () => {
    if (!finatic) return;
    addLog('info', `Fetching positions page ${positionsPageNum} (size ${positionsPageSize})...`);
    try {
      setIsLoading(true);
      setError(null);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAllPositions = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching all positions...');
    try {
      setIsLoading(true);
      setError(null);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPositionsPage = async () => {
    if (!finatic || !positionsPage || !positionsPage.hasNext) return;
    addLog('info', 'Fetching next positions page...');
    try {
      setIsLoading(true);
      setError(null);
      
      const nextResult = await positionsPage.nextPage();
      if (nextResult) {
        setPositionsPage(nextResult);
        setPositions(nextResult.data || []);
        setPositionsPageNum(nextResult.currentPage);
        addLog('success', `Fetched positions page ${nextResult.currentPage} (${nextResult.data ? nextResult.data.length : 0} items)`);
      } else {
        addLog('info', 'No more positions pages.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch next positions page';
      setError(msg);
      addLog('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousPositionsPage = async () => {
    if (!finatic || !positionsPage || !positionsPage.hasPrevious) return;
    addLog('info', 'Fetching previous positions page...');
    try {
      setIsLoading(true);
      setError(null);
      
      const prevResult = await positionsPage.previousPage();
      if (prevResult) {
        setPositionsPage(prevResult);
        setPositions(prevResult.data || []);
        setPositionsPageNum(prevResult.currentPage);
        addLog('success', `Fetched positions page ${prevResult.currentPage} (${prevResult.data ? prevResult.data.length : 0} items)`);
      } else {
        addLog('info', 'No previous positions pages.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch previous positions page';
      setError(msg);
      addLog('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirstPositionsPage = async () => {
    if (!finatic || !positionsPage) return;
    addLog('info', 'Fetching first positions page...');
    try {
      setIsLoading(true);
      setError(null);
      
      const firstResult = await positionsPage.firstPage();
      if (firstResult) {
        setPositionsPage(firstResult);
        setPositions(firstResult.data || []);
        setPositionsPageNum(firstResult.currentPage);
        addLog('success', `Fetched first positions page (${firstResult.data ? firstResult.data.length : 0} items)`);
      } else {
        addLog('info', 'Failed to fetch first positions page.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch first positions page';
      setError(msg);
      addLog('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Advanced handlers
  const handleTestAdvanced = async () => {
    if (!finatic) return;
    addLog('info', 'Running advanced tests...');
    try {
      setIsLoading(true);
      setError(null);
      
      // Test multiple operations
      const results = {
        openPositions: await finatic.getOpenPositions(),
        filledOrders: await finatic.getFilledOrders(),
        pendingOrders: await finatic.getPendingOrders(),
        activeAccounts: await finatic.getActiveAccounts(),
        brokerList: await finatic.getBrokerList(),
        connections: await finatic.getBrokerConnections()
      };
      
      setRawResponse(JSON.stringify(results, null, 2));
      addLog('success', 'Advanced tests completed successfully.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to run advanced tests';
      setError(msg);
      addLog('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // New handlers for broker connections and accounts
  const handleGetBrokerConnections = async () => {
    if (!finatic) return;
    addLog('info', 'Fetching broker connections...');
    try {
      setIsLoading(true);
      setError(null);
      const connections = await finatic.getBrokerConnections();
      setBrokerConnections(connections);
      setSelectedBrokerId('');
      setSelectedConnectionId('');
      addLog('success', `Fetched ${connections.length} broker connections.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch broker connections';
      setError(msg);
      addLog('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAvailableAccounts = async () => {
    if (!finatic || !selectedBrokerId) return;
    addLog('info', `Fetching available accounts for broker ${selectedBrokerId}...`);
    try {
      setIsLoading(true);
      setError(null);
      const accounts = await finatic.getAllAccounts({ broker_id: selectedBrokerId });
      console.log('Fetched accounts:', accounts);
      console.log('Fetched accounts - detailed:', accounts.map(acc => ({
        id: acc.id,
        account_name: acc.account_name,
        account_id: acc.account_id,
        connection_id: acc.connection_id,
        broker_id: acc.broker_id
      })));
      setAvailableAccounts(accounts);
      addLog('success', `Fetched ${accounts.length} available accounts.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch available accounts';
      setError(msg);
      addLog('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Trading handlers
  const handlePlaceOrder = async () => {
    if (!finatic) return;
    addLog('info', `Placing order ${orderForm.side.toUpperCase()} ${orderForm.quantity} ${orderForm.symbol}`);
    try {
      setIsLoading(true);
      setError(null);

      // Debug logging
      console.log('Method 1 Debug - Current state:', {
        selectedBrokerId,
        selectedConnectionId,
        brokerConnections: brokerConnections.map(c => ({ broker_id: c.broker_id, connection_id: c.connection_id })),
        availableAccounts: availableAccounts.map(a => ({ broker_provided_account_id: a.broker_provided_account_id, user_broker_connection_id: a.user_broker_connection_id })),
        currentTradingContext: finatic.getTradingContext()
      });

      // Set broker and account context if selected
      if (selectedBrokerId) {
        const selectedConnection = brokerConnections.find(conn => conn.broker_id === selectedBrokerId);
        console.log('Method 1 Debug - Found connection:', selectedConnection);
        
        if (selectedConnection) {
          // Map broker_id to the expected broker name
          let broker: 'robinhood' | 'tasty_trade' | 'ninja_trader';
          if (selectedConnection.broker_id === 'robinhood') broker = 'robinhood';
          else if (selectedConnection.broker_id === 'tasty_trade') broker = 'tasty_trade';
          else if (selectedConnection.broker_id === 'ninja_trader') broker = 'ninja_trader';
          else {
            throw new Error(`Unsupported broker: ${selectedConnection.broker_id}`);
          }
          
          console.log('Method 1 Debug - Setting broker:', broker);
          finatic.setBroker(broker);
          
          // Set account if selected
          if (selectedConnectionId) {
            const selectedAccount = availableAccounts.find(acc => acc.user_broker_connection_id === selectedConnectionId);
            console.log('Method 1 Debug - Found account:', selectedAccount);
            
                    if (selectedAccount) {
          console.log('Method 1 Debug - Setting account:', selectedAccount.broker_provided_account_id);
          finatic.setAccount(selectedAccount.broker_provided_account_id, selectedAccount.id);
          console.log('Method 1 Debug - Set account context:', {
            accountNumber: selectedAccount.broker_provided_account_id,
            accountId: selectedAccount.id,
            tradingContext: finatic.getTradingContext()
          });
        } else {
              console.log('Method 1 Debug - No account found for connection_id:', selectedConnectionId);
            }
          } else {
            console.log('Method 1 Debug - No selectedConnectionId');
          }
        } else {
          console.log('Method 1 Debug - No connection found for broker_id:', selectedBrokerId);
        }
      } else {
        console.log('Method 1 Debug - No selectedBrokerId');
      }

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

      console.log('About to place order with request:', orderRequest);
      const response = await finatic.placeOrder(orderRequest);
      setPlacedOrder(response);
      setCancelOrderId(response.response_data?.orderId || '');
      addLog('success', `Order placed. ID: ${response.response_data?.orderId}`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to place order';
      setError(msg);
      addLog('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!finatic || !cancelOrderId) return;
    addLog('info', `Cancelling order ${cancelOrderId}`);
    try {
      setIsLoading(true);
      setError(null);
      
      // Set broker and account context if selected
      if (selectedBrokerId) {
        const selectedConnection = brokerConnections.find(conn => conn.broker_id === selectedBrokerId);
        if (selectedConnection) {
          // Map broker_id to the expected broker name
          let broker: 'robinhood' | 'tasty_trade' | 'ninja_trader';
          if (selectedConnection.broker_id === 'robinhood') broker = 'robinhood';
          else if (selectedConnection.broker_id === 'tasty_trade') broker = 'tasty_trade';
          else if (selectedConnection.broker_id === 'ninja_trader') broker = 'ninja_trader';
          else {
            throw new Error(`Unsupported broker: ${selectedConnection.broker_id}`);
          }
          
          finatic.setBroker(broker);
          
          // Set account if selected
          if (selectedConnectionId) {
            const selectedAccount = availableAccounts.find(acc => acc.user_broker_connection_id === selectedConnectionId);
            if (selectedAccount) {
              finatic.setAccount(selectedAccount.broker_provided_account_id, selectedAccount.id);
            }
          }
        }
      }
      
      const response = await finatic.cancelOrder(cancelOrderId);
      setCancelOrderResponse(response);
      addLog('success', `Order cancelled. Status: ${response.response_data?.status}`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to cancel order';
      setError(msg);
      addLog('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear stored userId handler
  const handleClearStoredUserId = () => {
    clearStoredUserId();
    addLog('info', 'Cleared stored userId from localStorage');
    setSessionInfo(sessionInfo.replace(/ \(User: [^)]+\)/, '')); // Remove user info from session info
  };

  // New handler for modifying orders
  const handleModifyOrder = async () => {
    if (!finatic || !modifyOrderForm.orderId) return;
    addLog('info', `Modifying order ${modifyOrderForm.orderId}...`);
    try {
      setIsLoading(true);
      setError(null);

      // Set broker and account context if selected
      if (selectedBrokerId) {
        const selectedConnection = brokerConnections.find(conn => conn.broker_id === selectedBrokerId);
        if (selectedConnection) {
          // Map broker_id to the expected broker name
          let broker: 'robinhood' | 'tasty_trade' | 'ninja_trader';
          if (selectedConnection.broker_id === 'robinhood') broker = 'robinhood';
          else if (selectedConnection.broker_id === 'tasty_trade') broker = 'tasty_trade';
          else if (selectedConnection.broker_id === 'ninja_trader') broker = 'ninja_trader';
          else {
            throw new Error(`Unsupported broker: ${selectedConnection.broker_id}`);
          }
          
          finatic.setBroker(broker);
          
          // Set account if selected
          if (selectedConnectionId) {
            const selectedAccount = availableAccounts.find(acc => acc.user_broker_connection_id === selectedConnectionId);
            if (selectedAccount) {
              finatic.setAccount(selectedAccount.broker_provided_account_id, selectedAccount.id);
            }
          }
        }
      }

      const modifyRequest: any = {
        orderId: modifyOrderForm.orderId,
        quantity: Number(modifyOrderForm.quantity),
        side: modifyOrderForm.side,
        orderType: modifyOrderForm.orderType,
        timeInForce: modifyOrderForm.timeInForce,
        assetType: modifyOrderForm.assetType,
      };

      if (modifyOrderForm.price) modifyRequest.price = Number(modifyOrderForm.price);
      if (modifyOrderForm.stopPrice) modifyRequest.stopPrice = Number(modifyOrderForm.stopPrice);

      const response = await finatic.modifyOrder(modifyOrderForm.orderId, modifyRequest);
      setModifyOrderResponse(response);
      addLog('success', `Order modified. Status: ${response.response_data?.status}`);
    } catch (err: any) {
      const msg = err?.message || 'Failed to modify order';
      setError(msg);
      addLog('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Portal handler
  const handleOpenPortal = async () => {
    if (!finatic) return;
    addLog('info', 'Opening portal...');
    setPortalUrl('');
    setPortalError('');
    setPortalEvents([]);
    try {
      // Use the actual openPortal method from the SDK
      await finatic.openPortal({
        onSuccess: (userId: string) => {
          addLog('success', `Portal opened successfully for user: ${userId}`);
          setPortalUrl('Portal opened successfully');
          
          // Store userId in localStorage for future sessions
          setStoredUserId(userId);
          addLog('info', `Stored userId in localStorage: ${userId}`);
          
          setPortalEvents(prev => [...prev, {
            type: 'portal-success',
            data: { userId },
            timestamp: new Date().toLocaleTimeString()
          }]);
        },
        onError: (error: Error) => {
          setPortalError(error.message);
          addLog('error', error.message);
          setPortalEvents(prev => [...prev, {
            type: 'portal-error',
            data: { message: error.message },
            timestamp: new Date().toLocaleTimeString()
          }]);
        },
        onClose: () => {
          addLog('info', 'Portal closed');
          setPortalEvents(prev => [...prev, {
            type: 'portal-close',
            data: {},
            timestamp: new Date().toLocaleTimeString()
          }]);
        },
        onEvent: (type: string, data: any) => {
          addLog('info', `Portal event: ${type} - ${JSON.stringify(data)}`);
          setPortalEvents(prev => [...prev, {
            type,
            data,
            timestamp: new Date().toLocaleTimeString()
          }]);
        }
      });
    } catch (err: any) {
      setPortalError(err.message || 'Unknown error');
      addLog('error', err.message || 'Unknown error');
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'accounts', label: 'Accounts' },
    { id: 'orders', label: 'Orders' },
    { id: 'positions', label: 'Positions' },
    { id: 'portal', label: 'Portal' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'trading', label: 'Trading' }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 ${consoleOpen ? 'pr-96' : 'pr-10'}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finatic SDK Demo</h1>
              <p className="text-sm text-gray-600 mt-1">
                {sessionInfo} • {isMockMode ? '🔧 Mock Mode' : '🚀 Real Mode'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={initializeSDK}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? 'Loading...' : 'Reinitialize'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'accounts' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Accounts</h2>
                
                {/* Filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Broker ID"
                    value={accountsFilters.broker_id}
                    onChange={(e) => setAccountsFilters({...accountsFilters, broker_id: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <select
                    value={accountsFilters.account_type}
                    onChange={(e) => setAccountsFilters({...accountsFilters, account_type: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Account Types</option>
                    <option value="margin">Margin</option>
                    <option value="cash">Cash</option>
                    <option value="crypto_wallet">Crypto Wallet</option>
                    <option value="live">Live</option>
                    <option value="sim">Sim</option>
                  </select>
                  <select
                    value={accountsFilters.status}
                    onChange={(e) => setAccountsFilters({...accountsFilters, status: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Currency"
                    value={accountsFilters.currency}
                    onChange={(e) => setAccountsFilters({...accountsFilters, currency: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>



                {/* Test Base Methods */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Test Base Methods</h3>
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-blue-700">Page Size:</label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={accountsPageSize}
                        onChange={(e) => setAccountsPageSize(parseInt(e.target.value) || 10)}
                        className="border border-blue-300 rounded-md px-2 py-1 text-sm w-20"
                      />
                    </div>
                    <button
                      onClick={handleGetAccountsPage}
                      disabled={isLoading || !finatic}
                      className="btn btn-primary btn-sm"
                    >
                      Get First Page
                    </button>
                    <button
                      onClick={handleGetAllAccounts}
                      disabled={isLoading || !finatic}
                      className="btn btn-secondary btn-sm"
                    >
                      Get All (Convenience)
                    </button>
                  </div>
                  <div className="text-xs text-blue-700">
                    Page Size: 1-1000 (default: 10), Get First Page returns PaginatedResult, Get All returns array
                  </div>
                </div>

                {/* Manual Navigation Controls */}
                {accountsPage && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                    <h3 className="text-sm font-medium text-green-900 mb-2">Test PaginatedResult Navigation Methods</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleFirstAccountsPage}
                        disabled={isLoading || !finatic || !accountsPage.hasPrevious}
                        className="btn btn-outline btn-sm"
                      >
                        First
                      </button>
                      <button
                        onClick={handlePreviousAccountsPage}
                        disabled={isLoading || !finatic || !accountsPage.hasPrevious}
                        className="btn btn-outline btn-sm"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600 px-2">
                        Page {accountsPage.currentPage}
                      </span>
                      <button
                        onClick={handleNextAccountsPage}
                        disabled={isLoading || !finatic || !accountsPage.hasNext}
                        className="btn btn-outline btn-sm"
                      >
                        Next
                      </button>
                    </div>
                    <div className="text-xs text-green-700 mt-2">
                      These test the PaginatedResult.nextPage(), .previousPage(), .firstPage() methods
                    </div>
                  </div>
                )}

                {/* Pagination Info */}
                {accountsPage && (
                  <div className="bg-gray-50 rounded-md p-3 mb-4">
                    <div className="text-sm text-gray-600">
                      Page {accountsPage.currentPage} • 
                      {accountsPage.hasNext ? ' Has Next' : ' Last Page'} • 
                      {accountsPage.hasPrevious ? ' Has Previous' : ' First Page'} • 
                      {accountsPage.data ? accountsPage.data.length : 0} items
                    </div>
                  </div>
                )}

                {/* Results */}
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {account.cash_balance != null ? `$${account.cash_balance.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {account.buying_power != null ? `$${account.buying_power.toFixed(2)}` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Orders</h2>
                
                {/* Filters */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Broker ID"
                    value={ordersFilters.broker_id}
                    onChange={(e) => setOrdersFilters({...ordersFilters, broker_id: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Symbol"
                    value={ordersFilters.symbol}
                    onChange={(e) => setOrdersFilters({...ordersFilters, symbol: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <select
                    value={ordersFilters.status}
                    onChange={(e) => setOrdersFilters({...ordersFilters, status: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="filled">Filled</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                    <option value="partially_filled">Partially Filled</option>
                  </select>
                  <select
                    value={ordersFilters.side}
                    onChange={(e) => setOrdersFilters({...ordersFilters, side: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Sides</option>
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                  <select
                    value={ordersFilters.asset_type}
                    onChange={(e) => setOrdersFilters({...ordersFilters, asset_type: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Asset Types</option>
                    <option value="stock">Stock</option>
                    <option value="option">Option</option>
                    <option value="crypto">Crypto</option>
                    <option value="future">Future</option>
                  </select>
                </div>



                {/* Test Base Methods */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Test Base Methods</h3>
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-blue-700">Page Size:</label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={ordersPageSize}
                        onChange={(e) => setOrdersPageSize(parseInt(e.target.value) || 10)}
                        className="border border-blue-300 rounded-md px-2 py-1 text-sm w-20"
                      />
                    </div>
                    <button
                      onClick={handleGetOrdersPage}
                      disabled={isLoading || !finatic}
                      className="btn btn-primary btn-sm"
                    >
                      Get First Page
                    </button>
                    <button
                      onClick={handleGetAllOrders}
                      disabled={isLoading || !finatic}
                      className="btn btn-secondary btn-sm"
                    >
                      Get All (Convenience)
                    </button>
                  </div>
                  <div className="text-xs text-blue-700">
                    Page Size: 1-1000 (default: 10), Get First Page returns PaginatedResult, Get All returns array
                  </div>
                </div>

                {/* Manual Navigation Controls */}
                {ordersPage && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                    <h3 className="text-sm font-medium text-green-900 mb-2">Test PaginatedResult Navigation Methods</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleFirstOrdersPage}
                        disabled={isLoading || !finatic || !ordersPage.hasPrevious}
                        className="btn btn-outline btn-sm"
                      >
                        First
                      </button>
                      <button
                        onClick={handlePreviousOrdersPage}
                        disabled={isLoading || !finatic || !ordersPage.hasPrevious}
                        className="btn btn-outline btn-sm"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600 px-2">
                        Page {ordersPage.currentPage}
                      </span>
                      <button
                        onClick={handleNextOrdersPage}
                        disabled={isLoading || !finatic || !ordersPage.hasNext}
                        className="btn btn-outline btn-sm"
                      >
                        Next
                      </button>
                    </div>
                    <div className="text-xs text-green-700 mt-2">
                      These test the PaginatedResult.nextPage(), .previousPage(), .firstPage() methods
                    </div>
                  </div>
                )}

                {/* Pagination Info */}
                {ordersPage && (
                  <div className="bg-gray-50 rounded-md p-3 mb-4">
                    <div className="text-sm text-gray-600">
                      Page {ordersPage.currentPage} • 
                      {ordersPage.hasNext ? ' Has Next' : ' Last Page'} • 
                      {ordersPage.hasPrevious ? ' Has Previous' : ' First Page'} • 
                      {ordersPage.data ? ordersPage.data.length : 0} items
                    </div>
                  </div>
                )}

                {/* Results */}
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.price != null ? `$${order.price.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.status || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'positions' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Positions</h2>
                
                {/* Filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Broker ID"
                    value={positionsFilters.broker_id}
                    onChange={(e) => setPositionsFilters({...positionsFilters, broker_id: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Symbol"
                    value={positionsFilters.symbol}
                    onChange={(e) => setPositionsFilters({...positionsFilters, symbol: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <select
                    value={positionsFilters.position_status}
                    onChange={(e) => setPositionsFilters({...positionsFilters, position_status: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                  <select
                    value={positionsFilters.side}
                    onChange={(e) => setPositionsFilters({...positionsFilters, side: e.target.value})}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Sides</option>
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </div>



                {/* Test Base Methods */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Test Base Methods</h3>
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-blue-700">Page Size:</label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={positionsPageSize}
                        onChange={(e) => setPositionsPageSize(parseInt(e.target.value) || 10)}
                        className="border border-blue-300 rounded-md px-2 py-1 text-sm w-20"
                      />
                    </div>
                    <button
                      onClick={handleGetPositionsPage}
                      disabled={isLoading || !finatic}
                      className="btn btn-primary btn-sm"
                    >
                      Get First Page
                    </button>
                    <button
                      onClick={handleGetAllPositions}
                      disabled={isLoading || !finatic}
                      className="btn btn-secondary btn-sm"
                    >
                      Get All (Convenience)
                    </button>
                  </div>
                  <div className="text-xs text-blue-700">
                    Page Size: 1-1000 (default: 10), Get First Page returns PaginatedResult, Get All returns array
                  </div>
                </div>

                {/* Manual Navigation Controls */}
                {positionsPage && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                    <h3 className="text-sm font-medium text-green-900 mb-2">Test PaginatedResult Navigation Methods</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleFirstPositionsPage}
                        disabled={isLoading || !finatic || !positionsPage.hasPrevious}
                        className="btn btn-outline btn-sm"
                      >
                        First
                      </button>
                      <button
                        onClick={handlePreviousPositionsPage}
                        disabled={isLoading || !finatic || !positionsPage.hasPrevious}
                        className="btn btn-outline btn-sm"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600 px-2">
                        Page {positionsPage.currentPage}
                      </span>
                      <button
                        onClick={handleNextPositionsPage}
                        disabled={isLoading || !finatic || !positionsPage.hasNext}
                        className="btn btn-outline btn-sm"
                      >
                        Next
                      </button>
                    </div>
                    <div className="text-xs text-green-700 mt-2">
                      These test the PaginatedResult.nextPage(), .previousPage(), .firstPage() methods
                    </div>
                  </div>
                )}

                {/* Pagination Info */}
                {positionsPage && (
                  <div className="bg-gray-50 rounded-md p-3 mb-4">
                    <div className="text-sm text-gray-600">
                      Page {positionsPage.currentPage} • 
                      {positionsPage.hasNext ? ' Has Next' : ' Last Page'} • 
                      {positionsPage.hasPrevious ? ' Has Previous' : ' First Page'} • 
                      {positionsPage.data ? positionsPage.data.length : 0} items
                    </div>
                  </div>
                )}

                {/* Results */}
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {position.average_price != null ? `$${position.average_price.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {position.market_value != null ? `$${position.market_value.toFixed(2)}` : 'N/A'}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            position.unrealized_gain_loss != null && position.unrealized_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {position.unrealized_gain_loss != null ? `$${position.unrealized_gain_loss.toFixed(2)}` : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portal' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Portal</h2>
                
                {/* Authentication Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Authentication Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">SDK Initialized:</span>
                      <span className={`text-sm font-medium ${finatic ? 'text-green-600' : 'text-red-600'}`}>
                        {finatic ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Fully Authenticated:</span>
                      <span className={`text-sm font-medium ${finatic?.isAuthed() ? 'text-green-600' : 'text-red-600'}`}>
                        {finatic?.isAuthed() ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">User ID:</span>
                      <span className="text-sm text-blue-700 font-mono">
                        {finatic?.getUserId() || 'Not authenticated'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Access Token:</span>
                      <span className="text-sm text-blue-700 font-mono">
                        {finatic?.isAuthed() ? '✅ Present' : '❌ Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Refresh Token:</span>
                      <span className="text-sm text-blue-700 font-mono">
                        {finatic?.isAuthed() ? '✅ Present' : '❌ Missing'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stored User ID Status */}
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                  <h3 className="text-sm font-medium text-green-900 mb-2">Local Storage Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">Stored User ID:</span>
                      <span className="text-sm text-green-700 font-mono">
                        {storedUserId || 'None stored'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">Auto-login:</span>
                      <span className={`text-sm font-medium ${storedUserId ? 'text-green-600' : 'text-gray-500'}`}>
                        {storedUserId ? '✅ Enabled' : '❌ Disabled'}
                      </span>
                    </div>
                    {storedUserId && (
                      <div className="mt-3 pt-2 border-t border-green-200">
                        <button
                          onClick={handleClearStoredUserId}
                          className="btn btn-danger btn-sm"
                        >
                          Clear Stored User ID
                        </button>
                        <p className="text-xs text-green-600 mt-1">
                          This will remove the stored userId and disable auto-login for future sessions.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Session Management */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                  <h3 className="text-sm font-medium text-yellow-900 mb-2">Session Management</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-yellow-700">Session Status:</span>
                      <span className={`text-sm font-medium ${finatic?.isAuthed() ? 'text-green-600' : 'text-red-600'}`}>
                        {finatic?.isAuthed() ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-yellow-700">Auto Refresh:</span>
                      <span className="text-sm font-medium text-green-600">
                        ✅ Enabled (at 16 hours)
                      </span>
                    </div>
                    <p className="text-xs text-yellow-600 mt-2">
                      Sessions automatically refresh at 16 hours to extend the 24-hour lifetime
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Test the portal functionality using the actual SDK method.
                </p>
                <button
                  onClick={handleOpenPortal}
                  className="btn btn-primary mb-4"
                >
                  Open Portal
                </button>
                {portalUrl && (
                  <div className="mt-2 text-green-700 text-sm">{portalUrl}</div>
                )}
                {portalError && (
                  <div className="mt-2 text-red-700 text-sm">Error: {portalError}</div>
                )}
                
                {/* Portal Events Display */}
                {portalEvents.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Portal Events Received</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {portalEvents.map((event, index) => (
                        <div key={index} className="bg-gray-50 rounded-md p-3 border">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-mono text-sm font-medium text-blue-600">
                              {event.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {event.timestamp}
                            </span>
                          </div>
                          <pre className="text-xs text-gray-700 bg-white p-2 rounded border overflow-x-auto">
                            {JSON.stringify(event.data, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}



          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Advanced Testing</h2>
                
                <div className="space-y-4">
                  <button
                    onClick={handleTestAdvanced}
                    disabled={isLoading || !finatic}
                    className="btn btn-primary"
                  >
                    Run Advanced Tests
                  </button>
                  
                  {rawResponse && (
                    <div className="mt-4">
                      <h3 className="text-md font-medium text-gray-900 mb-2">Raw Response:</h3>
                      <pre className="bg-gray-50 rounded-md p-4 overflow-auto text-sm">
                        {rawResponse}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trading' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Trading</h2>

                {/* Broker Connections */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Broker Connections</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleGetBrokerConnections}
                      disabled={isLoading || !finatic}
                      className="btn btn-primary btn-sm"
                    >
                      {isLoading ? 'Fetching...' : 'Get Broker Connections'}
                    </button>
                    {brokerConnections.length > 0 && (
                      <div className="mt-3">
                        <label className="text-sm font-medium text-blue-700">Select Broker:</label>
                        <select
                          value={selectedBrokerId}
                          onChange={(e) => {
                            setSelectedBrokerId(e.target.value);
                            setSelectedConnectionId('');
                            setAvailableAccounts([]);
                          }}
                          className="border border-blue-300 rounded-md px-3 py-2 text-sm w-full"
                        >
                          <option value="">Select a Broker</option>
                          {brokerConnections.map((conn) => (
                            <option key={conn.id} value={conn.broker_id}>
                              {conn.metadata?.nickname || conn.broker_id} (ID: {conn.broker_id})
                            </option>
                          ))}
                        </select>
                        {selectedBrokerId && (
                          <button
                            onClick={handleGetAvailableAccounts}
                            disabled={isLoading || !finatic || !selectedBrokerId}
                            className="btn btn-primary btn-sm mt-2"
                          >
                            {isLoading ? 'Fetching...' : 'Get Available Accounts'}
                          </button>
                        )}
                        {availableAccounts.length > 0 && (
                          <div className="mt-3">
                            <label className="text-sm font-medium text-blue-700">Select Account:</label>
                            <select
                              value={selectedConnectionId}
                              onChange={(e) => {
                                console.log('Account dropdown onChange - e.target.value:', e.target.value);
                                console.log('Account dropdown onChange - availableAccounts:', availableAccounts.map(acc => ({
                                  id: acc.id,
                                  account_name: acc.account_name,
                                  broker_provided_account_id: acc.broker_provided_account_id,
                                  user_broker_connection_id: acc.user_broker_connection_id
                                })));
                                setSelectedConnectionId(e.target.value);
                              }}
                              className="border border-blue-300 rounded-md px-3 py-2 text-sm w-full"
                            >
                              <option value="">Select an Account</option>
                              {availableAccounts.map((acc) => (
                                <option key={acc.id} value={acc.user_broker_connection_id}>
                                  {acc.account_name} (ID: {acc.broker_provided_account_id})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Trading Context Management */}
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                  <h3 className="text-sm font-medium text-green-900 mb-2">Trading Context Management</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => {
                          if (selectedBrokerId && finatic) {
                            // Map broker_id to the expected broker name
                            let broker: 'robinhood' | 'tasty_trade' | 'ninja_trader';
                            if (selectedBrokerId === 'robinhood') broker = 'robinhood';
                            else if (selectedBrokerId === 'tasty_trade') broker = 'tasty_trade';
                            else if (selectedBrokerId === 'ninja_trader') broker = 'ninja_trader';
                            else {
                              addLog('error', `Unsupported broker: ${selectedBrokerId}`);
                              return;
                            }
                            
                            finatic.setBroker(broker);
                            addLog('success', `Set broker context: ${broker}`);
                          }
                        }}
                        disabled={!selectedBrokerId || !finatic}
                        className="btn btn-success btn-sm"
                      >
                        Set Broker Context
                      </button>
                      <button
                        onClick={() => {
                          if (selectedConnectionId && finatic) {
                            const selectedAccount = availableAccounts.find(acc => acc.user_broker_connection_id === selectedConnectionId);
                            if (selectedAccount) {
                              finatic.setAccount(selectedAccount.broker_provided_account_id, selectedAccount.id);
                              addLog('success', `Set account context: ${selectedAccount.broker_provided_account_id}`);
                            }
                          }
                        }}
                        disabled={!selectedConnectionId || !finatic}
                        className="btn btn-success btn-sm"
                      >
                        Set Account Context
                      </button>
                      <button
                        onClick={() => {
                          if (finatic) {
                            finatic.clearTradingContext();
                            addLog('info', 'Cleared trading context');
                          }
                        }}
                        disabled={!finatic}
                        className="btn btn-danger btn-sm"
                      >
                        Clear Context
                      </button>
                    </div>
                                    <div className="text-xs text-green-700">
                  <strong>Method 1:</strong> Set broker and account context once, then place orders without specifying them in each call.
                </div>
                {finatic && (
                  <div className="mt-3 p-3 bg-white border border-green-300 rounded-md">
                    <div className="text-xs font-medium text-green-800 mb-2">Current Trading Context:</div>
                    <pre className="text-xs text-green-700 bg-green-50 p-2 rounded border overflow-x-auto">
                      {JSON.stringify(finatic.getTradingContext(), null, 2)}
                    </pre>
                  </div>
                )}
                  </div>
                </div>

                {/* Order Entry */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Symbol"
                    value={orderForm.symbol}
                    onChange={(e) => setOrderForm({ ...orderForm, symbol: e.target.value.toUpperCase() })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Quantity"
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({ ...orderForm, quantity: Number(e.target.value) })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <select
                    value={orderForm.side}
                    onChange={(e) => setOrderForm({ ...orderForm, side: e.target.value as 'buy' | 'sell' })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                  <select
                    value={orderForm.orderType}
                    onChange={(e) => setOrderForm({ ...orderForm, orderType: e.target.value as any })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="market">Market</option>
                    <option value="limit">Limit</option>
                    <option value="stop">Stop</option>
                    <option value="stop_limit">Stop Limit</option>
                  </select>
                  {orderForm.orderType !== 'market' && (
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={orderForm.price}
                      onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  )}
                  {(orderForm.orderType === 'stop' || orderForm.orderType === 'stop_limit') && (
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Stop Price"
                      value={orderForm.stopPrice}
                      onChange={(e) => setOrderForm({ ...orderForm, stopPrice: e.target.value })}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  )}
                  <select
                    value={orderForm.timeInForce}
                    onChange={(e) => setOrderForm({ ...orderForm, timeInForce: e.target.value as any })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="day">Day</option>
                    <option value="gtc">GTC</option>
                    <option value="gtd">GTD</option>
                    <option value="ioc">IOC</option>
                    <option value="fok">FOK</option>
                  </select>
                  <select
                    value={orderForm.assetType}
                    onChange={(e) => setOrderForm({ ...orderForm, assetType: e.target.value as any })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="Equity">Equity</option>
                    <option value="Equity Option">Equity Option</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Futures">Futures</option>
                    <option value="Futures Option">Futures Option</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading || !finatic || !orderForm.symbol}
                    className="btn btn-primary"
                  >
                    {isLoading ? 'Placing...' : 'Place Order (Method 1)'}
                  </button>
                  <button
                    onClick={() => {
                      if (!finatic || !orderForm.symbol) return;
                      addLog('info', `Placing order with direct broker/account params: ${orderForm.side.toUpperCase()} ${orderForm.quantity} ${orderForm.symbol}`);
                      
                      // Method 2: Pass broker and account directly in the method call
                      const handlePlaceOrderDirect = async () => {
                        try {
                          setIsLoading(true);
                          setError(null);

                          // Debug logging
                          console.log('Method 2 Debug - Current state:', {
                            selectedBrokerId,
                            selectedConnectionId,
                            brokerConnections: brokerConnections.map(c => ({ broker_id: c.broker_id, connection_id: c.connection_id })),
                            availableAccounts: availableAccounts.map(a => ({ broker_provided_account_id: a.broker_provided_account_id, user_broker_connection_id: a.user_broker_connection_id }))
                          });

                          if (!selectedBrokerId || !selectedConnectionId) {
                            throw new Error('Please select both broker and account for Method 2 testing');
                          }

                          const selectedConnection = brokerConnections.find(conn => conn.broker_id === selectedBrokerId);
                          const selectedAccount = availableAccounts.find(acc => acc.user_broker_connection_id === selectedConnectionId);
                          
                          console.log('Method 2 Debug - Found connection:', selectedConnection);
                          console.log('Method 2 Debug - Found account:', selectedAccount);
                          
                          if (!selectedConnection || !selectedAccount) {
                            throw new Error('Selected broker or account not found');
                          }

                          // Map broker_id to the expected broker name
                          let broker: 'robinhood' | 'tasty_trade' | 'ninja_trader';
                          if (selectedConnection.broker_id === 'robinhood') broker = 'robinhood';
                          else if (selectedConnection.broker_id === 'tasty_trade') broker = 'tasty_trade';
                          else if (selectedConnection.broker_id === 'ninja_trader') broker = 'ninja_trader';
                          else {
                            throw new Error(`Unsupported broker: ${selectedConnection.broker_id}`);
                          }

                          const orderRequest: any = {
                            symbol: orderForm.symbol,
                            quantity: Number(orderForm.quantity),
                            side: orderForm.side,
                            orderType: orderForm.orderType,
                            timeInForce: orderForm.timeInForce,
                            assetType: orderForm.assetType,
                            broker: broker, // Pass broker directly
                            accountNumber: selectedAccount.broker_provided_account_id, // Pass account directly
                          };

                          if (orderForm.price) orderRequest.price = Number(orderForm.price);
                          if (orderForm.stopPrice) orderRequest.stopPrice = Number(orderForm.stopPrice);

                          console.log('About to place order with direct params:', orderRequest);
                          const response = await finatic.placeOrder(orderRequest);
                          setPlacedOrder(response);
                          setCancelOrderId(response.response_data?.orderId || '');
                          addLog('success', `Order placed with direct params. ID: ${response.response_data?.orderId}`);
                        } catch (err: any) {
                          const msg = err?.message || 'Failed to place order with direct params';
                          setError(msg);
                          addLog('error', msg);
                        } finally {
                          setIsLoading(false);
                        }
                      };

                      handlePlaceOrderDirect();
                    }}
                    disabled={isLoading || !finatic || !orderForm.symbol || !selectedBrokerId || !selectedConnectionId}
                    className="btn btn-secondary"
                  >
                    {isLoading ? 'Placing...' : 'Place Order (Method 2)'}
                  </button>
                </div>
                <div className="text-xs text-gray-600 mb-4">
                  <strong>Method 1:</strong> Uses set broker/account context • <strong>Method 2:</strong> Passes broker/account directly in method call
                </div>

                {placedOrder && (
                  <div className="bg-gray-50 rounded-md p-4 mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Order Response</h3>
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(placedOrder, null, 2)}
                    </pre>
                  </div>
                )}

                <h3 className="text-md font-medium text-gray-900 mb-2">Cancel Order</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="text"
                    placeholder="Order ID"
                    value={cancelOrderId}
                    onChange={(e) => setCancelOrderId(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1"
                  />
                  <button
                    onClick={handleCancelOrder}
                    disabled={isLoading || !finatic || !cancelOrderId}
                    className="btn btn-secondary btn-sm"
                  >
                    {isLoading ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                </div>

                {cancelOrderResponse && (
                  <div className="bg-gray-50 rounded-md p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Cancel Response</h3>
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(cancelOrderResponse, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Convenience Trading Methods */}
                <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-6">
                  <h3 className="text-sm font-medium text-purple-900 mb-2">Convenience Trading Methods</h3>
                  <div className="space-y-3">
                    <div className="text-xs text-purple-700 mb-3">
                      Test specific trading methods with automatic token management and context handling.
                    </div>
                                         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                       <button
                         onClick={() => {
                           if (!finatic || !orderForm.symbol) return;
                           addLog('info', `Testing placeStockMarketOrder: ${orderForm.side.toUpperCase()} ${orderForm.quantity} ${orderForm.symbol}`);
                           
                           const testStockMarket = async () => {
                             try {
                               setIsLoading(true);
                               setError(null);
                               
                               // Method 2: Pass broker and account directly
                               if (selectedBrokerId && selectedConnectionId) {
                                 const selectedConnection = brokerConnections.find(conn => conn.broker_id === selectedBrokerId);
                                 const selectedAccount = availableAccounts.find(acc => acc.user_broker_connection_id === selectedConnectionId);
                                 
                                 if (selectedConnection && selectedAccount) {
                                   let broker: 'robinhood' | 'tasty_trade' | 'ninja_trader';
                                   if (selectedConnection.broker_id === 'robinhood') broker = 'robinhood';
                                   else if (selectedConnection.broker_id === 'tasty_trade') broker = 'tasty_trade';
                                   else if (selectedConnection.broker_id === 'ninja_trader') broker = 'ninja_trader';
                                   else {
                                     throw new Error(`Unsupported broker: ${selectedConnection.broker_id}`);
                                   }
                                   
                                   const response = await finatic.placeStockMarketOrder(
                                     orderForm.symbol,
                                     orderForm.quantity,
                                     orderForm.side,
                                     broker,
                                     selectedAccount.broker_provided_account_id
                                   );
                                   setPlacedOrder(response);
                                   addLog('success', `Stock market order placed via convenience method. ID: ${response.response_data?.orderId}`);
                                 }
                               } else {
                                 // Method 1: Use context
                                 const response = await finatic.placeStockMarketOrder(
                                   orderForm.symbol,
                                   orderForm.quantity,
                                   orderForm.side
                                 );
                                 setPlacedOrder(response);
                                 addLog('success', `Stock market order placed via context. ID: ${response.response_data?.orderId}`);
                               }
                             } catch (err: any) {
                               const msg = err?.message || 'Failed to place stock market order';
                               setError(msg);
                               addLog('error', msg);
                             } finally {
                               setIsLoading(false);
                             }
                           };
                           
                           testStockMarket();
                         }}
                         disabled={isLoading || !finatic || !orderForm.symbol}
                         className="btn btn-purple btn-sm"
                       >
                         Stock Market
                       </button>
                       <button
                         onClick={() => {
                           if (!finatic || !orderForm.symbol || !orderForm.price) return;
                           addLog('info', `Testing placeStockLimitOrder: ${orderForm.side.toUpperCase()} ${orderForm.quantity} ${orderForm.symbol} @ $${orderForm.price}`);
                           
                           const testStockLimit = async () => {
                             try {
                               setIsLoading(true);
                               setError(null);
                               
                               // Method 2: Pass broker and account directly
                               if (selectedBrokerId && selectedConnectionId) {
                                 const selectedConnection = brokerConnections.find(conn => conn.broker_id === selectedBrokerId);
                                 const selectedAccount = availableAccounts.find(acc => acc.user_broker_connection_id === selectedConnectionId);
                                 
                                 if (selectedConnection && selectedAccount) {
                                   let broker: 'robinhood' | 'tasty_trade' | 'ninja_trader';
                                   if (selectedConnection.broker_id === 'robinhood') broker = 'robinhood';
                                   else if (selectedConnection.broker_id === 'tasty_trade') broker = 'tasty_trade';
                                   else if (selectedConnection.broker_id === 'ninja_trader') broker = 'ninja_trader';
                                   else {
                                     throw new Error(`Unsupported broker: ${selectedConnection.broker_id}`);
                                   }
                                   
                                   const response = await finatic.placeStockLimitOrder(
                                     orderForm.symbol,
                                     orderForm.quantity,
                                     orderForm.side,
                                     Number(orderForm.price),
                                     orderForm.timeInForce as 'day' | 'gtc',
                                     broker,
                                     selectedAccount.broker_provided_account_id
                                   );
                                   setPlacedOrder(response);
                                   addLog('success', `Stock limit order placed via convenience method. ID: ${response.response_data?.orderId}`);
                                 }
                               } else {
                                 // Method 1: Use context
                                 const response = await finatic.placeStockLimitOrder(
                                   orderForm.symbol,
                                   orderForm.quantity,
                                   orderForm.side,
                                   Number(orderForm.price),
                                   orderForm.timeInForce as 'day' | 'gtc'
                                 );
                                 setPlacedOrder(response);
                                 addLog('success', `Stock limit order placed via context. ID: ${response.response_data?.orderId}`);
                               }
                             } catch (err: any) {
                               const msg = err?.message || 'Failed to place stock limit order';
                               setError(msg);
                               addLog('error', msg);
                             } finally {
                               setIsLoading(false);
                             }
                           };
                           
                           testStockLimit();
                         }}
                         disabled={isLoading || !finatic || !orderForm.symbol || !orderForm.price}
                         className="btn btn-purple btn-sm"
                       >
                         Stock Limit
                       </button>
                       <button
                         onClick={() => {
                           if (!finatic || !orderForm.symbol) return;
                           addLog('info', `Testing placeOrder (generic): ${orderForm.side.toUpperCase()} ${orderForm.quantity} ${orderForm.symbol}`);
                           
                           const testGenericOrder = async () => {
                             try {
                               setIsLoading(true);
                               setError(null);
                               
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

                               // Method 2: Pass broker and account directly
                               if (selectedBrokerId && selectedConnectionId) {
                                 const selectedConnection = brokerConnections.find(conn => conn.broker_id === selectedBrokerId);
                                 const selectedAccount = availableAccounts.find(acc => acc.user_broker_connection_id === selectedConnectionId);
                                 
                                 if (selectedConnection && selectedAccount) {
                                   let broker: 'robinhood' | 'tasty_trade' | 'ninja_trader';
                                   if (selectedConnection.broker_id === 'robinhood') broker = 'robinhood';
                                   else if (selectedConnection.broker_id === 'tasty_trade') broker = 'tasty_trade';
                                   else if (selectedConnection.broker_id === 'ninja_trader') broker = 'ninja_trader';
                                   else {
                                     throw new Error(`Unsupported broker: ${selectedConnection.broker_id}`);
                                   }
                                   
                                   orderRequest.broker = broker;
                                   orderRequest.accountNumber = selectedAccount.broker_provided_account_id;
                                 }
                               }

                               const response = await finatic.placeOrder(orderRequest);
                               setPlacedOrder(response);
                               addLog('success', `Generic order placed. ID: ${response.response_data?.orderId}`);
                             } catch (err: any) {
                               const msg = err?.message || 'Failed to place generic order';
                               setError(msg);
                               addLog('error', msg);
                             } finally {
                               setIsLoading(false);
                             }
                           };
                           
                           testGenericOrder();
                         }}
                         disabled={isLoading || !finatic || !orderForm.symbol}
                         className="btn btn-purple btn-sm"
                       >
                         Generic Order
                       </button>
                       <button
                         onClick={() => {
                           if (!finatic) return;
                           addLog('info', 'Testing getTradingContext');
                           
                           try {
                             const context = finatic.getTradingContext();
                             addLog('success', `Trading context: ${JSON.stringify(context)}`);
                           } catch (err: any) {
                             const msg = err?.message || 'Failed to get trading context';
                             setError(msg);
                             addLog('error', msg);
                           }
                         }}
                         disabled={!finatic}
                         className="btn btn-purple btn-sm"
                       >
                         Get Context
                       </button>
                     </div>
                  </div>
                </div>

                {/* Modify Order */}
                <h3 className="text-md font-medium text-gray-900 mb-2">Modify Order</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Order ID"
                    value={modifyOrderForm.orderId}
                    onChange={(e) => setModifyOrderForm({ ...modifyOrderForm, orderId: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Symbol"
                    value={modifyOrderForm.symbol}
                    onChange={(e) => setModifyOrderForm({ ...modifyOrderForm, symbol: e.target.value.toUpperCase() })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Quantity"
                    value={modifyOrderForm.quantity}
                    onChange={(e) => setModifyOrderForm({ ...modifyOrderForm, quantity: Number(e.target.value) })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <select
                    value={modifyOrderForm.side}
                    onChange={(e) => setModifyOrderForm({ ...modifyOrderForm, side: e.target.value as 'buy' | 'sell' })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                  <select
                    value={modifyOrderForm.orderType}
                    onChange={(e) => setModifyOrderForm({ ...modifyOrderForm, orderType: e.target.value as any })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="market">Market</option>
                    <option value="limit">Limit</option>
                    <option value="stop">Stop</option>
                    <option value="stop_limit">Stop Limit</option>
                  </select>
                  {modifyOrderForm.orderType !== 'market' && (
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={modifyOrderForm.price}
                      onChange={(e) => setModifyOrderForm({ ...modifyOrderForm, price: e.target.value })}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  )}
                  {(modifyOrderForm.orderType === 'stop' || modifyOrderForm.orderType === 'stop_limit') && (
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Stop Price"
                      value={modifyOrderForm.stopPrice}
                      onChange={(e) => setModifyOrderForm({ ...modifyOrderForm, stopPrice: e.target.value })}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  )}
                  <select
                    value={modifyOrderForm.timeInForce}
                    onChange={(e) => setModifyOrderForm({ ...modifyOrderForm, timeInForce: e.target.value as any })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="day">Day</option>
                    <option value="gtc">GTC</option>
                    <option value="gtd">GTD</option>
                    <option value="ioc">IOC</option>
                    <option value="fok">FOK</option>
                  </select>
                  <select
                    value={modifyOrderForm.assetType}
                    onChange={(e) => setModifyOrderForm({ ...modifyOrderForm, assetType: e.target.value as any })}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="Equity">Equity</option>
                    <option value="Equity Option">Equity Option</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Futures">Futures</option>
                    <option value="Futures Option">Futures Option</option>
                  </select>
                </div>
                <button
                  onClick={handleModifyOrder}
                  disabled={isLoading || !finatic || !modifyOrderForm.orderId}
                  className="btn btn-primary mb-6"
                >
                  {isLoading ? 'Modifying...' : 'Modify Order'}
                </button>
                {modifyOrderResponse && (
                  <div className="bg-gray-50 rounded-md p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Modify Response</h3>
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(modifyOrderResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={`fixed top-0 right-0 h-full bg-gray-900 text-white shadow-lg transition-all duration-300 ${consoleOpen ? 'w-96' : 'w-10'} flex flex-col z-50`}>
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 cursor-pointer" onClick={() => setConsoleOpen((open) => !open)}>
          <span className="font-mono text-sm truncate">Console</span>
          <div className="flex items-center space-x-2">
            {consoleOpen && (
              <button
                onClick={(e) => { e.stopPropagation(); setLogs([]); }}
                className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
              >
                Clear
              </button>
            )}
            <span className="text-xs">{consoleOpen ? '◨' : '◧'}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto font-mono text-xs px-3 py-2">
          {logs.length === 0 ? (
            <div className="text-gray-400">No logs yet.</div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className={`mb-1 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-gray-200'}`}>[{log.timestamp}] {log.type.toUpperCase()}: {log.message}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 