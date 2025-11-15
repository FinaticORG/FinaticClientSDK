/**
 * Main client class for Finatic Client SDK.
 * 
 * This file is regenerated on each run - do not edit directly.
 * For custom logic, extend this class or use custom wrappers.
 */

import { Configuration } from './configuration';
import { SdkConfig, defaultConfig } from './config';
import { appendThemeToURL, appendBrokerFilterToURL } from './utils/url-utils';
import { EventEmitter } from './utils/events';
import { PortalUI } from './portal/PortalUI';
import { BrokersApi } from './api/brokers-api';
import { MarketDataApi } from './api/market-data-api';
import { SessionApi } from './api/session-api';
import { BrokersWrapper } from './wrappers/brokers';
import { MarketDataWrapper } from './wrappers/market-data';
import { SessionWrapper } from './wrappers/session';

export interface FinaticConnectOptions {
  token: string;
  baseUrl?: string;
  sdkConfig?: Partial<SdkConfig>;
}

export interface PortalOptions {
  theme?: string | { preset?: string; custom?: Record<string, unknown> };
  brokers?: string[];
  email?: string;
  onSuccess?: (userId: string) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export class FinaticConnect extends EventEmitter {
  private static instance: FinaticConnect | null = null;
  private config: Configuration;
  private sdkConfig: SdkConfig;
  private options: FinaticConnectOptions;
  private sessionId?: string;
  private companyId?: string;
  private csrfToken?: string;
  private portalUI?: PortalUI;
  private userId?: string;

  public readonly brokers: BrokersWrapper;
  public readonly marketData: MarketDataWrapper;
  public readonly session: SessionWrapper;

  constructor(options: FinaticConnectOptions) {
    super(); // Initialize EventEmitter
    this.options = options;
    this.config = new Configuration({
      basePath: options.baseUrl || 'https://api.finatic.dev',
    });
    this.sdkConfig = { ...defaultConfig, ...options.sdkConfig };

    this.brokers = new BrokersWrapper(new BrokersApi(this.config), this.config, this.sdkConfig);
    this.marketData = new MarketDataWrapper(new MarketDataApi(this.config), this.config, this.sdkConfig);
    this.session = new SessionWrapper(new SessionApi(this.config), this.config, this.sdkConfig);
  }

  /**
   * Static initialization method - creates instance and starts session.
   * This is the recommended way to initialize the Client SDK.
   */
  static async init(
    token: string,
    userId?: string,
    options?: { baseUrl?: string; sdkConfig?: Partial<SdkConfig> }
  ): Promise<FinaticConnect> {
    // Clear instance if it exists but has no valid session (Safari compatibility)
    if (FinaticConnect.instance && !FinaticConnect.instance.sessionId) {
      FinaticConnect.instance = null;
    }

    if (!FinaticConnect.instance) {
      const connectOptions: FinaticConnectOptions = {
        token,
        baseUrl: options?.baseUrl || 'https://api.finatic.dev',
        ...(options?.sdkConfig ? { sdkConfig: options.sdkConfig } : {}),
      };

      FinaticConnect.instance = new FinaticConnect(connectOptions);

      // Start session with the token
      await FinaticConnect.instance.startSession(token, userId);
    }

    return FinaticConnect.instance;
  }

  /**
   * Initialize a session by getting a one-time token.
   */
  async initSession(xApiKey: string): Promise<string> {
    const response = await this.session.initSession(xApiKey);
    return response.one_time_token || '';
  }

  /**
   * Start a session with a one-time token.
   */
  async startSession(oneTimeToken: string, userId?: string): Promise<{ session_id: string; company_id: string }> {
    const requestBody = userId !== undefined ? { user_id: userId } : {};
    const response = await this.session.startSession(oneTimeToken, requestBody);
    const sessionId = response.session_id || '';
    const companyId = response.company_id || '';
    // csrf_token is not in SessionResponseData, get from response headers if available
    const csrfToken = (response as any).csrf_token || '';
    
    if (sessionId && companyId) {
      this.setSessionContext(sessionId, companyId, csrfToken);
    }
    
    return { session_id: sessionId, company_id: companyId };
  }

  /**
   * Get portal URL with optional theme and broker filters.
   * This is where URL manipulation happens (not in session wrapper).
   * Returns the URL - app can use it as needed.
   * 
   * Note: For Client SDK, use openPortal() to open in iframe directly.
   */
  async getPortalUrl(options?: PortalOptions): Promise<string> {
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Get raw portal URL from session wrapper
    const response = await this.session.getPortalUrl();
    let portalUrl = response.portal_url || '';

    // Append theme if provided
    if (options?.theme) {
      portalUrl = appendThemeToURL(portalUrl, options.theme);
    }

    // Append broker filter if provided
    if (options?.brokers) {
      portalUrl = appendBrokerFilterToURL(portalUrl, options.brokers);
    }

    // Append email if provided
    if (options?.email) {
      const url = new URL(portalUrl);
      url.searchParams.set('email', options.email);
      portalUrl = url.toString();
    }

    // Add session ID and company ID to URL
    const url = new URL(portalUrl);
    if (this.sessionId) {
      url.searchParams.set('session_id', this.sessionId);
    }
    if (this.companyId) {
      url.searchParams.set('company_id', this.companyId);
    }

    return url.toString();
  }

  /**
   * Open portal in iframe (Client SDK only).
   * The portal handles user authentication and linking to session at the source of truth.
   * This method just records the userId for SDK state.
   */
  async openPortal(options?: PortalOptions): Promise<void> {
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Get portal URL with all parameters
    const portalUrl = await this.getPortalUrl(options);

    // Create portal UI if not exists
    if (!this.portalUI) {
      this.portalUI = new PortalUI(this.options.baseUrl || 'https://api.finatic.dev');
    }

    // Show portal with event handlers
    this.portalUI.show(portalUrl, this.sessionId, {
      onSuccess: (userId: string) => {
        // Store userId for SDK state (portal already linked user to session)
        this.userId = userId;
        
        // Emit portal success event
        this.emit('portal:success', userId);
        
        // Call optional callback
        options?.onSuccess?.(userId);
      },
      onError: (error: Error) => {
        // Emit portal error event
        this.emit('portal:error', error);
        
        // Call optional callback
        options?.onError?.(error);
      },
      onClose: () => {
        // Emit portal close event
        this.emit('portal:close');
        
        // Call optional callback
        options?.onClose?.();
      },
    });
  }

  /**
   * Close the portal iframe.
   */
  closePortal(): void {
    if (this.portalUI) {
      this.portalUI.hide();
      this.emit('portal:close');
    }
  }

  /**
   * Get current user ID (set after portal authentication).
   */
  getUserId(): string | undefined {
    return this.userId;
  }

  /**
   * Get session user information after portal authentication.
   */
  async getSessionUser(): Promise<{ user_id: string; company_id: string; token_type: string }> {
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }
    
    const response = await this.session.getSessionUser(this.sessionId);
    return {
      user_id: response.user_id || '',
      company_id: response.company_id || this.companyId || '',
      token_type: response.token_type || 'Bearer',
    };
  }

