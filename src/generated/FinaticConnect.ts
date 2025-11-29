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
import type { FDXBrokerAccount, FDXBrokerBalance, FDXBrokerOrder, FDXBrokerOrderEvent, FDXBrokerOrderFill, FDXBrokerOrderGroup, FDXBrokerPosition, FDXBrokerPositionLot, FDXBrokerPositionLotFill } from './models';


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
   * 
   * @methodId init_client_sdk
   * @category session
   * 
   * @example
   * ```typescript-client
   * const finatic = await FinaticConnect.init('your-one-time-token', 'optional-user-id', {
   *   baseUrl: 'https://api.finatic.dev',
   *   logLevel: 'debug'
   * });
   * ```
   * 
   * @param token - One-time token for authentication (required)
   * @param userId - Optional user ID for direct authentication
   * @param sdkConfig - Optional SDK configuration overrides
   * @returns FinaticConnect instance with session already initialized
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
   * 
   * @methodId get_portal_url_api_v1_session_portal_get
   * @category session
   * @param theme - Optional theme preset or custom theme object
   * @param brokers - Optional array of broker IDs to filter
   * @param email - Optional email address
   * @param mode - Optional mode ('light' or 'dark')
   * @returns Portal URL string
   * @example
   * ```typescript-client
   * const url = await finatic.getPortalUrl('dark', ['broker-1'], 'user@example.com', 'dark');
   * ```
   * @example
   * ```typescript-server
   * const url = await finatic.getPortalUrl('dark', ['broker-1'], 'user@example.com', 'dark');
   * ```
   * @example
   * ```python
   * url = await finatic.get_portal_url('dark', ['broker-1'], 'user@example.com', 'dark')
   * ```
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

    // Note: session_id and company_id should NOT be added to the portal URL
    // The backend includes the token in the URL, and session context is handled via headers

    this.logger.debug?.('Portal URL generated', { portalUrl });
    return portalUrl;
  }

  /**
   * Open portal in iframe (Client SDK only).
   * The portal handles user authentication and linking to session at the source of truth.
   * This method just records the userId for SDK state.
   * 
   * @methodId open_portal_client_sdk
   * @category session
   * @param theme - Optional theme preset or custom theme object
   * @param brokers - Optional array of broker IDs to filter
   * @param email - Optional email address
   * @param mode - Optional mode ('light' or 'dark')
   * @param onSuccess - Optional callback when portal authentication succeeds
   * @param onError - Optional callback when portal authentication fails
   * @param onClose - Optional callback when portal is closed
   * @returns Promise that resolves when portal is opened
   * @example
   * ```typescript-client
   * await finatic.openPortal('dark', ['broker-1'], 'user@example.com', 'dark', 
   *   (userId) => console.log('User authenticated:', userId),
   *   (error) => console.error('Portal error:', error),
   *   () => console.log('Portal closed')
   * );
   * ```
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
   * 
   * @methodId get_user_id_helper
   * @category session
   * @returns Current user ID or undefined if not authenticated
   * @example
   * ```typescript-client
   * const userId = finatic.getUserId();
   * ```
   * @example
   * ```typescript-server
   * const userId = finatic.getUserId();
   * ```
   * @example
   * ```python
   * user_id = finatic.get_user_id()
   * ```
   */
  getUserId(): string | undefined {
    return this.userId;
  }

  /**
   * Check if user is authenticated (has userId).
   * 
   * @methodId is_authed_helper
   * @category session
   * @returns True if user is authenticated, false otherwise
   * @example
   * ```typescript-client
   * const isAuthenticated = finatic.isAuthed();
   * ```
   * @example
   * ```typescript-server
   * const isAuthenticated = finatic.isAuthed();
   * ```
   * @example
   * ```python
   * is_authenticated = finatic.is_authed()
   * ```
   */
  isAuthed(): boolean {
    return !!this.userId;
  }

  /**
   * Get session user information after portal authentication.
   * 
   * @methodId get_session_user_api_v1_session__session_id__user_get
   * @category session
   * @returns Object with user_id and company_id
   * @example
   * ```typescript-client
   * const user = await finatic.getSessionUser();
   * ```
   * @example
   * ```typescript-server
   * const user = await finatic.getSessionUser();
   * ```
   * @example
   * ```python
   * user = await finatic.get_session_user()
   * ```
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
   * Get Company
   * 
   * Get public company details by ID (no user check, no sensitive data).
   * 
   * Convenience method that delegates to company wrapper.
   * 
   * @param params - Optional parameters object. Only include the fields you want to use.
   *                 Example: getCompany({ accountId: "123", limit: 10, offset: 0 })
   * @returns FinaticResponse with success, error, and warning fields
   * @methodId get_company_api_v1_company__company_id__get
   * @category company
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.getCompany({ companyId: '00000000-0000-0000-0000-000000000000' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```typescript-server
   * // Minimal example with required parameters only
   * const result = await finatic.getCompany({ companyId: '00000000-0000-0000-0000-000000000000' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```python
   * # Minimal example with required parameters only
   * result = await finatic.get_company(
   *            company_id='00000000-0000-0000-0000-000000000000'
   * )
   * 
   * # Access the response data
   * if result.success:
   *     print('Data:', result.success['data'])
   * elif result.error:
   *     print('Error:', result.error['message'])
   * ```
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
   * @methodId get_brokers_api_v1_brokers__get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getBrokers();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-server
   * // Example with no parameters
   * const result = await finatic.getBrokers();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```python
   * # Example with no parameters
   * result = await finatic.get_brokers()
   * 
   * # Access the response data
   * if result.success:
   *     print('Data:', result.success['data'])
   * ```
   */
  async getBrokers(params?: {}): Promise<Awaited<ReturnType<typeof this.brokers.getBrokers>>> {
    return await this.brokers.getBrokers();
  }

  /**
   * List Broker Connections
   * 
   * List all broker connections for the current user with permissions.
   * 
   * This endpoint is accessible from the portal and uses session-only authentication.
   * Returns connections that the user has any permissions for, including the current
   * company's permissions (read/write) for each connection.
   * 
   * Convenience method that delegates to brokers wrapper.
   * 
   * @param params - Optional parameters object. Only include the fields you want to use.
   *                 Example: getBrokerConnections({ accountId: "123", limit: 10, offset: 0 })
   * @returns FinaticResponse with success, error, and warning fields
   * @methodId list_broker_connections_api_v1_brokers_connections_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getBrokerConnections();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-server
   * // Example with no parameters
   * const result = await finatic.getBrokerConnections();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```python
   * # Example with no parameters
   * result = await finatic.get_broker_connections()
   * 
   * # Access the response data
   * if result.success:
   *     print('Data:', result.success['data'])
   * ```
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
   * @methodId disconnect_company_from_broker_api_v1_brokers_disconnect_company__connection_id__delete
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.disconnectCompanyFromBroker({ connectionId: '00000000-0000-0000-0000-000000000000' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```typescript-server
   * // Minimal example with required parameters only
   * const result = await finatic.disconnectCompanyFromBroker({ connectionId: '00000000-0000-0000-0000-000000000000' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```python
   * # Minimal example with required parameters only
   * result = await finatic.disconnect_company_from_broker(
   *            connection_id='00000000-0000-0000-0000-000000000000'
   * )
   * 
   * # Access the response data
   * if result.success:
   *     print('Data:', result.success['data'])
   * elif result.error:
   *     print('Error:', result.error['message'])
   * ```
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
   * @methodId get_orders_api_v1_brokers_data_orders_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getOrders();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getOrders({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountId: '123456789' });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   * @example
   * ```typescript-server
   * // Example with no parameters
   * const result = await finatic.getOrders();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```python
   * # Example with no parameters
   * result = await finatic.get_orders()
   * 
   * # Access the response data
   * if result.success:
   *     print('Data:', result.success['data'])
   * ```
   * @example
   * ```python
   * # Full example with optional parameters
   * result = await finatic.get_orders(
   *            broker_id='alpaca',
            connection_id='00000000-0000-0000-0000-000000000000',
            account_id='123456789'
   * )
   * 
   * # Handle response with warnings
   * if result.success:
   *     print('Data:', result.success['data'])
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'], result.error['code'])
   * ```
   */
  async getOrders(params?: Partial<GetOrdersParams>): Promise<Awaited<ReturnType<typeof this.brokers.getOrders>>> {
    return await this.brokers.getOrders(params?.brokerId, params?.connectionId, params?.accountId, params?.symbol, params?.orderStatus, params?.side, params?.assetType, params?.limit, params?.offset, params?.createdAfter, params?.createdBefore, params?.includeMetadata);
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
   * @methodId get_positions_api_v1_brokers_data_positions_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getPositions();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getPositions({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountId: '123456789' });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   * @example
   * ```typescript-server
   * // Example with no parameters
   * const result = await finatic.getPositions();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```python
   * # Example with no parameters
   * result = await finatic.get_positions()
   * 
   * # Access the response data
   * if result.success:
   *     print('Data:', result.success['data'])
   * ```
   * @example
   * ```python
   * # Full example with optional parameters
   * result = await finatic.get_positions(
   *            broker_id='alpaca',
            connection_id='00000000-0000-0000-0000-000000000000',
            account_id='123456789'
   * )
   * 
   * # Handle response with warnings
   * if result.success:
   *     print('Data:', result.success['data'])
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'], result.error['code'])
   * ```
   */
  async getPositions(params?: Partial<GetPositionsParams>): Promise<Awaited<ReturnType<typeof this.brokers.getPositions>>> {
    return await this.brokers.getPositions(params?.brokerId, params?.connectionId, params?.accountId, params?.symbol, params?.side, params?.assetType, params?.positionStatus, params?.limit, params?.offset, params?.updatedAfter, params?.updatedBefore, params?.includeMetadata);
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
   * @methodId get_balances_api_v1_brokers_data_balances_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getBalances();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getBalances({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountId: '123456789' });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   * @example
   * ```typescript-server
   * // Example with no parameters
   * const result = await finatic.getBalances();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```python
   * # Example with no parameters
   * result = await finatic.get_balances()
   * 
   * # Access the response data
   * if result.success:
   *     print('Data:', result.success['data'])
   * ```
   * @example
   * ```python
   * # Full example with optional parameters
   * result = await finatic.get_balances(
   *            broker_id='alpaca',
            connection_id='00000000-0000-0000-0000-000000000000',
            account_id='123456789'
   * )
   * 
   * # Handle response with warnings
   * if result.success:
   *     print('Data:', result.success['data'])
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'], result.error['code'])
   * ```
   */
  async getBalances(params?: Partial<GetBalancesParams>): Promise<Awaited<ReturnType<typeof this.brokers.getBalances>>> {
    return await this.brokers.getBalances(params?.brokerId, params?.connectionId, params?.accountId, params?.isEndOfDaySnapshot, params?.limit, params?.offset, params?.balanceCreatedAfter, params?.balanceCreatedBefore, params?.includeMetadata);
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
   * @methodId get_accounts_api_v1_brokers_data_accounts_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getAccounts();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getAccounts({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountType: 'margin' });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   * @example
   * ```typescript-server
   * // Example with no parameters
   * const result = await finatic.getAccounts();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```python
   * # Example with no parameters
   * result = await finatic.get_accounts()
   * 
   * # Access the response data
   * if result.success:
   *     print('Data:', result.success['data'])
   * ```
   * @example
   * ```python
   * # Full example with optional parameters
   * result = await finatic.get_accounts(
   *            broker_id='alpaca',
            connection_id='00000000-0000-0000-0000-000000000000',
            account_type='margin'
   * )
   * 
   * # Handle response with warnings
   * if result.success:
   *     print('Data:', result.success['data'])
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'], result.error['code'])
   * ```
   */
  async getAccounts(params?: Partial<GetAccountsParams>): Promise<Awaited<ReturnType<typeof this.brokers.getAccounts>>> {
    return await this.brokers.getAccounts(params?.brokerId, params?.connectionId, params?.accountType, params?.status, params?.currency, params?.limit, params?.offset, params?.includeMetadata);
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
   * @methodId get_order_fills_api_v1_brokers_data_orders__order_id__fills_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.getOrderFills({ orderId: '00000000-0000-0000-0000-000000000000' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getOrderFills({ orderId: '00000000-0000-0000-0000-000000000000', connectionId: '00000000-0000-0000-0000-000000000000', limit: 100, offset: 0 });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   * @example
   * ```typescript-server
   * // Minimal example with required parameters only
   * const result = await finatic.getOrderFills({ orderId: '00000000-0000-0000-0000-000000000000' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```python
   * # Minimal example with required parameters only
   * result = await finatic.get_order_fills(
   *            order_id='00000000-0000-0000-0000-000000000000'
   * )
   * 
   * # Access the response data
   * if result.success:
   *     print('Data:', result.success['data'])
   * elif result.error:
   *     print('Error:', result.error['message'])
   * ```
   * @example
   * ```python
   * # Full example with optional parameters
   * result = await finatic.get_order_fills(
   *            order_id='00000000-0000-0000-0000-000000000000',
            connection_id='00000000-0000-0000-0000-000000000000',
            limit=100,
            offset=0
   * )
   * 
   * # Handle response with warnings
   * if result.success:
   *     print('Data:', result.success['data'])
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'], result.error['code'])
   * ```
   */
  async getOrderFills(params?: Partial<GetOrderFillsParams>): Promise<Awaited<ReturnType<typeof this.brokers.getOrderFills>>> {
    return await this.brokers.getOrderFills((params?.orderId as any), params?.connectionId, params?.limit, params?.offset, params?.includeMetadata);
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
   * @methodId get_order_events_api_v1_brokers_data_orders__order_id__events_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.getOrderEvents({ orderId: '00000000-0000-0000-0000-000000000000' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getOrderEvents({ orderId: '00000000-0000-0000-0000-000000000000', connectionId: '00000000-0000-0000-0000-000000000000', limit: 100, offset: 0 });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   * @example
   * ```typescript-server
   * // Minimal example with required parameters only
   * const result = await finatic.getOrderEvents({ orderId: '00000000-0000-0000-0000-000000000000' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```python
   * # Minimal example with required parameters only
   * result = await finatic.get_order_events(
   *            order_id='00000000-0000-0000-0000-000000000000'
   * )
   * 
   * # Access the response data
   * if result.success:
   *     print('Data:', result.success['data'])
   * elif result.error:
   *     print('Error:', result.error['message'])
   * ```
   * @example
   * ```python
   * # Full example with optional parameters
   * result = await finatic.get_order_events(
   *            order_id='00000000-0000-0000-0000-000000000000',
            connection_id='00000000-0000-0000-0000-000000000000',
            limit=100,
            offset=0
   * )
   * 
   * # Handle response with warnings
   * if result.success:
   *     print('Data:', result.success['data'])
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'], result.error['code'])
   * ```
   */
  async getOrderEvents(params?: Partial<GetOrderEventsParams>): Promise<Awaited<ReturnType<typeof this.brokers.getOrderEvents>>> {
    return await this.brokers.getOrderEvents((params?.orderId as any), params?.connectionId, params?.limit, params?.offset, params?.includeMetadata);
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
   * @methodId get_order_groups_api_v1_brokers_data_orders_groups_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getOrderGroups();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getOrderGroups({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', limit: 100 });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   * @example
   * ```typescript-server
   * // Example with no parameters
   * const result = await finatic.getOrderGroups();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```python
   * # Example with no parameters
   * result = await finatic.get_order_groups()
   * 
   * # Access the response data
   * if result.success:
   *     print('Data:', result.success['data'])
   * ```
   * @example
   * ```python
   * # Full example with optional parameters
   * result = await finatic.get_order_groups(
   *            broker_id='alpaca',
            connection_id='00000000-0000-0000-0000-000000000000',
            limit=100
   * )
   * 
   * # Handle response with warnings
   * if result.success:
   *     print('Data:', result.success['data'])
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'], result.error['code'])
   * ```
   */
  async getOrderGroups(params?: Partial<GetOrderGroupsParams>): Promise<Awaited<ReturnType<typeof this.brokers.getOrderGroups>>> {
    return await this.brokers.getOrderGroups(params?.brokerId, params?.connectionId, params?.limit, params?.offset, params?.createdAfter, params?.createdBefore, params?.includeMetadata);
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
   * @methodId get_position_lots_api_v1_brokers_data_positions_lots_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Example with no parameters
   * const result = await finatic.getPositionLots();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getPositionLots({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountId: '123456789' });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   * @example
   * ```typescript-server
   * // Example with no parameters
   * const result = await finatic.getPositionLots();
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * }
   * ```
   * @example
   * ```python
   * # Example with no parameters
   * result = await finatic.get_position_lots()
   * 
   * # Access the response data
   * if result.success:
   *     print('Data:', result.success['data'])
   * ```
   * @example
   * ```python
   * # Full example with optional parameters
   * result = await finatic.get_position_lots(
   *            broker_id='alpaca',
            connection_id='00000000-0000-0000-0000-000000000000',
            account_id='123456789'
   * )
   * 
   * # Handle response with warnings
   * if result.success:
   *     print('Data:', result.success['data'])
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'], result.error['code'])
   * ```
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
   * @methodId get_position_lot_fills_api_v1_brokers_data_positions_lots__lot_id__fills_get
   * @category brokers
   * @example
   * ```typescript-client
   * // Minimal example with required parameters only
   * const result = await finatic.getPositionLotFills({ lotId: '00000000-0000-0000-0000-000000000000' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Full example with optional parameters
   * const result = await finatic.getPositionLotFills({ lotId: '00000000-0000-0000-0000-000000000000', connectionId: '00000000-0000-0000-0000-000000000000', limit: 100, offset: 0 });
   * 
   * // Handle response with warnings
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message, result.error.code);
   * }
   * ```
   * @example
   * ```typescript-server
   * // Minimal example with required parameters only
   * const result = await finatic.getPositionLotFills({ lotId: '00000000-0000-0000-0000-000000000000' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Data:', result.success.data);
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```python
   * # Minimal example with required parameters only
   * result = await finatic.get_position_lot_fills(
   *            lot_id='00000000-0000-0000-0000-000000000000'
   * )
   * 
   * # Access the response data
   * if result.success:
   *     print('Data:', result.success['data'])
   * elif result.error:
   *     print('Error:', result.error['message'])
   * ```
   * @example
   * ```python
   * # Full example with optional parameters
   * result = await finatic.get_position_lot_fills(
   *            lot_id='00000000-0000-0000-0000-000000000000',
            connection_id='00000000-0000-0000-0000-000000000000',
            limit=100,
            offset=0
   * )
   * 
   * # Handle response with warnings
   * if result.success:
   *     print('Data:', result.success['data'])
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'], result.error['code'])
   * ```
   */
  async getPositionLotFills(params?: Partial<GetPositionLotFillsParams>): Promise<Awaited<ReturnType<typeof this.brokers.getPositionLotFills>>> {
    return await this.brokers.getPositionLotFills((params?.lotId as any), params?.connectionId, params?.limit, params?.offset);
  }


  /**
   * Get all Orders across all pages.
   * Auto-generated from paginated endpoint.
   * 
   * This method automatically paginates through all pages and returns all items in a single response.
   * It uses the underlying getOrders method with internal pagination handling.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllOrders({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   * @methodId get_all_orders_api_v1_brokers_data_orders_get
   * @category brokers
   * @example
   * ```typescript-server
   * // Get all items with optional filters
   * const result = await finatic.getAllOrders({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountId: '123456789' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Get all items with optional filters
   * const result = await finatic.getAllOrders({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountId: '123456789' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```python
   * # Get all items with optional filters
   * result = await finatic.get_all_orders(
   *            broker_id='alpaca',
            connection_id='00000000-0000-0000-0000-000000000000',
            account_id='123456789'
   * )
   * 
   * # Access the response data
   * if result.success:
   *     print('Total items:', len(result.success['data']))
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'])
   * ```
   */
  async getAllOrders(params?: Partial<GetOrdersParams>): Promise<FinaticResponse<FDXBrokerOrder[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetOrdersParams = (params || {}) as GetOrdersParams;
    const allData: FDXBrokerOrder[] = [];
    let offset = 0;
    const limit = 1000;
    let lastError: { [key: string]: any; } | null = null;
    let warnings: Array<{ [key: string]: any; }> = [];
    
    while (true) {
      const response = await this.brokers.getOrders(filterParams?.brokerId, filterParams?.connectionId, filterParams?.accountId, filterParams?.symbol, filterParams?.orderStatus, filterParams?.side, filterParams?.assetType, limit, offset, filterParams?.createdAfter, filterParams?.createdBefore, filterParams?.includeMetadata);
      
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
          data: [] as FDXBrokerOrder[],
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
   * This method automatically paginates through all pages and returns all items in a single response.
   * It uses the underlying getPositions method with internal pagination handling.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllPositions({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   * @methodId get_all_positions_api_v1_brokers_data_positions_get
   * @category brokers
   * @example
   * ```typescript-server
   * // Get all items with optional filters
   * const result = await finatic.getAllPositions({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountId: '123456789' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Get all items with optional filters
   * const result = await finatic.getAllPositions({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountId: '123456789' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```python
   * # Get all items with optional filters
   * result = await finatic.get_all_positions(
   *            broker_id='alpaca',
            connection_id='00000000-0000-0000-0000-000000000000',
            account_id='123456789'
   * )
   * 
   * # Access the response data
   * if result.success:
   *     print('Total items:', len(result.success['data']))
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'])
   * ```
   */
  async getAllPositions(params?: Partial<GetPositionsParams>): Promise<FinaticResponse<FDXBrokerPosition[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetPositionsParams = (params || {}) as GetPositionsParams;
    const allData: FDXBrokerPosition[] = [];
    let offset = 0;
    const limit = 1000;
    let lastError: { [key: string]: any; } | null = null;
    let warnings: Array<{ [key: string]: any; }> = [];
    
    while (true) {
      const response = await this.brokers.getPositions(filterParams?.brokerId, filterParams?.connectionId, filterParams?.accountId, filterParams?.symbol, filterParams?.side, filterParams?.assetType, filterParams?.positionStatus, limit, offset, filterParams?.updatedAfter, filterParams?.updatedBefore, filterParams?.includeMetadata);
      
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
          data: [] as FDXBrokerPosition[],
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
   * This method automatically paginates through all pages and returns all items in a single response.
   * It uses the underlying getBalances method with internal pagination handling.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllBalances({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   * @methodId get_all_balances_api_v1_brokers_data_balances_get
   * @category brokers
   * @example
   * ```typescript-server
   * // Get all items with optional filters
   * const result = await finatic.getAllBalances({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountId: '123456789' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Get all items with optional filters
   * const result = await finatic.getAllBalances({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountId: '123456789' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```python
   * # Get all items with optional filters
   * result = await finatic.get_all_balances(
   *            broker_id='alpaca',
            connection_id='00000000-0000-0000-0000-000000000000',
            account_id='123456789'
   * )
   * 
   * # Access the response data
   * if result.success:
   *     print('Total items:', len(result.success['data']))
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'])
   * ```
   */
  async getAllBalances(params?: Partial<GetBalancesParams>): Promise<FinaticResponse<FDXBrokerBalance[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetBalancesParams = (params || {}) as GetBalancesParams;
    const allData: FDXBrokerBalance[] = [];
    let offset = 0;
    const limit = 1000;
    let lastError: { [key: string]: any; } | null = null;
    let warnings: Array<{ [key: string]: any; }> = [];
    
    while (true) {
      const response = await this.brokers.getBalances(filterParams?.brokerId, filterParams?.connectionId, filterParams?.accountId, filterParams?.isEndOfDaySnapshot, limit, offset, filterParams?.balanceCreatedAfter, filterParams?.balanceCreatedBefore, filterParams?.includeMetadata);
      
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
          data: [] as FDXBrokerBalance[],
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
   * This method automatically paginates through all pages and returns all items in a single response.
   * It uses the underlying getAccounts method with internal pagination handling.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllAccounts({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   * @methodId get_all_accounts_api_v1_brokers_data_accounts_get
   * @category brokers
   * @example
   * ```typescript-server
   * // Get all items with optional filters
   * const result = await finatic.getAllAccounts({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountType: 'margin' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Get all items with optional filters
   * const result = await finatic.getAllAccounts({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountType: 'margin' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```python
   * # Get all items with optional filters
   * result = await finatic.get_all_accounts(
   *            broker_id='alpaca',
            connection_id='00000000-0000-0000-0000-000000000000',
            account_type='margin'
   * )
   * 
   * # Access the response data
   * if result.success:
   *     print('Total items:', len(result.success['data']))
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'])
   * ```
   */
  async getAllAccounts(params?: Partial<GetAccountsParams>): Promise<FinaticResponse<FDXBrokerAccount[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetAccountsParams = (params || {}) as GetAccountsParams;
    const allData: FDXBrokerAccount[] = [];
    let offset = 0;
    const limit = 1000;
    let lastError: { [key: string]: any; } | null = null;
    let warnings: Array<{ [key: string]: any; }> = [];
    
    while (true) {
      const response = await this.brokers.getAccounts(filterParams?.brokerId, filterParams?.connectionId, filterParams?.accountType, filterParams?.status, filterParams?.currency, limit, offset, filterParams?.includeMetadata);
      
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
          data: [] as FDXBrokerAccount[],
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
   * This method automatically paginates through all pages and returns all items in a single response.
   * It uses the underlying getOrderFills method with internal pagination handling.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllOrderFills({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   * @methodId get_all_order_fills_api_v1_brokers_data_orders__order_id__fills_get
   * @category brokers
   * @example
   * ```typescript-server
   * // Get all items with optional filters
   * const result = await finatic.getAllOrderFills({ connectionId: '00000000-0000-0000-0000-000000000000', includeMetadata: false });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Get all items with optional filters
   * const result = await finatic.getAllOrderFills({ connectionId: '00000000-0000-0000-0000-000000000000', includeMetadata: false });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```python
   * # Get all items with optional filters
   * result = await finatic.get_all_order_fills(
   *            connection_id='00000000-0000-0000-0000-000000000000',
            include_metadata=false
   * )
   * 
   * # Access the response data
   * if result.success:
   *     print('Total items:', len(result.success['data']))
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'])
   * ```
   */
  async getAllOrderFills(params?: Partial<GetOrderFillsParams>): Promise<FinaticResponse<FDXBrokerOrderFill[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetOrderFillsParams = (params || {}) as GetOrderFillsParams;
    const allData: FDXBrokerOrderFill[] = [];
    let offset = 0;
    const limit = 1000;
    let lastError: { [key: string]: any; } | null = null;
    let warnings: Array<{ [key: string]: any; }> = [];
    
    while (true) {
      const response = await this.brokers.getOrderFills(filterParams?.orderId, filterParams?.connectionId, limit, offset, filterParams?.includeMetadata);
      
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
          data: [] as FDXBrokerOrderFill[],
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
   * This method automatically paginates through all pages and returns all items in a single response.
   * It uses the underlying getOrderEvents method with internal pagination handling.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllOrderEvents({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   * @methodId get_all_order_events_api_v1_brokers_data_orders__order_id__events_get
   * @category brokers
   * @example
   * ```typescript-server
   * // Get all items with optional filters
   * const result = await finatic.getAllOrderEvents({ connectionId: '00000000-0000-0000-0000-000000000000', includeMetadata: false });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Get all items with optional filters
   * const result = await finatic.getAllOrderEvents({ connectionId: '00000000-0000-0000-0000-000000000000', includeMetadata: false });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```python
   * # Get all items with optional filters
   * result = await finatic.get_all_order_events(
   *            connection_id='00000000-0000-0000-0000-000000000000',
            include_metadata=false
   * )
   * 
   * # Access the response data
   * if result.success:
   *     print('Total items:', len(result.success['data']))
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'])
   * ```
   */
  async getAllOrderEvents(params?: Partial<GetOrderEventsParams>): Promise<FinaticResponse<FDXBrokerOrderEvent[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetOrderEventsParams = (params || {}) as GetOrderEventsParams;
    const allData: FDXBrokerOrderEvent[] = [];
    let offset = 0;
    const limit = 1000;
    let lastError: { [key: string]: any; } | null = null;
    let warnings: Array<{ [key: string]: any; }> = [];
    
    while (true) {
      const response = await this.brokers.getOrderEvents(filterParams?.orderId, filterParams?.connectionId, limit, offset, filterParams?.includeMetadata);
      
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
          data: [] as FDXBrokerOrderEvent[],
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
   * This method automatically paginates through all pages and returns all items in a single response.
   * It uses the underlying getOrderGroups method with internal pagination handling.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllOrderGroups({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   * @methodId get_all_order_groups_api_v1_brokers_data_orders_groups_get
   * @category brokers
   * @example
   * ```typescript-server
   * // Get all items with optional filters
   * const result = await finatic.getAllOrderGroups({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', createdAfter: '2024-01-01T00:00:00Z' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Get all items with optional filters
   * const result = await finatic.getAllOrderGroups({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', createdAfter: '2024-01-01T00:00:00Z' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```python
   * # Get all items with optional filters
   * result = await finatic.get_all_order_groups(
   *            broker_id='alpaca',
            connection_id='00000000-0000-0000-0000-000000000000',
            created_after='2024-01-01T00:00:00Z'
   * )
   * 
   * # Access the response data
   * if result.success:
   *     print('Total items:', len(result.success['data']))
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'])
   * ```
   */
  async getAllOrderGroups(params?: Partial<GetOrderGroupsParams>): Promise<FinaticResponse<FDXBrokerOrderGroup[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetOrderGroupsParams = (params || {}) as GetOrderGroupsParams;
    const allData: FDXBrokerOrderGroup[] = [];
    let offset = 0;
    const limit = 1000;
    let lastError: { [key: string]: any; } | null = null;
    let warnings: Array<{ [key: string]: any; }> = [];
    
    while (true) {
      const response = await this.brokers.getOrderGroups(filterParams?.brokerId, filterParams?.connectionId, limit, offset, filterParams?.createdAfter, filterParams?.createdBefore, filterParams?.includeMetadata);
      
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
          data: [] as FDXBrokerOrderGroup[],
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
   * This method automatically paginates through all pages and returns all items in a single response.
   * It uses the underlying getPositionLots method with internal pagination handling.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllPositionLots({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   * @methodId get_all_position_lots_api_v1_brokers_data_positions_lots_get
   * @category brokers
   * @example
   * ```typescript-server
   * // Get all items with optional filters
   * const result = await finatic.getAllPositionLots({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountId: '123456789' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Get all items with optional filters
   * const result = await finatic.getAllPositionLots({ brokerId: 'alpaca', connectionId: '00000000-0000-0000-0000-000000000000', accountId: '123456789' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```python
   * # Get all items with optional filters
   * result = await finatic.get_all_position_lots(
   *            broker_id='alpaca',
            connection_id='00000000-0000-0000-0000-000000000000',
            account_id='123456789'
   * )
   * 
   * # Access the response data
   * if result.success:
   *     print('Total items:', len(result.success['data']))
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'])
   * ```
   */
  async getAllPositionLots(params?: Partial<GetPositionLotsParams>): Promise<FinaticResponse<FDXBrokerPositionLot[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetPositionLotsParams = (params || {}) as GetPositionLotsParams;
    const allData: FDXBrokerPositionLot[] = [];
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
          data: [] as FDXBrokerPositionLot[],
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
   * This method automatically paginates through all pages and returns all items in a single response.
   * It uses the underlying getPositionLotFills method with internal pagination handling.
   * 
   * @param params - Optional parameters object. Only include the fields you want to filter by.
   *                 Example: getAllPositionLotFills({ accountId: "123", symbol: "AAPL" })
   * @returns FinaticResponse with success, error, and warning fields containing array of all items
   * @methodId get_all_position_lot_fills_api_v1_brokers_data_positions_lots__lot_id__fills_get
   * @category brokers
   * @example
   * ```typescript-server
   * // Get all items with optional filters
   * const result = await finatic.getAllPositionLotFills({ connectionId: '00000000-0000-0000-0000-000000000000' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```typescript-client
   * // Get all items with optional filters
   * const result = await finatic.getAllPositionLotFills({ connectionId: '00000000-0000-0000-0000-000000000000' });
   * 
   * // Access the response data
   * if (result.success) {
   *   console.log('Total items:', result.success.data.length);
   *   if (result.warning && result.warning.length > 0) {
   *     console.warn('Warnings:', result.warning);
   *   }
   * } else if (result.error) {
   *   console.error('Error:', result.error.message);
   * }
   * ```
   * @example
   * ```python
   * # Get all items with optional filters
   * result = await finatic.get_all_position_lot_fills(
   *            connection_id='00000000-0000-0000-0000-000000000000'
   * )
   * 
   * # Access the response data
   * if result.success:
   *     print('Total items:', len(result.success['data']))
   *     if result.warning:
   *         print('Warnings:', result.warning)
   * elif result.error:
   *     print('Error:', result.error['message'])
   * ```
   */
  async getAllPositionLotFills(params?: Partial<GetPositionLotFillsParams>): Promise<FinaticResponse<FDXBrokerPositionLotFill[]>> {
    // Use provided params or empty object (excluding limit and offset which are handled internally)
    const filterParams: GetPositionLotFillsParams = (params || {}) as GetPositionLotFillsParams;
    const allData: FDXBrokerPositionLotFill[] = [];
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
          data: [] as FDXBrokerPositionLotFill[],
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
