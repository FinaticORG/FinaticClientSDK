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
import type { Logger } from './utils/logger';
import { BrokersApi } from './api/brokers-api';
import { SessionApi } from './api/session-api';
import { BrokersWrapper } from './wrappers/brokers';
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
  mode?: 'light' | 'dark';
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
  private logger: Logger;

  public readonly brokers: BrokersWrapper;
  public readonly session: SessionWrapper;

  constructor(options: FinaticConnectOptions) {
    super(); // Initialize EventEmitter
    this.options = options;
    this.config = new Configuration({
      basePath: options.baseUrl || 'https://api.finatic.dev',
    });
    this.sdkConfig = { ...defaultConfig, ...options.sdkConfig };

    // Initialize logger
    try {
      const { getLogger } = require('./utils/logger');
      this.logger = getLogger(this.sdkConfig);
    } catch {
      // Fallback logger for browser environments where pino might not work correctly
      this.logger = console;
    }

    this.brokers = new BrokersWrapper(new BrokersApi(this.config), this.config, this.sdkConfig);
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
    // Use console for static method logging (instance logger will be initialized in constructor)
    const logger = console;

    logger.debug?.('FinaticConnect.init() called', {
      token: token ? `${token.substring(0, 20)}...` : 'missing',
      userId,
      hasOptions: !!options,
    });

    try {
      // Access private instance via type assertion to base class
      const baseClass = FinaticConnect as any;

      // Clear instance if it exists but has no valid session (Safari compatibility)
      if (baseClass.instance && !baseClass.instance.sessionId) {
        logger.debug?.('Clearing existing instance without sessionId');
        baseClass.instance = null;
      }

      let instance: FinaticConnect;

      if (!baseClass.instance) {
        logger.debug?.('Creating new FinaticConnect instance');
        const connectOptions: FinaticConnectOptions = {
          token,
          baseUrl: options?.baseUrl || 'https://api.finatic.dev',
          ...(options?.sdkConfig ? { sdkConfig: options.sdkConfig } : {}),
        };

        instance = new FinaticConnect(connectOptions);
        baseClass.instance = instance;

        // CRITICAL: Client SDK init() receives a one-time token directly (not an API key)
        // Unlike Server SDK, Client SDK does NOT call _initSession() - it goes straight to _startSession()
        logger.debug?.('Calling _startSession() inside init() with provided token');
        await instance._startSession(token, userId);
        logger.debug?.('_startSession() completed in init()');
      } else {
        logger.debug?.('Using existing FinaticConnect instance');
        instance = baseClass.instance as FinaticConnect;
      }

      // Verify session was initialized correctly
      const sessionId = instance.getSessionId();
      if (!sessionId) {
        const error = new Error(
          'Session initialization failed: startSession() did not return a session_id. ' +
            'Please check that the API endpoint returned a valid session response. ' +
            'The network call to /api/v1/session/start may have failed or returned an invalid response.'
        );
        logger.error?.('FinaticConnect.init() failed - no sessionId', error, {});
        throw error;
      }

      logger.debug?.('FinaticConnect.init() completed successfully', { sessionId });
      return instance;
    } catch (error) {
      // Re-throw with more context if it's a session initialization error
      if (error instanceof Error) {
        if (error.message.includes('Session not initialized')) {
          const enhancedError = new Error(
            `Failed to initialize Finatic session: ${error.message}. ` +
              'This may indicate that startSession() was called but did not successfully create a session. ' +
              'Please check the API response and ensure the one-time token is valid.'
          );
          logger.error?.('FinaticConnect.init() session initialization error', enhancedError, {});
          throw enhancedError;
        }
        logger.error?.('FinaticConnect.init() error', error, {});
      }

      // Re-throw other errors as-is
      throw error;
    }
  }

  /**
   * Start a session with a one-time token (internal/private).
   *
   * Note: Client SDK does NOT use _initSession() - the token passed to init() is already a one-time token.
   * Only Server SDKs use _initSession() to convert API keys to one-time tokens.
   */
  private async _startSession(
    oneTimeToken: string,
    userId?: string
  ): Promise<{ session_id: string; company_id: string }> {
    const requestBody = userId !== undefined ? { user_id: userId } : {};
    // Phase 2C: Use typed input object
    const response = await this.session.startSession({
      OneTimeToken: oneTimeToken,
      body: requestBody,
    });

    // Phase 2C: Unwrap standard response structure
    if (response.Error) {
      throw new Error(response.Error.message || 'Failed to start session');
    }

    const data = response.success?.data;
    const sessionId = data?.session_id || '';
    const companyId = data?.company_id || '';
    // csrf_token is not in SessionResponseData, get from response headers if available
    const csrfToken = (data as any)?.csrf_token || '';

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
    const response = await this.session.getPortalUrl({});

    // Check for errors
    if (response.Error) {
      this.logger.error?.('Failed to get portal URL', new Error(response.Error.message), {
        code: response.Error.code,
        status: response.Error.status,
      });
      throw new Error(response.Error.message || 'Failed to get portal URL');
    }

    // Validate response structure
    if (!response.success?.data?.portal_url) {
      this.logger.error?.(
        'Invalid portal URL response: missing data',
        new Error('Invalid response'),
        {}
      );
      throw new Error('Invalid portal URL response: missing portal_url');
    }

    let portalUrl = response.success.data.portal_url;

    // Validate URL before manipulation
    try {
      new URL(portalUrl);
    } catch (error) {
      this.logger.error?.('Invalid portal URL from API', error, { portalUrl });
      throw new Error(`Invalid portal URL received from API: ${portalUrl}`);
    }

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

    // Append mode if provided (light or dark)
    if (options?.mode) {
      const url = new URL(portalUrl);
      url.searchParams.set('mode', options.mode);
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

    this.logger.debug?.('Portal URL generated', { portalUrl: url.toString() });
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

  // Phase 2C: _convertToPlainObject removed - now handled in generated methods via convertToPlainObject utility

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
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async getBrokerList(): Promise<any[]> {
    const response = await this.brokers.getBrokers({});
    const brokers = response.success?.data || [];
    const baseUrl =
      this.config.basePath?.replace('/api/v1', '') ||
      this.options.baseUrl?.replace('/api/v1', '') ||
      'https://api.finatic.dev';

    // Transform broker list to include full logo URLs
    return brokers.map((broker: any) => ({
      ...broker,
      logo_path: broker.logo_path ? `${baseUrl}${broker.logo_path}` : '',
    }));
  }

  /**
   * Get user's broker connections.
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async getBrokerConnections(): Promise<any[]> {
    const response = await this.brokers.listBrokerConnections({});
    return response.success?.data || [];
  }

  /**
   * Get all accounts across all pages.
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async getAllAccounts(filter?: any): Promise<any[]> {
    const allData: any[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await this.brokers.getAccounts({
        brokerId: filter?.brokerId,
        connectionId: filter?.connectionId,
        accountType: filter?.accountType, // Will be coerced to enum
        status: filter?.status, // Will be coerced to enum
        currency: filter?.currency,
        limit,
        offset,
        withMetadata: filter?.withMetadata,
      });

      const result = response.success?.data || [];
      if (!result || result.length === 0) break;
      allData.push(...result);
      if (result.length < limit) break;
      offset += limit;
    }

    return allData;
  }

  /**
   * Get all orders across all pages.
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async getAllOrders(filter?: any): Promise<any[]> {
    const allData: any[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await this.brokers.getOrders({
        brokerId: filter?.brokerId,
        connectionId: filter?.connectionId,
        accountId: filter?.accountId,
        symbol: filter?.symbol,
        orderStatus: filter?.orderStatus, // Will be coerced to enum
        side: filter?.side, // Will be coerced to enum
        assetType: filter?.assetType, // Will be coerced to enum
        limit,
        offset,
        createdAfter: filter?.createdAfter,
        createdBefore: filter?.createdBefore,
        withMetadata: filter?.withMetadata,
      });

      const result = response.success?.data || [];
      if (!result || result.length === 0) break;
      allData.push(...result);
      if (result.length < limit) break;
      offset += limit;
    }

    return allData;
  }

  /**
   * Get all positions across all pages.
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async getAllPositions(filter?: any): Promise<any[]> {
    const allData: any[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await this.brokers.getPositions({
        brokerId: filter?.brokerId,
        connectionId: filter?.connectionId,
        accountId: filter?.accountId,
        symbol: filter?.symbol,
        side: filter?.side, // Will be coerced to enum
        assetType: filter?.assetType, // Will be coerced to enum
        positionStatus: filter?.positionStatus, // Will be coerced to enum
        limit,
        offset,
        updatedAfter: filter?.updatedAfter,
        updatedBefore: filter?.updatedBefore,
        withMetadata: filter?.withMetadata,
      });

      const result = response.success?.data || [];
      if (!result || result.length === 0) break;
      allData.push(...result);
      if (result.length < limit) break;
      offset += limit;
    }

    return allData;
  }

  /**
   * Get all balances across all pages.
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async getAllBalances(filter?: any): Promise<any[]> {
    const allData: any[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await this.brokers.getBalances({
        brokerId: filter?.brokerId,
        connectionId: filter?.connectionId,
        accountId: filter?.accountId,
        isEndOfDaySnapshot: filter?.isEndOfDaySnapshot,
        limit,
        offset,
        balanceCreatedAfter: filter?.balanceCreatedAfter,
        balanceCreatedBefore: filter?.balanceCreatedBefore,
        withMetadata: filter?.withMetadata,
      });

      const result = response.success?.data || [];
      if (!result || result.length === 0) break;
      allData.push(...result);
      if (result.length < limit) break;
      offset += limit;
    }

    return allData;
  }

  /**
   * Get paginated accounts.
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async getAccounts(page: number = 1, perPage: number = 100, filter?: any): Promise<any> {
    const offset = (page - 1) * perPage;
    const response = await this.brokers.getAccounts({
      limit: perPage,
      offset,
    });
    return response.success?.data || [];
  }

  /**
   * Get paginated orders.
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async getOrders(page: number = 1, perPage: number = 100, filter?: any): Promise<any> {
    const offset = (page - 1) * perPage;
    const response = await this.brokers.getOrders({
      symbol: filter?.symbol,
      orderStatus: filter?.orderStatus, // Will be coerced to enum
      side: filter?.side, // Will be coerced to enum
      assetType: filter?.assetType, // Will be coerced to enum
      limit: perPage,
      offset,
    });
    return response.success?.data || [];
  }

  /**
   * Get paginated positions.
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async getPositions(page: number = 1, perPage: number = 100, filter?: any): Promise<any> {
    const offset = (page - 1) * perPage;
    const response = await this.brokers.getPositions({
      symbol: filter?.symbol,
      side: filter?.side, // Will be coerced to enum
      assetType: filter?.assetType, // Will be coerced to enum
      positionStatus: filter?.positionStatus, // Will be coerced to enum
      limit: perPage,
      offset,
    });
    return response.success?.data || [];
  }

  /**
   * Get paginated balances.
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async getBalances(page: number = 1, perPage: number = 100, filter?: any): Promise<any> {
    const offset = (page - 1) * perPage;
    const response = await this.brokers.getBalances({
      isEndOfDaySnapshot: filter?.isEndOfDaySnapshot,
      limit: perPage,
      offset,
    });
    return response.success?.data || [];
  }

  /**
   * Get only open positions.
   * Phase 2C: Uses enum coercion (case-insensitive string matching).
   */
  async getOpenPositions(filter?: any): Promise<any[]> {
    // Phase 2C: Enum coercion happens in getAllPositions via typed input object
    return await this.getAllPositions({ ...filter, positionStatus: 'active' });
  }

  /**
   * Get only filled orders.
   * Phase 2C: Uses enum coercion (case-insensitive string matching).
   */
  async getFilledOrders(filter?: any): Promise<any[]> {
    // Phase 2C: Enum coercion happens in getAllOrders via typed input object
    return await this.getAllOrders({ ...filter, orderStatus: 'filled' });
  }

  /**
   * Get only pending orders.
   * Phase 2C: Uses enum coercion (case-insensitive string matching).
   */
  async getPendingOrders(filter?: any): Promise<any[]> {
    // Phase 2C: Enum coercion happens in getAllOrders via typed input object
    return await this.getAllOrders({ ...filter, orderStatus: 'new' });
  }

  /**
   * Get only active accounts.
   * Phase 2C: Uses enum coercion (case-insensitive string matching).
   */
  async getActiveAccounts(filter?: any): Promise<any[]> {
    // Phase 2C: Enum coercion happens in getAllAccounts via typed input object
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
   * Get all order groups across all pages.
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async getAllOrderGroups(filter?: any): Promise<any[]> {
    const allData: any[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await this.brokers.getOrderGroups({
        brokerId: filter?.brokerId,
        connectionId: filter?.connectionId,
        limit,
        offset,
        createdAfter: filter?.createdAfter,
        createdBefore: filter?.createdBefore,
      });

      const result = response.success?.data || [];
      if (!result || result.length === 0) break;
      allData.push(...result);
      if (result.length < limit) break;
      offset += limit;
    }

    return allData;
  }

  /**
   * Get paginated order groups.
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async getOrderGroups(page: number = 1, perPage: number = 100, filter?: any): Promise<any> {
    const offset = (page - 1) * perPage;
    const response = await this.brokers.getOrderGroups({
      brokerId: filter?.brokerId,
      connectionId: filter?.connectionId,
      limit: perPage,
      offset,
      createdAfter: filter?.createdAfter,
      createdBefore: filter?.createdBefore,
    });
    return response.success?.data || [];
  }

  /**
   * Get all position lots across all pages.
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async getAllPositionLots(filter?: any): Promise<any[]> {
    const allData: any[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await this.brokers.getPositionLots({
        brokerId: filter?.brokerId,
        connectionId: filter?.connectionId,
        accountId: filter?.accountId,
        symbol: filter?.symbol,
        positionId: filter?.positionId,
        limit,
        offset,
      });

      const result = response.success?.data || [];
      if (!result || result.length === 0) break;
      allData.push(...result);
      if (result.length < limit) break;
      offset += limit;
    }

    return allData;
  }

  /**
   * Get paginated position lots.
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async getPositionLots(page: number = 1, perPage: number = 100, filter?: any): Promise<any> {
    const offset = (page - 1) * perPage;
    const response = await this.brokers.getPositionLots({
      brokerId: filter?.brokerId,
      connectionId: filter?.connectionId,
      accountId: filter?.accountId,
      symbol: filter?.symbol,
      positionId: filter?.positionId,
      limit: perPage,
      offset,
    });
    return response.success?.data || [];
  }

  /**
   * Disconnect company from broker.
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async disconnectCompany(connectionId: string): Promise<any> {
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }
    const response = await this.brokers.disconnectCompanyFromBroker({ connectionId });
    return response.success?.data || null;
  }

  /**
   * Get order fills for a specific order.
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async getOrderFills(
    orderId: string,
    page: number = 1,
    perPage: number = 100,
    filter?: any
  ): Promise<any> {
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }
    const offset = (page - 1) * perPage;
    const response = await this.brokers.getOrderFills({
      orderId,
      connectionId: filter?.connectionId,
      limit: perPage,
      offset,
    });
    return response.success?.data || [];
  }

  /**
   * Get order events for a specific order.
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async getOrderEvents(
    orderId: string,
    page: number = 1,
    perPage: number = 100,
    filter?: any
  ): Promise<any> {
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }
    const offset = (page - 1) * perPage;
    const response = await this.brokers.getOrderEvents({
      orderId,
      connectionId: filter?.connectionId,
      limit: perPage,
      offset,
    });
    return response.success?.data || [];
  }

  /**
   * Get position lot fills for a specific lot.
   * Phase 2C: Uses typed input objects and handles standard response structure.
   */
  async getPositionLotFills(
    lotId: string,
    page: number = 1,
    perPage: number = 100,
    filter?: any
  ): Promise<any> {
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }
    const offset = (page - 1) * perPage;
    const response = await this.brokers.getPositionLotFills({
      lotId,
      connectionId: filter?.connectionId,
      limit: perPage,
      offset,
    });
    return response.success?.data || [];
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
    return await this.brokers.placeOrder({ body: orderParams });
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
    return await this.brokers.placeOrder({ body: orderParams });
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
    return await this.brokers.placeOrder({ body: orderParams });
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
    return await this.brokers.placeOrder({ body: orderParams });
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
    return await this.brokers.placeOrder({ body: orderParams });
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
    return await this.brokers.placeOrder({ body: orderParams });
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
    return await this.brokers.placeOrder({ body: orderParams });
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
    return await this.brokers.placeOrder({ body: orderParams });
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
    return await this.brokers.placeOrder({ body: orderParams });
  }

  /**
   * Place a generic order.
   */
  async placeOrder(orderParams: any): Promise<any> {
    return await this.brokers.placeOrder({ body: orderParams });
  }

  /**
   * Modify an existing order.
   */
  async modifyOrder(orderId: string, orderParams: any): Promise<any> {
    return await this.brokers.modifyOrder({ orderId, body: orderParams });
  }

  /**
   * Cancel an existing order.
   */
  async cancelOrder(orderId: string, accountNumber?: string, connectionId?: string): Promise<any> {
    return await this.brokers.cancelOrder({
      orderId,
      ...(accountNumber ? { accountNumber } : {}),
      ...(connectionId ? { connectionId } : {}),
    });
  }
}
