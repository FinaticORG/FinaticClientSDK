import { EventEmitter } from '../../utils/events';
import { ApiClient } from './ApiClient';
import { PortalUI } from '../portal/PortalUI';
import { SessionError, AuthenticationError, CompanyAccessError, ApiError, ValidationError } from '../../utils/errors';
import { MockFactory } from '../../mocks/MockFactory';
import { PaginatedResult } from '../../types/common/pagination';
import { UserToken, SessionState } from '../../types/api/auth';
import { Order, OrderResponse, TradingContext } from '../../types/api/orders';
import {
  BrokerDataOptions,
  BrokerAccount,
  BrokerOrder,
  BrokerPosition,
  BrokerBalance,
  BrokerInfo,
  BrokerOrderParams,
  BrokerConnection,
  OrdersFilter,
  PositionsFilter,
  AccountsFilter,
  BalancesFilter,
  BrokerDataOrder,
  BrokerDataPosition,
  BrokerDataAccount,
  DisconnectCompanyResponse,
} from '../../types/api/broker';
import { FinaticConnectOptions, PortalOptions } from '../../types/connect';
import { appendThemeToURL } from '../../utils/themeUtils';
import { appendBrokerFilterToURL } from '../../utils/brokerUtils';
// Supabase import removed - SDK no longer depends on Supabase

interface DeviceInfo {
  ip_address: string;
  user_agent: string;
  fingerprint: string;
}

export class FinaticConnect extends EventEmitter {
  private static instance: FinaticConnect | null = null;
  private apiClient: ApiClient | any; // Allow both ApiClient and MockApiClient
  private portalUI: PortalUI;
  private options: FinaticConnectOptions;
  private userToken: UserToken | null = null;
  private sessionId: string | null = null;
  private companyId: string;
  private baseUrl: string;
  private readonly BROKER_LIST_CACHE_KEY = 'finatic_broker_list_cache';
  private readonly BROKER_LIST_CACHE_VERSION = '1.0';
  private readonly BROKER_LIST_CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours in milliseconds
  private readonly deviceInfo?: DeviceInfo;
  private currentSessionState: string | null = null;

  // Session keep-alive mechanism
  private sessionKeepAliveInterval: ReturnType<typeof setInterval> | null = null;
  private readonly SESSION_KEEP_ALIVE_INTERVAL = 1000 * 60 * 5; // 5 minutes
  private readonly SESSION_VALIDATION_TIMEOUT = 1000 * 30; // 30 seconds
  private readonly SESSION_REFRESH_BUFFER_HOURS = 16; // Refresh session at 16 hours
  private sessionStartTime: number | null = null;

  constructor(options: FinaticConnectOptions, deviceInfo?: DeviceInfo) {
    super();
    this.options = options;
    this.baseUrl = options.baseUrl || 'https://api.finatic.dev';
    this.apiClient = MockFactory.createApiClient(this.baseUrl, deviceInfo);
    this.portalUI = new PortalUI(this.baseUrl);
    this.deviceInfo = deviceInfo;

    // Extract company ID from token
    try {
      // Validate token exists
      if (!options.token) {
        throw new Error('Token is required but not provided');
      }

      // Check if token is in JWT format (contains dots)
      if (options.token.includes('.')) {
        const tokenParts = options.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          this.companyId = payload.company_id;
        } else {
          throw new Error('Invalid JWT token format');
        }
      } else {
        // Handle UUID format token
        // For UUID tokens, we'll get the company_id from the session start response
        this.companyId = ''; // Will be set after session start
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error('Failed to parse token: ' + error.message);
      } else {
        throw new Error('Failed to parse token: Unknown error');
      }
    }

    // Set up event listeners for callbacks
    if (this.options.onSuccess) {
      this.on('success', this.options.onSuccess);
    }
    if (this.options.onError) {
      this.on('error', this.options.onError);
    }
    if (this.options.onClose) {
      this.on('close', this.options.onClose);
    }

