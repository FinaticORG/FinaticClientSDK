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

// Main SDK adapter interface
export interface SdkAdapter {
  // Session methods
  isAuthenticated(): Promise<boolean>;
  getUserId(): Promise<string | null>;
  getSessionId?(): Promise<string | undefined>;
  getCompanyId?(): Promise<string | undefined>;
  setUserId(userId: string): Promise<void>;
  
  // Portal methods - special handling for server SDKs
  openPortal(options: PortalOptions): Promise<void>;
  getPortalUrl?(options?: PortalOptions): Promise<string>;
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
  
  // Trading methods
  getOrders(options?: any): Promise<any>;
  getAllOrders(): Promise<any[]>;
  getOrdersPage?(options?: any): Promise<any>;
  getFilledOrders?(options?: any): Promise<any[]>;
  getPendingOrders?(options?: any): Promise<any[]>;
  getOrdersBySymbol?(symbol: string): Promise<any[]>;
  getOrdersByBroker?(broker: string): Promise<any[]>;
  getOrderFills(orderId: string, filter?: any): Promise<any[]>;
  getOrderEvents(orderId: string, filter?: any): Promise<any[]>;
  getOrderGroups(filter?: any): Promise<any[]>;
  getAllOrderGroups(filter?: any): Promise<any[]>;
  
  // Position methods
  getPositions(options?: any): Promise<any>;
  getAllPositions(): Promise<any[]>;
  getPositionsPage?(options?: any): Promise<any>;
  getOpenPositions?(options?: any): Promise<any[]>;
  getPositionsBySymbol?(symbol: string): Promise<any[]>;
  getPositionsByBroker?(broker: string): Promise<any[]>;
  getPositionLots(filter?: any): Promise<any[]>;
  getAllPositionLots(filter?: any): Promise<any[]>;
  getPositionLotFills(lotId: string, filter?: any): Promise<any[]>;
  
  // Balance methods
  getBalances(options?: any): Promise<any>;
  getAllBalances(): Promise<any[]>;
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

  // Helper to extract data from FinaticResponse
  private extractData<T>(response: any): T {
    if (response?.success?.data !== undefined) {
      return response.success.data as T;
    }
    // Fallback for direct data (backward compatibility)
    return response as T;
  }

  async isAuthenticated(): Promise<boolean> {
    // SDK uses isAuthed() method, not isAuthenticated()
    return this.client.isAuthed();
  }

  async getUserId(): Promise<string | null> {
    // SDK returns string | undefined, but adapter should return string | null
    const userId = this.client.getUserId();
    return userId ?? null;
  }

  async getSessionId(): Promise<string | undefined> {
    return Promise.resolve(this.client.getSessionId());
  }

  async getCompanyId(): Promise<string | undefined> {
    return Promise.resolve(this.client.getCompanyId());
  }

  async setUserId(userId: string): Promise<void> {
    return await this.client.setUserId(userId);
  }

  async openPortal(options: PortalOptions): Promise<void> {
    // Client SDK now accepts a single options object with callbacks inside
    return await this.client.openPortal({
      theme: options.theme,
      brokers: options.brokers,
      email: options.email,
      mode: options.mode as 'light' | 'dark' | undefined,
      onSuccess: options.onSuccess,
      onError: options.onError,
      onClose: options.onClose,
    });
  }

  async getPortalUrl(options?: PortalOptions): Promise<string> {
    if (!options) {
      return await this.client.getPortalUrl();
    }
    return await this.client.getPortalUrl({
      theme: options.theme,
      brokers: options.brokers,
      email: options.email,
      mode: options.mode as 'light' | 'dark' | undefined,
    });
  }

  async closePortal(): Promise<void> {
    // Client SDK doesn't have closePortal method - portal UI handles this
    return Promise.resolve();
  }

  async getBrokerList(): Promise<any[]> {
    const response = await this.client.getBrokers();
    return this.extractData<any[]>(response);
  }

  async getBrokerConnections(): Promise<any[]> {
    const response = await this.client.getBrokerConnections();
    return this.extractData<any[]>(response);
  }

