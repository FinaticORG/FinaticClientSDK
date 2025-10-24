import { FinaticConnect } from '@finatic/client';

export type SdkType = 'client' | 'python' | 'node';

// Portal options interface to match client SDK expectations
export interface PortalOptions {
  brokers?: string[];
  email?: string;
  theme?: any;
  onSuccess?: (userId: string) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  onEvent?: (type: string, data: unknown) => void;
  path?: string;
  mode?: string;
}

// Main SDK adapter interface
export interface SdkAdapter {
  // Session methods
  isAuthed(): Promise<boolean>;
  getUserId(): Promise<string | null>;
  setUserId(userId: string): Promise<void>;
  getSessionUser(): Promise<any>;
  
  // Portal methods - special handling for server SDKs
  openPortal(options: PortalOptions): Promise<void>;
  closePortal?(): Promise<void>;
  confirmPortalAuth?(): Promise<any>; // For server SDKs only
  
  // Broker methods
  getBrokerList(): Promise<any[]>;
  getBrokerConnections(): Promise<any[]>;
  disconnectCompany(companyId: string): Promise<void>;
  
  // Account methods
  getAccounts(options?: any): Promise<any>;
  getActiveAccounts(): Promise<any[]>;
  getAllAccounts(): Promise<any[]>;
  getAccountsPage?(options?: any): Promise<any>;
  getNextAccountsPage?(): Promise<any>;
  
  // Trading methods
  getOrders(options?: any): Promise<any>;
  getAllOrders(): Promise<any[]>;
  getOrdersPage?(options?: any): Promise<any>;
  getNextOrdersPage?(): Promise<any>;
  getFilledOrders?(options?: any): Promise<any[]>;
  getPendingOrders?(options?: any): Promise<any[]>;
  getOrdersBySymbol?(symbol: string): Promise<any[]>;
  getOrdersByBroker?(broker: string): Promise<any[]>;
  
  // Position methods
  getPositions(options?: any): Promise<any>;
  getAllPositions(): Promise<any[]>;
  getPositionsPage?(options?: any): Promise<any>;
  getNextPositionsPage?(): Promise<any>;
  getOpenPositions?(options?: any): Promise<any[]>;
  getPositionsBySymbol?(symbol: string): Promise<any[]>;
  getPositionsByBroker?(broker: string): Promise<any[]>;
  
  // Balance methods
  getBalances(options?: any): Promise<any>;
  getAllBalances(): Promise<any[]>;
  getBalancesPage?(options?: any): Promise<any>;
  getNextBalancesPage?(): Promise<any>;
  
  // Trading context
  setBroker(broker: string): void;
  setAccount(account: string): void;
  getTradingContext(): any;
  clearTradingContext?(): void;
  
  // Order operations
  placeOrder(order: any): Promise<any>;
  cancelOrder(orderId: string): Promise<any>;
  modifyOrder(orderId: string, modifications: any): Promise<any>;
  
  // Convenience order methods
  placeStockMarketOrder?(symbol: string, quantity: number, side: string): Promise<any>;
  placeStockLimitOrder?(symbol: string, quantity: number, side: string, price: number): Promise<any>;
  placeStockStopOrder?(symbol: string, quantity: number, side: string, stopPrice: number): Promise<any>;
  placeCryptoMarketOrder?(symbol: string, quantity: number, side: string): Promise<any>;
  placeCryptoLimitOrder?(symbol: string, quantity: number, side: string, price: number): Promise<any>;
  placeOptionsMarketOrder?(symbol: string, quantity: number, side: string): Promise<any>;
  placeOptionsLimitOrder?(symbol: string, quantity: number, side: string, price: number): Promise<any>;
  placeFuturesMarketOrder?(symbol: string, quantity: number, side: string): Promise<any>;
  placeFuturesLimitOrder?(symbol: string, quantity: number, side: string, price: number): Promise<any>;
}

// Client SDK adapter - wraps the existing FinaticConnect instance
export class ClientSdkAdapter implements SdkAdapter {
  constructor(private client: FinaticConnect) {}

