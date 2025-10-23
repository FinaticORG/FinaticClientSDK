import { v4 as uuidv4 } from 'uuid';

// Import types from the main API types
import { Order, OrderResponse } from '../types/api/orders';
import { 
  BrokerInfo,
  BrokerAccount,
  BrokerOrder,
  BrokerPosition,
  BrokerBalance,
  BrokerConnection,
  OrdersFilter,
  PositionsFilter,
  AccountsFilter,
  BalancesFilter,
  BrokerDataOrder,
  BrokerDataPosition,
  BrokerDataAccount,
  BrokerOrderParams,
  DisconnectCompanyResponse,
} from '../types/api/broker';
import { 
  SessionResponse,
  OtpRequestResponse,
  OtpVerifyResponse,
  SessionValidationResponse,
  SessionAuthenticateResponse,
  UserToken,
  RefreshTokenResponse,
  SessionState,
} from '../types/api/auth';
import { PortalUrlResponse } from '../types/api/core';

/**
 * Configuration for mock behavior
 */
export interface MockConfig {
  delay?: number;
  scenario?: MockScenario;
  customData?: Record<string, any>;
  mockApiOnly?: boolean;
}

/**
 * Different mock scenarios for testing
 */
export type MockScenario = 'success' | 'error' | 'network_error' | 'rate_limit' | 'auth_failure';

/**
 * Mock data provider for Finatic API endpoints
 */
export class MockDataProvider {
  private config: MockConfig;
  private sessionData: Map<string, any> = new Map();
  private userTokens: Map<string, UserToken> = new Map();

  constructor(config: MockConfig = {}) {
    this.config = {
      delay: config.delay || this.getRandomDelay(50, 200),
      scenario: config.scenario || 'success',
      customData: config.customData || {},
    };
  }

