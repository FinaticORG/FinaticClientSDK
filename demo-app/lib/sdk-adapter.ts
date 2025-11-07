/**
 * SDK Adapter - Unified Interface for Multiple SDK Types
 *
 * This module provides a unified adapter pattern that allows the demo app to work with
 * different SDK implementations (client SDK, Python server SDK, Node server SDK) through
 * a single interface.
 *
 * ## Architecture
 *
 * The `SdkAdapter` interface is **automatically generated** from the `FinaticConnect` class
 * using TypeScript utility types. This ensures that:
 * - When methods are added/removed from `FinaticConnect`, they're automatically reflected in `SdkAdapter`
 * - Type safety is maintained across all SDK implementations
 * - No manual interface maintenance is required
 *
 * ## How Auto-Generation Works
 *
 * 1. **Method Extraction**: `FunctionPropertyNames<T>` extracts all function properties from `FinaticConnect`
 * 2. **Filtering**: `FinaticConnectMethodNames` filters out:
 *    - EventEmitter methods (`on`, `off`, `emit`, etc.)
 *    - Static methods (`init`)
 *    - Private/internal methods (session management, cleanup, etc.)
 * 3. **Signature Simplification**: `SimplifiedFinaticMethods` converts all method signatures to
 *    `(...args: any[]) => Promise<any>` for adapter compatibility
 * 4. **Optional Methods**: Some methods are marked optional (convenience methods, server SDK-specific)
 * 5. **Extension**: Adapter-only methods (like `getAccountsPage`, `confirmPortalAuth`) are added
 *
 * ## SDK Types
 *
 * - **client**: Uses `FinaticConnect` directly (browser-based SDK)
 * - **python**: Makes HTTP calls to Python server SDK API (port 8002)
 * - **node**: Makes HTTP calls to Node server SDK API (port 8003)
 *
 * ## Usage
 *
 * ```typescript
 * import { createSdkAdapter, SdkType } from '@/lib/sdk-adapter';
 *
 * // Create adapter based on SDK type
 * const adapter = createSdkAdapter('client', finaticInstance);
 * // or
 * const adapter = createSdkAdapter('python', undefined, 'http://localhost:8002');
 *
 * // Use unified interface
 * const isAuthed = await adapter.isAuthenticated();
 * const orders = await adapter.getAllOrders();
 * ```
 *
 * ## Maintenance
 *
 * ### Adding a New Method to FinaticConnect
 *
 * When you add a new public method to `FinaticConnect`:
 * 1. The method is **automatically** included in `SdkAdapter`
 * 2. Both `ClientSdkAdapter` and `ApiSdkAdapter` must implement it
 * 3. TypeScript will error if implementations are missing
 *
 * ### Excluding a Method from the Adapter
 *
 * If a method exists on `FinaticConnect` but shouldn't be in the adapter, add it to the
 * exclusion list in `FinaticConnectMethodNames` (around line 26).
 *
 * ### Making a Method Optional
 *
 * Add the method name to `OptionalFinaticMethods` (around line 71) to make it optional
 * in the adapter interface. This is useful for convenience methods that not all SDKs support.
 *
 * ## Implementation Details
 *
 * - **ClientSdkAdapter**: Wraps `FinaticConnect` instance, delegates calls directly
 * - **ApiSdkAdapter**: Makes HTTP requests to server SDK endpoints, handles response normalization
 * - **Portal Flow**: Client SDK handles portal internally; server SDKs return URLs for UI to open
 * - **Error Handling**: Server SDK adapters catch errors and return empty arrays/fallbacks
 * - **Response Normalization**: `ApiSdkAdapter.makeRequest()` extracts `data` from `{success, data}` responses
 */

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

// Helper type to extract all function properties (methods) from a type
// This excludes properties that are not functions
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

// Extract all method names from FinaticConnect (excluding EventEmitter methods)
// We filter out EventEmitter methods, static methods, and internal methods
type FinaticConnectMethodNames = Exclude<
  FunctionPropertyNames<FinaticConnect>,
  // Exclude EventEmitter methods
  | 'on'
  | 'off'
  | 'once'
  | 'emit'
  | 'removeAllListeners'
  | 'listenerCount'
  | 'listeners'
  | 'rawListeners'
  | 'eventNames'
  | 'setMaxListeners'
  | 'getMaxListeners'
  // Exclude static methods
  | 'init'
  // Exclude internal/private methods that shouldn't be in the adapter
  | 'linkUserToSession'
  | 'storeUserId'
  | 'initializeWithUser'
  | 'handleCompanyAccessError'
  | 'startSession'
  | 'registerSessionCleanup'
  | 'startSessionKeepAlive'
  | 'stopSessionKeepAlive'
  | 'validateSessionKeepAlive'
  | 'shouldRefreshSession'
  | 'refreshSessionAutomatically'
  | 'handleSessionCleanup'
  | 'handleVisibilityChange'
  | 'completeSession'
  // Exclude methods that might come from EventEmitter or other sources
  | 'isAuthed'
  | 'is_authenticated'
  | 'getSessionUser'
  | 'setTradingContextBroker'
  | 'setTradingContextAccount'
  | 'getTradingContext'
  | 'clearTradingContext'
  | 'testWebhook'