  async isAuthed(): Promise<boolean> {
    return await this.client.isAuthed();
  }

  async getUserId(): Promise<string | null> {
    return await this.client.getUserId();
  }

  async setUserId(userId: string): Promise<void> {
    return await this.client.setUserId(userId);
  }

  async getSessionUser(): Promise<any> {
    return await this.client.getSessionUser();
  }

  async openPortal(options: PortalOptions): Promise<void> {
    // Client SDK handles portal internally with callbacks
    return await (this.client as any).openPortal(options);
  }

  async closePortal(): Promise<void> {
    return await (this.client as any).closePortal();
  }

  async getBrokerList(): Promise<any[]> {
    return await this.client.getBrokerList();
  }

  async getBrokerConnections(): Promise<any[]> {
    return await this.client.getBrokerConnections();
  }

  async disconnectCompany(companyId: string): Promise<void> {
    return await this.client.disconnectCompany(companyId);
  }

  async getAccounts(options?: any): Promise<any> {
    return await this.client.getAccounts(options);
  }

  async getActiveAccounts(): Promise<any[]> {
    return await this.client.getActiveAccounts();
  }

  async getAllAccounts(): Promise<any[]> {
    return await this.client.getAllAccounts();
  }

  async getAccountsPage(options?: any): Promise<any> {
    return await this.client.getAccountsPage(options);
  }

  async getNextAccountsPage(): Promise<any> {
    return await this.client.getNextAccountsPage();
  }

  async getOrders(options?: any): Promise<any> {
    return await this.client.getOrders(options);
  }

  async getAllOrders(): Promise<any[]> {
    return await this.client.getAllOrders();
  }

  async getOrdersPage(options?: any): Promise<any> {
    return await this.client.getOrdersPage(options);
  }

  async getNextOrdersPage(): Promise<any> {
    return await this.client.getNextOrdersPage();
  }

  async getFilledOrders(options?: any): Promise<any[]> {
    return await this.client.getFilledOrders(options);
  }

  async getPendingOrders(options?: any): Promise<any[]> {
    return await this.client.getPendingOrders(options);
  }

  async getOrdersBySymbol(symbol: string): Promise<any[]> {
    return await this.client.getOrdersBySymbol(symbol);
  }

  async getOrdersByBroker(broker: string): Promise<any[]> {
    return await this.client.getOrdersByBroker(broker);
  }

  async getPositions(options?: any): Promise<any> {
    return await this.client.getPositions(options);
  }

  async getAllPositions(): Promise<any[]> {
    return await this.client.getAllPositions();
  }

  async getPositionsPage(options?: any): Promise<any> {
    return await this.client.getPositionsPage(options);
  }

  async getNextPositionsPage(): Promise<any> {
    return await this.client.getNextPositionsPage();
  }

  async getOpenPositions(options?: any): Promise<any[]> {
    return await this.client.getOpenPositions(options);
  }

  async getPositionsBySymbol(symbol: string): Promise<any[]> {
    return await this.client.getPositionsBySymbol(symbol);
  }

  async getPositionsByBroker(broker: string): Promise<any[]> {
    return await this.client.getPositionsByBroker(broker);
  }

  async getBalances(options?: any): Promise<any> {
    return await this.client.getBalances(options);
  }

  async getAllBalances(): Promise<any[]> {
    return await this.client.getAllBalances();
  }

  async getBalancesPage(options?: any): Promise<any> {
    return await this.client.getBalancesPage(options);
  }

  async getNextBalancesPage(): Promise<any> {
    return await this.client.getNextBalancesPage();
  }

  setBroker(broker: string): void {
    (this.client as any).setBroker(broker);
  }

  setAccount(account: string): void {
    (this.client as any).setAccount(account);
  }

  getTradingContext(): any {
    return (this.client as any).getTradingContext();
  }

  clearTradingContext(): void {
    (this.client as any).clearTradingContext();
  }

  async placeOrder(order: any): Promise<any> {
    return await this.client.placeOrder(order);
  }

  async cancelOrder(orderId: string): Promise<any> {
    return await this.client.cancelOrder(orderId);
  }

