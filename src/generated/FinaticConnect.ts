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
import { unwrapAxiosResponse } from './utils/response-utils';
import { SessionApi } from './api/session-api';
import { BrokersApi } from './api/brokers-api';
import { CompanyApi } from './api/company-api';
import { BrokersWrapper } from './wrappers/brokers';
import { CompanyWrapper } from './wrappers/company';
import { SessionWrapper } from './wrappers/session';
import type { FinaticResponse, GetAccountsParams, GetBalancesParams, GetOrderEventsParams, GetOrderFillsParams, GetOrderGroupsParams, GetOrdersParams, GetPositionLotFillsParams, GetPositionLotsParams, GetPositionsParams } from './wrappers/brokers';
import type { Accounts, Balances, OrderEventResponse, OrderFillResponse, OrderGroupResponse, OrderResponse, PositionLotFillResponse, PositionLotResponse, PositionResponse } from './models';


export interface FinaticConnectOptions {
  token: string;
  sdkConfig?: Partial<SdkConfig>;
}

// PortalOptions removed - portal methods now use individual parameters

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
  private sessionApi: SessionApi;

  private readonly brokers: BrokersWrapper;
  private readonly company: CompanyWrapper;
  private readonly session: SessionWrapper;

  constructor(options: FinaticConnectOptions) {
    super(); // Initialize EventEmitter
    this.options = options;
    this.sdkConfig = { ...defaultConfig, ...options.sdkConfig };
    this.config = new Configuration({
      basePath: this.sdkConfig.baseUrl || 'https://api.finatic.dev',
    });

    // Initialize logger
    try {
      const { getLogger } = require('./utils/logger');
      this.logger = getLogger(this.sdkConfig);
    } catch {
      // Fallback logger for browser environments where pino might not work correctly
      this.logger = console;
    }

    // Initialize SessionApi for internal session management
    this.sessionApi = new SessionApi(this.config);

    this.brokers = new BrokersWrapper(new BrokersApi(this.config), this.config, this.sdkConfig);
    this.company = new CompanyWrapper(new CompanyApi(this.config), this.config, this.sdkConfig);
    this.session = new SessionWrapper(new SessionApi(this.config), this.config, this.sdkConfig);
  }

  /**
   * Static initialization method - creates instance and starts session.
   * This is the recommended way to initialize the Client SDK.
   */
  static async init(
    token: string,
    userId?: string,
    sdkConfig?: Partial<SdkConfig>
  ): Promise<FinaticConnect> {
    // Use console for static method logging (instance logger will be initialized in constructor)
    const logger = console;
    
    logger.debug?.('FinaticConnect.init() called', {
      token: token ? `${token.substring(0, 20)}...` : 'missing',
      userId,
      hasSdkConfig: !!sdkConfig,
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
          sdkConfig: sdkConfig,
        };

        instance = new FinaticConnect(connectOptions);
        baseClass.instance = instance;

        // CRITICAL: Client SDK init() receives a one-time token directly (not an API key)
        // Unlike Server SDK, Client SDK does NOT call _initSession() - it goes straight to _startSession()
        logger.debug?.('Calling _startSession() inside init() with provided token');
        const sessionResult = await instance._startSession(token, userId);
        logger.debug?.('_startSession() completed in init()', { sessionResult });
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
          'The network call to start the session may have failed or returned an invalid response.'
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
  private async _startSession(oneTimeToken: string, userId?: string): Promise<{ session_id: string; company_id: string }> {
    const requestBody = userId !== undefined ? { user_id: userId } : {};
    // Use SessionApi directly (not a wrapper) since this is internal session management
    const axiosResponse = await this.sessionApi.startSessionApiV1SessionStartPost({
      oneTimeToken,
      sessionStartRequest: requestBody,
    });
    
    // Unwrap axios response immediately - get FinaticResponse object
    const response = unwrapAxiosResponse(axiosResponse);
    
    this.logger.debug?.('_startSession response received', { 
      axiosResponse: axiosResponse,
      response: response,
      responseKeys: Object.keys(response || {}),
      hasSuccess: !!response?.success,
      successType: typeof response?.success,
      successIsObject: typeof response?.success === 'object' && response?.success !== null,
      hasData: !!response?.success?.data,
      sessionId: response?.success?.data?.session_id,
      companyId: response?.success?.data?.company_id
    });
    
    // Phase 2C: Unwrap standard response structure
    // Handle both old structure (success: boolean, data: T) and new structure (success: { data: T, meta: {...} })
    if (response?.error) {
      throw new Error(response.error.message || 'Failed to start session');
    }
    
    // New structure: success is an object with data and meta
    // Response structure: { success: { data: {...}, meta: {...} }, error: null, warning: null }
    let data;
    if (response?.success && typeof response.success === 'object' && response.success !== null) {
      // Check if success has a data property
      if ('data' in response.success && response.success.data !== null && response.success.data !== undefined) {
        data = response.success.data;
      } else {
        // Success is an object but no data property - might be the data itself
        data = response.success;
      }
    } 
    // Old structure fallback: success is boolean, data is at top level
    else if (response?.data && typeof response.data === 'object') {
      data = response.data;
    } else {
      this.logger.error?.('_startSession invalid response structure', { 
        response, 
        axiosResponse,
        responseType: typeof response,
        responseKeys: response ? Object.keys(response) : [],
        successType: typeof response?.success,
        successValue: response?.success,
        successKeys: response?.success && typeof response.success === 'object' ? Object.keys(response.success) : []
      });
      throw new Error('Invalid response structure from startSession endpoint');
    }
    
    const sessionId = data?.session_id || '';
    const companyId = data?.company_id || '';
    // csrf_token is not in SessionResponseData, get from response headers if available
    const csrfToken = (data as any)?.csrf_token || '';
    
    this.logger.debug?.('_startSession extracted data', { 
      sessionId, 
      companyId, 
      csrfToken, 
      fullData: data,
      dataKeys: data ? Object.keys(data) : []
    });
    
    if (sessionId && companyId) {
      this.setSessionContext(sessionId, companyId, csrfToken);
      this.logger.debug?.('_startSession setSessionContext called', { 
        sessionId: this.sessionId, 
        companyId: this.companyId 
      });
    } else {
      this.logger.error?.('_startSession missing required data', { 
        sessionId, 
        companyId, 
        data, 
        response,
        dataKeys: data ? Object.keys(data) : [],
        responseKeys: response ? Object.keys(response) : []
      });
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
  async getPortalUrl(
    theme?: string | { preset?: string; custom?: Record<string, unknown> },
    brokers?: string[],
    email?: string,
    mode?: 'light' | 'dark'
  ): Promise<string> {
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Get raw portal URL from SessionApi directly (not a wrapper)
    const axiosResponse = await this.sessionApi.getPortalUrlApiV1SessionPortalGet({
      sessionId: this.sessionId,
    });
    
    // Unwrap axios response immediately - get FinaticResponse object
    const response = unwrapAxiosResponse(axiosResponse);
    
    this.logger.debug?.('getPortalUrl response received', {
      axiosResponse: axiosResponse,
      response: response,
      responseKeys: Object.keys(response || {}),
      hasSuccess: !!response?.success,
      hasData: !!response?.success?.data,
      portalUrl: response?.success?.data?.portal_url
    });
    
    // Check for errors
    if (response?.error) {
      this.logger.error?.('Failed to get portal URL', new Error(response.error.message), {
        code: response.error.code,
        status: response.error.status,
      });
      throw new Error(response.error.message || 'Failed to get portal URL');
    }
    
    // Validate response structure
    if (!response?.success?.data?.portal_url) {
      this.logger.error?.('Invalid portal URL response: missing data', new Error('Invalid response'), {
        response,
        axiosResponse,
        responseKeys: response ? Object.keys(response) : [],
        successKeys: response?.success && typeof response.success === 'object' ? Object.keys(response.success) : []
      });
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
    if (theme) {
      portalUrl = appendThemeToURL(portalUrl, theme);
    }

    // Append broker filter if provided
    if (brokers) {
      portalUrl = appendBrokerFilterToURL(portalUrl, brokers);
    }

    // Append email if provided
    if (email) {
      const url = new URL(portalUrl);
      url.searchParams.set('email', email);
      portalUrl = url.toString();
    }

    // Append mode if provided (light or dark)
    if (mode) {
      const url = new URL(portalUrl);
      url.searchParams.set('mode', mode);
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
  async openPortal(
    theme?: string | { preset?: string; custom?: Record<string, unknown> },
    brokers?: string[],
    email?: string,
    mode?: 'light' | 'dark',
    onSuccess?: (userId: string) => void,
    onError?: (error: Error) => void,
    onClose?: () => void
  ): Promise<void> {
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }

    // Get portal URL with all parameters
    const portalUrl = await this.getPortalUrl(theme, brokers, email, mode);

    // Create portal UI if not exists
    if (!this.portalUI) {
      this.portalUI = new PortalUI(this.sdkConfig.baseUrl || 'https://api.finatic.dev');
    }

    // Show portal with event handlers
    this.portalUI.show(portalUrl, this.sessionId, {
      onSuccess: (userId: string) => {
        // Store userId for SDK state (portal already linked user to session)
        this.userId = userId;
        
        // Emit portal success event
        this.emit('portal:success', userId);
        
        // Call optional callback
        onSuccess?.(userId);
      },
      onError: (error: Error) => {
        // Emit portal error event
        this.emit('portal:error', error);
        
        // Call optional callback
        onError?.(error);
      },
      onClose: () => {
        // Emit portal close event
        this.emit('portal:close');
        
        // Call optional callback
        onClose?.();
      },
    });
  }

  /**
   * Get current user ID (set after portal authentication).
   */
  getUserId(): string | undefined {
    return this.userId;
  }

  /**
   * Check if user is authenticated (has userId).
   */
  isAuthed(): boolean {
    return !!this.userId;
  }

  /**
   * Get session user information after portal authentication.
   */
  async getSessionUser(): Promise<{ user_id: string; company_id: string }> {
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call startSession() first.');
    }
    
    const axiosResponse = await this.sessionApi.getSessionUserApiV1SessionSessionIdUserGet({
      sessionId: this.sessionId,
      xSessionId: this.sessionId,
    });
    
    // Unwrap axios response immediately - get FinaticResponse object
    const response = unwrapAxiosResponse(axiosResponse);
    
    // Unwrap FinaticResponse structure
    if (response?.error) {
      throw new Error(response.error.message || 'Failed to get session user');
    }
    
    const data = response?.success?.data;
    return {
      user_id: data?.user_id || '',
      company_id: data?.company_id || this.companyId || '',
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
    this.company.setSessionContext(sessionId, companyId, csrfToken);
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
   * Start Session
   * 
   * Start a session with a one-time token.
   * 
   * Convenience method that delegates to session wrapper.
   * 
   * @param params - Optional parameters object. Only include the fields you want to use.
   *                 Example: startSession({ accountId: "123", limit: 10, offset: 0 })
   * @returns FinaticResponse with success, error, and warning fields
   */
  async startSession(params?: Partial<StartSessionParams>): Promise<Awaited<ReturnType<typeof this.session.startSession>>> {
    return await this.session.startSession((params?.OneTimeToken as any), (params?.body as any));
  }

  /**
   * Get Session User
   * 
   * Get user information and fresh tokens for a completed session.
   * 
   * This endpoint is designed for server SDKs to retrieve user information
   * and authentication tokens after successful OTP verification.
   * 
   * 
   * Security:
   * - Requires valid session in ACTIVE state
   * - Validates device fingerprint binding
   * - Generates fresh tokens (not returning stored ones)
   * - Only accessible to authenticated sessions with user_id
   * - Validates that header session_id matches path session_id
   * 
   * Convenience method that delegates to session wrapper.
   * 
   * @param params - Optional parameters object. Only include the fields you want to use.
   *                 Example: getSessionUser({ accountId: "123", limit: 10, offset: 0 })
   * @returns FinaticResponse with success, error, and warning fields
   */
  async getSessionUser(params?: Partial<GetSessionUserParams>): Promise<Awaited<ReturnType<typeof this.session.getSessionUser>>> {
    return await this.session.getSessionUser((params?.sessionId as any));
  }

  /**
   * Get Company
   * 
   * Get public company details by ID (no user check, no sensitive data).
   * 
   * Convenience method that delegates to company wrapper.
   * 
   * @param params - Optional parameters object. Only include the fields you want to use.
   *                 Example: getCompany({ accountId: "123", limit: 10, offset: 0 })
   * @returns FinaticResponse with success, error, and warning fields
   */
  async getCompany(params?: Partial<GetCompanyParams>): Promise<Awaited<ReturnType<typeof this.company.getCompany>>> {
    return await this.company.getCompany((params?.companyId as any));
  }

  /**
   * Get Brokers
   * 
   * Get all available brokers.
   * 
   * This is a fast operation that returns a cached list of available brokers.
   * The list is loaded once at startup and never changes during runtime.
   * 
   * Returns
   * -------
   * FinaticResponse[list[BrokerInfo]]
   *     list of available brokers with their metadata.
   * 
   * Convenience method that delegates to brokers wrapper.
   * 
   * @param params - Optional parameters object. Only include the fields you want to use.
   *                 Example: getBrokers({ accountId: "123", limit: 10, offset: 0 })
   * @returns FinaticResponse with success, error, and warning fields
   */
  async getBrokers(params?: {}): Promise<Awaited<ReturnType<typeof this.brokers.getBrokers>>> {
    return await this.brokers.getBrokers();
  }

  /**
   * List Broker Connections
   * 
   * List all broker connections for the current user.
   * 
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns connections that the user has any permissions for.
   * 
   * Convenience method that delegates to brokers wrapper.
   * 
   * @param params - Optional parameters object. Only include the fields you want to use.
   *                 Example: getBrokerConnections({ accountId: "123", limit: 10, offset: 0 })
   * @returns FinaticResponse with success, error, and warning fields
   */
  async getBrokerConnections(params?: {}): Promise<Awaited<ReturnType<typeof this.brokers.getBrokerConnections>>> {
    return await this.brokers.getBrokerConnections();
  }

  /**
   * Disconnect Company From Broker
   * 
   * Remove a company's access to a broker connection.
   * 
   * If the company is the only one with access, the entire connection is deleted.
   * If other companies have access, only the company's access is removed.
   * 
   * Convenience method that delegates to brokers wrapper.
   * 
   * @param params - Optional parameters object. Only include the fields you want to use.
   *                 Example: disconnectCompanyFromBroker({ accountId: "123", limit: 10, offset: 0 })
   * @returns FinaticResponse with success, error, and warning fields
   */
  async disconnectCompanyFromBroker(params?: Partial<DisconnectCompanyFromBrokerParams>): Promise<Awaited<ReturnType<typeof this.brokers.disconnectCompanyFromBroker>>> {
    return await this.brokers.disconnectCompanyFromBroker((params?.connectionId as any));
  }

  /**
   * Get Orders
   * 
   * Get orders for all authorized broker connections.
   * 
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns orders from connections the company has read access to.
   * 
   * Convenience method that delegates to brokers wrapper.
   * 
   * @param params - Optional parameters object. Only include the fields you want to use.
   *                 Example: getOrders({ accountId: "123", limit: 10, offset: 0 })
   * @returns FinaticResponse with success, error, and warning fields
   */
  async getOrders(params?: Partial<GetOrdersParams>): Promise<Awaited<ReturnType<typeof this.brokers.getOrders>>> {
    return await this.brokers.getOrders(params?.brokerId, params?.connectionId, params?.accountId, params?.symbol, params?.orderStatus, params?.side, params?.assetType, params?.limit, params?.offset, params?.createdAfter, params?.createdBefore, params?.withMetadata);
  }

  /**
   * Get Positions
   * 
   * Get positions for all authorized broker connections.
   * 
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns positions from connections the company has read access to.
   * 
   * Convenience method that delegates to brokers wrapper.
   * 
   * @param params - Optional parameters object. Only include the fields you want to use.
   *                 Example: getPositions({ accountId: "123", limit: 10, offset: 0 })
   * @returns FinaticResponse with success, error, and warning fields
   */
  async getPositions(params?: Partial<GetPositionsParams>): Promise<Awaited<ReturnType<typeof this.brokers.getPositions>>> {
    return await this.brokers.getPositions(params?.brokerId, params?.connectionId, params?.accountId, params?.symbol, params?.side, params?.assetType, params?.positionStatus, params?.limit, params?.offset, params?.updatedAfter, params?.updatedBefore, params?.withMetadata);
  }

  /**
   * Get Balances
   * 
   * Get balances for all authorized broker connections.
   * 
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns balances from connections the company has read access to.
   * 
   * Convenience method that delegates to brokers wrapper.
   * 
   * @param params - Optional parameters object. Only include the fields you want to use.
   *                 Example: getBalances({ accountId: "123", limit: 10, offset: 0 })
   * @returns FinaticResponse with success, error, and warning fields
   */
  async getBalances(params?: Partial<GetBalancesParams>): Promise<Awaited<ReturnType<typeof this.brokers.getBalances>>> {
    return await this.brokers.getBalances(params?.brokerId, params?.connectionId, params?.accountId, params?.isEndOfDaySnapshot, params?.limit, params?.offset, params?.balanceCreatedAfter, params?.balanceCreatedBefore, params?.withMetadata);
  }

  /**
   * Get Accounts
   * 
   * Get accounts for all authorized broker connections.
   * 
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns accounts from connections the company has read access to.
   * 
   * Convenience method that delegates to brokers wrapper.
   * 
   * @param params - Optional parameters object. Only include the fields you want to use.
   *                 Example: getAccounts({ accountId: "123", limit: 10, offset: 0 })
   * @returns FinaticResponse with success, error, and warning fields
   */
  async getAccounts(params?: Partial<GetAccountsParams>): Promise<Awaited<ReturnType<typeof this.brokers.getAccounts>>> {
    return await this.brokers.getAccounts(params?.brokerId, params?.connectionId, params?.accountType, params?.status, params?.currency, params?.limit, params?.offset, params?.withMetadata);
  }

  /**
   * Get Order Fills
   * 
   * Get order fills for a specific order.
   * 
   * This endpoint returns all execution fills for the specified order.
   * 
   * Convenience method that delegates to brokers wrapper.
   * 
   * @param params - Optional parameters object. Only include the fields you want to use.
   *                 Example: getOrderFills({ accountId: "123", limit: 10, offset: 0 })
   * @returns FinaticResponse with success, error, and warning fields
   */
  async getOrderFills(params?: Partial<GetOrderFillsParams>): Promise<Awaited<ReturnType<typeof this.brokers.getOrderFills>>> {
    return await this.brokers.getOrderFills((params?.orderId as any), params?.connectionId, params?.limit, params?.offset);
  }

  /**
   * Get Order Events
   * 
   * Get order events for a specific order.
   * 
   * This endpoint returns all lifecycle events for the specified order.
   * 
   * Convenience method that delegates to brokers wrapper.
   * 
   * @param params - Optional parameters object. Only include the fields you want to use.
   *                 Example: getOrderEvents({ accountId: "123", limit: 10, offset: 0 })
   * @returns FinaticResponse with success, error, and warning fields
   */
  async getOrderEvents(params?: Partial<GetOrderEventsParams>): Promise<Awaited<ReturnType<typeof this.brokers.getOrderEvents>>> {
    return await this.brokers.getOrderEvents((params?.orderId as any), params?.connectionId, params?.limit, params?.offset);
  }

  /**
   * Get Order Groups
   * 
   * Get order groups.
   * 
   * This endpoint returns order groups that contain multiple orders.
   * 
   * Convenience method that delegates to brokers wrapper.
   * 
   * @param params - Optional parameters object. Only include the fields you want to use.
   *                 Example: getOrderGroups({ accountId: "123", limit: 10, offset: 0 })
   * @returns FinaticResponse with success, error, and warning fields
   */
  async getOrderGroups(params?: Partial<GetOrderGroupsParams>): Promise<Awaited<ReturnType<typeof this.brokers.getOrderGroups>>> {
    return await this.brokers.getOrderGroups(params?.brokerId, params?.connectionId, params?.limit, params?.offset, params?.createdAfter, params?.createdBefore);
  }

  /**
   * Get Position Lots
   * 
   * Get position lots (tax lots for positions).
   * 
   * This endpoint returns tax lots for positions, which are used for tax reporting.
   * Each lot tracks when a position was opened/closed and at what prices.
   * 
   * Convenience method that delegates to brokers wrapper.
   * 
   * @param params - Optional parameters object. Only include the fields you want to use.
   *                 Example: getPositionLots({ accountId: "123", limit: 10, offset: 0 })
   * @returns FinaticResponse with success, error, and warning fields
   */
  async getPositionLots(params?: Partial<GetPositionLotsParams>): Promise<Awaited<ReturnType<typeof this.brokers.getPositionLots>>> {
    return await this.brokers.getPositionLots(params?.brokerId, params?.connectionId, params?.accountId, params?.symbol, params?.positionId, params?.limit, params?.offset);
  }

  /**
   * Get Position Lot Fills
   * 
   * Get position lot fills for a specific lot.
   * 
   * This endpoint returns all fills associated with a specific position lot.
   * 
   * Convenience method that delegates to brokers wrapper.
   * 
   * @param params - Optional parameters object. Only include the fields you want to use.
   *                 Example: getPositionLotFills({ accountId: "123", limit: 10, offset: 0 })
   * @returns FinaticResponse with success, error, and warning fields
   */
  async getPositionLotFills(params?: Partial<GetPositionLotFillsParams>): Promise<Awaited<ReturnType<typeof this.brokers.getPositionLotFills>>> {
    return await this.brokers.getPositionLotFills((params?.lotId as any), params?.connectionId, params?.limit, params?.offset);
  }


  /**
   * Get all Orders across all pages.
   * Auto-generated from paginated endpoint.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllOrders({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   */
  async getAllOrders(params?: Partial<GetOrdersParams>): Promise<FinaticResponse<OrderResponse[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetOrdersParams = (params || {}) as GetOrdersParams;
    const allData: OrderResponse[] = [];
    let offset = 0;
    const limit = 1000;
    let lastError: { [key: string]: any; } | null = null;
    let warnings: Array<{ [key: string]: any; }> = [];
    
    while (true) {
      const response = await this.brokers.getOrders(filterParams?.brokerId, filterParams?.connectionId, filterParams?.accountId, filterParams?.symbol, filterParams?.orderStatus, filterParams?.side, filterParams?.assetType, limit, offset, filterParams?.createdAfter, filterParams?.createdBefore, filterParams?.withMetadata);
      
      // Collect warnings from each page
      if (response.warning && Array.isArray(response.warning)) {
        warnings.push(...response.warning);
      }
      
      if (response.error) {
        lastError = response.error;
        break;
      }
      
      const result = response.success?.data || [];
      if (!result || result.length === 0) break;
      allData.push(...(Array.isArray(result) ? result : [result]));
      if (result.length < limit) break;
      offset += limit;
    }
    
    // Return FinaticResponse with accumulated data
    // When error occurs, return error response (success may be omitted or null)
    if (lastError) {
      return {
        success: {
          data: [] as OrderResponse[],
        },
        error: lastError,
        warning: warnings.length > 0 ? warnings : null,
      };
    }
    
    return {
      success: {
        data: allData,
      },
      error: null,
      warning: warnings.length > 0 ? warnings : null,
    };
  }

  /**
   * Get all Positions across all pages.
   * Auto-generated from paginated endpoint.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllOrders({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   */
  async getAllPositions(params?: Partial<GetPositionsParams>): Promise<FinaticResponse<PositionResponse[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetPositionsParams = (params || {}) as GetPositionsParams;
    const allData: PositionResponse[] = [];
    let offset = 0;
    const limit = 1000;
    let lastError: { [key: string]: any; } | null = null;
    let warnings: Array<{ [key: string]: any; }> = [];
    
    while (true) {
      const response = await this.brokers.getPositions(filterParams?.brokerId, filterParams?.connectionId, filterParams?.accountId, filterParams?.symbol, filterParams?.side, filterParams?.assetType, filterParams?.positionStatus, limit, offset, filterParams?.updatedAfter, filterParams?.updatedBefore, filterParams?.withMetadata);
      
      // Collect warnings from each page
      if (response.warning && Array.isArray(response.warning)) {
        warnings.push(...response.warning);
      }
      
      if (response.error) {
        lastError = response.error;
        break;
      }
      
      const result = response.success?.data || [];
      if (!result || result.length === 0) break;
      allData.push(...(Array.isArray(result) ? result : [result]));
      if (result.length < limit) break;
      offset += limit;
    }
    
    // Return FinaticResponse with accumulated data
    // When error occurs, return error response (success may be omitted or null)
    if (lastError) {
      return {
        success: {
          data: [] as PositionResponse[],
        },
        error: lastError,
        warning: warnings.length > 0 ? warnings : null,
      };
    }
    
    return {
      success: {
        data: allData,
      },
      error: null,
      warning: warnings.length > 0 ? warnings : null,
    };
  }

  /**
   * Get all Balances across all pages.
   * Auto-generated from paginated endpoint.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllOrders({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   */
  async getAllBalances(params?: Partial<GetBalancesParams>): Promise<FinaticResponse<Balances[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetBalancesParams = (params || {}) as GetBalancesParams;
    const allData: Balances[] = [];
    let offset = 0;
    const limit = 1000;
    let lastError: { [key: string]: any; } | null = null;
    let warnings: Array<{ [key: string]: any; }> = [];
    
    while (true) {
      const response = await this.brokers.getBalances(filterParams?.brokerId, filterParams?.connectionId, filterParams?.accountId, filterParams?.isEndOfDaySnapshot, limit, offset, filterParams?.balanceCreatedAfter, filterParams?.balanceCreatedBefore, filterParams?.withMetadata);
      
      // Collect warnings from each page
      if (response.warning && Array.isArray(response.warning)) {
        warnings.push(...response.warning);
      }
      
      if (response.error) {
        lastError = response.error;
        break;
      }
      
      const result = response.success?.data || [];
      if (!result || result.length === 0) break;
      allData.push(...(Array.isArray(result) ? result : [result]));
      if (result.length < limit) break;
      offset += limit;
    }
    
    // Return FinaticResponse with accumulated data
    // When error occurs, return error response (success may be omitted or null)
    if (lastError) {
      return {
        success: {
          data: [] as Balances[],
        },
        error: lastError,
        warning: warnings.length > 0 ? warnings : null,
      };
    }
    
    return {
      success: {
        data: allData,
      },
      error: null,
      warning: warnings.length > 0 ? warnings : null,
    };
  }

  /**
   * Get all Accounts across all pages.
   * Auto-generated from paginated endpoint.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllOrders({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   */
  async getAllAccounts(params?: Partial<GetAccountsParams>): Promise<FinaticResponse<Accounts[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetAccountsParams = (params || {}) as GetAccountsParams;
    const allData: Accounts[] = [];
    let offset = 0;
    const limit = 1000;
    let lastError: { [key: string]: any; } | null = null;
    let warnings: Array<{ [key: string]: any; }> = [];
    
    while (true) {
      const response = await this.brokers.getAccounts(filterParams?.brokerId, filterParams?.connectionId, filterParams?.accountType, filterParams?.status, filterParams?.currency, limit, offset, filterParams?.withMetadata);
      
      // Collect warnings from each page
      if (response.warning && Array.isArray(response.warning)) {
        warnings.push(...response.warning);
      }
      
      if (response.error) {
        lastError = response.error;
        break;
      }
      
      const result = response.success?.data || [];
      if (!result || result.length === 0) break;
      allData.push(...(Array.isArray(result) ? result : [result]));
      if (result.length < limit) break;
      offset += limit;
    }
    
    // Return FinaticResponse with accumulated data
    // When error occurs, return error response (success may be omitted or null)
    if (lastError) {
      return {
        success: {
          data: [] as Accounts[],
        },
        error: lastError,
        warning: warnings.length > 0 ? warnings : null,
      };
    }
    
    return {
      success: {
        data: allData,
      },
      error: null,
      warning: warnings.length > 0 ? warnings : null,
    };
  }

  /**
   * Get all OrderFills across all pages.
   * Auto-generated from paginated endpoint.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllOrders({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   */
  async getAllOrderFills(params?: Partial<GetOrderFillsParams>): Promise<FinaticResponse<OrderFillResponse[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetOrderFillsParams = (params || {}) as GetOrderFillsParams;
    const allData: OrderFillResponse[] = [];
    let offset = 0;
    const limit = 1000;
    let lastError: { [key: string]: any; } | null = null;
    let warnings: Array<{ [key: string]: any; }> = [];
    
    while (true) {
      const response = await this.brokers.getOrderFills(filterParams?.orderId, filterParams?.connectionId, limit, offset);
      
      // Collect warnings from each page
      if (response.warning && Array.isArray(response.warning)) {
        warnings.push(...response.warning);
      }
      
      if (response.error) {
        lastError = response.error;
        break;
      }
      
      const result = response.success?.data || [];
      if (!result || result.length === 0) break;
      allData.push(...(Array.isArray(result) ? result : [result]));
      if (result.length < limit) break;
      offset += limit;
    }
    
    // Return FinaticResponse with accumulated data
    // When error occurs, return error response (success may be omitted or null)
    if (lastError) {
      return {
        success: {
          data: [] as OrderFillResponse[],
        },
        error: lastError,
        warning: warnings.length > 0 ? warnings : null,
      };
    }
    
    return {
      success: {
        data: allData,
      },
      error: null,
      warning: warnings.length > 0 ? warnings : null,
    };
  }

  /**
   * Get all OrderEvents across all pages.
   * Auto-generated from paginated endpoint.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllOrders({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   */
  async getAllOrderEvents(params?: Partial<GetOrderEventsParams>): Promise<FinaticResponse<OrderEventResponse[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetOrderEventsParams = (params || {}) as GetOrderEventsParams;
    const allData: OrderEventResponse[] = [];
    let offset = 0;
    const limit = 1000;
    let lastError: { [key: string]: any; } | null = null;
    let warnings: Array<{ [key: string]: any; }> = [];
    
    while (true) {
      const response = await this.brokers.getOrderEvents(filterParams?.orderId, filterParams?.connectionId, limit, offset);
      
      // Collect warnings from each page
      if (response.warning && Array.isArray(response.warning)) {
        warnings.push(...response.warning);
      }
      
      if (response.error) {
        lastError = response.error;
        break;
      }
      
      const result = response.success?.data || [];
      if (!result || result.length === 0) break;
      allData.push(...(Array.isArray(result) ? result : [result]));
      if (result.length < limit) break;
      offset += limit;
    }
    
    // Return FinaticResponse with accumulated data
    // When error occurs, return error response (success may be omitted or null)
    if (lastError) {
      return {
        success: {
          data: [] as OrderEventResponse[],
        },
        error: lastError,
        warning: warnings.length > 0 ? warnings : null,
      };
    }
    
    return {
      success: {
        data: allData,
      },
      error: null,
      warning: warnings.length > 0 ? warnings : null,
    };
  }

  /**
   * Get all OrderGroups across all pages.
   * Auto-generated from paginated endpoint.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllOrders({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   */
  async getAllOrderGroups(params?: Partial<GetOrderGroupsParams>): Promise<FinaticResponse<OrderGroupResponse[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetOrderGroupsParams = (params || {}) as GetOrderGroupsParams;
    const allData: OrderGroupResponse[] = [];
    let offset = 0;
    const limit = 1000;
    let lastError: { [key: string]: any; } | null = null;
    let warnings: Array<{ [key: string]: any; }> = [];
    
    while (true) {
      const response = await this.brokers.getOrderGroups(filterParams?.brokerId, filterParams?.connectionId, limit, offset, filterParams?.createdAfter, filterParams?.createdBefore);
      
      // Collect warnings from each page
      if (response.warning && Array.isArray(response.warning)) {
        warnings.push(...response.warning);
      }
      
      if (response.error) {
        lastError = response.error;
        break;
      }
      
      const result = response.success?.data || [];
      if (!result || result.length === 0) break;
      allData.push(...(Array.isArray(result) ? result : [result]));
      if (result.length < limit) break;
      offset += limit;
    }
    
    // Return FinaticResponse with accumulated data
    // When error occurs, return error response (success may be omitted or null)
    if (lastError) {
      return {
        success: {
          data: [] as OrderGroupResponse[],
        },
        error: lastError,
        warning: warnings.length > 0 ? warnings : null,
      };
    }
    
    return {
      success: {
        data: allData,
      },
      error: null,
      warning: warnings.length > 0 ? warnings : null,
    };
  }

  /**
   * Get all PositionLots across all pages.
   * Auto-generated from paginated endpoint.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllOrders({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   */
  async getAllPositionLots(params?: Partial<GetPositionLotsParams>): Promise<FinaticResponse<PositionLotResponse[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetPositionLotsParams = (params || {}) as GetPositionLotsParams;
    const allData: PositionLotResponse[] = [];
    let offset = 0;
    const limit = 1000;
    let lastError: { [key: string]: any; } | null = null;
    let warnings: Array<{ [key: string]: any; }> = [];
    
    while (true) {
      const response = await this.brokers.getPositionLots(filterParams?.brokerId, filterParams?.connectionId, filterParams?.accountId, filterParams?.symbol, filterParams?.positionId, limit, offset);
      
      // Collect warnings from each page
      if (response.warning && Array.isArray(response.warning)) {
        warnings.push(...response.warning);
      }
      
      if (response.error) {
        lastError = response.error;
        break;
      }
      
      const result = response.success?.data || [];
      if (!result || result.length === 0) break;
      allData.push(...(Array.isArray(result) ? result : [result]));
      if (result.length < limit) break;
      offset += limit;
    }
    
    // Return FinaticResponse with accumulated data
    // When error occurs, return error response (success may be omitted or null)
    if (lastError) {
      return {
        success: {
          data: [] as PositionLotResponse[],
        },
        error: lastError,
        warning: warnings.length > 0 ? warnings : null,
      };
    }
    
    return {
      success: {
        data: allData,
      },
      error: null,
      warning: warnings.length > 0 ? warnings : null,
    };
  }

  /**
   * Get all PositionLotFills across all pages.
   * Auto-generated from paginated endpoint.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllOrders({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   */
  async getAllPositionLotFills(params?: Partial<GetPositionLotFillsParams>): Promise<FinaticResponse<PositionLotFillResponse[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetPositionLotFillsParams = (params || {}) as GetPositionLotFillsParams;
    const allData: PositionLotFillResponse[] = [];
    let offset = 0;
    const limit = 1000;
    let lastError: { [key: string]: any; } | null = null;
    let warnings: Array<{ [key: string]: any; }> = [];
    
    while (true) {
      const response = await this.brokers.getPositionLotFills(filterParams?.lotId, filterParams?.connectionId, limit, offset);
      
      // Collect warnings from each page
      if (response.warning && Array.isArray(response.warning)) {
        warnings.push(...response.warning);
      }
      
      if (response.error) {
        lastError = response.error;
        break;
      }
      
      const result = response.success?.data || [];
      if (!result || result.length === 0) break;
      allData.push(...(Array.isArray(result) ? result : [result]));
      if (result.length < limit) break;
      offset += limit;
    }
    
    // Return FinaticResponse with accumulated data
    // When error occurs, return error response (success may be omitted or null)
    if (lastError) {
      return {
        success: {
          data: [] as PositionLotFillResponse[],
        },
        error: lastError,
        warning: warnings.length > 0 ? warnings : null,
      };
    }
    
    return {
      success: {
        data: allData,
      },
      error: null,
      warning: warnings.length > 0 ? warnings : null,
    };
  }
}