  async disconnectCompany(connectionId: string): Promise<void> {
    // SDK method is disconnectCompanyFromBroker and expects { connectionId: string }
    await this.client.disconnectCompanyFromBroker({ connectionId });
  }

  async getCompany(companyId: string): Promise<any> {
    const response = await this.client.getCompany({ companyId });
    return this.extractData(response);
  }

  async getAccounts(filter?: any): Promise<any> {
    const response = await this.client.getAccounts(filter || {});
    return this.extractData(response);
  }

  async getAllAccounts(filter?: any): Promise<any[]> {
    const response = await this.client.getAllAccounts(filter || {});
    return this.extractData<any[]>(response);
  }

  async getBalances(filter?: any): Promise<any> {
    const response = await this.client.getBalances(filter || {});
    return this.extractData(response);
  }

  async getAllBalances(filter?: any): Promise<any[]> {
    const response = await this.client.getAllBalances(filter || {});
    return this.extractData<any[]>(response);
  }

  async getOrders(filter?: any): Promise<any> {
    const response = await this.client.getOrders(filter || {});
    return this.extractData(response);
  }

  async getAllOrders(filter?: any): Promise<any[]> {
    const response = await this.client.getAllOrders(filter || {});
    return this.extractData<any[]>(response);
  }

  async getPositions(filter?: any): Promise<any> {
    const response = await this.client.getPositions(filter || {});
    return this.extractData(response);
  }

  async getAllPositions(filter?: any): Promise<any[]> {
    const response = await this.client.getAllPositions(filter || {});
    return this.extractData<any[]>(response);
  }

  async getOrderFills(orderId: string, filter?: any): Promise<any> {
    const response = await this.client.getOrderFills({ orderId, ...(filter || {}) });
    return this.extractData(response);
  }

  async getOrderEvents(orderId: string, filter?: any): Promise<any> {
    const response = await this.client.getOrderEvents({ orderId, ...(filter || {}) });
    return this.extractData(response);
  }

  async getOrderGroups(filter?: any): Promise<any> {
    const response = await this.client.getOrderGroups(filter || {});
    return this.extractData(response);
  }

  async getAllOrderGroups(filter?: any): Promise<any[]> {
    const response = await this.client.getAllOrderGroups(filter || {});
    return this.extractData<any[]>(response);
  }

  async getPositionLots(filter?: any): Promise<any> {
    const response = await this.client.getPositionLots(filter || {});
    return this.extractData(response);
  }

  async getAllPositionLots(filter?: any): Promise<any[]> {
    const response = await this.client.getAllPositionLots(filter || {});
    return this.extractData<any[]>(response);
  }

  async getPositionLotFills(lotId: string, filter?: any): Promise<any> {
    const response = await this.client.getPositionLotFills({ lotId, ...(filter || {}) });
    return this.extractData(response);
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
    
    // Handle new FinaticResponse structure: { success: { data: {...}, meta: {...} }, error: null, warning: null }
    if (result && typeof result === 'object' && 'success' in result && result.success && typeof result.success === 'object' && 'data' in result.success) {
      // Return the data field from success.data
      console.log('🔍 makeRequest returning success.data:', result.success.data);
      return result.success.data;
    } else if (result && typeof result === 'object' && 'data' in result) {
      // Fallback for old format: { data: {...} }
      console.log('🔍 makeRequest returning data (fallback):', result.data);
      return result.data;
    } else {
      // Return the full result if it doesn't match expected formats
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
        urlParams.append('theme', options.theme.preset);
      }
      // Add mode only if not system (system is default, so don't pass it)
      if (options.mode && options.mode !== 'system') {
        urlParams.append('mode', options.mode);
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
    // makeRequest already extracts success.data, so response should be the data object directly
    const response = await this.makeRequest<any>('POST', '/api/session/confirm-auth');

    console.log('🔍 confirmPortalAuth response:', response);
    console.log('🔍 confirmPortalAuth response type:', typeof response);

    // Handle different response formats
    let userInfo: any;

    if (typeof response === 'object' && response !== null) {
      // Response should already be the data object (makeRequest extracts success.data)
      if ('user_id' in response) {
        // If response is the data object with user_id
        userInfo = {
          user_id: response.user_id || null,
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
