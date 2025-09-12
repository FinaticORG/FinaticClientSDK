import { v4 as uuidv4 } from 'uuid';

// Import types from the main API types
import {
  SessionResponse,
  OtpRequestResponse,
  OtpVerifyResponse,
  PortalUrlResponse,
  SessionValidationResponse,
  SessionAuthenticateResponse,
  UserToken,
  Order,
  BrokerInfo,
  BrokerAccount,
  BrokerOrder,
  BrokerPosition,
  BrokerConnection,
  BrokerDataOptions,
  BrokerOrderParams,
  BrokerExtras,
  CryptoOrderOptions,
  OptionsOrderOptions,
  OrderResponse,
  TradingContext,
  RefreshTokenRequest,
  RefreshTokenResponse,
  OrdersFilter,
  PositionsFilter,
  AccountsFilter,
  BrokerDataOrder,
  BrokerDataPosition,
  BrokerDataAccount,
  DisconnectCompanyResponse,
} from '../types';
import { PaginatedResult } from '../types';
import { DeviceInfo, SessionState, TokenInfo } from '../types/api/auth';
import {
  ApiError,
  SessionError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  CompanyAccessError,
  OrderError,
  OrderValidationError,
} from '../utils/errors';
import { MockDataProvider, MockConfig } from './MockDataProvider';

/**
 * Mock API Client that implements the same interface as the real ApiClient
 * but returns mock data instead of making HTTP requests
 */
export class MockApiClient {
  private readonly baseUrl: string;
  protected readonly deviceInfo?: DeviceInfo;
  protected currentSessionState: SessionState | null = null;
  protected currentSessionId: string | null = null;
  private tradingContext: TradingContext = {};

  // Token management
  private tokenInfo: TokenInfo | null = null;
  private refreshPromise: Promise<TokenInfo> | null = null;
  private readonly REFRESH_BUFFER_MINUTES = 5;

  // Session and company context
  private companyId: string | null = null;
  private csrfToken: string | null = null;

  // Mock data provider
  private mockDataProvider: MockDataProvider;
  private readonly mockApiOnly: boolean;

  constructor(baseUrl: string, deviceInfo?: DeviceInfo, mockConfig?: MockConfig) {
    this.baseUrl = baseUrl;
    this.deviceInfo = deviceInfo;
    this.mockApiOnly = mockConfig?.mockApiOnly || false;
    this.mockDataProvider = new MockDataProvider(mockConfig);

    // Log that mocks are being used
    if (this.mockApiOnly) {
      console.log('🔧 Finatic SDK: Using MOCK API Client (API only - real portal)');
    } else {
      console.log('🔧 Finatic SDK: Using MOCK API Client');
    }
  }

  /**
   * Store tokens after successful authentication
   */
  setTokens(accessToken: string, refreshToken: string, expiresAt: string, userId?: string): void {
    this.tokenInfo = {
      accessToken,
      refreshToken,
      expiresAt,
      userId,
    };
  }

  /**
   * Get the current access token, refreshing if necessary
   */
  async getValidAccessToken(): Promise<string> {
    if (!this.tokenInfo) {
      throw new AuthenticationError('No tokens available. Please authenticate first.');
    }

    // Check if token is expired or about to expire
    if (this.isTokenExpired()) {
      await this.refreshTokens();
    }

    return this.tokenInfo.accessToken;
  }