>;

// Extract method signatures from FinaticConnect and simplify them
// This automatically includes all public methods from FinaticConnect
type SimplifiedFinaticMethods = {
  [K in FinaticConnectMethodNames]: FinaticConnect[K] extends (...args: any[]) => Promise<any>
    ? (...args: any[]) => Promise<any>
    : FinaticConnect[K] extends (...args: any[]) => any
      ? (...args: any[]) => any
      : never;
};

// Methods that should be optional in the adapter (not all SDKs support them)
// These are methods that exist on FinaticConnect but should be optional in the adapter
type OptionalFinaticMethods =
  | 'closePortal'
  | 'getFilledOrders'
  | 'getPendingOrders'
  | 'getOrdersBySymbol'
  | 'getOrdersByBroker'
  | 'getOpenPositions'
  | 'getPositionsBySymbol'
  | 'getPositionsByBroker'
  | 'placeStockMarketOrder'
  | 'placeStockLimitOrder'
  | 'placeStockStopOrder'
  | 'placeCryptoMarketOrder'
  | 'placeCryptoLimitOrder'
  | 'placeOptionsMarketOrder'
  | 'placeOptionsLimitOrder'
  | 'placeFuturesMarketOrder'
  | 'placeFuturesLimitOrder';

// Additional methods that don't exist on FinaticConnect but are needed for the adapter
type AdapterOnlyMethods = {
  getAccountsPage?(options?: any): Promise<any>;
  getOrdersPage?(options?: any): Promise<any>;
  getPositionsPage?(options?: any): Promise<any>;
  getBalancesPage?(options?: any): Promise<any>;
  getNextAccountsPage?(): Promise<any>;
  getNextOrdersPage?(): Promise<any>;
  getNextPositionsPage?(): Promise<any>;
  getNextBalancesPage?(): Promise<any>;
  setBroker?(broker: string): void;
  setAccount?(account: string): void;
};

// Server SDK-specific methods (not in FinaticConnect)
type ServerSdkMethods = {
  confirmPortalAuth?(): Promise<any>;
};

// Make certain methods optional
type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Generate the base adapter interface from FinaticConnect
type BaseSdkAdapter = MakeOptional<SimplifiedFinaticMethods, OptionalFinaticMethods>;

// Final SdkAdapter interface - combines FinaticConnect methods with adapter-only and server SDK extensions
export type SdkAdapter = BaseSdkAdapter & AdapterOnlyMethods & ServerSdkMethods;

// Client SDK adapter - wraps the existing FinaticConnect instance
export class ClientSdkAdapter implements SdkAdapter {
  constructor(private client: FinaticConnect) {}

  async isAuthenticated(): Promise<boolean> {
    // The compiled SDK uses snake_case method names
    // Try snake_case first (is_authenticated), then camelCase (isAuthenticated)
    if (typeof (this.client as any).is_authenticated === 'function') {
      return await (this.client as any).is_authenticated();
    }
    if (typeof (this.client as any).isAuthenticated === 'function') {
      return await (this.client as any).isAuthenticated();
    }
    // Try accessing via prototype
    const proto = Object.getPrototypeOf(this.client);
    if (proto) {
      if (typeof (proto as any).is_authenticated === 'function') {
        return await (proto as any).is_authenticated.call(this.client);
      }
      if (typeof (proto as any).isAuthenticated === 'function') {
        return await (proto as any).isAuthenticated.call(this.client);
      }
    }
    throw new Error('isAuthenticated method not accessible on FinaticConnect instance');
  }

  async getUserId(): Promise<string | null> {
    // Try camelCase first (getUserId), then snake_case (get_user_id) as fallback
    if (typeof (this.client as any).getUserId === 'function') {
      return await (this.client as any).getUserId();
    }
    if (typeof (this.client as any).get_user_id === 'function') {
      return await (this.client as any).get_user_id();
    }
    // Try accessing via prototype
    const proto = Object.getPrototypeOf(this.client);
    if (proto) {
      if (typeof (proto as any).getUserId === 'function') {
        return await (proto as any).getUserId.call(this.client);
      }
      if (typeof (proto as any).get_user_id === 'function') {
        return await (proto as any).get_user_id.call(this.client);
      }
    }
    throw new Error('getUserId method not accessible on FinaticConnect instance');
  }