    // Register automatic session cleanup
    this.registerSessionCleanup();
  }

  private async linkUserToSession(userId: string): Promise<boolean> {
    try {
      if (!this.sessionId) {
        console.error('No session ID available for user linking');
        return false;
      }

      // Call API endpoint to authenticate user with session
      const response = await this.apiClient.request('/session/authenticate', {
        method: 'POST',
        body: {
          session_id: this.sessionId,
          user_id: userId,
        },
      });

      if (response.error) {
        console.error('Failed to link user to session:', response.error);
        return false;
      }

      console.log('User linked to session successfully');
      return true;
    } catch (error) {
      console.error('Error linking user to session:', error);
      return false;
    }
  }

  /**
   * Store user ID for authentication state persistence
   * @param userId - The user ID to store
   */
  private storeUserId(userId: string): void {
    // Initialize userToken if it doesn't exist
    if (!this.userToken) {
      this.userToken = {
        user_id: userId,
      };
    } else {
      // Update existing userToken with new userId
      this.userToken.user_id = userId;
    }

    // Set user ID in ApiClient for session context
    this.apiClient.setSessionContext(this.sessionId || '', this.companyId, undefined);
  }

  /**
   * Check if the user is fully authenticated (has userId in session context)
   * @returns True if the user is fully authenticated and ready for API calls
   */
  public async isAuthenticated(): Promise<boolean> {
    // Check internal session context only - no localStorage dependency
    return this.userToken?.user_id !== undefined && this.userToken?.user_id !== null;
  }


  /**
   * Get user's orders with pagination and optional filtering
   * @param params - Query parameters including page, perPage, and filters
   * @returns Promise with paginated result that supports navigation
   */
  public async getOrders(
    page: number = 1,
    perPage: number = 100,
    options?: BrokerDataOptions,
    filters?: OrdersFilter
  ): Promise<PaginatedResult<BrokerDataOrder[]>> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated');
    }

    const result = await this.apiClient.getBrokerOrdersPage(page, perPage, filters);
    
    // Add navigation methods to the result
    const paginatedResult = result as any;
    paginatedResult.next_page = async () => {
      if (paginatedResult.hasNext) {
        return this.apiClient.getBrokerOrdersPage(page + 1, perPage, filters);
      }
      throw new Error('No next page available');
    };
    paginatedResult.previous_page = async () => {
      if (paginatedResult.has_previous) {
        return this.apiClient.getBrokerOrdersPage(page - 1, perPage, filters);
      }
      throw new Error('No previous page available');
    };
    
    return paginatedResult;
  }

  /**
   * Get user's positions with pagination and optional filtering
   * @param params - Query parameters including page, perPage, and filters
   * @returns Promise with paginated result that supports navigation
   */
  public async getPositions(
    page: number = 1,
    perPage: number = 100,
    options?: BrokerDataOptions,
    filters?: PositionsFilter
  ): Promise<PaginatedResult<BrokerDataPosition[]>> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated');
    }

    const result = await this.apiClient.getBrokerPositionsPage(page, perPage, filters);
    
    // Add navigation methods to the result
    const paginatedResult = result as any;
    paginatedResult.next_page = async () => {
      if (paginatedResult.hasNext) {
        return this.apiClient.getBrokerPositionsPage(page + 1, perPage, filters);
      }
      throw new Error('No next page available');
    };
    paginatedResult.previous_page = async () => {
      if (paginatedResult.has_previous) {
        return this.apiClient.getBrokerPositionsPage(page - 1, perPage, filters);
      }
      throw new Error('No previous page available');
    };
    
    return paginatedResult;
  }

  /**
   * Get user's accounts with pagination and optional filtering
   * @param params - Query parameters including page, perPage, and filters
   * @returns Promise with paginated result that supports navigation
   */
  public async getAccounts(
    page: number = 1,
    perPage: number = 100,
    options?: BrokerDataOptions,
    filters?: AccountsFilter
  ): Promise<PaginatedResult<BrokerDataAccount[]>> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated');
    }

    const result = await this.apiClient.getBrokerAccountsPage(page, perPage, filters);
    
    // Add navigation methods to the result
    const paginatedResult = result as any;
    paginatedResult.next_page = async () => {
      if (paginatedResult.hasNext) {
        return this.apiClient.getBrokerAccountsPage(page + 1, perPage, filters);
      }
      throw new Error('No next page available');
    };
    paginatedResult.previous_page = async () => {
      if (paginatedResult.has_previous) {
        return this.apiClient.getBrokerAccountsPage(page - 1, perPage, filters);
      }
      throw new Error('No previous page available');
    };
    
    return paginatedResult;
  }

  /**
   * Get user's balances with pagination and optional filtering
   * @param params - Query parameters including page, perPage, and filters
   * @returns Promise with paginated result that supports navigation
   */
  public async getBalances(
    page: number = 1,
    perPage: number = 100,
    options?: BrokerDataOptions,
    filters?: BalancesFilter
  ): Promise<PaginatedResult<BrokerBalance[]>> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated');
    }

    const result = await this.apiClient.getBrokerBalancesPage(page, perPage, filters);
    
    // Add navigation methods to the result
    const paginatedResult = result as any;
    paginatedResult.next_page = async () => {
      if (paginatedResult.hasNext) {
        return this.apiClient.getBrokerBalancesPage(page + 1, perPage, filters);
      }
      throw new Error('No next page available');
    };
    paginatedResult.previous_page = async () => {
      if (paginatedResult.has_previous) {
        return this.apiClient.getBrokerBalancesPage(page - 1, perPage, filters);
      }
      throw new Error('No previous page available');
    };
    
    return paginatedResult;
  }

  /**
   * Initialize the Finatic Connect SDK
   * @param token - The portal token from your backend
   * @param userId - Optional: The user ID if you have it from a previous session
   * @param options - Optional configuration including baseUrl
   * @returns FinaticConnect instance
   */
  public static async init(
    token: string,
    userId?: string | null | undefined,
    options?: { baseUrl?: string } | undefined
  ): Promise<FinaticConnect> {
    // Safari-specific fix: Clear instance if it exists but has no valid session
    // This prevents stale instances from interfering with new requests
    if (FinaticConnect.instance && !FinaticConnect.instance.sessionId) {
      console.log('[FinaticConnect] Clearing stale instance for Safari compatibility');
      FinaticConnect.instance = null;
    }

    if (!FinaticConnect.instance) {
      const connectOptions: FinaticConnectOptions = {
        token,
        baseUrl: options?.baseUrl || 'https://api.finatic.dev',
        onSuccess: undefined,
        onError: undefined,
        onClose: undefined,
      };

      // Generate device info
      const deviceInfo: DeviceInfo = {
        ip_address: '', // Will be set by the server
        user_agent: navigator.userAgent,
        fingerprint: btoa(
          [
            navigator.userAgent,
            navigator.language,
            new Date().getTimezoneOffset(),
            screen.width,
            screen.height,
            navigator.hardwareConcurrency,
            // @ts-expect-error - deviceMemory is not in the Navigator type but exists in modern browsers
            navigator.deviceMemory || 'unknown',
          ].join('|')
        ),
      };

      FinaticConnect.instance = new FinaticConnect(connectOptions, deviceInfo);

      // Start session and get session data
      const normalizedUserId = userId || undefined; // Convert null to undefined
      const startResponse = await FinaticConnect.instance.apiClient.startSession(
        token,
        normalizedUserId
      );
      FinaticConnect.instance.sessionId = startResponse.data.session_id;
      FinaticConnect.instance.companyId = startResponse.data.company_id || '';

      // Record session start time for automatic refresh
      FinaticConnect.instance.sessionStartTime = Date.now();

      // Set session context in API client
      if (
        FinaticConnect.instance.apiClient &&
        typeof FinaticConnect.instance.apiClient.setSessionContext === 'function'
      ) {
        FinaticConnect.instance.apiClient.setSessionContext(
          FinaticConnect.instance.sessionId,
          FinaticConnect.instance.companyId,
          startResponse.data.csrf_token // If available in response
        );
      }

      // If userId is provided, try to link user to session
      if (normalizedUserId) {
        try {
          // Try to link user to session via API
          const linked = await FinaticConnect.instance.linkUserToSession(normalizedUserId);
          if (linked) {
            // Store user ID for authentication state
            FinaticConnect.instance.storeUserId(normalizedUserId);
            // Emit success event
            FinaticConnect.instance.emit('success', normalizedUserId);
          } else {
            console.warn('Failed to link user to session during initialization');
          }
        } catch (error) {
          FinaticConnect.instance.emit('error', error as Error);
          throw error;
        }
      }
    }
    return FinaticConnect.instance;
  }

  /**
   * Initialize the SDK with a user ID
   * @param userId - The user ID from a previous session
   */
  public async setUserId(userId: string): Promise<void> {
    await this.initializeWithUser(userId);
  }

  /**
   * Get the user and tokens for a completed session
   * @returns Promise with user information and tokens
   */

  private async initializeWithUser(userId: string): Promise<void> {
    try {
      if (!this.sessionId) {
        throw new SessionError('Session not initialized');
      }

      // Try to link user to session
      const linked = await this.linkUserToSession(userId);
      if (!linked) {
        console.warn('Failed to link user to session during initialization');
        // Don't throw error, just continue without authentication
        return;
      }

      // Store user ID for authentication state
      this.storeUserId(userId);

      this.emit('success', userId);
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Handle company access error by opening the portal
   * @param error The company access error
   * @param options Optional configuration for the portal
   */
  private async handleCompanyAccessError(
    error: CompanyAccessError,
    options?: {
      onSuccess?: (userId: string) => void;
      onError?: (error: Error) => void;
      onClose?: () => void;
    }
  ): Promise<void> {
    // Emit a specific event for company access errors
    this.emit('companyAccessError', error);

    // Open the portal to allow the user to connect a broker
    await this.openPortal(options);
  }

  /**
   * Open the portal for user authentication
   * @param options Optional configuration for the portal
   */
  public async openPortal(options?: PortalOptions): Promise<void> {
    try {
      if (!this.sessionId) {
        throw new SessionError('Session not initialized');
      }

      // Ensure session is active
      const sessionState = this.apiClient.getCurrentSessionState();
      if (sessionState !== SessionState.ACTIVE) {
        // If not active, try to start a new session
        const startResponse = await this.apiClient.startSession(this.options.token);
        this.sessionId = startResponse.data.session_id;
        this.companyId = startResponse.data.company_id || '';

        // Set session context in API client
        if (this.apiClient && typeof this.apiClient.setSessionContext === 'function') {
          this.apiClient.setSessionContext(
            this.sessionId,
            this.companyId,
            startResponse.data.csrf_token // If available in response
          );
        }

        // Session is now active
        this.currentSessionState = SessionState.ACTIVE;
      }

      // Get portal URL
      const portalResponse = await this.apiClient.getPortalUrl(this.sessionId);
      if (!portalResponse.data.portal_url) {
        throw new Error('Failed to get portal URL');
      }

      // Apply theme to portal URL if provided
      let themedPortalUrl = appendThemeToURL(portalResponse.data.portal_url, options?.theme);

      // Apply broker filter to portal URL if provided
      themedPortalUrl = appendBrokerFilterToURL(themedPortalUrl, options?.brokers);

      // Apply email parameter to portal URL if provided
      if (options?.email) {
        const url = new URL(themedPortalUrl);
        url.searchParams.set('email', options.email);
        themedPortalUrl = url.toString();
      }

      // Add session ID to portal URL so the portal can use it
      const url = new URL(themedPortalUrl);
      if (this.sessionId) {
        url.searchParams.set('session_id', this.sessionId);
      }
      if (this.companyId) {
        url.searchParams.set('company_id', this.companyId);
      }
      themedPortalUrl = url.toString();

      // Create portal UI if not exists
      if (!this.portalUI) {
        this.portalUI = new PortalUI(this.baseUrl);
      }

      // Show portal
      this.portalUI.show(themedPortalUrl, this.sessionId || '', {
        onSuccess: async (userId: string) => {
          try {
            if (!this.sessionId) {
              throw new SessionError('Session not initialized');
            }

            // Store the userId for authentication state
            this.storeUserId(userId);

            // Try to link user to session via API
            const linked = await this.linkUserToSession(userId);
            if (!linked) {
              console.warn('Failed to link user to session, but continuing with authentication');
            }

            // Emit portal success event
            this.emit('portal:success', userId);

            // Emit legacy success event
            this.emit('success', userId);
            options?.onSuccess?.(userId);
          } catch (error) {
            if (error instanceof CompanyAccessError) {
              // Handle company access error by opening the portal
              await this.handleCompanyAccessError(error, options);
            } else {
              this.emit('error', error as Error);
              options?.onError?.(error as Error);
            }
          }
        },
        onError: (error: Error) => {
          // Emit portal error event
          this.emit('portal:error', error);

          // Emit legacy error event
          this.emit('error', error);
          options?.onError?.(error);
        },
        onClose: () => {
          // Emit portal close event
          this.emit('portal:close');

          // Emit legacy close event
          this.emit('close');
          options?.onClose?.();
        },
        onEvent: (type: string, data: any) => {
          console.log('[FinaticConnect] Portal event received:', type, data);

          // Emit generic event
          this.emit('event', type, data);

          // Call the event callback
          options?.onEvent?.(type, data);
        },
      });
    } catch (error) {
      if (error instanceof CompanyAccessError) {
        // Handle company access error by opening the portal
        await this.handleCompanyAccessError(error, options);
      } else {
        this.emit('error', error as Error);
        options?.onError?.(error as Error);
      }
    }
  }

  /**
   * Close the Finatic Connect Portal
   */
  public closePortal(): void {
    this.portalUI.hide();
    this.emit('close');
  }

  /**
   * Initialize a new session
   * @param oneTimeToken - The one-time token from initSession
   */
  protected async startSession(oneTimeToken: string): Promise<void> {
    try {
      const response = await this.apiClient.startSession(oneTimeToken);
      this.sessionId = response.data.session_id;
      this.currentSessionState = response.data.state;

      // Set session context in API client
      if (this.apiClient && typeof this.apiClient.setSessionContext === 'function') {
        this.apiClient.setSessionContext(
          this.sessionId,
          this.companyId,
          response.data.csrf_token // If available in response
        );
      }

      // For non-direct auth, we need to wait for the session to be ACTIVE
      if (response.data.state === SessionState.PENDING) {
        // Session is now active
        this.currentSessionState = SessionState.ACTIVE;
      }
    } catch (error) {
      if (error instanceof SessionError) {
        throw new AuthenticationError('Failed to start session', error.details);
      }
      throw error;
    }
  }

  /**
   * Place a new order using the broker order API
   * @param order - Order details with broker context
   */
  public async placeOrder(order: BrokerOrderParams, extras?: BrokerExtras): Promise<OrderResponse> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated. Please connect a broker first.');
    }
    if (!this.userToken?.user_id) {
      throw new AuthenticationError('No user ID available. Please connect a broker first.');
    }

    try {
      // Use the order parameter directly since it's already BrokerOrderParams
      return await this.apiClient.placeBrokerOrder(
        order,
        extras || {},
        order.connection_id
      );
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Cancel a broker order
   * @param orderId - The order ID to cancel
   * @param broker - Optional broker override
   * @param connection_id - Optional connection ID for testing bypass
   */
  public async cancelOrder(
    orderId: string,
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    connection_id?: string
  ): Promise<OrderResponse> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated. Please connect a broker first.');
    }
    if (!this.userToken?.user_id) {
      throw new AuthenticationError('No user ID available. Please connect a broker first.');
    }

    try {
      return await this.apiClient.cancelBrokerOrder(orderId, broker, {}, connection_id);
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Modify a broker order
   * @param orderId - The order ID to modify
   * @param modifications - The modifications to apply
   * @param broker - Optional broker override
   * @param connection_id - Optional connection ID for testing bypass
   */
  public async modifyOrder(
    orderId: string,
    modifications: Partial<{
      symbol?: string;
      quantity?: number;
      price?: number;
      stopPrice?: number;
      timeInForce?: 'day' | 'gtc' | 'gtd' | 'ioc' | 'fok';
      orderType?: 'Market' | 'Limit' | 'Stop' | 'StopLimit';
      side?: 'Buy' | 'Sell';
      order_id?: string;
    }>,
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    connection_id?: string
  ): Promise<OrderResponse> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated. Please connect a broker first.');
    }
    if (!this.userToken?.user_id) {
      throw new AuthenticationError('No user ID available. Please connect a broker first.');
    }

    try {
      // Convert modifications to broker format
      const brokerModifications: Partial<BrokerOrderParams> = {};
      if (modifications.symbol) brokerModifications.symbol = modifications.symbol;
      if (modifications.quantity) brokerModifications.orderQty = modifications.quantity;
      if (modifications.price) brokerModifications.price = modifications.price;
      if (modifications.stopPrice) brokerModifications.stopPrice = modifications.stopPrice;
      if (modifications.timeInForce)
        brokerModifications.timeInForce = modifications.timeInForce as
          | 'day'
          | 'gtc'
          | 'gtd'
          | 'ioc'
          | 'fok';
      if (modifications.orderType) brokerModifications.orderType = modifications.orderType;
      if (modifications.side) brokerModifications.action = modifications.side;
      if (modifications.order_id) brokerModifications.order_id = modifications.order_id;

      return await this.apiClient.modifyBrokerOrder(
        orderId,
        brokerModifications,
        broker,
        {},
        connection_id
      );
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }


  /**
   * Place a stock market order (convenience method)
   */
  public async placeStockMarketOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    accountNumber?: string
  ): Promise<OrderResponse> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated. Please connect a broker first.');
    }
    if (!this.userToken?.user_id) {
      throw new AuthenticationError('No user ID available. Please connect a broker first.');
    }

    try {
      return await this.apiClient.placeStockMarketOrder(
        symbol,
        quantity,
        side === 'buy' ? 'Buy' : 'Sell',
        broker,
        accountNumber
      );
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Place a stock limit order (convenience method)
   */
  public async placeStockLimitOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    price: number,
    timeInForce: 'day' | 'gtc' = 'gtc',
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    accountNumber?: string
  ): Promise<OrderResponse> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated. Please connect a broker first.');
    }
    if (!this.userToken?.user_id) {
      throw new AuthenticationError('No user ID available. Please connect a broker first.');
    }

    try {
      return await this.apiClient.placeStockLimitOrder(
        symbol,
        quantity,
        side === 'buy' ? 'Buy' : 'Sell',
        price,
        timeInForce,
        broker,
        accountNumber
      );
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Place a stock stop order (convenience method)
   */
  public async placeStockStopOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    stopPrice: number,
    timeInForce: 'day' | 'gtc' = 'gtc',
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    accountNumber?: string
  ): Promise<OrderResponse> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated. Please connect a broker first.');
    }
    if (!this.userToken?.user_id) {
      throw new AuthenticationError('No user ID available. Please connect a broker first.');
    }

    try {
      return await this.apiClient.placeStockStopOrder(
        symbol,
        quantity,
        side === 'buy' ? 'Buy' : 'Sell',
        stopPrice,
        timeInForce,
        broker,
        accountNumber
      );
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Place a crypto market order (convenience method)
   */
  public async placeCryptoMarketOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    broker?: 'coinbase' | 'binance' | 'kraken',
    accountNumber?: string
  ): Promise<OrderResponse> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated. Please connect a broker first.');
    }
    if (!this.userToken?.user_id) {
      throw new AuthenticationError('No user ID available. Please connect a broker first.');
    }

    try {
      return await this.apiClient.placeCryptoMarketOrder(
        symbol,
        quantity,
        side === 'buy' ? 'Buy' : 'Sell',
        broker,
        accountNumber
      );
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Place a crypto limit order (convenience method)
   */
  public async placeCryptoLimitOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    price: number,
    timeInForce: 'day' | 'gtc' = 'gtc',
    broker?: 'coinbase' | 'binance' | 'kraken',
    accountNumber?: string
  ): Promise<OrderResponse> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated. Please connect a broker first.');
    }
    if (!this.userToken?.user_id) {
      throw new AuthenticationError('No user ID available. Please connect a broker first.');
    }

    try {
      return await this.apiClient.placeCryptoLimitOrder(
        symbol,
        quantity,
        side === 'buy' ? 'Buy' : 'Sell',
        price,
        timeInForce,
        broker,
        accountNumber
      );
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Place an options market order (convenience method)
   */
  public async placeOptionsMarketOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    broker?: 'tasty_trade' | 'robinhood' | 'ninja_trader',
    accountNumber?: string
  ): Promise<OrderResponse> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated. Please connect a broker first.');
    }
    if (!this.userToken?.user_id) {
      throw new AuthenticationError('No user ID available. Please connect a broker first.');
    }

    try {
      return await this.apiClient.placeOptionsMarketOrder(
        symbol,
        quantity,
        side === 'buy' ? 'Buy' : 'Sell',
        broker,
        accountNumber
      );
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Place an options limit order (convenience method)
   */
  public async placeOptionsLimitOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    price: number,
    timeInForce: 'day' | 'gtc' = 'gtc',
    broker?: 'tasty_trade' | 'robinhood' | 'ninja_trader',
    accountNumber?: string
  ): Promise<OrderResponse> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated. Please connect a broker first.');
    }
    if (!this.userToken?.user_id) {
      throw new AuthenticationError('No user ID available. Please connect a broker first.');
    }

    try {
      return await this.apiClient.placeOptionsLimitOrder(
        symbol,
        quantity,
        side === 'buy' ? 'Buy' : 'Sell',
        price,
        timeInForce,
        broker,
        accountNumber
      );
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Place a futures market order (convenience method)
   */
  public async placeFuturesMarketOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    broker?: 'ninja_trader' | 'tasty_trade',
    accountNumber?: string
  ): Promise<OrderResponse> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated. Please connect a broker first.');
    }
    if (!this.userToken?.user_id) {
      throw new AuthenticationError('No user ID available. Please connect a broker first.');
    }

    try {
      return await this.apiClient.placeFuturesMarketOrder(
        symbol,
        quantity,
        side === 'buy' ? 'Buy' : 'Sell',
        broker,
        accountNumber
      );
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Place a futures limit order (convenience method)
   */
  public async placeFuturesLimitOrder(
    symbol: string,
    quantity: number,
    side: 'buy' | 'sell',
    price: number,
    timeInForce: 'day' | 'gtc' = 'gtc',
    broker?: 'ninja_trader' | 'tasty_trade',
    accountNumber?: string
  ): Promise<OrderResponse> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated. Please connect a broker first.');
    }
    if (!this.userToken?.user_id) {
      throw new AuthenticationError('No user ID available. Please connect a broker first.');
    }

    try {
      return await this.apiClient.placeFuturesLimitOrder(
        symbol,
        quantity,
        side === 'buy' ? 'Buy' : 'Sell',
        price,
        timeInForce,
        broker,
        accountNumber
      );
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Get the current user ID
   * @returns The current user ID or undefined if not authenticated
   * @throws AuthenticationError if user is not authenticated
   */
  public async getUserId(): Promise<string | null> {
    if (!(await this.isAuthenticated())) {
      return null;
    }
    if (!this.userToken?.user_id) {
      return null;
    }
    return this.userToken.user_id;
  }

  /**
   * Get list of supported brokers
   * @returns Promise with array of broker information
   */
  public async getBrokerList(): Promise<BrokerInfo[]> {
    // if (!this.isAuthenticated()) {
    //   throw new AuthenticationError('Not authenticated');
    // }

    const response = await this.apiClient.getBrokerList();
    const baseUrl = this.baseUrl.replace('/api/v1', ''); // Remove /api/v1 to get the base URL

    // Transform the broker list to include full logo URLs
    return response.response_data.map((broker: BrokerInfo) => ({
      ...broker,
      logo_path: broker.logo_path ? `${baseUrl}${broker.logo_path}` : '',
    }));
  }

  /**
   * Get broker connections
   * @returns Promise with array of broker connections
   * @throws AuthenticationError if user is not authenticated
   */
  public async getBrokerConnections(): Promise<BrokerConnection[]> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated. Please connect a broker first.');
    }
    if (!this.userToken?.user_id) {
      throw new AuthenticationError('No user ID available. Please connect a broker first.');
    }

    const response = await this.apiClient.getBrokerConnections();
    if (response.status_code !== 200) {
      throw new Error(response.message || 'Failed to retrieve broker connections');
    }
    return response.response_data;
  }

  // Abstract convenience methods
  /**
   * Get only open positions
   * @returns Promise with array of open positions
   */
  public async getOpenPositions(): Promise<BrokerDataPosition[]> {
    return this.getAllPositions({ position_status: 'open' });
  }

  /**
   * Get only filled orders
   * @returns Promise with array of filled orders
   */
  public async getFilledOrders(): Promise<BrokerDataOrder[]> {
    return this.getAllOrders({ status: 'filled' });
  }

  /**
   * Get only pending orders
   * @returns Promise with array of pending orders
   */
  public async getPendingOrders(): Promise<BrokerDataOrder[]> {
    return this.getAllOrders({ status: 'pending' });
  }

  /**
   * Get only active accounts
   * @returns Promise with array of active accounts
   */
  public async getActiveAccounts(): Promise<BrokerDataAccount[]> {
    return this.getAllAccounts({ status: 'active' });
  }

  /**
   * Get orders for a specific symbol
   * @param symbol - The symbol to filter by
   * @returns Promise with array of orders for the symbol
   */
  public async getOrdersBySymbol(symbol: string): Promise<BrokerDataOrder[]> {
    return this.getAllOrders({ symbol });
  }

  /**
   * Get positions for a specific symbol
   * @param symbol - The symbol to filter by
   * @returns Promise with array of positions for the symbol
   */
  public async getPositionsBySymbol(symbol: string): Promise<BrokerDataPosition[]> {
    return this.getAllPositions({ symbol });
  }

  /**
   * Get orders for a specific broker
   * @param brokerId - The broker ID to filter by
   * @returns Promise with array of orders for the broker
   */
  public async getOrdersByBroker(brokerId: string): Promise<BrokerDataOrder[]> {
    return this.getAllOrders({ broker_id: brokerId });
  }

  /**
   * Get positions for a specific broker
   * @param brokerId - The broker ID to filter by
   * @returns Promise with array of positions for the broker
   */
  public async getPositionsByBroker(brokerId: string): Promise<BrokerDataPosition[]> {
    return this.getAllPositions({ broker_id: brokerId });
  }

  // Pagination methods







  /**
   * Get all orders across all pages (convenience method)
   * @param filter - Optional filter parameters
   * @returns Promise with all orders
   */
  public async getAllOrders(filter?: OrdersFilter): Promise<BrokerDataOrder[]> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated');
    }

    const allData: BrokerDataOrder[] = [];
    let currentResult = await this.apiClient.getBrokerOrdersPage(1, 100, filter);

    while (currentResult) {
      allData.push(...currentResult.data);
      if (!currentResult.hasNext) break;
      const nextResult = await currentResult.nextPage();
      if (!nextResult) break;
      currentResult = nextResult;
    }

    return allData;
  }

  /**
   * Get all positions across all pages (convenience method)
   * @param filter - Optional filter parameters
   * @returns Promise with all positions
   */
  public async getAllPositions(filter?: PositionsFilter): Promise<BrokerDataPosition[]> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated');
    }

    const allData: BrokerDataPosition[] = [];
    let currentResult = await this.apiClient.getBrokerPositionsPage(1, 100, filter);

    while (currentResult) {
      allData.push(...currentResult.data);
      if (!currentResult.hasNext) break;
      const nextResult = await currentResult.nextPage();
      if (!nextResult) break;
      currentResult = nextResult;
    }

    return allData;
  }

  /**
   * Get all accounts across all pages (convenience method)
   * @param filter - Optional filter parameters
   * @returns Promise with all accounts
   */
  public async getAllAccounts(filter?: AccountsFilter): Promise<BrokerDataAccount[]> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated');
    }

    const allData: BrokerDataAccount[] = [];
    let currentResult = await this.apiClient.getBrokerAccountsPage(1, 100, filter);

    while (currentResult) {
      allData.push(...currentResult.data);
      if (!currentResult.hasNext) break;
      const nextResult = await currentResult.nextPage();
      if (!nextResult) break;
      currentResult = nextResult;
    }

    return allData;
  }

  public async getAllBalances(filter?: BalancesFilter): Promise<BrokerBalance[]> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated');
    }

    const allData: BrokerBalance[] = [];
    let currentResult = await this.apiClient.getBrokerBalancesPage(1, 100, filter);

    while (currentResult) {
      allData.push(...currentResult.data);
      if (!currentResult.hasNext) break;
      const nextResult = await currentResult.nextPage();
      if (!nextResult) break;
      currentResult = nextResult;
    }

    return allData;
  }

  /**
   * Register session management (but don't auto-cleanup for 24-hour sessions)
   */
  private registerSessionCleanup(): void {
    // Only cleanup on actual page unload (not visibility changes)
    // This prevents sessions from being closed when users switch tabs or apps
    window.addEventListener('beforeunload', this.handleSessionCleanup.bind(this));

    // Handle visibility changes for keep-alive management (but don't complete sessions)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Start session keep-alive mechanism
    this.startSessionKeepAlive();
  }

  /**
   * Start the session keep-alive mechanism
   */
  private startSessionKeepAlive(): void {
    if (this.sessionKeepAliveInterval) {
      clearInterval(this.sessionKeepAliveInterval);
    }

    this.sessionKeepAliveInterval = setInterval(() => {
      this.validateSessionKeepAlive();
    }, this.SESSION_KEEP_ALIVE_INTERVAL);

    console.log('[FinaticConnect] Session keep-alive started (5-minute intervals)');
  }

  /**
   * Stop the session keep-alive mechanism
   */
  private stopSessionKeepAlive(): void {
    if (this.sessionKeepAliveInterval) {
      clearInterval(this.sessionKeepAliveInterval);
      this.sessionKeepAliveInterval = null;
      console.log('[FinaticConnect] Session keep-alive stopped');
    }
  }

  /**
   * Validate session for keep-alive purposes and handle automatic refresh
   */
  private async validateSessionKeepAlive(): Promise<void> {
    if (!this.sessionId || !(await this.isAuthenticated())) {
      console.log('[FinaticConnect] Session keep-alive skipped - no active session');
      return;
    }

    try {
      console.log('[FinaticConnect] Validating session for keep-alive...');

      // Check if we need to refresh the session (at 16 hours)
      if (this.shouldRefreshSession()) {
        await this.refreshSessionAutomatically();
        return;
      }

      // Session keep-alive - assume session is active if we have a session ID
      console.log('[FinaticConnect] Session keep-alive successful');
      this.currentSessionState = 'active';
    } catch (error) {
      console.warn('[FinaticConnect] Session keep-alive error:', error);
      // Don't throw errors during keep-alive - just log them
    }
  }

  /**
   * Check if the session should be refreshed (after 16 hours)
   */
  private shouldRefreshSession(): boolean {
    if (!this.sessionStartTime) {
      return false;
    }

    const sessionAgeHours = (Date.now() - this.sessionStartTime) / (1000 * 60 * 60);
    const hoursUntilRefresh = this.SESSION_REFRESH_BUFFER_HOURS - sessionAgeHours;

    if (hoursUntilRefresh <= 0) {
      console.log(
        `[FinaticConnect] Session is ${sessionAgeHours.toFixed(1)} hours old - triggering refresh`
      );
      return true;
    }

    // Log when refresh will occur (every 5 minutes during keep-alive)
    if (hoursUntilRefresh <= 1) {
      console.log(`[FinaticConnect] Session will refresh in ${hoursUntilRefresh.toFixed(1)} hours`);
    }

    return false;
  }

  /**
   * Automatically refresh the session to extend its lifetime
   */
  private async refreshSessionAutomatically(): Promise<void> {
    if (!this.sessionId) {
      console.warn('[FinaticConnect] Cannot refresh session - no session ID');
      return;
    }

    try {
      console.log('[FinaticConnect] Automatically refreshing session (16+ hours old)...');
      const response = await this.apiClient.refreshSession();

      if (response.success) {
        console.log('[FinaticConnect] Session automatically refreshed successfully');
        console.log('[FinaticConnect] New session expires at:', response.response_data.expires_at);
        this.currentSessionState = response.response_data.status;

        // Update session start time to prevent immediate re-refresh
        this.sessionStartTime = Date.now();
      } else {
        console.warn('[FinaticConnect] Automatic session refresh failed');
      }
    } catch (error) {
      console.warn('[FinaticConnect] Automatic session refresh error:', error);
      // Don't throw errors during automatic refresh - just log them
    }
  }

  /**
   * Handle session cleanup when page is unloading
   */
  private async handleSessionCleanup(): Promise<void> {
    this.stopSessionKeepAlive();
    if (this.sessionId) {
      await this.completeSession(this.sessionId);
    }
  }

  /**
   * Handle visibility change (mobile browsers)
   * Note: We don't complete sessions on visibility change for 24-hour sessions
   */
  private async handleVisibilityChange(): Promise<void> {
    // For 24-hour sessions, we don't want to complete sessions on visibility changes
    // This prevents sessions from being closed when users switch tabs or apps
    console.log('[FinaticConnect] Page visibility changed to:', document.visibilityState);

    // Only pause keep-alive when hidden, but don't complete the session
    if (document.visibilityState === 'hidden') {
      this.stopSessionKeepAlive();
    } else if (document.visibilityState === 'visible') {
      // Restart keep-alive when page becomes visible again
      this.startSessionKeepAlive();
    }
  }

  /**
   * Complete the session by calling the API
   * @param sessionId - The session ID to complete
   */
  private async completeSession(sessionId: string): Promise<void> {
    try {
      // Check if we're in mock mode (check if apiClient is a mock client)
      const isMockMode =
        this.apiClient &&
        typeof this.apiClient.isMockClient === 'function' &&
        this.apiClient.isMockClient();

      if (isMockMode) {
        // Mock the completion response
        console.log('[FinaticConnect] Mock session completion for session:', sessionId);
        return;
      }

      // Real API call
      const response = await fetch(`${this.baseUrl}/portal/${sessionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('[FinaticConnect] Session completed successfully');
      } else {
        console.warn('[FinaticConnect] Failed to complete session:', response.status);
      }
    } catch (error) {
      // Silent failure - don't throw errors during cleanup
      console.warn('[FinaticConnect] Session cleanup failed:', error);
    }
  }

  /**
   * Disconnect a company from a broker connection
   * @param connectionId - The connection ID to disconnect
   * @returns Promise with disconnect response
   * @throws AuthenticationError if user is not authenticated
   */
  public async disconnectCompany(connectionId: string): Promise<DisconnectCompanyResponse> {
    if (!(await this.isAuthenticated())) {
      throw new AuthenticationError('User is not authenticated. Please connect a broker first.');
    }
    if (!this.userToken?.user_id) {
      throw new AuthenticationError('No user ID available. Please connect a broker first.');
    }

    return this.apiClient.disconnectCompany(connectionId);
  }

  // Duplicate getBalances method removed - using the paginated version above

}