  /**
   * Get a random delay between min and max milliseconds
   */
  private getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Simulate network delay
   */
  async simulateDelay(): Promise<void> {
    const delay = this.config.delay || this.getRandomDelay(50, 200);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Generate a realistic session ID
   */
  private generateSessionId(): string {
    return `session_${uuidv4().replace(/-/g, '')}`;
  }

  /**
   * Generate a realistic user ID
   */
  private generateUserId(): string {
    return `user_${uuidv4().replace(/-/g, '').substring(0, 8)}`;
  }

  /**
   * Generate a realistic company ID
   */
  private generateCompanyId(): string {
    return `company_${uuidv4().replace(/-/g, '').substring(0, 8)}`;
  }

  /**
   * Generate mock tokens
   */
  private generateTokens(userId: string): UserToken {
    const accessToken = `mock_access_${uuidv4().replace(/-/g, '')}`;
    const refreshToken = `mock_refresh_${uuidv4().replace(/-/g, '')}`;

    return {
      user_id: userId,
      // Removed token fields - we no longer use Supabase tokens in the SDK
    };
  }

  // Authentication & Session Management Mocks

  async mockStartSession(token: string, userId?: string): Promise<SessionResponse> {
    await this.simulateDelay();

    const sessionId = this.generateSessionId();
    const companyId = this.generateCompanyId();
    const actualUserId = userId || this.generateUserId();

    const sessionData = {
      session_id: sessionId,
      state: SessionState.ACTIVE,
      company_id: companyId,
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      user_id: actualUserId,
      auto_login: false,
    };

    this.sessionData.set(sessionId, sessionData);

    return {
      success: true,
      data: sessionData,
      message: 'Session started successfully',
    };
  }

  async mockRequestOtp(sessionId: string, email: string): Promise<OtpRequestResponse> {
    await this.simulateDelay();

    return {
      success: true,
      message: 'OTP sent successfully',
      data: true,
    };
  }

  async mockVerifyOtp(sessionId: string, otp: string): Promise<OtpVerifyResponse> {
    await this.simulateDelay();

    const userId = this.generateUserId();
    const tokens = this.generateTokens(userId);

    this.userTokens.set(userId, tokens);

    return {
      success: true,
      message: 'OTP verified successfully',
      data: {
        access_token: '', // No longer using Supabase tokens
        refresh_token: '', // No longer using Supabase tokens
        user_id: userId,
        expires_in: 0, // No token expiration for session-based auth
        scope: 'api:access',
        token_type: 'Bearer',
      },
    };
  }

  async mockAuthenticateDirectly(
    sessionId: string,
    userId: string
  ): Promise<SessionAuthenticateResponse> {
    await this.simulateDelay();

    const tokens = this.generateTokens(userId);
    this.userTokens.set(userId, tokens);

    return {
      success: true,
      message: 'Authentication successful',
      data: {
        access_token: '', // No longer using Supabase tokens
        refresh_token: '', // No longer using Supabase tokens
      },
    };
  }

  async mockGetPortalUrl(sessionId: string): Promise<PortalUrlResponse> {
    await this.simulateDelay();
    const scenario = this.getScenario();
    if (scenario === 'error') {
      return {
        success: false,
        message: 'Failed to retrieve portal URL (mock error)',
        data: { portal_url: '' },
      };
    }
    if (scenario === 'network_error') {
      throw new Error('Network error (mock)');
    }
    if (scenario === 'rate_limit') {
      return {
        success: false,
        message: 'Rate limit exceeded (mock)',
        data: { portal_url: '' },
      };
    }
    if (scenario === 'auth_failure') {
      return {
        success: false,
        message: 'Authentication failed (mock)',
        data: { portal_url: '' },
      };
    }
    // Default: success
    return {
      success: true,
      message: 'Portal URL retrieved successfully',
      data: {
        portal_url: 'http://localhost:3000/mock-portal',
      },
    };
  }

  async mockValidatePortalSession(
    sessionId: string,
    signature: string
  ): Promise<SessionValidationResponse> {
    await this.simulateDelay();

    return {
      valid: true,
      company_id: this.generateCompanyId(),
      status: 'active',
      is_sandbox: false,
      environment: 'production',
    };
  }

  async mockCompletePortalSession(sessionId: string): Promise<PortalUrlResponse> {
    await this.simulateDelay();

    return {
      success: true,
      message: 'Portal session completed successfully',
      data: {
        portal_url: `https://portal.finatic.dev/complete/${sessionId}`,
      },
    };
  }

  async mockRefreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    await this.simulateDelay();

    const newAccessToken = `mock_access_${uuidv4().replace(/-/g, '')}`;
    const newRefreshToken = `mock_refresh_${uuidv4().replace(/-/g, '')}`;

    return {
      success: true,
      response_data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        company_id: this.generateCompanyId(),
        company_name: 'Mock Company',
        email_verified: true,
      },
      message: 'Token refreshed successfully',
    };
  }

  // Broker Management Mocks

  async mockGetBrokerList(): Promise<{
    _id: string;
    response_data: BrokerInfo[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    await this.simulateDelay();

    const brokers: BrokerInfo[] = [
      {
        id: 'alpaca',
        name: 'alpaca',
        display_name: 'Alpaca',
        description: 'Commission-free stock trading and crypto',
        website: 'https://alpaca.markets',
        features: ['stocks', 'crypto', 'fractional_shares', 'api_trading'],
        auth_type: 'api_key',
        logo_path: '/logos/alpaca.png',
        is_active: true,
      },
      {
        id: 'robinhood',
        name: 'robinhood',
        display_name: 'Robinhood',
        description: 'Commission-free stock and options trading',
        website: 'https://robinhood.com',
        features: ['stocks', 'options', 'crypto', 'fractional_shares'],
        auth_type: 'oauth',
        logo_path: '/logos/robinhood.png',
        is_active: true,
      },
      {
        id: 'tasty_trade',
        name: 'tasty_trade',
        display_name: 'TastyTrade',
        description: 'Options and futures trading platform',
        website: 'https://tastytrade.com',
        features: ['options', 'futures', 'stocks'],
        auth_type: 'oauth',
        logo_path: '/logos/tastytrade.png',
        is_active: true,
      },
      {
        id: 'ninja_trader',
        name: 'ninja_trader',
        display_name: 'NinjaTrader',
        description: 'Advanced futures and forex trading platform',
        website: 'https://ninjatrader.com',
        features: ['futures', 'forex', 'options'],
        auth_type: 'api_key',
        logo_path: '/logos/ninjatrader.png',
        is_active: true,
      },
    ];

    return {
      _id: uuidv4(),
      response_data: brokers,
      message: 'Broker list retrieved successfully',
      status_code: 200,
      warnings: null,
      errors: null,
    };
  }

  async mockGetBrokerAccounts(): Promise<{
    _id: string;
    response_data: BrokerAccount[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    await this.simulateDelay();

    const accounts: BrokerAccount[] = [
      {
        id: uuidv4(),
        user_broker_connection_id: uuidv4(),
        broker_provided_account_id: '123456789',
        account_name: 'Individual Account',
        account_type: 'individual',
        currency: 'USD',
        cash_balance: 15000.5,
        buying_power: 45000.0,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
        positions_synced_at: new Date().toISOString(),
        orders_synced_at: new Date().toISOString(),
        balances_synced_at: new Date().toISOString(),
        account_created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
        account_updated_at: new Date().toISOString(),
        account_first_trade_at: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(), // 300 days ago
      },
      {
        id: uuidv4(),
        user_broker_connection_id: uuidv4(),
        broker_provided_account_id: '987654321',
        account_name: 'IRA Account',
        account_type: 'ira',
        currency: 'USD',
        cash_balance: 25000.75,
        buying_power: 75000.0,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
        positions_synced_at: new Date().toISOString(),
        orders_synced_at: new Date().toISOString(),
        balances_synced_at: new Date().toISOString(),
        account_created_at: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(), // 2 years ago
        account_updated_at: new Date().toISOString(),
        account_first_trade_at: new Date(Date.now() - 700 * 24 * 60 * 60 * 1000).toISOString(), // 700 days ago
      },
    ];

    return {
      _id: uuidv4(),
      response_data: accounts,
      message: 'Broker accounts retrieved successfully',
      status_code: 200,
      warnings: null,
      errors: null,
    };
  }

  async mockGetBrokerConnections(): Promise<{
    _id: string;
    response_data: BrokerConnection[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    await this.simulateDelay();

    const connections: BrokerConnection[] = [
      {
        id: uuidv4(),
        broker_id: 'robinhood',
        user_id: this.generateUserId(),
        company_id: this.generateCompanyId(),
        status: 'connected',
        connected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        last_synced_at: new Date().toISOString(),
        permissions: {
          read: true,
          write: true,
        },
        metadata: {
          nickname: 'My Robinhood',
        },
        needs_reauth: false,
      },
      {
        id: uuidv4(),
        broker_id: 'tasty_trade',
        user_id: this.generateUserId(),
        company_id: this.generateCompanyId(),
        status: 'connected',
        connected_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        last_synced_at: new Date().toISOString(),
        permissions: {
          read: true,
          write: false,
        },
        metadata: {
          nickname: 'Tasty Options',
        },
        needs_reauth: false,
      },
    ];

    return {
      _id: uuidv4(),
      response_data: connections,
      message: 'Broker connections retrieved successfully',
      status_code: 200,
      warnings: null,
      errors: null,
    };
  }

  // Portfolio & Trading Mocks



  async mockGetOrders(filter?: OrdersFilter): Promise<{ data: Order[] }> {
    await this.simulateDelay();

    const mockOrders: Order[] = [
      {
        symbol: 'AAPL',
        side: 'buy',
        quantity: 100,
        type_: 'market',
        timeInForce: 'day',
      },
      {
        symbol: 'TSLA',
        side: 'sell',
        quantity: 50,
        type_: 'limit',
        price: 250.0,
        timeInForce: 'day',
      },
    ];

    // Apply filters if provided
    let filteredOrders = mockOrders;
    if (filter) {
      filteredOrders = this.applyOrderFilters(mockOrders, filter);
    }

    return { data: filteredOrders };
  }

  async mockGetBrokerOrders(filter?: OrdersFilter): Promise<{ data: BrokerDataOrder[] }> {
    await this.simulateDelay();

    // Determine how many orders to generate based on limit parameter
    const limit = filter?.limit || 100;
    const maxLimit = Math.min(limit, 1000); // Cap at 1000
    const count = Math.max(1, maxLimit); // At least 1

    // Generate diverse mock orders based on requested count
    const mockOrders: BrokerDataOrder[] = this.generateMockOrders(count);

    // Apply filters if provided
    let filteredOrders = mockOrders;
    if (filter) {
      filteredOrders = this.applyBrokerOrderFilters(mockOrders, filter);
    }

    return {
      data: filteredOrders,
    };
  }

  async mockGetBrokerPositions(filter?: PositionsFilter): Promise<{ data: BrokerDataPosition[] }> {
    await this.simulateDelay();

    // Determine how many positions to generate based on limit parameter
    const limit = filter?.limit || 100;
    const maxLimit = Math.min(limit, 1000); // Cap at 1000
    const count = Math.max(1, maxLimit); // At least 1

    // Generate diverse mock positions based on requested count
    const mockPositions: BrokerDataPosition[] = this.generateMockPositions(count);

    // Apply filters if provided
    let filteredPositions = mockPositions;
    if (filter) {
      filteredPositions = this.applyBrokerPositionFilters(mockPositions, filter);
    }

    return {
      data: filteredPositions,
    };
  }

  async mockGetBrokerBalances(filter?: BalancesFilter): Promise<{ data: BrokerBalance[] }> {
    await this.simulateDelay();

    // Determine how many balances to generate based on limit parameter
    const limit = filter?.limit || 100;
    const maxLimit = Math.min(limit, 1000); // Cap at 1000

    const mockBalances: BrokerBalance[] = [];
    for (let i = 0; i < maxLimit; i++) {
      const totalCashValue = Math.random() * 100000 + 10000; // $10k - $110k
      const netLiquidationValue = totalCashValue * (0.8 + Math.random() * 0.4); // ±20% variation
      const initialMargin = netLiquidationValue * 0.1; // 10% of net liquidation
      const maintenanceMargin = initialMargin * 0.8; // 80% of initial margin
      const availableToWithdraw = totalCashValue * 0.9; // 90% of cash available
      const totalRealizedPnl = (Math.random() - 0.5) * 10000; // -$5k to +$5k

      const balance: BrokerBalance = {
        id: `balance_${i + 1}`,
        account_id: `account_${Math.floor(Math.random() * 3) + 1}`,
        total_cash_value: totalCashValue,
        net_liquidation_value: netLiquidationValue,
        initial_margin: initialMargin,
        maintenance_margin: maintenanceMargin,
        available_to_withdraw: availableToWithdraw,
        total_realized_pnl: totalRealizedPnl,
        balance_created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        balance_updated_at: new Date().toISOString(),
        is_end_of_day_snapshot: Math.random() > 0.7, // 30% chance of being EOD snapshot
        raw_payload: {
          broker_specific_data: {
            margin_ratio: netLiquidationValue / initialMargin,
            day_trading_buying_power: availableToWithdraw * 4,
            overnight_buying_power: availableToWithdraw * 2,
          },
        },
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockBalances.push(balance);
    }

    // Apply filters if provided
    let filteredBalances = mockBalances;
    if (filter) {
      filteredBalances = this.applyBrokerBalanceFilters(mockBalances, filter);
    }

    return {
      data: filteredBalances,
    };
  }

  async mockGetBrokerDataAccounts(filter?: AccountsFilter): Promise<{ data: BrokerAccount[] }> {
    await this.simulateDelay();

    // Determine how many accounts to generate based on limit parameter
    const limit = filter?.limit || 100;
    const maxLimit = Math.min(limit, 1000); // Cap at 1000
    const count = Math.max(1, maxLimit); // At least 1

    // Generate diverse mock accounts based on requested count
    const mockAccounts: BrokerAccount[] = this.generateMockAccounts(count);

    // Apply filters if provided
    let filteredAccounts = mockAccounts;
    if (filter) {
      filteredAccounts = this.applyBrokerAccountFilters(mockAccounts, filter);
    }

    return {
      data: filteredAccounts,
    };
  }

  async mockPlaceOrder(order: BrokerOrderParams): Promise<OrderResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Generate a mock order ID
    const orderId = `mock_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      response_data: {
        orderId: orderId,
        status: 'pending',
        broker: order.broker,
        accountNumber: order.accountNumber,
        symbol: order.symbol,
        orderType: order.orderType,
        assetType: order.assetType,
        action: order.action,
        quantity: order.orderQty,
        price: order.price,
        stopPrice: order.stopPrice,
        timeInForce: order.timeInForce,
      },
      message: 'Order placed successfully',
      status_code: 200,
    };
  }

  // Utility methods

  /**
   * Get stored session data
   */
  getSessionData(sessionId: string): any {
    return this.sessionData.get(sessionId);
  }

  /**
   * Get stored user token
   */
  getUserToken(sessionId: string): UserToken | undefined {
    return this.userTokens.get(sessionId);
  }

  /**
   * Clear all stored data
   */
  clearData(): void {
    this.sessionData.clear();
    this.userTokens.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MockConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setScenario(scenario: MockScenario) {
    this.config.scenario = scenario;
  }
  getScenario(): MockScenario {
    return this.config.scenario || 'success';
  }

  // Helper methods to apply filters
  private applyOrderFilters(orders: Order[], filter: OrdersFilter): Order[] {
    return orders.filter(order => {
      if (filter.symbol && order.symbol !== filter.symbol) return false;
      if (filter.side && order.side !== filter.side) return false;
      return true;
    });
  }

  private applyBrokerOrderFilters(
    orders: BrokerDataOrder[],
    filter: OrdersFilter
  ): BrokerDataOrder[] {
    return orders.filter(order => {
      if (filter.broker_id && order.broker_id !== filter.broker_id) return false;
      if (filter.connection_id && order.connection_id !== filter.connection_id) return false;
      if (filter.account_id && order.account_id !== filter.account_id) return false;
      if (filter.symbol && order.symbol !== filter.symbol) return false;
      if (filter.status && order.status !== filter.status) return false;
      if (filter.side && order.side !== filter.side) return false;
      if (filter.asset_type && order.asset_type !== filter.asset_type) return false;
      if (filter.created_after && new Date(order.created_at) < new Date(filter.created_after))
        return false;
      if (filter.created_before && new Date(order.created_at) > new Date(filter.created_before))
        return false;
      return true;
    });
  }

  private applyBrokerPositionFilters(
    positions: BrokerDataPosition[],
    filter: PositionsFilter
  ): BrokerDataPosition[] {
    return positions.filter(position => {
      if (filter.broker_id && position.broker_id !== filter.broker_id) return false;
      if (filter.connection_id && position.connection_id !== filter.connection_id) return false;
      if (filter.account_id && position.account_id !== filter.account_id) return false;
      if (filter.symbol && position.symbol !== filter.symbol) return false;
      if (filter.side && position.side !== filter.side) return false;
      if (filter.asset_type && position.asset_type !== filter.asset_type) return false;
      if (filter.position_status && position.position_status !== filter.position_status)
        return false;
      if (filter.updated_after && new Date(position.updated_at) < new Date(filter.updated_after))
        return false;
      if (filter.updated_before && new Date(position.updated_at) > new Date(filter.updated_before))
        return false;
      return true;
    });
  }

  private applyBrokerAccountFilters(
    accounts: BrokerAccount[],
    filter: AccountsFilter
  ): BrokerAccount[] {
    return accounts.filter(account => {
      if (filter.broker_id && account.user_broker_connection_id !== filter.connection_id) return false;
      if (filter.connection_id && account.user_broker_connection_id !== filter.connection_id) return false;
      if (filter.account_type && account.account_type !== filter.account_type) return false;
      if (filter.status && account.status !== filter.status) return false;
      if (filter.currency && account.currency !== filter.currency) return false;
      return true;
    });
  }

  private applyBrokerBalanceFilters(
    balances: BrokerBalance[],
    filter: BalancesFilter
  ): BrokerBalance[] {
    return balances.filter(balance => {
      if (filter.account_id && balance.account_id !== filter.account_id) return false;
      if (filter.is_end_of_day_snapshot !== undefined && balance.is_end_of_day_snapshot !== filter.is_end_of_day_snapshot) return false;
      if (filter.balance_created_after && balance.balance_created_at && new Date(balance.balance_created_at) < new Date(filter.balance_created_after)) return false;
      if (filter.balance_created_before && balance.balance_created_at && new Date(balance.balance_created_at) > new Date(filter.balance_created_before)) return false;
      return true;
    });
  }

  /**
   * Generate mock orders with diverse data
   */
  private generateMockOrders(count: number): BrokerDataOrder[] {
    const orders: BrokerDataOrder[] = [];
    const symbols = [
      'AAPL',
      'TSLA',
      'MSFT',
      'GOOGL',
      'AMZN',
      'META',
      'NVDA',
      'NFLX',
      'SPY',
      'QQQ',
      'IWM',
      'VTI',
      'BTC',
      'ETH',
      'ADA',
    ];
    const brokers = ['robinhood', 'alpaca', 'tasty_trade', 'ninja_trader'];
    const orderTypes = ['market', 'limit', 'stop', 'stop_limit'] as const;
    const sides = ['buy', 'sell'] as const;
    const statuses = ['filled', 'pending', 'cancelled', 'rejected', 'partially_filled'] as const;
    const assetTypes = ['stock', 'option', 'crypto', 'future'] as const;

    for (let i = 0; i < count; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const broker = brokers[Math.floor(Math.random() * brokers.length)];
      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
      const side = sides[Math.floor(Math.random() * sides.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const assetType = assetTypes[Math.floor(Math.random() * assetTypes.length)];
      const quantity = Math.floor(Math.random() * 1000) + 1;
      const price = Math.random() * 500 + 10;
      const isFilled = status === 'filled' || status === 'partially_filled';
      const filledQuantity = isFilled ? Math.floor(quantity * (0.5 + Math.random() * 0.5)) : 0;
      const filledAvgPrice = isFilled ? price * (0.95 + Math.random() * 0.1) : 0;

      orders.push({
        id: uuidv4(),
        broker_id: broker,
        connection_id: uuidv4(),
        account_id: `account_${Math.floor(Math.random() * 1000000)}`,
        order_id: `order_${String(i + 1).padStart(6, '0')}`,
        symbol,
        order_type: orderType,
        side,
        quantity,
        price,
        status,
        asset_type: assetType,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
        updated_at: new Date().toISOString(),
        filled_at: isFilled ? new Date().toISOString() : undefined,
        filled_quantity: filledQuantity,
        filled_avg_price: filledAvgPrice,
      });
    }

    return orders;
  }

  /**
   * Generate mock positions with diverse data
   */
  private generateMockPositions(count: number): BrokerDataPosition[] {
    const positions: BrokerDataPosition[] = [];
    const symbols = [
      'AAPL',
      'TSLA',
      'MSFT',
      'GOOGL',
      'AMZN',
      'META',
      'NVDA',
      'NFLX',
      'SPY',
      'QQQ',
      'IWM',
      'VTI',
      'BTC',
      'ETH',
      'ADA',
    ];
    const brokers = ['robinhood', 'alpaca', 'tasty_trade', 'ninja_trader'];
    const sides = ['long', 'short'] as const;
    const assetTypes = ['stock', 'option', 'crypto', 'future'] as const;
    const positionStatuses = ['open', 'closed'] as const;

    for (let i = 0; i < count; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const broker = brokers[Math.floor(Math.random() * brokers.length)];
      const side = sides[Math.floor(Math.random() * sides.length)];
      const assetType = assetTypes[Math.floor(Math.random() * assetTypes.length)];
      const positionStatus = positionStatuses[Math.floor(Math.random() * positionStatuses.length)];
      const quantity = Math.floor(Math.random() * 1000) + 1;
      const averagePrice = Math.random() * 500 + 10;
      const currentPrice = averagePrice * (0.8 + Math.random() * 0.4); // ±20% variation
      const marketValue = quantity * currentPrice;
      const costBasis = quantity * averagePrice;
      const unrealizedGainLoss = marketValue - costBasis;
      const unrealizedGainLossPercent = (unrealizedGainLoss / costBasis) * 100;

      positions.push({
        id: uuidv4(),
        broker_id: broker,
        connection_id: uuidv4(),
        account_id: `account_${Math.floor(Math.random() * 1000000)}`,
        symbol,
        asset_type: assetType,
        side,
        quantity,
        average_price: averagePrice,
        market_value: marketValue,
        cost_basis: costBasis,
        unrealized_gain_loss: unrealizedGainLoss,
        unrealized_gain_loss_percent: unrealizedGainLossPercent,
        current_price: currentPrice,
        last_price: currentPrice,
        last_price_updated_at: new Date().toISOString(),
        position_status: positionStatus,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
        updated_at: new Date().toISOString(),
      });
    }

    return positions;
  }

  /**
   * Generate mock accounts with diverse data
   */
  private generateMockAccounts(count: number): BrokerAccount[] {
    const accounts: BrokerAccount[] = [];
    const brokers = ['robinhood', 'alpaca', 'tasty_trade', 'ninja_trader'];
    const accountTypes = ['margin', 'cash', 'crypto_wallet', 'live', 'sim'] as const;
    const statuses = ['active', 'inactive'] as const;
    const currencies = ['USD', 'EUR', 'GBP', 'CAD'];
    const accountNames = [
      'Individual Account',
      'Paper Trading',
      'Retirement Account',
      'Crypto Wallet',
      'Margin Account',
      'Cash Account',
      'Trading Account',
      'Investment Account',
    ];

    for (let i = 0; i < count; i++) {
      const broker = brokers[Math.floor(Math.random() * brokers.length)];
      const accountType = accountTypes[Math.floor(Math.random() * accountTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const currency = currencies[Math.floor(Math.random() * currencies.length)];
      const accountName = accountNames[Math.floor(Math.random() * accountNames.length)];

      const cashBalance = Math.random() * 100000 + 1000;
      const buyingPower = cashBalance * (1 + Math.random() * 2); // 1-3x cash balance

      accounts.push({
        id: uuidv4(),
        user_broker_connection_id: uuidv4(),
        broker_provided_account_id: `account_${Math.floor(Math.random() * 1000000)}`,
        account_name: `${accountName} ${i + 1}`,
        account_type: accountType,
        currency,
        cash_balance: cashBalance,
        buying_power: buyingPower,
        status,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last year
        updated_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
        positions_synced_at: new Date().toISOString(),
        orders_synced_at: new Date().toISOString(),
        balances_synced_at: new Date().toISOString(),
        account_created_at: new Date(Date.now() - Math.random() * 730 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 2 years
        account_updated_at: new Date().toISOString(),
        account_first_trade_at: new Date(Date.now() - Math.random() * 500 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 500 days
      });
    }

    return accounts;
  }

  /**
   * Mock disconnect company method
   * @param connectionId - The connection ID to disconnect
   * @returns Promise with mock disconnect response
   */
  async mockDisconnectCompany(connectionId: string): Promise<DisconnectCompanyResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Randomly decide if this will delete the connection or just remove company access
    const willDeleteConnection = Math.random() > 0.5;
    
    if (willDeleteConnection) {
      return {
        success: true,
        response_data: {
          connection_id: connectionId,
          action: 'connection_deleted',
          message: 'Company access removed and connection deleted (no companies remaining)',
        },
        message: 'Company access removed and connection deleted (no companies remaining)',
        status_code: 200,
      };
    } else {
      return {
        success: true,
        response_data: {
          connection_id: connectionId,
          action: 'company_access_removed',
          remaining_companies: Math.floor(Math.random() * 5) + 1, // 1-5 remaining companies
          message: 'Company access removed from connection',
        },
        message: 'Company access removed from connection',
        status_code: 200,
      };
    }
  }
}
