import { Order } from '../../types/api/orders';
import {
  BrokerInfo,
  BrokerAccount,
  BrokerOrder,
  BrokerPosition,
  BrokerBalance,
  BrokerDataOptions,
  DisconnectCompanyResponse,
} from '../../types/api/broker';
import { BrokerOrderParams, BrokerExtras } from '../../types/api/broker';
import { CryptoOrderOptions, OptionsOrderOptions, OrderResponse } from '../../types/api/orders';
import { BrokerConnection } from '../../types/api/broker';
import {
  OrdersFilter,
  PositionsFilter,
  AccountsFilter,
  BalancesFilter,
  OrderFill,
  OrderEvent,
  OrderGroup,
  PositionLot,
  PositionLotFill,
  OrderFillsFilter,
  OrderEventsFilter,
  OrderGroupsFilter,
  PositionLotsFilter,
  PositionLotFillsFilter,
} from '../../types/api/broker';
import { TradingContext } from '../../types/api/orders';
import { ApiPaginationInfo, PaginatedResult } from '../../types/common/pagination';
import { ApiResponse } from '../../types/api/core';
import { PortalUrlResponse } from '../../types/api/core';
import {
  DeviceInfo,
  SessionState,
  TokenInfo,
  SessionResponse,
  SessionResponseData,
  OtpRequestResponse,
  OtpVerifyResponse,
  SessionValidationResponse,
  SessionAuthenticateResponse,
  UserToken,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../../types/api/auth';
import {
  ApiError,
  SessionError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  CompanyAccessError,
  OrderError,
  OrderValidationError,
  TradingNotEnabledError,
} from '../../utils/errors';
// Supabase import removed - SDK no longer depends on Supabase

export class ApiClient {
  private readonly baseUrl: string;
  protected readonly deviceInfo?: DeviceInfo;
  protected currentSessionState: SessionState | null = null;
  protected currentSessionId: string | null = null;
  private tradingContext: TradingContext = {};

  // Session management (no Supabase needed)

  // Session and company context
  private companyId: string | null = null;
  private csrfToken: string | null = null;

  constructor(baseUrl: string, deviceInfo?: DeviceInfo) {
    this.baseUrl = baseUrl;
    this.deviceInfo = deviceInfo;
    // Ensure baseUrl doesn't end with a slash
    this.baseUrl = baseUrl.replace(/\/$/, '');
    // Append /api/v1 if not already present
    if (!this.baseUrl.includes('/api/v1')) {
      this.baseUrl = `${this.baseUrl}/api/v1`;
    }

    // No Supabase initialization needed - SDK is clean
  }

  // Supabase initialization removed - SDK no longer depends on Supabase

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

  /**
   * Get a valid access token (session-based auth - no tokens needed)
   */
  async getValidAccessToken(): Promise<string> {
    // Session-based auth - return empty token as we use session headers
    return '';
  }

  // Token expiration check removed - session-based auth doesn't use expiring tokens

  // Supabase refresh method removed - SDK no longer uses Supabase tokens

  /**
   * Perform the actual Supabase session refresh
   */
  // Supabase refresh method removed - SDK no longer uses Supabase tokens

  /**
   * Clear session tokens (useful for logout)
   */
  clearTokens(): void {
    // Session-based auth - no tokens to clear
  }

  /**
   * Get current session info (for debugging/testing) - session-based auth
   */
  getTokenInfo(): { accessToken: string; refreshToken: string; expiresAt: number } | null {
    // Session-based auth - no tokens to return
    return null;
  }

  /**
   * Make a request to the API.
   */
  protected async request<T>(
    path: string,
    options: {
      method: string;
      headers?: Record<string, string>;
      body?: any;
      params?: Record<string, string>;
    }
  ): Promise<T> {
    // Ensure path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalizedPath}`);

    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    // Get Supabase JWT token
    const accessToken = await this.getValidAccessToken();

    // Build comprehensive headers object with all available session data
    const comprehensiveHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };

    // Add device info if available
    if (this.deviceInfo) {
      comprehensiveHeaders['X-Device-Info'] = JSON.stringify({
        ip_address: this.deviceInfo.ip_address || '',
        user_agent: this.deviceInfo.user_agent || '',
        fingerprint: this.deviceInfo.fingerprint || '',
      });
    }

    // Add session headers if available (filter out empty values)
    if (this.currentSessionId && this.currentSessionId.trim() !== '') {
      comprehensiveHeaders['X-Session-ID'] = this.currentSessionId;
      comprehensiveHeaders['Session-ID'] = this.currentSessionId;
    }

    if (this.companyId && this.companyId.trim() !== '') {
      comprehensiveHeaders['X-Company-ID'] = this.companyId;
    }

    if (this.csrfToken && this.csrfToken.trim() !== '') {
      comprehensiveHeaders['X-CSRF-Token'] = this.csrfToken;
    }

    // Add any additional headers from options (these will override defaults)
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value.trim() !== '') {
          comprehensiveHeaders[key] = value;
        }
      });
    }

    // Safari-specific fix: Ensure all headers are explicitly set and not empty
    // Safari can be strict about header formatting and empty values
    const safariSafeHeaders: Record<string, string> = {};
    Object.entries(comprehensiveHeaders).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        // Ensure header names are properly formatted for Safari
        const normalizedKey = key.trim();
        const normalizedValue = value.trim();
        safariSafeHeaders[normalizedKey] = normalizedValue;
      }
    });

    // Debug logging for development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('Request to:', url.toString());
      console.log('Safari-safe headers:', safariSafeHeaders);
      console.log('Browser:', navigator.userAgent);
      console.log('Session ID:', this.currentSessionId);
      console.log('Company ID:', this.companyId);
      console.log('CSRF Token:', this.csrfToken);
    }

    const response = await fetch(url.toString(), {
      method: options.method,
      headers: safariSafeHeaders,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // Debug logging for response
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Request was made with headers:', safariSafeHeaders);
    }

    if (!response.ok) {
      const error = await response.json();
      throw this.handleError(response.status, error);
    }

    const data = await response.json();

    // Check if the response has a success field and it's false
    if (data && typeof data === 'object' && 'success' in data && data.success === false) {
      // For order endpoints, provide more context
      const isOrderEndpoint = path.includes('/brokers/orders');
      if (isOrderEndpoint) {
        // Add context that this is an order-related error
        data._isOrderError = true;
      }
      throw this.handleError(data.status_code || 500, data);
    }

    // Check if the response has a status_code field indicating an error (4xx or 5xx)
    if (data && typeof data === 'object' && 'status_code' in data && data.status_code >= 400) {
      throw this.handleError(data.status_code, data);
    }

    // Check if the response has errors field with content
    if (
      data &&
      typeof data === 'object' &&
      'errors' in data &&
      data.errors &&
      Array.isArray(data.errors) &&
      data.errors.length > 0
    ) {
      throw this.handleError(data.status_code || 500, data);
    }

    return data;
  }

  /**
   * Handle API errors. This method can be overridden by language-specific implementations.
   */
  protected handleError(status: number, error: any): ApiError {
    // Extract message from the error object with multiple fallback options
    let message = 'API request failed';

    if (error && typeof error === 'object') {
      // Try different possible message fields
      message =
        error.message ||
        error.detail?.message ||
        error.error?.message ||
        error.errors?.[0]?.message ||
        (typeof error.errors === 'string' ? error.errors : null) ||
        'API request failed';
    }

    // Check if this is an order-related error (either from order endpoints or order validation)
    const isOrderError =
      error._isOrderError ||
      message.includes('ORDER_FAILED') ||
      message.includes('AUTH_ERROR') ||
      message.includes('not found or not available for trading') ||
      message.includes('Symbol') ||
      (error.errors &&
        Array.isArray(error.errors) &&
        error.errors.some(
          (e: any) =>
            e.category === 'INVALID_ORDER' ||
            e.message?.includes('Symbol') ||
            e.message?.includes('not available for trading')
        ));

    if (isOrderError) {
      // Check if this is a validation error (400 status with specific validation messages)
      const isValidationError =
        status === 400 &&
        (message.includes('not found or not available for trading') ||
          message.includes('Symbol') ||
          (error.errors &&
            Array.isArray(error.errors) &&
            error.errors.some(
              (e: any) =>
                e.category === 'INVALID_ORDER' ||
                e.message?.includes('Symbol') ||
                e.message?.includes('not available for trading')
            )));

      if (isValidationError) {
        return new OrderValidationError(message, error);
      }

      // For order placement errors, provide more specific error messages
      if (message.includes('ORDER_FAILED') || message.includes('AUTH_ERROR')) {
        // Extract the specific error from the nested structure
        const orderErrorMatch = message.match(/\[([^\]]+)\]/g);
        if (orderErrorMatch && orderErrorMatch.length > 0) {
          // Take the last error in the chain (most specific)
          const specificError = orderErrorMatch[orderErrorMatch.length - 1].replace(/[[\]]/g, '');
          message = `Order failed: ${specificError}`;
        }
      }

      // Use OrderError for order-related failures
      return new OrderError(message, error);
    }

    switch (status) {
      case 400:
        return new SessionError(message, error);
      case 401:
        return new AuthenticationError(
          message || 'Unauthorized: Invalid or missing session token',
          error
        );
      case 403:
        if (error.detail?.code === 'NO_COMPANY_ACCESS') {
          return new CompanyAccessError(
            error.detail.message || 'No broker connections found for this company',
            error.detail
          );
        }
        if (error.detail?.code === 'TRADING_NOT_ENABLED') {
          return new TradingNotEnabledError(
            error.detail.message || 'Trading is not enabled for your company',
            error.detail
          );
        }
        return new AuthorizationError(
          message || 'Forbidden: No access to the requested data',
          error
        );
      case 404:
        return new ApiError(
          status,
          message || 'Not found: The requested data does not exist',
          error
        );
      case 429:
        return new RateLimitError(message || 'Rate limit exceeded', error);
      case 500:
        return new ApiError(status, message || 'Internal server error', error);
      default:
        return new ApiError(status, message || 'API request failed', error);
    }
  }

  // Session Management
  async startSession(token: string, userId?: string): Promise<SessionResponse> {
    const response = await this.request<SessionResponse>('/session/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'One-Time-Token': token,
        'X-Device-Info': JSON.stringify({
          ip_address: this.deviceInfo?.ip_address || '',
          user_agent: this.deviceInfo?.user_agent || '',
          fingerprint: this.deviceInfo?.fingerprint || '',
        }),
      },
      body: {
        user_id: userId,
      },
    });

    // Store session ID and set state to ACTIVE
    this.currentSessionId = response.data.session_id;
    this.currentSessionState = SessionState.ACTIVE;

    return response;
  }

  // OTP Flow
  async requestOtp(sessionId: string, email: string): Promise<OtpRequestResponse> {
    return this.request<OtpRequestResponse>('/auth/otp/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
        'X-Device-Info': JSON.stringify({
          ip_address: this.deviceInfo?.ip_address || '',
          user_agent: this.deviceInfo?.user_agent || '',
          fingerprint: this.deviceInfo?.fingerprint || '',
        }),
      },
      body: {
        email,
      },
    });
  }

  async verifyOtp(sessionId: string, otp: string): Promise<OtpVerifyResponse> {
    const response = await this.request<OtpVerifyResponse>('/auth/otp/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
        'X-Device-Info': JSON.stringify({
          ip_address: this.deviceInfo?.ip_address || '',
          user_agent: this.deviceInfo?.user_agent || '',
          fingerprint: this.deviceInfo?.fingerprint || '',
        }),
      },
      body: {
        otp,
      },
    });

    // OTP verification successful - tokens are handled by Supabase client
    if (response.success && response.data) {
      // Note: Supabase JWT will be handled by the Supabase client
      // The backend now creates/retrieves Supabase users and returns session info
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

    const response = await this.request<SessionAuthenticateResponse>('/session/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Session-ID': sessionId,
        'X-Session-ID': sessionId,
        'X-Device-Info': JSON.stringify({
          ip_address: this.deviceInfo?.ip_address || '',
          user_agent: this.deviceInfo?.user_agent || '',
          fingerprint: this.deviceInfo?.fingerprint || '',
        }),
      },
      body: {
        session_id: sessionId,
        user_id: userId,
      },
    });

    // Store tokens after successful direct authentication
    if (response.success && response.data) {
      // Session-based auth - no token storage needed
    }

    return response;
  }

  // Portal Management
  /**
   * Get the portal URL for an active session
   * @param sessionId The session identifier
   * @returns Portal URL response
   * @throws SessionError if session is not in ACTIVE state
   */
  public async getPortalUrl(sessionId: string): Promise<PortalUrlResponse> {
    if (this.currentSessionState !== SessionState.ACTIVE) {
      throw new SessionError('Session must be in ACTIVE state to get portal URL');
    }

    return this.request<PortalUrlResponse>('/session/portal', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Session-ID': sessionId,
        'X-Session-ID': sessionId,
        'X-Device-Info': JSON.stringify({
          ip_address: this.deviceInfo?.ip_address || '',
          user_agent: this.deviceInfo?.user_agent || '',
          fingerprint: this.deviceInfo?.fingerprint || '',
        }),
      },
    });
  }

  async completePortalSession(sessionId: string): Promise<PortalUrlResponse> {
    return this.request<PortalUrlResponse>(`/portal/${sessionId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Portfolio Management

  async getOrders(): Promise<{ data: Order[] }> {
    const accessToken = await this.getValidAccessToken();
    return this.request<{ data: Order[] }>('/brokers/data/orders', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  // Enhanced Trading Methods with Session Management
  async placeBrokerOrder(
    params: Partial<BrokerOrderParams> & {
      symbol: string;
      orderQty: number;
      action: 'Buy' | 'Sell';
      orderType: 'Market' | 'Limit' | 'Stop' | 'StopLimit';
      assetType: 'equity' | 'equity_option' | 'crypto' | 'forex' | 'future' | 'future_option';
    },
    extras: BrokerExtras = {},
    connection_id?: string
  ): Promise<OrderResponse> {
    const accessToken = await this.getValidAccessToken();

    // Accept both flattened and nested shapes. If nested, normalize to flattened.
    const normalizedParams: any = (() => {
      const incoming: any = params as unknown as Record<string, any>;
      if (incoming && typeof incoming === 'object' && 'order' in incoming && 'broker' in incoming) {
        const { broker, order } = incoming;
        return { broker, ...(order || {}) };
      }
      return incoming;
    })();

    // Get broker and account from context or params (robust extraction)
    const brokerCandidate =
      normalizedParams.broker ||
      (normalizedParams.order && normalizedParams.order.broker) ||
      this.tradingContext.broker;
    const accountCandidate =
      normalizedParams.accountNumber ||
      (normalizedParams.order && normalizedParams.order.accountNumber) ||
      this.tradingContext.accountNumber;

    const broker = brokerCandidate ? String(brokerCandidate).trim() : '';
    const accountNumber = accountCandidate ? String(accountCandidate).trim() : '';

    if (!broker) {
      throw new Error('Broker not set. Call setBroker() or pass broker parameter.');
    }

    if (!accountNumber) {
      throw new Error('Account not set. Call setAccount() or pass accountNumber parameter.');
    }

    // Ensure trading context is synced for downstream calls
    if (typeof (this as any).setBroker === 'function') {
      (this as any).setBroker(broker as any);
    }
    if (typeof (this as any).setAccount === 'function') {
      (this as any).setAccount(accountNumber as any);
    }

    // Merge context with provided parameters
    const fullParams: BrokerOrderParams = {
      broker:
        ((normalizedParams.broker || this.tradingContext.broker) as
          | 'robinhood'
          | 'tasty_trade'
          | 'ninja_trader') ||
        (() => {
          throw new Error('Broker not set. Call setBroker() or pass broker parameter.');
        })(),
      accountNumber:
        normalizedParams.accountNumber ||
        this.tradingContext.accountNumber ||
        (() => {
          throw new Error('Account not set. Call setAccount() or pass accountNumber parameter.');
        })(),
      symbol: normalizedParams.symbol,
      orderQty: normalizedParams.orderQty,
      action: normalizedParams.action,
      orderType: normalizedParams.orderType,
      assetType: normalizedParams.assetType,
      timeInForce: normalizedParams.timeInForce || 'day',
      price: normalizedParams.price,
      stopPrice: normalizedParams.stopPrice,
      order_id: normalizedParams.order_id,
    };

    // Extract broker-specific extras from normalizedParams (e.g., extended_hours, extendedHours, marketHours, etc.)
    // These fields may be in the order object but should be treated as extras
    const brokerSpecificExtras: any = {};
    const brokerName = fullParams.broker;

    if (brokerName === 'robinhood') {
      // Extract Robinhood-specific fields (accept both snake_case and camelCase)
      if (normalizedParams.extendedHours !== undefined) {
        brokerSpecificExtras.extendedHours = normalizedParams.extendedHours;
      } else if (normalizedParams.extended_hours !== undefined) {
        brokerSpecificExtras.extendedHours = normalizedParams.extended_hours;
      }
      if (normalizedParams.marketHours !== undefined) {
        brokerSpecificExtras.marketHours = normalizedParams.marketHours;
      } else if (normalizedParams.market_hours !== undefined) {
        brokerSpecificExtras.marketHours = normalizedParams.market_hours;
      }
      if (normalizedParams.trailType !== undefined) {
        brokerSpecificExtras.trailType = normalizedParams.trailType;
      } else if (normalizedParams.trail_type !== undefined) {
        brokerSpecificExtras.trailType = normalizedParams.trail_type;
      }
    } else if (brokerName === 'ninja_trader') {
      // Extract NinjaTrader-specific fields
      if (normalizedParams.accountSpec !== undefined) {
        brokerSpecificExtras.accountSpec = normalizedParams.accountSpec;
      } else if (normalizedParams.account_spec !== undefined) {
        brokerSpecificExtras.accountSpec = normalizedParams.account_spec;
      }
      if (normalizedParams.isAutomated !== undefined) {
        brokerSpecificExtras.isAutomated = normalizedParams.isAutomated;
      } else if (normalizedParams.is_automated !== undefined) {
        brokerSpecificExtras.isAutomated = normalizedParams.is_automated;
      }
    } else if (brokerName === 'tasty_trade') {
      // Extract TastyTrade-specific fields
      if (normalizedParams.automatedSource !== undefined) {
        brokerSpecificExtras.automatedSource = normalizedParams.automatedSource;
      } else if (normalizedParams.automated_source !== undefined) {
        brokerSpecificExtras.automatedSource = normalizedParams.automated_source;
      }
    }

    // Merge extracted extras with provided extras (extracted extras take precedence)
    // Merge nested broker-specific objects if they exist
    const mergedExtras: any = { ...extras };
    if (brokerName === 'robinhood' && Object.keys(brokerSpecificExtras).length > 0) {
      mergedExtras.robinhood = {
        ...(extras?.robinhood || {}),
        ...brokerSpecificExtras,
      };
    } else if (brokerName === 'ninja_trader' && Object.keys(brokerSpecificExtras).length > 0) {
      mergedExtras.ninjaTrader = {
        ...(extras?.ninjaTrader || {}),
        ...brokerSpecificExtras,
      };
    } else if (brokerName === 'tasty_trade' && Object.keys(brokerSpecificExtras).length > 0) {
      mergedExtras.tastyTrade = {
        ...(extras?.tastyTrade || {}),
        ...brokerSpecificExtras,
      };
    }

    // Build request body with camelCase parameter names
    // Pass the full payload structure to preserve option fields from the order object
    const payloadForBuild = (() => {
      const incoming: any = params as unknown as Record<string, any>;
      if (incoming && typeof incoming === 'object' && 'order' in incoming && 'broker' in incoming) {
        // Preserve the original structure with order object - this includes all option fields
        // Use incoming.order directly since it already contains all fields including option fields
        return {
          broker: incoming.broker || fullParams.broker,
          order: incoming.order,
        };
      }
      // If flattened, reconstruct the nested structure with option fields from normalizedParams
      // Extract option fields from normalizedParams since they're not in fullParams type
      const optionFields: any = {};
      if (normalizedParams.expirationDate !== undefined)
        optionFields.expirationDate = normalizedParams.expirationDate;
      if (normalizedParams.strikePrice !== undefined)
        optionFields.strikePrice = normalizedParams.strikePrice;
      if (normalizedParams.optionType !== undefined)
        optionFields.optionType = normalizedParams.optionType;
      if (normalizedParams.positionEffect !== undefined)
        optionFields.positionEffect = normalizedParams.positionEffect;

      // Build order object from fullParams
      // Note: fullParams is typed as BrokerOrderParams but built as flat object, so we access properties directly
      const fullParamsAny = fullParams as any;
      const orderFromFullParams: any = {
        orderType: fullParamsAny.orderType,
        assetType: fullParamsAny.assetType,
        action: fullParamsAny.action,
        timeInForce: fullParamsAny.timeInForce,
        accountNumber: fullParamsAny.accountNumber,
        symbol: fullParamsAny.symbol,
        orderQty: fullParamsAny.orderQty,
        ...(fullParamsAny.price !== undefined && { price: fullParamsAny.price }),
        ...(fullParamsAny.stopPrice !== undefined && { stopPrice: fullParamsAny.stopPrice }),
        ...(fullParamsAny.order_id !== undefined && { order_id: fullParamsAny.order_id }),
        ...optionFields,
      };

      return {
        broker: fullParamsAny.broker,
        order: orderFromFullParams,
      };
    })();
    const requestBody = this.buildOrderRequestBody(payloadForBuild, mergedExtras);

    // Add query parameters if connection_id is provided
    const queryParams: Record<string, string> = {};
    if (connection_id) {
      queryParams.connection_id = connection_id;
    }

    return this.request<OrderResponse>('/brokers/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Session-ID': this.currentSessionId || '',
        'X-Session-ID': this.currentSessionId || '',
        'X-Device-Info': JSON.stringify(this.deviceInfo),
      },
      body: requestBody,
      params: queryParams,
    });
  }

  async cancelBrokerOrder(orderId: string): Promise<OrderResponse> {
    const accessToken = await this.getValidAccessToken();

    // New endpoint only requires order_id as path parameter
    // Backend infers broker, account, and connection from the order record
    return this.request<OrderResponse>(`/brokers/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Session-ID': this.currentSessionId || '',
        'X-Session-ID': this.currentSessionId || '',
        'X-Device-Info': JSON.stringify(this.deviceInfo),
      },
      // No body, no query params - just order_id in path
    });
  }

  async modifyBrokerOrder(
    orderId: string,
    params: Partial<BrokerOrderParams>,
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    extras: any = {},
    connection_id?: string
  ): Promise<OrderResponse> {
    const accessToken = await this.getValidAccessToken();

    const selectedBroker = broker || this.tradingContext.broker;
    if (!selectedBroker) {
      throw new Error('Broker not set. Call setBroker() or pass broker parameter.');
    }

    // Build request body with camelCase parameter names and include broker
    const requestBody = this.buildModifyRequestBody(params, extras, selectedBroker);

    // Add query parameters if connection_id is provided
    const queryParams: Record<string, string> = {};
    if (connection_id) {
      queryParams.connection_id = connection_id;
    }

    return this.request<OrderResponse>(`/brokers/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Session-ID': this.currentSessionId || '',
        'X-Session-ID': this.currentSessionId || '',
        'X-Device-Info': JSON.stringify(this.deviceInfo),
      },
      body: requestBody,
      params: queryParams,
    });
  }

  // Context management methods
  setBroker(broker: 'robinhood' | 'tasty_trade' | 'ninja_trader'): void {
    this.tradingContext.broker = broker;
    // Clear account when broker changes
    this.tradingContext.accountNumber = undefined;
    this.tradingContext.accountId = undefined;
  }

  setAccount(accountNumber: string, accountId?: string): void {
    this.tradingContext.accountNumber = accountNumber;
    this.tradingContext.accountId = accountId;
  }

  // Stock convenience methods
  async placeStockMarketOrder(
    symbol: string,
    orderQty: number,
    action: 'Buy' | 'Sell',
    broker?: 'robinhood' | 'tasty_trade' | 'ninja_trader',
    accountNumber?: string,
    extras: BrokerExtras = {},
    connection_id?: string
  ): Promise<OrderResponse> {
    return this.placeBrokerOrder(
      {
        symbol,
        orderQty,
        action,
        orderType: 'Market',
        assetType: 'equity',
        timeInForce: 'day',
        broker,
        accountNumber,
      },
      extras,
      connection_id
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
    extras: BrokerExtras = {},
    connection_id?: string
  ): Promise<OrderResponse> {
    return this.placeBrokerOrder(
      {
        symbol,
        orderQty,
        action,
        orderType: 'Limit',
        assetType: 'equity',
        price,
        timeInForce,
        broker,
        accountNumber,
      },
      extras,
      connection_id
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
    extras: BrokerExtras = {},
    connection_id?: string
  ): Promise<OrderResponse> {
    return this.placeBrokerOrder(
      {
        symbol,
        orderQty,
        action,
        orderType: 'Stop',
        assetType: 'equity',
        stopPrice,
        timeInForce,
        broker,
        accountNumber,
      },
      extras,
      connection_id
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
    return this.placeBrokerOrder(
      {
        symbol,
        orderQty,
        action,
        orderType: 'Market',
        assetType: 'crypto',
        timeInForce: 'day',
        broker,
        accountNumber,
        ...options,
      },
      extras
    );
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
    return this.placeBrokerOrder(
      {
        symbol,
        orderQty,
        action,
        orderType: 'Limit',
        assetType: 'crypto',
        price,
        timeInForce,
        broker,
        accountNumber,
        ...options,
      },
      extras
    );
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
    return this.placeBrokerOrder(
      {
        symbol,
        orderQty,
        action,
        orderType: 'Market',
        assetType: 'equity_option',
        timeInForce: 'day',
        broker,
        accountNumber,
        ...options,
      },
      extras
    );
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
    return this.placeBrokerOrder(
      {
        symbol,
        orderQty,
        action,
        orderType: 'Limit',
        assetType: 'equity_option',
        price,
        timeInForce,
        broker,
        accountNumber,
        ...options,
      },
      extras
    );
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
        symbol,
        orderQty,
        action,
        orderType: 'Market',
        assetType: 'future',
        timeInForce: 'day',
        broker,
        accountNumber,
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
        symbol,
        orderQty,
        action,
        orderType: 'Limit',
        assetType: 'future',
        price,
        timeInForce,
        broker,
        accountNumber,
      },
      extras
    );
  }

  private buildOrderRequestBody(params: any, extras: BrokerExtras = {}) {
    // Handle both discriminated union format and flattened format
    const orderParams = params.order || params;
    const broker = params.broker || (params as BrokerOrderParams).broker;

    // Add option fields if present (for equity_option asset type)
    const optionFields: any = {};
    if (orderParams.expirationDate !== undefined) {
      optionFields.expirationDate = orderParams.expirationDate;
    }
    if (orderParams.strikePrice !== undefined) {
      optionFields.strikePrice = orderParams.strikePrice;
    }
    if (orderParams.optionType !== undefined) {
      optionFields.optionType = orderParams.optionType;
    }
    if (orderParams.positionEffect !== undefined) {
      optionFields.positionEffect = orderParams.positionEffect;
    }

    // Apply broker-specific defaults – map camelCase extras property keys to snake_case before merging
    const brokerExtras = this.applyBrokerDefaults(broker, extras);

    // Build final order object:
    // - Start from the full incoming orderParams so we never drop unknown fields (like option params)
    // - Overlay brokerExtras (extendedHours, marketHours, etc.)
    // - Spread optionFields last so option-specific fields are always preserved
    const finalOrder = {
      ...orderParams,
      ...brokerExtras,
      ...optionFields,
    };

    return {
      broker: broker,
      order: finalOrder,
    };
  }

  private buildModifyRequestBody(params: any, extras: any, broker: string) {
    // Handle both discriminated union format and flattened format
    const orderParams = params.order || params;
    const order: any = {};

    if (orderParams.order_id !== undefined) order.order_id = orderParams.order_id;
    if (orderParams.orderType !== undefined) order.orderType = orderParams.orderType;
    if (orderParams.assetType !== undefined) order.assetType = orderParams.assetType;
    if (orderParams.action !== undefined) order.action = orderParams.action;
    if (orderParams.timeInForce !== undefined) order.timeInForce = orderParams.timeInForce;
    if (orderParams.accountNumber !== undefined) order.accountNumber = orderParams.accountNumber;
    if (orderParams.symbol !== undefined) order.symbol = orderParams.symbol;
    if (orderParams.orderQty !== undefined) order.orderQty = orderParams.orderQty;
    if (orderParams.price !== undefined) order.price = orderParams.price;
    if (orderParams.stopPrice !== undefined) order.stopPrice = orderParams.stopPrice;

    // Add option fields if present (for equity_option asset type)
    const optionFields: any = {};
    if (orderParams.expirationDate !== undefined)
      optionFields.expirationDate = orderParams.expirationDate;
    if (orderParams.strikePrice !== undefined) optionFields.strikePrice = orderParams.strikePrice;
    if (orderParams.optionType !== undefined) optionFields.optionType = orderParams.optionType;
    if (orderParams.positionEffect !== undefined)
      optionFields.positionEffect = orderParams.positionEffect;

    // Apply broker-specific defaults (handles snake_case conversion)
    const brokerExtras = this.applyBrokerDefaults(broker, extras);

    // Build final order object - preserve option fields by spreading them last
    const finalOrder = {
      ...order,
      ...brokerExtras,
      ...optionFields, // Option fields spread last to ensure they're not overwritten
    };

    return {
      broker,
      order: finalOrder,
    };
  }

  private applyBrokerDefaults(broker: string, extras: any): any {
    // If the caller provided a broker-scoped extras object (e.g. { ninjaTrader: { ... } })
    // pull the nested object for easier processing.
    if (extras && typeof extras === 'object') {
      const scoped =
        broker === 'robinhood'
          ? extras.robinhood
          : broker === 'ninja_trader'
            ? extras.ninjaTrader
            : broker === 'tasty_trade'
              ? extras.tastyTrade
              : undefined;
      if (scoped) {
        extras = scoped;
      }
    }

    switch (broker) {
      case 'robinhood':
        return {
          ...extras,
          extendedHours: extras?.extendedHours ?? extras?.extended_hours ?? false,
          marketHours: extras?.marketHours ?? extras?.market_hours ?? 'regular_hours',
          trailType: extras?.trailType ?? extras?.trail_type ?? 'percentage',
        };
      case 'ninja_trader':
        return {
          ...extras,
          accountSpec: extras?.accountSpec ?? extras?.account_spec ?? '',
          isAutomated: extras?.isAutomated ?? extras?.is_automated ?? true,
        };
      case 'tasty_trade':
        return {
          ...extras,
          automatedSource: extras?.automatedSource ?? extras?.automated_source ?? true,
        };
      default:
        return extras;
    }
  }

  async getUserToken(sessionId: string): Promise<UserToken> {
    const accessToken = await this.getValidAccessToken();
    return this.request<UserToken>(`/session/${sessionId}/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  /**
   * Get the current session state
   */
  getCurrentSessionState(): SessionState | null {
    return this.currentSessionState;
  }

  /**
   * Refresh the current session to extend its lifetime
   * Note: This now uses Supabase session refresh instead of custom endpoint
   */
  async refreshSession(): Promise<{
    success: boolean;
    response_data: {
      session_id: string;
      company_id: string;
      status: string;
      expires_at: string;
      user_id: string;
      auto_login: boolean;
    };
    message: string;
    status_code: number;
  }> {
    if (!this.currentSessionId || !this.companyId) {
      throw new SessionError('No active session to refresh');
    }

    // Session-based auth - no token refresh needed

    // Return session info in expected format
    return {
      success: true,
      response_data: {
        session_id: this.currentSessionId,
        company_id: this.companyId,
        status: 'active',
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        user_id: '', // Session-based auth - user_id comes from session
        auto_login: false,
      },
      message: 'Session refreshed successfully',
      status_code: 200,
    };
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
    // Public endpoint - no auth required
    return this.request<{
      _id: string;
      response_data: BrokerInfo[];
      message: string;
      status_code: number;
      warnings: null;
      errors: null;
    }>('/brokers/', {
      method: 'GET',
    });
  }

  async getBrokerAccounts(options?: BrokerDataOptions): Promise<{
    _id: string;
    response_data: BrokerAccount[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    const accessToken = await this.getValidAccessToken();
    const params: Record<string, string> = {};

    if (options?.broker_name) {
      params.broker_id = options.broker_name;
    }
    if (options?.account_id) {
      params.account_id = options.account_id;
    }
    if (options?.symbol) {
      params.symbol = options.symbol;
    }

    return this.request<{
      _id: string;
      response_data: BrokerAccount[];
      message: string;
      status_code: number;
      warnings: null;
      errors: null;
    }>('/brokers/data/accounts', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });
  }

  async getBrokerOrders(options?: BrokerDataOptions): Promise<{
    _id: string;
    response_data: BrokerOrder[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    const accessToken = await this.getValidAccessToken();
    const params: Record<string, string> = {};

    if (options?.broker_name) {
      params.broker_id = options.broker_name;
    }
    if (options?.account_id) {
      params.account_id = options.account_id;
    }
    if (options?.symbol) {
      params.symbol = options.symbol;
    }

    return this.request<{
      _id: string;
      response_data: BrokerOrder[];
      message: string;
      status_code: number;
      warnings: null;
      errors: null;
    }>('/brokers/data/orders', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });
  }

  async getBrokerPositions(options?: BrokerDataOptions): Promise<{
    _id: string;
    response_data: BrokerPosition[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    const accessToken = await this.getValidAccessToken();
    const params: Record<string, string> = {};

    if (options?.broker_name) {
      params.broker_id = options.broker_name;
    }
    if (options?.account_id) {
      params.account_id = options.account_id;
    }
    if (options?.symbol) {
      params.symbol = options.symbol;
    }

    return this.request<{
      _id: string;
      response_data: BrokerPosition[];
      message: string;
      status_code: number;
      warnings: null;
      errors: null;
    }>('/brokers/data/positions', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });
  }

  async getBrokerBalances(options?: BrokerDataOptions): Promise<{
    _id: string;
    response_data: BrokerBalance[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    const accessToken = await this.getValidAccessToken();
    const params: Record<string, string> = {};

    if (options?.broker_name) {
      params.broker_id = options.broker_name;
    }
    if (options?.account_id) {
      params.account_id = options.account_id;
    }
    if (options?.symbol) {
      params.symbol = options.symbol;
    }

    return this.request<{
      _id: string;
      response_data: BrokerBalance[];
      message: string;
      status_code: number;
      warnings: null;
      errors: null;
    }>('/brokers/data/balances', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });
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
    return this.request<{
      _id: string;
      response_data: BrokerConnection[];
      message: string;
      status_code: number;
      warnings: null;
      errors: null;
    }>('/brokers/connections', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async getBalances(filters?: any): Promise<{
    _id: string;
    response_data: any[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    const accessToken = await this.getValidAccessToken();
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/brokers/data/balances?${queryString}` : '/brokers/data/balances';

    return this.request<{
      _id: string;
      response_data: any[];
      message: string;
      status_code: number;
      warnings: null;
      errors: null;
    }>(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  // Page-based pagination methods
  async getBrokerOrdersPage(
    page: number = 1,
    perPage: number = 100,
    filters?: OrdersFilter
  ): Promise<PaginatedResult<BrokerOrder[]>> {
    const accessToken = await this.getValidAccessToken();
    const offset = (page - 1) * perPage;
    const params: Record<string, string> = {
      limit: perPage.toString(),
      offset: offset.toString(),
    };

    // Add filter parameters
    if (filters) {
      if (filters.broker_id) params.broker_id = filters.broker_id;
      if (filters.connection_id) params.connection_id = filters.connection_id;
      if (filters.account_id) params.account_id = filters.account_id;
      if (filters.symbol) params.symbol = filters.symbol;
      if (filters.status) params.status = filters.status;
      if (filters.side) params.side = filters.side;
      if (filters.asset_type) params.asset_type = filters.asset_type;
      if (filters.created_after) params.created_after = filters.created_after;
      if (filters.created_before) params.created_before = filters.created_before;
    }

    const response = await this.request<ApiResponse<BrokerOrder[]>>('/brokers/data/orders', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });

    // Create navigation callback for pagination
    const navigationCallback = async (
      newOffset: number,
      newLimit: number
    ): Promise<PaginatedResult<BrokerOrder[]>> => {
      const newParams: Record<string, string> = {
        limit: newLimit.toString(),
        offset: newOffset.toString(),
      };

      // Add filter parameters
      if (filters) {
        if (filters.broker_id) newParams.broker_id = filters.broker_id;
        if (filters.connection_id) newParams.connection_id = filters.connection_id;
        if (filters.account_id) newParams.account_id = filters.account_id;
        if (filters.symbol) newParams.symbol = filters.symbol;
        if (filters.status) newParams.status = filters.status;
        if (filters.side) newParams.side = filters.side;
        if (filters.asset_type) newParams.asset_type = filters.asset_type;
        if (filters.created_after) newParams.created_after = filters.created_after;
        if (filters.created_before) newParams.created_before = filters.created_before;
      }

      const newResponse = await this.request<ApiResponse<BrokerOrder[]>>('/brokers/data/orders', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: newParams,
      });

      return new PaginatedResult(
        newResponse.response_data,
        newResponse.pagination || {
          has_more: false,
          next_offset: newOffset,
          current_offset: newOffset,
          limit: newLimit,
        },
        navigationCallback
      );
    };

    return new PaginatedResult(
      response.response_data,
      response.pagination || {
        has_more: false,
        next_offset: offset,
        current_offset: offset,
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
    const accessToken = await this.getValidAccessToken();
    const offset = (page - 1) * perPage;
    const params: Record<string, string> = {
      limit: perPage.toString(),
      offset: offset.toString(),
    };

    // Add filter parameters
    if (filters) {
      if (filters.broker_id) params.broker_id = filters.broker_id;
      if (filters.connection_id) params.connection_id = filters.connection_id;
      if (filters.account_type) params.account_type = filters.account_type;
      if (filters.status) params.status = filters.status;
      if (filters.currency) params.currency = filters.currency;
    }

    const response = await this.request<ApiResponse<BrokerAccount[]>>('/brokers/data/accounts', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });

    // Create navigation callback for pagination
    const navigationCallback = async (
      newOffset: number,
      newLimit: number
    ): Promise<PaginatedResult<BrokerAccount[]>> => {
      const newParams: Record<string, string> = {
        limit: newLimit.toString(),
        offset: newOffset.toString(),
      };

      // Add filter parameters
      if (filters) {
        if (filters.broker_id) newParams.broker_id = filters.broker_id;
        if (filters.connection_id) newParams.connection_id = filters.connection_id;
        if (filters.account_type) newParams.account_type = filters.account_type;
        if (filters.status) newParams.status = filters.status;
        if (filters.currency) newParams.currency = filters.currency;
      }

      const newResponse = await this.request<ApiResponse<BrokerAccount[]>>(
        '/brokers/data/accounts',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: newParams,
        }
      );

      return new PaginatedResult(
        newResponse.response_data,
        newResponse.pagination || {
          has_more: false,
          next_offset: newOffset,
          current_offset: newOffset,
          limit: newLimit,
        },
        navigationCallback
      );
    };

    return new PaginatedResult(
      response.response_data,
      response.pagination || {
        has_more: false,
        next_offset: offset,
        current_offset: offset,
        limit: perPage,
      },
      navigationCallback
    );
  }

  async getBrokerPositionsPage(
    page: number = 1,
    perPage: number = 100,
    filters?: PositionsFilter
  ): Promise<PaginatedResult<BrokerPosition[]>> {
    const accessToken = await this.getValidAccessToken();
    const offset = (page - 1) * perPage;
    const params: Record<string, string> = {
      limit: perPage.toString(),
      offset: offset.toString(),
    };

    // Add filter parameters
    if (filters) {
      if (filters.broker_id) params.broker_id = filters.broker_id;
      if (filters.account_id) params.account_id = filters.account_id;
      if (filters.symbol) params.symbol = filters.symbol;
      if (filters.position_status) params.position_status = filters.position_status;
      if (filters.side) params.side = filters.side;
    }

    const response = await this.request<ApiResponse<BrokerPosition[]>>('/brokers/data/positions', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });

    // Create navigation callback for pagination
    const navigationCallback = async (
      newOffset: number,
      newLimit: number
    ): Promise<PaginatedResult<BrokerPosition[]>> => {
      const newParams: Record<string, string> = {
        limit: newLimit.toString(),
        offset: newOffset.toString(),
      };

      // Add filter parameters
      if (filters) {
        if (filters.broker_id) newParams.broker_id = filters.broker_id;
        if (filters.account_id) newParams.account_id = filters.account_id;
        if (filters.symbol) newParams.symbol = filters.symbol;
        if (filters.position_status) newParams.position_status = filters.position_status;
        if (filters.side) newParams.side = filters.side;
      }

      const newResponse = await this.request<ApiResponse<BrokerPosition[]>>(
        '/brokers/data/positions',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: newParams,
        }
      );

      return new PaginatedResult(
        newResponse.response_data,
        newResponse.pagination || {
          has_more: false,
          next_offset: newOffset,
          current_offset: newOffset,
          limit: newLimit,
        },
        navigationCallback
      );
    };

    return new PaginatedResult(
      response.response_data,
      response.pagination || {
        has_more: false,
        next_offset: offset,
        current_offset: offset,
        limit: perPage,
      },
      navigationCallback
    );
  }

  async getBrokerBalancesPage(
    page: number = 1,
    perPage: number = 100,
    filters?: BalancesFilter
  ): Promise<PaginatedResult<BrokerBalance[]>> {
    const accessToken = await this.getValidAccessToken();
    const offset = (page - 1) * perPage;
    const params: Record<string, string> = {
      limit: perPage.toString(),
      offset: offset.toString(),
    };

    // Add filter parameters
    if (filters) {
      if (filters.broker_id) params.broker_id = filters.broker_id;
      if (filters.connection_id) params.connection_id = filters.connection_id;
      if (filters.account_id) params.account_id = filters.account_id;
      if (filters.is_end_of_day_snapshot !== undefined)
        params.is_end_of_day_snapshot = filters.is_end_of_day_snapshot.toString();
      if (filters.balance_created_after)
        params.balance_created_after = filters.balance_created_after;
      if (filters.balance_created_before)
        params.balance_created_before = filters.balance_created_before;
      if (filters.with_metadata !== undefined)
        params.with_metadata = filters.with_metadata.toString();
    }

    const response = await this.request<ApiResponse<BrokerBalance[]>>('/brokers/data/balances', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });

    // Create navigation callback for pagination
    const navigationCallback = async (
      newOffset: number,
      newLimit: number
    ): Promise<PaginatedResult<BrokerBalance[]>> => {
      const newParams: Record<string, string> = {
        limit: newLimit.toString(),
        offset: newOffset.toString(),
      };

      // Add filter parameters
      if (filters) {
        if (filters.broker_id) newParams.broker_id = filters.broker_id;
        if (filters.connection_id) newParams.connection_id = filters.connection_id;
        if (filters.account_id) newParams.account_id = filters.account_id;
        if (filters.is_end_of_day_snapshot !== undefined)
          newParams.is_end_of_day_snapshot = filters.is_end_of_day_snapshot.toString();
        if (filters.balance_created_after)
          newParams.balance_created_after = filters.balance_created_after;
        if (filters.balance_created_before)
          newParams.balance_created_before = filters.balance_created_before;
        if (filters.with_metadata !== undefined)
          newParams.with_metadata = filters.with_metadata.toString();
      }

      const newResponse = await this.request<ApiResponse<BrokerBalance[]>>(
        '/brokers/data/balances',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: newParams,
        }
      );

      return new PaginatedResult(
        newResponse.response_data,
        newResponse.pagination || {
          has_more: false,
          next_offset: newOffset,
          current_offset: newOffset,
          limit: newLimit,
        },
        navigationCallback
      );
    };

    return new PaginatedResult(
      response.response_data,
      response.pagination || {
        has_more: false,
        next_offset: offset,
        current_offset: offset,
        limit: perPage,
      },
      navigationCallback
    );
  }

  // Navigation methods
  async getNextPage<T>(
    previousResult: PaginatedResult<T>,
    fetchFunction: (offset: number, limit: number) => Promise<PaginatedResult<T>>
  ): Promise<PaginatedResult<T> | null> {
    if (!previousResult.hasNext) {
      return null;
    }

    return fetchFunction(previousResult.metadata.nextOffset, previousResult.metadata.limit);
  }

  /**
   * Check if this is a mock client
   * @returns false for real API client
   */
  isMockClient(): boolean {
    return false;
  }

  /**
   * Disconnect a company from a broker connection
   * @param connectionId - The connection ID to disconnect
   * @returns Promise with disconnect response
   */
  async disconnectCompany(connectionId: string): Promise<DisconnectCompanyResponse> {
    const accessToken = await this.getValidAccessToken();
    return this.request<DisconnectCompanyResponse>(`/brokers/disconnect/${connectionId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  /**
   * Get order fills for a specific order
   * @param orderId - The order ID
   * @param filter - Optional filter parameters
   * @returns Promise with order fills response
   */
  async getOrderFills(
    orderId: string,
    filter?: OrderFillsFilter
  ): Promise<{
    _id: string;
    response_data: OrderFill[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    const accessToken = await this.getValidAccessToken();
    const params: Record<string, string> = {};

    if (filter?.connection_id) {
      params.connection_id = filter.connection_id;
    }
    if (filter?.limit) {
      params.limit = filter.limit.toString();
    }
    if (filter?.offset) {
      params.offset = filter.offset.toString();
    }

    return this.request<{
      _id: string;
      response_data: OrderFill[];
      message: string;
      status_code: number;
      warnings: null;
      errors: null;
    }>(`/brokers/data/orders/${orderId}/fills`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });
  }

  /**
   * Get order events for a specific order
   * @param orderId - The order ID
   * @param filter - Optional filter parameters
   * @returns Promise with order events response
   */
  async getOrderEvents(
    orderId: string,
    filter?: OrderEventsFilter
  ): Promise<{
    _id: string;
    response_data: OrderEvent[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    const accessToken = await this.getValidAccessToken();
    const params: Record<string, string> = {};

    if (filter?.connection_id) {
      params.connection_id = filter.connection_id;
    }
    if (filter?.limit) {
      params.limit = filter.limit.toString();
    }
    if (filter?.offset) {
      params.offset = filter.offset.toString();
    }

    return this.request<{
      _id: string;
      response_data: OrderEvent[];
      message: string;
      status_code: number;
      warnings: null;
      errors: null;
    }>(`/brokers/data/orders/${orderId}/events`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });
  }

  /**
   * Get order groups
   * @param filter - Optional filter parameters
   * @returns Promise with order groups response
   */
  async getOrderGroups(filter?: OrderGroupsFilter): Promise<{
    _id: string;
    response_data: OrderGroup[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    const accessToken = await this.getValidAccessToken();
    const params: Record<string, string> = {};

    if (filter?.broker_id) {
      params.broker_id = filter.broker_id;
    }
    if (filter?.connection_id) {
      params.connection_id = filter.connection_id;
    }
    if (filter?.limit) {
      params.limit = filter.limit.toString();
    }
    if (filter?.offset) {
      params.offset = filter.offset.toString();
    }
    if (filter?.created_after) {
      params.created_after = filter.created_after;
    }
    if (filter?.created_before) {
      params.created_before = filter.created_before;
    }

    return this.request<{
      _id: string;
      response_data: OrderGroup[];
      message: string;
      status_code: number;
      warnings: null;
      errors: null;
    }>('/brokers/data/orders/groups', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });
  }

  /**
   * Get position lots (tax lots for positions)
   * @param filter - Optional filter parameters
   * @returns Promise with position lots response
   */
  async getPositionLots(filter?: PositionLotsFilter): Promise<{
    _id: string;
    response_data: PositionLot[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    const accessToken = await this.getValidAccessToken();
    const params: Record<string, string> = {};

    if (filter?.broker_id) {
      params.broker_id = filter.broker_id;
    }
    if (filter?.connection_id) {
      params.connection_id = filter.connection_id;
    }
    if (filter?.account_id) {
      params.account_id = filter.account_id;
    }
    if (filter?.symbol) {
      params.symbol = filter.symbol;
    }
    if (filter?.position_id) {
      params.position_id = filter.position_id;
    }
    if (filter?.limit) {
      params.limit = filter.limit.toString();
    }
    if (filter?.offset) {
      params.offset = filter.offset.toString();
    }

    return this.request<{
      _id: string;
      response_data: PositionLot[];
      message: string;
      status_code: number;
      warnings: null;
      errors: null;
    }>('/brokers/data/positions/lots', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });
  }

  /**
   * Get position lot fills for a specific lot
   * @param lotId - The position lot ID
   * @param filter - Optional filter parameters
   * @returns Promise with position lot fills response
   */
  async getPositionLotFills(
    lotId: string,
    filter?: PositionLotFillsFilter
  ): Promise<{
    _id: string;
    response_data: PositionLotFill[];
    message: string;
    status_code: number;
    warnings: null;
    errors: null;
  }> {
    const accessToken = await this.getValidAccessToken();
    const params: Record<string, string> = {};

    if (filter?.connection_id) {
      params.connection_id = filter.connection_id;
    }
    if (filter?.limit) {
      params.limit = filter.limit.toString();
    }
    if (filter?.offset) {
      params.offset = filter.offset.toString();
    }

    return this.request<{
      _id: string;
      response_data: PositionLotFill[];
      message: string;
      status_code: number;
      warnings: null;
      errors: null;
    }>(`/brokers/data/positions/lots/${lotId}/fills`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });
  }
}