  async setUserId(userId: string): Promise<void> {
    return await this.client.setUserId(userId);
  }

  async openPortal(options: PortalOptions): Promise<void> {
    // Client SDK handles portal internally with callbacks
    return await this.client.openPortal(options);
  }

  async closePortal(): Promise<void> {
    // closePortal is synchronous in FinaticConnect, but we make it async for adapter compatibility
    this.client.closePortal();
  }

  async getBrokerList(): Promise<any[]> {
    return await this.client.getBrokerList();
  }

  async getBrokerConnections(): Promise<any[]> {
    return await this.client.getBrokerConnections();
  }

  async disconnectCompany(companyId: string): Promise<void> {
    // disconnectCompany returns DisconnectCompanyResponse, but adapter expects void
    await this.client.disconnectCompany(companyId);
  }

  async getAccounts(options?: any): Promise<any> {
    // FinaticConnect.getAccounts takes (page, perPage, options?, filters?)
    // We'll extract page/perPage from options if provided, otherwise use defaults
    const page = options?.page || 1;
    const perPage = options?.per_page || 100;
    const brokerOptions = options?.options;
    const filters = options?.filter;
    return await (this.client as any).getAccounts(page, perPage, brokerOptions, filters);
  }

  async getActiveAccounts(): Promise<any[]> {
    return await this.client.getActiveAccounts();
  }

  async getAllAccounts(): Promise<any[]> {
    return await this.client.getAllAccounts();
  }

  async getAccountsPage(options?: any): Promise<any> {
    // getAccountsPage doesn't exist on FinaticConnect, delegate to getAccounts
    return await this.getAccounts(options);
  }

  async getNextAccountsPage(): Promise<any> {
    // getNextAccountsPage doesn't exist on FinaticConnect
    // Return empty result indicating no more pages
    return { data: [], hasMore: false };
  }

  async getOrders(options?: any): Promise<any> {
    // FinaticConnect.getOrders takes (page, perPage, options?, filters?)
    const page = options?.page || 1;
    const perPage = options?.per_page || 100;
    const brokerOptions = options?.options;
    const filters = options?.filter;
    return await (this.client as any).getOrders(page, perPage, brokerOptions, filters);
  }

  async getAllOrders(): Promise<any[]> {
    return await this.client.getAllOrders();
  }

  async getOrdersPage(options?: any): Promise<any> {
    // getOrdersPage doesn't exist on FinaticConnect, delegate to getOrders
    return await this.getOrders(options);
  }

  async getNextOrdersPage(): Promise<any> {
    // getNextOrdersPage doesn't exist on FinaticConnect
    return { data: [], hasMore: false };
  }

  async getFilledOrders(options?: any): Promise<any[]> {
    return await this.client.getFilledOrders();
  }

  async getPendingOrders(options?: any): Promise<any[]> {
    return await this.client.getPendingOrders();
  }

  async getOrdersBySymbol(symbol: string): Promise<any[]> {
    return await this.client.getOrdersBySymbol(symbol);
  }

  async getOrdersByBroker(broker: string): Promise<any[]> {
    return await this.client.getOrdersByBroker(broker);
  }

  async getOrderFills(orderId: string, filter?: any): Promise<any[]> {
    return await (this.client as any).getOrderFills(orderId, filter);
  }

  async getOrderEvents(orderId: string, filter?: any): Promise<any[]> {
    return await (this.client as any).getOrderEvents(orderId, filter);
  }

  async getOrderGroups(filter?: any): Promise<any[]> {
    return await (this.client as any).getOrderGroups(filter);
  }

  async getPositions(options?: any): Promise<any> {
    // FinaticConnect.getPositions takes (page, perPage, options?, filters?)
    const page = options?.page || 1;
    const perPage = options?.per_page || 100;
    const brokerOptions = options?.options;
    const filters = options?.filter;
    return await (this.client as any).getPositions(page, perPage, brokerOptions, filters);
  }

  async getAllPositions(): Promise<any[]> {
    return await this.client.getAllPositions();
  }

  async getPositionsPage(options?: any): Promise<any> {
    // getPositionsPage doesn't exist on FinaticConnect, delegate to getPositions
    return await this.getPositions(options);
  }