  async modifyOrder(orderId: string, modifications: any): Promise<any> {
    return await this.client.modifyOrder(orderId, modifications);
  }

  async placeStockMarketOrder(symbol: string, quantity: number, side: string): Promise<any> {
    return await this.client.placeStockMarketOrder(symbol, quantity, side);
  }

  async placeStockLimitOrder(symbol: string, quantity: number, side: string, price: number): Promise<any> {
    return await this.client.placeStockLimitOrder(symbol, quantity, side, price);
  }

  async placeStockStopOrder(symbol: string, quantity: number, side: string, stopPrice: number): Promise<any> {
    return await this.client.placeStockStopOrder(symbol, quantity, side, stopPrice);
  }

  async placeCryptoMarketOrder(symbol: string, quantity: number, side: string): Promise<any> {
    return await this.client.placeCryptoMarketOrder(symbol, quantity, side);
  }

  async placeCryptoLimitOrder(symbol: string, quantity: number, side: string, price: number): Promise<any> {
    return await this.client.placeCryptoLimitOrder(symbol, quantity, side, price);
  }

  async placeOptionsMarketOrder(symbol: string, quantity: number, side: string): Promise<any> {
    return await this.client.placeOptionsMarketOrder(symbol, quantity, side);
  }

  async placeOptionsLimitOrder(symbol: string, quantity: number, side: string, price: number): Promise<any> {
    return await this.client.placeOptionsLimitOrder(symbol, quantity, side, price);
  }

  async placeFuturesMarketOrder(symbol: string, quantity: number, side: string): Promise<any> {
    return await this.client.placeFuturesMarketOrder(symbol, quantity, side);
  }

  async placeFuturesLimitOrder(symbol: string, quantity: number, side: string, price: number): Promise<any> {
    return await this.client.placeFuturesLimitOrder(symbol, quantity, side, price);
  }
}

// API SDK adapter - makes HTTP calls to server SDK APIs
export class ApiSdkAdapter implements SdkAdapter {
  private portalUrl: string | null = null;
  private portalCallbacks: PortalOptions | null = null;

  constructor(private baseUrl: string) {}

  private async makeRequest<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, body?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('🔍 makeRequest result for', endpoint, ':', result);
    