  /**
   * Check if the current token is expired or about to expire
   */
  private isTokenExpired(): boolean {
    if (!this.tokenInfo) return true;

    const expiryTime = new Date(this.tokenInfo.expiresAt).getTime();
    const currentTime = Date.now();
    const bufferTime = this.REFRESH_BUFFER_MINUTES * 60 * 1000;

    return currentTime >= expiryTime - bufferTime;
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshTokens(): Promise<void> {
    if (!this.tokenInfo) {
      throw new AuthenticationError('No refresh token available.');
    }

    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      await this.refreshPromise;
      return;
    }

    // Start a new refresh
    this.refreshPromise = this.performTokenRefresh();

    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh request
   */
  private async performTokenRefresh(): Promise<TokenInfo> {
    if (!this.tokenInfo) {
      throw new AuthenticationError('No refresh token available.');
    }

    try {
      const response = await this.mockDataProvider.mockRefreshToken(this.tokenInfo.refreshToken);

      // Update stored tokens
      this.tokenInfo = {
        accessToken: response.response_data.access_token,
        refreshToken: response.response_data.refresh_token,
        expiresAt: response.response_data.expires_at,
        userId: this.tokenInfo.userId,
      };

      return this.tokenInfo;
    } catch (error) {
      // Clear tokens on refresh failure
      this.tokenInfo = null;
      throw new AuthenticationError(
        'Token refresh failed. Please re-authenticate.',
        error as Record<string, any>
      );
    }
  }

  /**
   * Clear stored tokens (useful for logout)
   */
  clearTokens(): void {
    this.tokenInfo = null;
    this.refreshPromise = null;
  }

  /**
   * Get current token info (for debugging/testing)
   */
  getTokenInfo(): TokenInfo | null {
    return this.tokenInfo ? { ...this.tokenInfo } : null;
  }

  /**
   * Set session context (session ID, company ID, CSRF token)
   */
  setSessionContext(sessionId: string, companyId: string, csrfToken?: string): void {
    this.currentSessionId = sessionId;
    this.companyId = companyId;
    this.csrfToken = csrfToken || null;
  }

  /**
   * Get the current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  /**
   * Get the current company ID
   */
  getCurrentCompanyId(): string | null {
    return this.companyId;
  }

  /**
   * Get the current CSRF token
   */
  getCurrentCsrfToken(): string | null {
    return this.csrfToken;
  }

  // Session Management
  async startSession(token: string, userId?: string): Promise<SessionResponse> {
    const response = await this.mockDataProvider.mockStartSession(token, userId);

    // Store session ID and set state to ACTIVE
    this.currentSessionId = response.data.session_id;
    this.currentSessionState = SessionState.ACTIVE;

    return response;
  }

  // OTP Flow
  async requestOtp(sessionId: string, email: string): Promise<OtpRequestResponse> {
    return this.mockDataProvider.mockRequestOtp(sessionId, email);
  }

  async verifyOtp(sessionId: string, otp: string): Promise<OtpVerifyResponse> {
    const response = await this.mockDataProvider.mockVerifyOtp(sessionId, otp);

    // Store tokens after successful OTP verification
    if (response.success && response.data) {
      const expiresAt = new Date(Date.now() + response.data.expires_in * 1000).toISOString();
      this.setTokens(
        response.data.access_token,
        response.data.refresh_token,
        expiresAt,
        response.data.user_id
      );
    }

    return response;
  }

  // Direct Authentication
  async authenticateDirectly(
    sessionId: string,
    userId: string
  ): Promise<SessionAuthenticateResponse> {
    // Ensure session is active before authenticating
    if (this.currentSessionState !== SessionState.ACTIVE) {
      throw new SessionError('Session must be in ACTIVE state to authenticate');
    }

    const response = await this.mockDataProvider.mockAuthenticateDirectly(sessionId, userId);

    // Store tokens after successful direct authentication
    if (response.success && response.data) {
      // For direct auth, we don't get expires_in, so we'll set a default 1-hour expiry
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
      this.setTokens(response.data.access_token, response.data.refresh_token, expiresAt, userId);
    }

    return response;
  }

  // Portal Management
  async getPortalUrl(sessionId: string): Promise<PortalUrlResponse> {
    if (this.currentSessionState !== SessionState.ACTIVE) {
      throw new SessionError('Session must be in ACTIVE state to get portal URL');
    }

    // If in mockApiOnly mode, return the real portal URL
    if (this.mockApiOnly) {
      return {
        success: true,
        message: 'Portal URL retrieved successfully',
        data: {
          portal_url: 'http://localhost:5173/companies',
        },
      };
    }

    return this.mockDataProvider.mockGetPortalUrl(sessionId);
  }

  async validatePortalSession(
    sessionId: string,
    signature: string
  ): Promise<SessionValidationResponse> {
    return this.mockDataProvider.mockValidatePortalSession(sessionId, signature);
  }

  async completePortalSession(sessionId: string): Promise<PortalUrlResponse> {
    return this.mockDataProvider.mockCompletePortalSession(sessionId);
  }

  // Portfolio Management

  async getOrders(filter?: OrdersFilter): Promise<{ data: Order[] }> {
    const accessToken = await this.getValidAccessToken();
    return this.mockDataProvider.mockGetOrders(filter);
  }


  async placeOrder(order: BrokerOrderParams): Promise<void> {
    const accessToken = await this.getValidAccessToken();
    await this.mockDataProvider.mockPlaceOrder(order);
  }



  // Enhanced Trading Methods with Session Management
  async placeBrokerOrder(
    params: Partial<BrokerOrderParams> & {
      symbol: string;
      orderQty: number;
      action: 'Buy' | 'Sell';
      orderType: 'Market' | 'Limit' | 'Stop' | 'StopLimit';
      assetType: 'Stock' | 'Option' | 'Crypto' | 'Future';
    },
    extras: BrokerExtras = {},
    connection_id?: string
  ): Promise<OrderResponse> {
    const accessToken = await this.getValidAccessToken();
    
    // Debug logging
    console.log('MockApiClient.placeBrokerOrder Debug:', {
      params,
      tradingContext: this.tradingContext,
      paramsBroker: params.broker,
      contextBroker: this.tradingContext.broker,
      paramsAccountNumber: params.accountNumber,
      contextAccountNumber: this.tradingContext.accountNumber
    });
    
    const fullParams: BrokerOrderParams = {
      broker:
        ((params.broker || this.tradingContext.broker) as
          | 'robinhood'
          | 'tasty_trade'
          | 'ninja_trader') ||
        (() => {
          throw new Error('Broker not set. Call setBroker() or pass broker parameter.');
        })(),
      accountNumber:
        params.accountNumber ||
        this.tradingContext.accountNumber ||
        (() => {
          throw new Error('Account not set. Call setAccount() or pass accountNumber parameter.');
        })(),
      symbol: params.symbol,
      orderQty: params.orderQty,
      action: params.action,
      orderType: params.orderType,
      assetType: params.assetType,
      timeInForce: params.timeInForce || 'day',
      price: params.price,
      stopPrice: params.stopPrice,
      order_id: params.order_id,
    };

    console.log('MockApiClient.placeBrokerOrder Debug - Final params:', fullParams);
    return this.mockDataProvider.mockPlaceOrder(fullParams);
  }

  async cancelBrokerOrder(
    orderId: string,
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    extras: any = {},
    connection_id?: string
  ): Promise<OrderResponse> {
    // Mock successful cancellation
    return {
      success: true,
      response_data: {
        orderId: orderId,
        status: 'cancelled',
        broker: broker || this.tradingContext.broker,
      },
      message: 'Order cancelled successfully',
      status_code: 200,
    };
  }

  async modifyBrokerOrder(
    orderId: string,
    params: Partial<BrokerOrderParams>,
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    extras: any = {},
    connection_id?: string
  ): Promise<OrderResponse> {
    // Mock successful modification
    return {
      success: true,
      response_data: {
        orderId: orderId,
        status: 'modified',
        broker: broker || this.tradingContext.broker,
        ...params,
      },
      message: 'Order modified successfully',
      status_code: 200,
    };
  }

  // Context management methods
  setBroker(broker: 'robinhood' | 'tasty_trade' | 'ninja_trader'): void {
    this.tradingContext.broker = broker;
    // Clear account when broker changes
    this.tradingContext.accountNumber = undefined;
    this.tradingContext.accountId = undefined;
  }

  setAccount(accountNumber: string, accountId?: string): void {
    console.log('MockApiClient.setAccount Debug:', {
      accountNumber,
      accountId,
      previousContext: { ...this.tradingContext }
    });
    this.tradingContext.accountNumber = accountNumber;
    this.tradingContext.accountId = accountId;
    console.log('MockApiClient.setAccount Debug - Updated context:', this.tradingContext);
  }

  getTradingContext(): TradingContext {
    return { ...this.tradingContext };
  }

  clearTradingContext(): void {
    this.tradingContext = {};
  }

  // Stock convenience methods
  async placeStockMarketOrder(
    symbol: string,
    orderQty: number,
    action: 'Buy' | 'Sell',
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    accountNumber?: string,
    extras: BrokerExtras = {}
  ): Promise<OrderResponse> {
    return this.placeBrokerOrder(
      {
        broker,
        accountNumber,
        symbol,
        orderQty,
        action,
        orderType: 'Market',
        assetType: 'Stock',
        timeInForce: 'day',
      },
      extras
    );
  }

  async placeStockLimitOrder(
    symbol: string,
    orderQty: number,
    action: 'Buy' | 'Sell',
    price: number,
    timeInForce: 'day' | 'gtc' = 'gtc',
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    accountNumber?: string,
    extras: BrokerExtras = {}
  ): Promise<OrderResponse> {
    return this.placeBrokerOrder(
      {
        broker,
        accountNumber,
        symbol,
        orderQty,
        action,
        orderType: 'Limit',
        assetType: 'Stock',
        timeInForce,
        price,
      },
      extras
    );
  }

  async placeStockStopOrder(
    symbol: string,
    orderQty: number,
    action: 'Buy' | 'Sell',
    stopPrice: number,
    timeInForce: 'day' | 'gtc' = 'day',
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    accountNumber?: string,
    extras: BrokerExtras = {}
  ): Promise<OrderResponse> {
    return this.placeBrokerOrder(
      {
        broker,
        accountNumber,
        symbol,
        orderQty,
        action,
        orderType: 'Stop',
        assetType: 'Stock',
        timeInForce,
        stopPrice,
      },
      extras
    );
  }

  // Crypto convenience methods
  async placeCryptoMarketOrder(
    symbol: string,
    orderQty: number,
    action: 'Buy' | 'Sell',
    options: CryptoOrderOptions = {},
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    accountNumber?: string,
    extras: BrokerExtras = {}
  ): Promise<OrderResponse> {
    const orderParams: Partial<BrokerOrderParams> & {
      symbol: string;
      orderQty: number;
      action: 'Buy' | 'Sell';
      orderType: 'Market';
      assetType: 'Crypto';
    } = {
      broker,
      accountNumber,
      symbol,
      orderQty: options.quantity || orderQty,
      action,
      orderType: 'Market',
      assetType: 'Crypto',
      timeInForce: 'gtc', // Crypto typically uses GTC
    };

    return this.placeBrokerOrder(orderParams, extras);
  }

  async placeCryptoLimitOrder(
    symbol: string,
    orderQty: number,
    action: 'Buy' | 'Sell',
    price: number,
    timeInForce: 'day' | 'gtc' = 'gtc',
    options: CryptoOrderOptions = {},
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    accountNumber?: string,
    extras: BrokerExtras = {}
  ): Promise<OrderResponse> {
    const orderParams: Partial<BrokerOrderParams> & {
      symbol: string;
      orderQty: number;
      action: 'Buy' | 'Sell';
      orderType: 'Limit';
      assetType: 'Crypto';
    } = {
      broker,
      accountNumber,
      symbol,
      orderQty: options.quantity || orderQty,
      action,
      orderType: 'Limit',
      assetType: 'Crypto',
      timeInForce,
      price,
    };

    return this.placeBrokerOrder(orderParams, extras);
  }

  // Options convenience methods
  async placeOptionsMarketOrder(
    symbol: string,
    orderQty: number,
    action: 'Buy' | 'Sell',
    options: OptionsOrderOptions,
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    accountNumber?: string,
    extras: BrokerExtras = {}
  ): Promise<OrderResponse> {
    const orderParams: Partial<BrokerOrderParams> & {
      symbol: string;
      orderQty: number;
      action: 'Buy' | 'Sell';
      orderType: 'Market';
      assetType: 'Option';
    } = {
      broker,
      accountNumber,
      symbol,
      orderQty,
      action,
      orderType: 'Market',
      assetType: 'Option',
      timeInForce: 'day',
    };

    return this.placeBrokerOrder(orderParams, extras);
  }

  async placeOptionsLimitOrder(
    symbol: string,
    orderQty: number,
    action: 'Buy' | 'Sell',
    price: number,
    options: OptionsOrderOptions,
    timeInForce: 'day' | 'gtc' = 'gtc',
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    accountNumber?: string,
    extras: BrokerExtras = {}
  ): Promise<OrderResponse> {
    const orderParams: Partial<BrokerOrderParams> & {
      symbol: string;
      orderQty: number;
      action: 'Buy' | 'Sell';
      orderType: 'Limit';
      assetType: 'Option';
    } = {
      broker,
      accountNumber,
      symbol,
      orderQty,
      action,
      orderType: 'Limit',
      assetType: 'Option',
      timeInForce,
      price,
    };

    return this.placeBrokerOrder(orderParams, extras);
  }

  // Futures convenience methods
  async placeFuturesMarketOrder(
    symbol: string,
    orderQty: number,
    action: 'Buy' | 'Sell',
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    accountNumber?: string,
    extras: BrokerExtras = {}
  ): Promise<OrderResponse> {
    return this.placeBrokerOrder(
      {
        broker,
        accountNumber,
        symbol,
        orderQty,
        action,
        orderType: 'Market',
        assetType: 'Future',
        timeInForce: 'day',
      },
      extras
    );
  }

  async placeFuturesLimitOrder(
    symbol: string,
    orderQty: number,
    action: 'Buy' | 'Sell',
    price: number,
    timeInForce: 'day' | 'gtc' = 'gtc',
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    accountNumber?: string,
    extras: BrokerExtras = {}
  ): Promise<OrderResponse> {
    return this.placeBrokerOrder(
      {
        broker,
        accountNumber,
        symbol,
        orderQty,
        action,
        orderType: 'Limit',
        assetType: 'Future',
        timeInForce,
        price,
      },
      extras
    );
  }


  async getUserToken(sessionId: string): Promise<UserToken> {
    const token = this.mockDataProvider.getUserToken(sessionId);
    if (!token) {
      throw new AuthenticationError('User token not found');
    }
    return token;
  }

  getCurrentSessionState(): SessionState | null {
    return this.currentSessionState;
  }

  // Broker Data Management
  async getBrokerList(): Promise<{
    _id: string;
    response_data: BrokerInfo[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    const accessToken = await this.getValidAccessToken();
    return this.mockDataProvider.mockGetBrokerList();
  }

  async getBrokerAccounts(
    options?: BrokerDataOptions
  ): Promise<{
    _id: string;
    response_data: BrokerAccount[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    const accessToken = await this.getValidAccessToken();
    return this.mockDataProvider.mockGetBrokerAccounts();
  }

  async getBrokerOrders(
    options?: BrokerDataOptions
  ): Promise<{
    _id: string;
    response_data: BrokerOrder[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    const accessToken = await this.getValidAccessToken();
    // Return empty orders for now - keeping original interface
    return {
      _id: uuidv4(),
      response_data: [],
      message: 'Broker orders retrieved successfully',
      status_code: 200,
      warnings: null,
      errors: null,
    };
  }

  async getBrokerPositions(
    options?: BrokerDataOptions
  ): Promise<{
    _id: string;
    response_data: BrokerPosition[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    const accessToken = await this.getValidAccessToken();
    // Return empty positions for now - keeping original interface
    return {
      _id: uuidv4(),
      response_data: [],
      message: 'Broker positions retrieved successfully',
      status_code: 200,
      warnings: null,
      errors: null,
    };
  }

  // New broker data methods with filtering support
  async getBrokerOrdersWithFilter(filter?: OrdersFilter): Promise<{ data: BrokerDataOrder[] }> {
    return this.mockDataProvider.mockGetBrokerOrders(filter);
  }

  async getBrokerPositionsWithFilter(
    filter?: PositionsFilter
  ): Promise<{ data: BrokerDataPosition[] }> {
    return this.mockDataProvider.mockGetBrokerPositions(filter);
  }

  async getBrokerDataAccountsWithFilter(
    filter?: AccountsFilter
  ): Promise<{ data: BrokerAccount[] }> {
    return this.mockDataProvider.mockGetBrokerDataAccounts(filter);
  }

  // Page-based pagination methods
  async getBrokerOrdersPage(
    page: number = 1,
    perPage: number = 100,
    filters?: OrdersFilter
  ): Promise<PaginatedResult<BrokerDataOrder[]>> {
    const mockOrders = await this.mockDataProvider.mockGetBrokerOrders(filters);
    const orders = mockOrders.data;

    // Simulate pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedOrders = orders.slice(startIndex, endIndex);

    const hasMore = endIndex < orders.length;
    const nextOffset = hasMore ? endIndex : startIndex;

    // Create navigation callback for mock pagination
    const navigationCallback = async (
      newOffset: number,
      newLimit: number
    ): Promise<PaginatedResult<BrokerDataOrder[]>> => {
      const newStartIndex = newOffset;
      const newEndIndex = newStartIndex + newLimit;
      const newPaginatedOrders = orders.slice(newStartIndex, newEndIndex);
      const newHasMore = newEndIndex < orders.length;
      const newNextOffset = newHasMore ? newEndIndex : newStartIndex;

      return new PaginatedResult(
        newPaginatedOrders,
        {
          has_more: newHasMore,
          next_offset: newNextOffset,
          current_offset: newStartIndex,
          limit: newLimit,
        },
        navigationCallback
      );
    };

    return new PaginatedResult(
      paginatedOrders,
      {
        has_more: hasMore,
        next_offset: nextOffset,
        current_offset: startIndex,
        limit: perPage,
      },
      navigationCallback
    );
  }

  async getBrokerAccountsPage(
    page: number = 1,
    perPage: number = 100,
    filters?: AccountsFilter
  ): Promise<PaginatedResult<BrokerAccount[]>> {
    const mockAccounts = await this.mockDataProvider.mockGetBrokerDataAccounts(filters);
    const accounts = mockAccounts.data;

    // Simulate pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedAccounts = accounts.slice(startIndex, endIndex);

    const hasMore = endIndex < accounts.length;
    const nextOffset = hasMore ? endIndex : startIndex;

    // Create navigation callback for mock pagination
    const navigationCallback = async (
      newOffset: number,
      newLimit: number
    ): Promise<PaginatedResult<BrokerAccount[]>> => {
      const newStartIndex = newOffset;
      const newEndIndex = newStartIndex + newLimit;
      const newPaginatedAccounts = accounts.slice(newStartIndex, newEndIndex);
      const newHasMore = newEndIndex < accounts.length;
      const newNextOffset = newHasMore ? newEndIndex : newStartIndex;

      return new PaginatedResult(
        newPaginatedAccounts,
        {
          has_more: newHasMore,
          next_offset: newNextOffset,
          current_offset: newStartIndex,
          limit: newLimit,
        },
        navigationCallback
      );
    };

    return new PaginatedResult(
      paginatedAccounts,
      {
        has_more: hasMore,
        next_offset: nextOffset,
        current_offset: startIndex,
        limit: perPage,
      },
      navigationCallback
    );
  }

  async getBrokerPositionsPage(
    page: number = 1,
    perPage: number = 100,
    filters?: PositionsFilter
  ): Promise<PaginatedResult<BrokerDataPosition[]>> {
    const mockPositions = await this.mockDataProvider.mockGetBrokerPositions(filters);
    const positions = mockPositions.data;

    // Simulate pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedPositions = positions.slice(startIndex, endIndex);

    const hasMore = endIndex < positions.length;
    const nextOffset = hasMore ? endIndex : startIndex;

    // Create navigation callback for mock pagination
    const navigationCallback = async (
      newOffset: number,
      newLimit: number
    ): Promise<PaginatedResult<BrokerDataPosition[]>> => {
      const newStartIndex = newOffset;
      const newEndIndex = newStartIndex + newLimit;
      const newPaginatedPositions = positions.slice(newStartIndex, newEndIndex);
      const newHasMore = newEndIndex < positions.length;
      const newNextOffset = newHasMore ? newEndIndex : newStartIndex;

      return new PaginatedResult(
        newPaginatedPositions,
        {
          has_more: newHasMore,
          next_offset: newNextOffset,
          current_offset: newStartIndex,
          limit: newLimit,
        },
        navigationCallback
      );
    };

    return new PaginatedResult(
      paginatedPositions,
      {
        has_more: hasMore,
        next_offset: nextOffset,
        current_offset: startIndex,
        limit: perPage,
      },
      navigationCallback
    );
  }

  async getBrokerConnections(): Promise<{
    _id: string;
    response_data: BrokerConnection[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    const accessToken = await this.getValidAccessToken();
    return this.mockDataProvider.mockGetBrokerConnections();
  }

  /**
   * Mock disconnect company method
   * @param connectionId - The connection ID to disconnect
   * @returns Promise with mock disconnect response
   */
  async disconnectCompany(connectionId: string): Promise<DisconnectCompanyResponse> {
    const accessToken = await this.getValidAccessToken();
    return this.mockDataProvider.mockDisconnectCompany(connectionId);
  }

  // Utility methods for mock system
  getMockDataProvider(): MockDataProvider {
    return this.mockDataProvider;
  }

  clearMockData(): void {
    this.mockDataProvider.clearData();
  }

  /**
   * Check if this is a mock client
   * @returns true if this is a mock client
   */
  isMockClient(): boolean {
    return true;
  }
}