  async getNextPositionsPage(): Promise<any> {
    // getNextPositionsPage doesn't exist on FinaticConnect
    return { data: [], hasMore: false };
  }

  async getOpenPositions(options?: any): Promise<any[]> {
    return await this.client.getOpenPositions();
  }

  async getPositionsBySymbol(symbol: string): Promise<any[]> {
    return await this.client.getPositionsBySymbol(symbol);
  }

  async getPositionsByBroker(broker: string): Promise<any[]> {
    return await this.client.getPositionsByBroker(broker);
  }

  async getPositionLots(filter?: any): Promise<any[]> {
    return await (this.client as any).getPositionLots(filter);
  }

  async getPositionLotFills(lotId: string, filter?: any): Promise<any[]> {
    return await (this.client as any).getPositionLotFills(lotId, filter);
  }

  async getBalances(options?: any): Promise<any> {
    // FinaticConnect.getBalances takes (page, perPage, options?, filters?)
    const page = options?.page || 1;
    const perPage = options?.per_page || 100;
    const brokerOptions = options?.options;
    const filters = options?.filter;
    return await (this.client as any).getBalances(page, perPage, brokerOptions, filters);
  }

  async getAllBalances(): Promise<any[]> {
    return await this.client.getAllBalances();
  }

  async getBalancesPage(options?: any): Promise<any> {
    // getBalancesPage doesn't exist on FinaticConnect, delegate to getBalances
    return await this.getBalances(options);
  }

  async getNextBalancesPage(): Promise<any> {
    // getNextBalancesPage doesn't exist on FinaticConnect
    return { data: [], hasMore: false };
  }

  setBroker(broker: string): void {
    // setBroker doesn't exist on FinaticConnect - this is adapter-only
    // No-op for client SDK
  }

  setAccount(account: string): void {
    // setAccount doesn't exist on FinaticConnect - this is adapter-only
    // No-op for client SDK
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
    // FinaticConnect expects 'buy' | 'sell', but adapter accepts string
    return await this.client.placeStockMarketOrder(symbol, quantity, side as 'buy' | 'sell');
  }

  async placeStockLimitOrder(
    symbol: string,
    quantity: number,
    side: string,
    price: number
  ): Promise<any> {
    return await this.client.placeStockLimitOrder(symbol, quantity, side as 'buy' | 'sell', price);
  }

  async placeStockStopOrder(
    symbol: string,
    quantity: number,
    side: string,
    stopPrice: number
  ): Promise<any> {
    return await this.client.placeStockStopOrder(
      symbol,
      quantity,
      side as 'buy' | 'sell',
      stopPrice
    );
  }

  async placeCryptoMarketOrder(symbol: string, quantity: number, side: string): Promise<any> {
    return await this.client.placeCryptoMarketOrder(symbol, quantity, side as 'buy' | 'sell');
  }

  async placeCryptoLimitOrder(
    symbol: string,
    quantity: number,
    side: string,
    price: number
  ): Promise<any> {
    return await this.client.placeCryptoLimitOrder(symbol, quantity, side as 'buy' | 'sell', price);
  }

  async placeOptionsMarketOrder(symbol: string, quantity: number, side: string): Promise<any> {
    return await this.client.placeOptionsMarketOrder(symbol, quantity, side as 'buy' | 'sell');
  }

  async placeOptionsLimitOrder(
    symbol: string,
    quantity: number,
    side: string,
    price: number
  ): Promise<any> {
    return await this.client.placeOptionsLimitOrder(
      symbol,
      quantity,
      side as 'buy' | 'sell',
      price
    );
  }

  async placeFuturesMarketOrder(symbol: string, quantity: number, side: string): Promise<any> {
    return await this.client.placeFuturesMarketOrder(symbol, quantity, side as 'buy' | 'sell');
  }

  async placeFuturesLimitOrder(
    symbol: string,
    quantity: number,
    side: string,
    price: number
  ): Promise<any> {
    return await this.client.placeFuturesLimitOrder(
      symbol,
      quantity,
      side as 'buy' | 'sell',
      price
    );
  }
}

// API SDK adapter - makes HTTP calls to server SDK APIs
export class ApiSdkAdapter implements SdkAdapter {
  private portalUrl: string | null = null;
  private portalCallbacks: PortalOptions | null = null;