    // Handle response format consistently
    if (result && typeof result === 'object' && 'data' in result) {
      // Return the data field, even if it's falsy, to maintain consistency
      console.log('🔍 makeRequest returning data:', result.data);
      return result.data;
    } else {
      // Return the full result if it doesn't have a data field
      console.log('🔍 makeRequest returning full result:', result);
      return result;
    }
  }

  async isAuthed(): Promise<boolean> {
    try {
      // makeRequest now returns result.data directly, so for {success:true, data:true} it returns true
      const result = await this.makeRequest<boolean>('GET', '/api/session/is-authed');
      console.log('🔍 ApiSdkAdapter.isAuthed() result:', result, 'typeof:', typeof result);
      
      // result should be a boolean directly from the data field
      return Boolean(result);
    } catch (error) {
      console.error('🔍 ApiSdkAdapter.isAuthed() error:', error);
      return false;
    }
  }

  async getUserId(): Promise<string | null> {
    try {
      // makeRequest now returns result.data directly, so for {success:true, data:"user_id"} it returns "user_id"
      const result = await this.makeRequest<string>('GET', '/api/session/user-id');
      console.log('🔍 ApiSdkAdapter.getUserId() result:', result, 'typeof:', typeof result);
      return result || null;
    } catch (error) {
      console.error('🔍 ApiSdkAdapter.getUserId() error:', error);
      return null;
    }
  }

  async setUserId(userId: string): Promise<void> {
    await this.makeRequest('POST', '/api/session/authenticate', { user_id: userId });
  }

  async getSessionUser(): Promise<any> {
    return await this.makeRequest('GET', '/api/session/user');
  }

  async openPortal(options: PortalOptions): Promise<void> {
    // Store callbacks for later use
    this.portalCallbacks = options;
    
    // Get portal URL from server SDK with optional parameters
    try {
      // Build URL with query parameters
      const urlParams = new URLSearchParams();
      if (options.brokers && options.brokers.length > 0) {
        urlParams.append('brokers', options.brokers.join(','));
      }
      if (options.email) {
        urlParams.append('email', options.email);
      }
      if (options.theme?.preset) {
        urlParams.append('theme_preset', options.theme.preset);
      }
      
      const endpoint = `/api/session/portal-url${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
      const portalResponse = await this.makeRequest<any>('GET', endpoint);
      
      // The makeRequest method returns result.data || result, so portalResponse should be {portal_url: "..."}
      const portalUrl = portalResponse.portal_url || (typeof portalResponse === 'string' ? portalResponse : '');
      
      if (!portalUrl) {
        console.error('Portal response:', portalResponse);
        throw new Error('No portal URL received from server');
      }
      
      this.portalUrl = portalUrl;
      
      // Trigger the onSuccess callback with the URL (for UI to handle)
      options.onSuccess?.(this.portalUrl);
      
      // Note: Server SDK flow requires UI to open iframe and show confirm button
      // The actual authentication confirmation happens in confirmPortalAuth()
    } catch (error) {
      console.error('Portal error:', error);
      options.onError?.(error as Error);
    }
  }

  async confirmPortalAuth(): Promise<any> {
    // This is the server SDK specific method to confirm authentication
    const response = await this.makeRequest<any>('POST', '/api/session/confirm-auth');
    
    console.log('🔍 confirmPortalAuth response:', response);
    console.log('🔍 confirmPortalAuth response type:', typeof response);
    
    // Handle different response formats
    let userInfo: any;
    
    if (typeof response === 'object' && response !== null) {
      // If response is the full API response object like {success: true, data: {...}}
      if ('data' in response && response.data && typeof response.data === 'object') {
        // Extract from response.data
        userInfo = {
          user_id: response.data.user_id || null,
          company_id: response.data.company_id || null,
          success: true
        };
      } else if ('user_id' in response) {
        // If response is already the data object with user_id
        userInfo = {
          user_id: response.user_id || null,
          company_id: response.company_id || null,
          success: true
        };
      } else {
        // Fallback - return error info
        console.error('🔍 Unexpected response format:', response);
        throw new Error('Unexpected response format from confirm-auth endpoint');
      }
    } else {
      console.error('🔍 Response is not an object:', response);
      throw new Error('Invalid response from confirm-auth endpoint');
    }
    
    console.log('🔍 confirmPortalAuth userInfo:', userInfo);
    
    return userInfo;
  }

  async closePortal(): Promise<void> {
    // Server SDKs don't have a close portal concept since they just return URLs
    // This is a no-op for server SDKs
    console.log('closePortal called on server SDK - no action needed');
  }

  async getBrokerList(): Promise<any[]> {
    const result = await this.makeRequest<any[]>('GET', '/api/broker/list');
    return Array.isArray(result) ? result : [];
  }

  async getBrokerConnections(): Promise<any[]> {
    const result = await this.makeRequest<any[]>('GET', '/api/broker/connections');
    return Array.isArray(result) ? result : [];
  }

  async disconnectCompany(companyId: string): Promise<void> {
    try {
      if (!companyId || !companyId.trim()) {
        console.log('🔍 disconnectCompany called with empty companyId - skipping');
        return;
      }
      await this.makeRequest('POST', '/api/broker/disconnect', { connection_id: companyId });
    } catch (error) {
      console.error('🔍 disconnectCompany error:', error);
      // In demo environment, don't fail if connection doesn't exist or other validation errors
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes('connection_id') || errorMsg.includes('not found') || errorMsg.includes('400')) {
        console.log('🔍 disconnectCompany failed but continuing (expected in demo)');
        return;
      }
      throw error; // Re-throw unexpected errors
    }
  }

  async getAccounts(options?: any): Promise<any> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.per_page) params.append('per_page', options.per_page.toString());
    if (options?.filter) params.append('filter', options.filter);
    
    return await this.makeRequest('GET', `/api/broker/accounts?${params}`);
  }

  async getActiveAccounts(): Promise<any[]> {
    // Get all accounts and filter active ones based on server SDK response format
    const accounts = await this.getAllAccounts();
    return Array.isArray(accounts) ? accounts.filter((account: any) => account.status === 'active' || account.active) : [];
  }

  async getAllAccounts(): Promise<any[]> {
    const result = await this.makeRequest<any[]>('GET', '/api/broker/accounts/all');
    return Array.isArray(result) ? result : [];
  }

  async getAccountsPage(options?: any): Promise<any> {
    return await this.getAccounts(options);
  }

  async getOrders(options?: any): Promise<any> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.per_page) params.append('per_page', options.per_page.toString());
    if (options?.filter) params.append('filter', options.filter);
    
    return await this.makeRequest('GET', `/api/trading/orders?${params}`);
  }

  async getAllOrders(): Promise<any[]> {
    try {
      const result = await this.makeRequest<any[]>('GET', '/api/trading/orders/all');
      console.log('🔍 getAllOrders result:', result, 'type:', typeof result);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('🔍 getAllOrders error:', error);
      return [];
    }
  }

  async getOrdersPage(options?: any): Promise<any> {
    return await this.getOrders(options);
  }

  async getFilledOrders(options?: any): Promise<any[]> {
    try {
      const allOrders = await this.getAllOrders();
      if (!Array.isArray(allOrders)) {
        console.log('🔍 getFilledOrders: allOrders is not array:', allOrders);
        return [];
      }
      const filtered = allOrders.filter((order: any) => {
        const status = order?.status || order?.state;
        const isFilled = status === 'filled' || status === 'completed';
        console.log('🔍 order status check:', { order, status, isFilled });
        return isFilled;
      });
      console.log('🔍 getFilledOrders result:', filtered.length, 'from', allOrders.length);
      return filtered;
    } catch (error) {
      console.error('🔍 getFilledOrders error:', error);
      return [];
    }
  }

  async getPendingOrders(options?: any): Promise<any[]> {
    try {
      const allOrders = await this.getAllOrders();
      if (!Array.isArray(allOrders)) {
        console.log('🔍 getPendingOrders: allOrders is not array:', allOrders);
        return [];
      }
      const filtered = allOrders.filter((order: any) => {
        const status = order?.status || order?.state;
        const isPending = status === 'pending' || status === 'submitted' || status === 'open';
        console.log('🔍 order status check:', { order, status, isPending });
        return isPending;
      });
      console.log('🔍 getPendingOrders result:', filtered.length, 'from', allOrders.length);
      return filtered;
    } catch (error) {
      console.error('🔍 getPendingOrders error:', error);
      return [];
    }
  }

  async getOrdersBySymbol(symbol: string): Promise<any[]> {
    try {
      const allOrders = await this.getAllOrders();
      if (!Array.isArray(allOrders)) {
        console.log('🔍 getOrdersBySymbol: allOrders is not array:', allOrders);
        return [];
      }
      const filtered = allOrders.filter((order: any) => {
        const orderSymbol = order?.symbol || order?.instrument?.symbol;
        const matches = orderSymbol === symbol;
        console.log('🔍 symbol check:', { orderSymbol, symbol, matches });
        return matches;
      });
      console.log('🔍 getOrdersBySymbol result:', filtered.length, 'from', allOrders.length);
      return filtered;
    } catch (error) {
      console.error('🔍 getOrdersBySymbol error:', error);
      return [];
    }
  }

  async getOrdersByBroker(broker: string): Promise<any[]> {
    try {
      const allOrders = await this.getAllOrders();
      if (!Array.isArray(allOrders)) {
        console.log('🔍 getOrdersByBroker: allOrders is not array:', allOrders);
        return [];
      }
      const filtered = allOrders.filter((order: any) => {
        const orderBroker = order?.broker || order?.broker_id || order?.account?.broker;
        const matches = orderBroker === broker || orderBroker?.toLowerCase() === broker.toLowerCase();
        console.log('🔍 broker check:', { orderBroker, broker, matches });
        return matches;
      });
      console.log('🔍 getOrdersByBroker result:', filtered.length, 'from', allOrders.length);
      return filtered;
    } catch (error) {
      console.error('🔍 getOrdersByBroker error:', error);
      return [];
    }
  }

  async getPositions(options?: any): Promise<any> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.per_page) params.append('per_page', options.per_page.toString());
    if (options?.filter) params.append('filter', options.filter);
    
    return await this.makeRequest('GET', `/api/trading/positions?${params}`);
  }

  async getAllPositions(): Promise<any[]> {
    try {
      const result = await this.makeRequest<any[]>('GET', '/api/trading/positions/all');
      console.log('🔍 getAllPositions result:', result, 'type:', typeof result);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('🔍 getAllPositions error:', error);
      return [];
    }
  }

  async getPositionsPage(options?: any): Promise<any> {
    return await this.getPositions(options);
  }

  async getOpenPositions(options?: any): Promise<any[]> {
    try {
      const allPositions = await this.getAllPositions();
      if (!Array.isArray(allPositions)) {
        console.log('🔍 getOpenPositions: allPositions is not array:', allPositions);
        return [];
      }
      const filtered = allPositions.filter((pos: any) => {
        const quantity = pos?.quantity || pos?.size || pos?.qty;
        const isOpen = quantity && Number(quantity) !== 0;
        console.log('🔍 position quantity check:', { pos, quantity, isOpen });
        return isOpen;
      });
      console.log('🔍 getOpenPositions result:', filtered.length, 'from', allPositions.length);
      return filtered;
    } catch (error) {
      console.error('🔍 getOpenPositions error:', error);
      return [];
    }
  }

  async getPositionsBySymbol(symbol: string): Promise<any[]> {
    try {
      const allPositions = await this.getAllPositions();
      if (!Array.isArray(allPositions)) {
        console.log('🔍 getPositionsBySymbol: allPositions is not array:', allPositions);
        return [];
      }
      const filtered = allPositions.filter((pos: any) => {
        const posSymbol = pos?.symbol || pos?.instrument?.symbol;
        const matches = posSymbol === symbol;
        console.log('🔍 position symbol check:', { posSymbol, symbol, matches });
        return matches;
      });
      console.log('🔍 getPositionsBySymbol result:', filtered.length, 'from', allPositions.length);
      return filtered;
    } catch (error) {
      console.error('🔍 getPositionsBySymbol error:', error);
      return [];
    }
  }

  async getPositionsByBroker(broker: string): Promise<any[]> {
    try {
      const allPositions = await this.getAllPositions();
      if (!Array.isArray(allPositions)) {
        console.log('🔍 getPositionsByBroker: allPositions is not array:', allPositions);
        return [];
      }
      const filtered = allPositions.filter((pos: any) => {
        const posBroker = pos?.broker || pos?.broker_id || pos?.account?.broker;
        const matches = posBroker === broker || posBroker?.toLowerCase() === broker.toLowerCase();
        console.log('🔍 position broker check:', { posBroker, broker, matches });
        return matches;
      });
      console.log('🔍 getPositionsByBroker result:', filtered.length, 'from', allPositions.length);
      return filtered;
    } catch (error) {
      console.error('🔍 getPositionsByBroker error:', error);
      return [];
    }
  }

  async getBalances(options?: any): Promise<any> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.per_page) params.append('per_page', options.per_page.toString());
    if (options?.filter) params.append('filter', options.filter);
    
    return await this.makeRequest('GET', `/api/trading/balances?${params}`);
  }

  async getAllBalances(): Promise<any[]> {
    try {
      const result = await this.makeRequest<any[]>('GET', '/api/trading/balances/all');
      console.log('🔍 getAllBalances result:', result, 'type:', typeof result);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('🔍 getAllBalances error:', error);
      return [];
    }
  }

  async getBalancesPage(options?: any): Promise<any> {
    return await this.getBalances(options);
  }

  // Trading context methods (these are synchronous in client SDK, so we store locally)
  private tradingContext: { broker?: string; account?: string } = {};

  setBroker(broker: string): void {
    this.tradingContext.broker = broker;
    // Make API call to set broker context on server
    this.makeRequest('POST', '/api/trading/context/broker', { broker }).catch(() => {
      // Ignore errors for context setting
    });
  }

  setAccount(account: string): void {
    this.tradingContext.account = account;
    // Make API call to set account context on server
    this.makeRequest('POST', '/api/trading/context/account', { account }).catch(() => {
      // Ignore errors for context setting
    });
  }

  getTradingContext(): any {
    return this.tradingContext;
  }

  async clearTradingContext(): Promise<void> {
    this.tradingContext = {};
    // Clear on server as well if endpoint exists
    await this.makeRequest('DELETE', '/api/trading/context').catch(() => {
      // Ignore errors for context clearing
    });
  }

  async placeOrder(order: any): Promise<any> {
    return await this.makeRequest('POST', '/api/trading/order', order);
  }

  async cancelOrder(orderId: string): Promise<any> {
    return await this.makeRequest('POST', '/api/trading/order/cancel', { order_id: orderId });
  }

  async modifyOrder(orderId: string, modifications: any): Promise<any> {
    return await this.makeRequest('POST', '/api/trading/order/modify', { order_id: orderId, modifications });
  }

  // Convenience order methods - these would be implemented on client, so we delegate to placeOrder with proper parameters
  async placeStockMarketOrder(symbol: string, quantity: number, side: string): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'market'
    });
  }

  async placeStockLimitOrder(symbol: string, quantity: number, side: string, price: number): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'limit',
      price
    });
  }

  async placeStockStopOrder(symbol: string, quantity: number, side: string, stopPrice: number): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'stop',
      stop_price: stopPrice
    });
  }

  async placeCryptoMarketOrder(symbol: string, quantity: number, side: string): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'market'
    });
  }

  async placeCryptoLimitOrder(symbol: string, quantity: number, side: string, price: number): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'limit',
      price
    });
  }

  async placeOptionsMarketOrder(symbol: string, quantity: number, side: string): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'market'
    });
  }

  async placeOptionsLimitOrder(symbol: string, quantity: number, side: string, price: number): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'limit',
      price
    });
  }

  async placeFuturesMarketOrder(symbol: string, quantity: number, side: string): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'market'
    });
  }

  async placeFuturesLimitOrder(symbol: string, quantity: number, side: string, price: number): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'limit',
      price
    });
  }

  // Pagination methods - for now return empty results for server SDKs since pagination state is not tracked
  async getNextAccountsPage(): Promise<any> {
    console.log('getNextAccountsPage called on server SDK - returning empty result');
    return { data: [], hasMore: false };
  }

  async getNextOrdersPage(): Promise<any> {
    console.log('getNextOrdersPage called on server SDK - returning empty result');
    return { data: [], hasMore: false };
  }

  async getNextPositionsPage(): Promise<any> {
    console.log('getNextPositionsPage called on server SDK - returning empty result');
    return { data: [], hasMore: false };
  }

  async getNextBalancesPage(): Promise<any> {
    console.log('getNextBalancesPage called on server SDK - returning empty result');
    return { data: [], hasMore: false };
  }
}

// Factory function to create the appropriate adapter
export function createSdkAdapter(sdkType: SdkType, client?: FinaticConnect, baseUrl?: string): SdkAdapter {
  switch (sdkType) {
    case 'client':
      if (!client) {
        throw new Error('FinaticConnect client instance required for client SDK mode');
      }
      return new ClientSdkAdapter(client);
    case 'python':
      return new ApiSdkAdapter(baseUrl || 'http://localhost:8002');
    case 'node':
      return new ApiSdkAdapter(baseUrl || 'http://localhost:8003');
    default:
      throw new Error(`Unknown SDK type: ${sdkType}`);
  }
}

// Check if API server is running
export async function checkApiServerStatus(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch (error) {
    // Silently handle connection refused, CORS, and other network errors
    // These are expected when servers are offline
    return false;
  }
}