  /**
   * Set session context for all wrappers.
   */
  setSessionContext(sessionId: string, companyId: string, csrfToken: string): void {
    this.sessionId = sessionId;
    this.companyId = companyId;
    this.csrfToken = csrfToken;
    
    // Update all wrappers with session context
    this.brokers.setSessionContext(sessionId, companyId, csrfToken);
    this.marketData.setSessionContext(sessionId, companyId, csrfToken);
    this.session.setSessionContext(sessionId, companyId, csrfToken);
  }

  /**
   * Get current session ID.
   */
  getSessionId(): string | undefined {
    return this.sessionId;
  }

  /**
   * Get current company ID.
   */
  getCompanyId(): string | undefined {
    return this.companyId;
  }


  /**
   * Check if user is authenticated.
   */
  isAuthenticated(): boolean {
    return !!(this.userId && this.sessionId);
  }

  /**
   * Alias for isAuthenticated().
   */
  isAuthed(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Get list of supported brokers.
   */
  async getBrokerList(): Promise<any[]> {
    const response = await this.brokers.getBrokers();
    const baseUrl = this.config.basePath?.replace('/api/v1', '') || this.options.baseUrl?.replace('/api/v1', '') || 'https://api.finatic.dev';
    
    // Transform broker list to include full logo URLs
    if (Array.isArray(response)) {
      return response.map((broker: any) => ({
        ...broker,
        logo_path: broker.logo_path ? `${baseUrl}${broker.logo_path}` : '',
      }));
    }
    
    // Handle FinaticResponse wrapper if present
    if (response && typeof response === 'object' && 'response_data' in response) {
      const responseData = (response as any).response_data;
      if (Array.isArray(responseData)) {
        return responseData.map((broker: any) => ({
          ...broker,
          logo_path: broker.logo_path ? `${baseUrl}${broker.logo_path}` : '',
        }));
      }
    }
    
    return response;
  }

  /**
   * Get user's broker connections.
   */
  async getBrokerConnections(): Promise<any[]> {
    return await this.brokers.listBrokerConnections();
  }

  /**
   * Get all accounts across all pages.
   */
  async getAllAccounts(filter?: any): Promise<any[]> {
    const allData: any[] = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
      const result = await this.brokers.getAccounts(undefined, undefined, undefined, undefined, undefined, limit, offset);
      if (!result || result.length === 0) break;
      allData.push(...result);
      if (result.length < limit) break;
      offset += limit;
    }
    
    return allData;
  }