  constructor(private baseUrl: string) {}

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: any
  ): Promise<T> {
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

  async isAuthenticated(): Promise<boolean> {
    try {
      // makeRequest now returns result.data directly, so for {success:true, data:true} it returns true
      const result = await this.makeRequest<boolean>('GET', '/api/session/is-authed');
      console.log('🔍 ApiSdkAdapter.isAuthenticated() result:', result, 'typeof:', typeof result);

      // result should be a boolean directly from the data field
      return Boolean(result);
    } catch (error) {
      console.error('🔍 ApiSdkAdapter.isAuthenticated() error:', error);
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
      const portalUrl =
        portalResponse.portal_url || (typeof portalResponse === 'string' ? portalResponse : '');

      if (!portalUrl) {
        console.error('Portal response:', portalResponse);
        throw new Error('No portal URL received from server');
      }

      this.portalUrl = portalUrl;

      // Trigger the onSuccess callback with the URL as userId (for UI to handle)
      // Note: For server SDKs, the portal URL is passed as userId since we don't have userId yet
      if (this.portalUrl) {
        options.onSuccess?.(this.portalUrl);
      }

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
          success: response.data.success || true,
        };
      } else if ('user_id' in response) {
        // If response is already the data object with user_id
        userInfo = {
          user_id: response.user_id || null,
          success: response.success || true,
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
      if (
        errorMsg.includes('connection_id') ||
        errorMsg.includes('not found') ||
        errorMsg.includes('400')
      ) {
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
    return Array.isArray(accounts)
      ? accounts.filter((account: any) => account.status === 'active' || account.active)
      : [];
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
        const matches =
          orderBroker === broker || orderBroker?.toLowerCase() === broker.toLowerCase();
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

  async getOrderFills(orderId: string, filter?: any): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      const result = await this.makeRequest<any[]>(
        'GET',
        `/api/trading/orders/${orderId}/fills?${params}`
      );
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('🔍 getOrderFills error:', error);
      return [];
    }
  }

  async getOrderEvents(orderId: string, filter?: any): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      const result = await this.makeRequest<any[]>(
        'GET',
        `/api/trading/orders/${orderId}/events?${params}`
      );
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('🔍 getOrderEvents error:', error);
      return [];
    }
  }

  async getOrderGroups(filter?: any): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      const result = await this.makeRequest<any[]>('GET', `/api/trading/order-groups?${params}`);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('🔍 getOrderGroups error:', error);
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

  async getPositionLots(filter?: any): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      const result = await this.makeRequest<any[]>('GET', `/api/trading/positions/lots?${params}`);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('🔍 getPositionLots error:', error);
      return [];
    }
  }

  async getPositionLotFills(lotId: string, filter?: any): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      const result = await this.makeRequest<any[]>(
        'GET',
        `/api/trading/positions/lots/${lotId}/fills?${params}`
      );
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('🔍 getPositionLotFills error:', error);
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

  async placeOrder(order: any): Promise<any> {
    return await this.makeRequest('POST', '/api/trading/order', order);
  }

  async cancelOrder(orderId: string): Promise<any> {
    return await this.makeRequest('POST', '/api/trading/order/cancel', { order_id: orderId });
  }

  async modifyOrder(orderId: string, modifications: any): Promise<any> {
    return await this.makeRequest('POST', '/api/trading/order/modify', {
      order_id: orderId,
      modifications,
    });
  }

  // Convenience order methods - these would be implemented on client, so we delegate to placeOrder with proper parameters
  async placeStockMarketOrder(symbol: string, quantity: number, side: string): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'market',
    });
  }

  async placeStockLimitOrder(
    symbol: string,
    quantity: number,
    side: string,
    price: number
  ): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'limit',
      price,
    });
  }

  async placeStockStopOrder(
    symbol: string,
    quantity: number,
    side: string,
    stopPrice: number
  ): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'stop',
      stop_price: stopPrice,
    });
  }

  async placeCryptoMarketOrder(symbol: string, quantity: number, side: string): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'market',
    });
  }

  async placeCryptoLimitOrder(
    symbol: string,
    quantity: number,
    side: string,
    price: number
  ): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'limit',
      price,
    });
  }

  async placeOptionsMarketOrder(symbol: string, quantity: number, side: string): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'market',
    });
  }

  async placeOptionsLimitOrder(
    symbol: string,
    quantity: number,
    side: string,
    price: number
  ): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'limit',
      price,
    });
  }

  async placeFuturesMarketOrder(symbol: string, quantity: number, side: string): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'market',
    });
  }

  async placeFuturesLimitOrder(
    symbol: string,
    quantity: number,
    side: string,
    price: number
  ): Promise<any> {
    return await this.placeOrder({
      symbol,
      quantity,
      side,
      order_type: 'limit',
      price,
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
export function createSdkAdapter(
  sdkType: SdkType,
  client?: FinaticConnect,
  baseUrl?: string
): SdkAdapter {
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