  /**
   * Get all orders across all pages.
   */
  async getAllOrders(filter?: any): Promise<any[]> {
    const allData: any[] = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
      const result = await this.brokers.getOrders(undefined, undefined, undefined, filter?.symbol, filter?.orderStatus, filter?.side, filter?.assetType, limit, offset);
      if (!result || result.length === 0) break;
      allData.push(...result);
      if (result.length < limit) break;
      offset += limit;
    }
    
    return allData;
  }

  /**
   * Get all positions across all pages.
   */
  async getAllPositions(filter?: any): Promise<any[]> {
    const allData: any[] = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
      const result = await this.brokers.getPositions(undefined, undefined, undefined, filter?.symbol, filter?.side, filter?.assetType, filter?.positionStatus, limit, offset);
      if (!result || result.length === 0) break;
      allData.push(...result);
      if (result.length < limit) break;
      offset += limit;
    }
    
    return allData;
  }

  /**
   * Get all balances across all pages.
   */
  async getAllBalances(filter?: any): Promise<any[]> {
    const allData: any[] = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
      const result = await this.brokers.getBalances(undefined, undefined, undefined, filter?.isEndOfDaySnapshot, limit, offset);
      if (!result || result.length === 0) break;
      allData.push(...result);
      if (result.length < limit) break;
      offset += limit;
    }
    
    return allData;
  }

  /**
   * Get paginated accounts.
   */
  async getAccounts(page: number = 1, perPage: number = 100, filter?: any): Promise<any> {
    const offset = (page - 1) * perPage;
    return await this.brokers.getAccounts(undefined, undefined, undefined, undefined, undefined, perPage, offset);
  }

  /**
   * Get paginated orders.
   */
  async getOrders(page: number = 1, perPage: number = 100, filter?: any): Promise<any> {
    const offset = (page - 1) * perPage;
    return await this.brokers.getOrders(undefined, undefined, undefined, filter?.symbol, filter?.orderStatus, filter?.side, filter?.assetType, perPage, offset);
  }

  /**
   * Get paginated positions.
   */
  async getPositions(page: number = 1, perPage: number = 100, filter?: any): Promise<any> {
    const offset = (page - 1) * perPage;
    return await this.brokers.getPositions(undefined, undefined, undefined, filter?.symbol, filter?.side, filter?.assetType, filter?.positionStatus, perPage, offset);
  }

  /**
   * Get paginated balances.
   */
  async getBalances(page: number = 1, perPage: number = 100, filter?: any): Promise<any> {
    const offset = (page - 1) * perPage;
    return await this.brokers.getBalances(undefined, undefined, undefined, filter?.isEndOfDaySnapshot, perPage, offset);
  }

  /**
   * Get only open positions.
   */
  async getOpenPositions(filter?: any): Promise<any[]> {
    return await this.getAllPositions({ ...filter, positionStatus: 'open' });
  }

  /**
   * Get only filled orders.
   */
  async getFilledOrders(filter?: any): Promise<any[]> {
    return await this.getAllOrders({ ...filter, orderStatus: 'filled' });
  }

  /**
   * Get only pending orders.
   */
  async getPendingOrders(filter?: any): Promise<any[]> {
    return await this.getAllOrders({ ...filter, orderStatus: 'pending' });
  }

  /**
   * Get only active accounts.
   */
  async getActiveAccounts(filter?: any): Promise<any[]> {
    return await this.getAllAccounts({ ...filter, status: 'active' });
  }

  /**
   * Get orders filtered by symbol.
   */
  async getOrdersBySymbol(symbol: string, filter?: any): Promise<any[]> {
    return await this.getAllOrders({ ...filter, symbol });
  }

  /**
   * Get positions filtered by symbol.
   */
  async getPositionsBySymbol(symbol: string, filter?: any): Promise<any[]> {
    return await this.getAllPositions({ ...filter, symbol });
  }

  /**
   * Get orders filtered by broker.
   */
  async getOrdersByBroker(brokerId: string, filter?: any): Promise<any[]> {
    return await this.getAllOrders({ ...filter, brokerId });
  }

  /**
   * Get positions filtered by broker.
   */
  async getPositionsByBroker(brokerId: string, filter?: any): Promise<any[]> {
    return await this.getAllPositions({ ...filter, brokerId });
  }



  /**
   * Place a stock market order.
   */
  async placeStockMarketOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    broker?: string,
    accountNumber?: string
  ): Promise<any> {
    const orderParams: any = {
      broker: broker || 'robinhood',
      order_type: 'Market',
      asset_type: 'equity',
      action: side === 'buy' ? 'Buy' : 'Sell',
      time_in_force: 'day',
      account_number: accountNumber !== undefined ? accountNumber : '',
      symbol,
      order_qty: quantity,
    };
    return await this.brokers.placeOrder(orderParams);
  }

  /**
   * Place a stock limit order.
   */
  async placeStockLimitOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    price: number,
    timeInForce: 'day' | 'gtc' = 'gtc',
    broker?: string,
    accountNumber?: string
  ): Promise<any> {
    const orderParams: any = {
      broker: broker || 'robinhood',
      order_type: 'Limit',
      asset_type: 'equity',
      action: side === 'buy' ? 'Buy' : 'Sell',
      time_in_force: timeInForce,
      account_number: accountNumber !== undefined ? accountNumber : '',
      symbol,
      order_qty: quantity,
      price,
    };
    return await this.brokers.placeOrder(orderParams);
  }

  /**
   * Place a stock stop order.
   */
  async placeStockStopOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    stopPrice: number,
    timeInForce: 'day' | 'gtc' = 'gtc',
    broker?: string,
    accountNumber?: string
  ): Promise<any> {
    const orderParams: any = {
      broker: broker || 'robinhood',
      order_type: 'Stop',
      asset_type: 'equity',
      action: side === 'buy' ? 'Buy' : 'Sell',
      time_in_force: timeInForce,
      account_number: accountNumber !== undefined ? accountNumber : '',
      symbol,
      order_qty: quantity,
      stop_price: stopPrice,
    };
    return await this.brokers.placeOrder(orderParams);
  }

  /**
   * Place a crypto market order.
   */
  async placeCryptoMarketOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    broker?: string,
    accountNumber?: string
  ): Promise<any> {
    const orderParams: any = {
      broker: broker || 'robinhood',
      order_type: 'Market',
      asset_type: 'crypto',
      action: side === 'buy' ? 'Buy' : 'Sell',
      time_in_force: 'day',
      account_number: accountNumber !== undefined ? accountNumber : '',
      symbol,
      order_qty: quantity,
    };
    return await this.brokers.placeOrder(orderParams);
  }

  /**
   * Place a crypto limit order.
   */
  async placeCryptoLimitOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    price: number,
    timeInForce: 'day' | 'gtc' = 'gtc',
    broker?: string,
    accountNumber?: string
  ): Promise<any> {
    const orderParams: any = {
      broker: broker || 'robinhood',
      order_type: 'Limit',
      asset_type: 'crypto',
      action: side === 'buy' ? 'Buy' : 'Sell',
      time_in_force: timeInForce,
      account_number: accountNumber !== undefined ? accountNumber : '',
      symbol,
      order_qty: quantity,
      price,
    };
    return await this.brokers.placeOrder(orderParams);
  }

  /**
   * Place an options market order.
   */
  async placeOptionsMarketOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    broker?: string,
    accountNumber?: string
  ): Promise<any> {
    const orderParams: any = {
      broker: broker || 'robinhood',
      order_type: 'Market',
      asset_type: 'equity_option',
      action: side === 'buy' ? 'Buy' : 'Sell',
      time_in_force: 'day',
      account_number: accountNumber !== undefined ? accountNumber : '',
      symbol,
      order_qty: quantity,
    };
    return await this.brokers.placeOrder(orderParams);
  }

  /**
   * Place an options limit order.
   */
  async placeOptionsLimitOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    price: number,
    timeInForce: 'day' | 'gtc' = 'gtc',
    broker?: string,
    accountNumber?: string
  ): Promise<any> {
    const orderParams: any = {
      broker: broker || 'robinhood',
      order_type: 'Limit',
      asset_type: 'equity_option',
      action: side === 'buy' ? 'Buy' : 'Sell',
      time_in_force: timeInForce,
      account_number: accountNumber !== undefined ? accountNumber : '',
      symbol,
      order_qty: quantity,
      price,
    };
    return await this.brokers.placeOrder(orderParams);
  }

  /**
   * Place a futures market order.
   */
  async placeFuturesMarketOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    broker?: string,
    accountNumber?: string
  ): Promise<any> {
    const orderParams: any = {
      broker: broker || 'robinhood',
      order_type: 'Market',
      asset_type: 'future',
      action: side === 'buy' ? 'Buy' : 'Sell',
      time_in_force: 'day',
      account_number: accountNumber !== undefined ? accountNumber : '',
      symbol,
      order_qty: quantity,
    };
    return await this.brokers.placeOrder(orderParams);
  }

  /**
   * Place a futures limit order.
   */
  async placeFuturesLimitOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    price: number,
    timeInForce: 'day' | 'gtc' = 'gtc',
    broker?: string,
    accountNumber?: string
  ): Promise<any> {
    const orderParams: any = {
      broker: broker || 'robinhood',
      order_type: 'Limit',
      asset_type: 'future',
      action: side === 'buy' ? 'Buy' : 'Sell',
      time_in_force: timeInForce,
      account_number: accountNumber !== undefined ? accountNumber : '',
      symbol,
      order_qty: quantity,
      price,
    };
    return await this.brokers.placeOrder(orderParams);
  }

  /**
   * Place a generic order.
   */
  async placeOrder(orderParams: any, extras?: any): Promise<any> {
    return await this.brokers.placeOrder(orderParams, extras);
  }

  /**
   * Modify an existing order.
   */
  async modifyOrder(orderId: string, orderParams: any, extras?: any): Promise<any> {
    return await this.brokers.modifyOrder(orderId, orderParams, extras);
  }

  /**
   * Cancel an existing order.
   */
  async cancelOrder(orderId: string, accountNumber?: string, connectionId?: string): Promise<any> {
    return await this.brokers.cancelOrder(orderId, undefined, accountNumber, connectionId);
  }

}
