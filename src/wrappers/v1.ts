import axios, { type AxiosInstance, type RawAxiosRequestConfig } from 'axios';
import { AccountGrantsApi } from '../openapi/api/account-grants-api';
import { AccountsApi } from '../openapi/api/accounts-api';
import { SessionApi } from '../openapi/api/session-api';
import { UserLifecycleApi } from '../openapi/api/user-lifecycle-api';
import { WebhooksApi } from '../openapi/api/webhooks-api';
import type { Configuration } from '../openapi/configuration';
import {
  FDXAssetType,
  FinaticEnvironment,
  type FDXAccountGrantUpdate,
  type FDXWebhookSubscriptionCreate,
  type FDXWebhookSubscriptionUpdate,
} from '../openapi/models';
import type {
  AccountOrderCommandRequest,
  AccountOrderPayload,
  FDXBrokerOrder,
  FDXBrokerOrderCommandResult,
  FDXBrokerOrderEvent,
  FDXBrokerOrderFill,
  FDXBrokerPosition,
} from '../contracts/instrument-descriptors';
import type { FinaticApiEnvironment, SdkConfig } from '../config';
import {
  appendAssetTypesToURL,
  appendBrokerFilterToURL,
  appendKindToURL,
  appendStageToURL,
  appendThemeToURL,
} from '../utils/url-utils';
import { generateRequestId } from '../utils/request-id';
import { unwrapAxiosResponse } from '../utils/response-utils';

export interface FinaticV1Response<T = unknown> {
  _id?: string;
  success?: {
    data: T;
    meta?: Record<string, unknown> | null;
  };
  error?: Record<string, unknown> | null;
  warning?: Array<Record<string, unknown>> | null;
}

export interface FinaticV1CallOptions {
  environment?: FinaticApiEnvironment;
}

export interface AccountScopedParams {
  accountId: string;
  limit?: number;
  offset?: number;
}

export interface AccountOrderParams {
  accountId: string;
  orderId: string;
}

/**
 * Browser-safe order payload input. OpenAPI Generator 7.22 emits the nullable
 * provider-native identifier as an empty interface under OpenAPI 3.1, so the
 * facade restores its API-defined string-or-integer wire type while preserving
 * provider-specific extension fields.
 */
export type AccountOrderPayloadInput = Omit<
  AccountOrderPayload,
  'finaticInstrumentId' | 'instrumentId'
> & {
  finaticInstrumentId?: string | null;
  instrumentId?: string | number | null;
};

export type AccountOrderCommandInput = Omit<AccountOrderCommandRequest, 'order'> & {
  order: AccountOrderPayloadInput;
};

export interface CreateAccountOrderCommandParams {
  accountId: string;
  body?: AccountOrderCommandInput;
  idempotencyKey: string;
}

export interface AccountOrderCommandParams extends AccountOrderParams {
  body?: AccountOrderCommandInput;
  idempotencyKey: string;
}

export interface AccountOrderSchemaParams {
  accountId: string;
  action: 'place' | 'modify' | 'cancel';
  broker?: string;
}

export interface BrokerConnectionOffboardingParams {
  userId: string;
  accountId: string;
  idempotencyKey: string;
}

export interface BrokerConnectionOffboardingResult {
  operationId: string;
  userId: string;
  accountId: string;
  state: 'accepted' | 'completed';
  action: 'company_grants_revoked' | 'connection_deletion_started';
  revokedGrantCount: number;
  idempotentReplay: boolean;
}

type AccountResource = 'balances' | 'positions' | 'transactions' | 'orders';

export interface PortalUrlParams {
  theme?: string | { preset?: string; custom?: Record<string, unknown> };
  brokers?: string[];
  kind?: 'broker' | 'exchange';
  asset_types?: string[];
  stage?: ('production' | 'beta' | 'alpha')[];
  email?: string;
  mode?: 'light' | 'dark';
}

function readSessionField(
  data: Record<string, unknown> | null | undefined,
  keys: string[]
): string {
  if (!data) {
    return '';
  }
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string' && value) {
      return value;
    }
  }
  return '';
}

function extractFinaticData(
  response: FinaticV1Response | null | undefined
): Record<string, unknown> {
  if (!response) {
    throw new Error('Empty response from API');
  }
  if (response.error) {
    throw new Error(
      typeof response.error['message'] === 'string' ? response.error['message'] : 'Request failed'
    );
  }
  if (response.success?.data !== null && response.success?.data !== undefined) {
    if (typeof response.success.data === 'object') {
      return response.success.data as Record<string, unknown>;
    }
  }
  throw new Error('Invalid response structure from API');
}

export class V1Wrapper {
  protected accountsApi: AccountsApi;
  protected accountGrantsApi: AccountGrantsApi;
  protected sessionApi: SessionApi;
  protected userLifecycleApi: UserLifecycleApi;
  protected webhooksApi: WebhooksApi;
  protected config?: Configuration;
  protected sdkConfig?: SdkConfig;
  protected sessionId?: string;
  protected companyId?: string;
  protected csrfToken?: string;
  protected userId?: string;

  constructor(config?: Configuration, sdkConfig?: SdkConfig, axiosInstance: AxiosInstance = axios) {
    this.accountsApi = new AccountsApi(config, undefined, axiosInstance);
    this.accountGrantsApi = new AccountGrantsApi(config, undefined, axiosInstance);
    this.sessionApi = new SessionApi(config, undefined, axiosInstance);
    this.userLifecycleApi = new UserLifecycleApi(config, undefined, axiosInstance);
    this.webhooksApi = new WebhooksApi(config, undefined, axiosInstance);
    if (config !== undefined) {
      this.config = config;
    }
    if (sdkConfig !== undefined) {
      this.sdkConfig = sdkConfig;
    }
  }

  private headers(options?: FinaticV1CallOptions): {
    headers: Record<string, string>;
    xFinaticEnvironment: FinaticApiEnvironment;
  } {
    return {
      xFinaticEnvironment: options?.environment ?? this.sdkConfig?.apiEnvironment ?? 'live',
      headers: {
        'x-request-id': generateRequestId(),
        ...(this.sessionId ? { 'x-session-id': this.sessionId } : {}),
        ...(this.companyId ? { 'x-company-id': this.companyId } : {}),
        ...(this.csrfToken ? { 'x-csrf-token': this.csrfToken } : {}),
      },
    };
  }

  private requestOptions(options?: FinaticV1CallOptions): {
    xFinaticEnvironment: FinaticApiEnvironment;
    axiosOptions: RawAxiosRequestConfig;
  } {
    const { xFinaticEnvironment, headers } = this.headers(options);
    return { xFinaticEnvironment, axiosOptions: { headers } };
  }

  private validateOrderAssetType(body: AccountOrderCommandInput | undefined): void {
    const value = body?.order['assetType'];
    if (value === undefined) {
      return;
    }
    if (typeof value !== 'string' || !Object.values(FDXAssetType).includes(value as FDXAssetType)) {
      throw new Error(
        `Invalid assetType: ${String(value)}. Allowed values: ${Object.values(FDXAssetType).join(', ')}`
      );
    }
  }

  private sessionEnvironment(): FinaticEnvironment {
    return this.sdkConfig?.apiEnvironment === 'sandbox'
      ? FinaticEnvironment.Sandbox
      : FinaticEnvironment.Live;
  }

  setSessionContext(sessionId: string, companyId: string, csrfToken: string): void {
    this.sessionId = sessionId;
    this.companyId = companyId;
    this.csrfToken = csrfToken;
  }

  getSessionId(): string | undefined {
    return this.sessionId;
  }

  getCompanyId(): string | undefined {
    return this.companyId;
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  isAuthed(): boolean {
    return !!this.userId;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  getCsrfToken(): string | undefined {
    return this.csrfToken;
  }

  async startSession(
    oneTimeToken: string,
    userId?: string
  ): Promise<{ session_id: string; company_id: string }> {
    const axiosResponse = await this.sessionApi.finaticV1PostSessionStart({
      oneTimeToken,
      xFinaticEnvironment: this.sessionEnvironment(),
      ...(userId !== undefined ? { sessionStartRequest: { user_id: userId } } : {}),
    });
    const response = unwrapAxiosResponse<FinaticV1Response>(axiosResponse);
    const data = extractFinaticData(response);

    const sessionId = readSessionField(data, ['session_id', 'sessionId']);
    const companyId = readSessionField(data, ['company_id', 'companyId']);
    const responseUserId = readSessionField(data, ['user_id', 'userId']);
    const csrfToken = readSessionField(data, ['csrf_token', 'csrfToken']);

    if (sessionId && companyId) {
      this.setSessionContext(sessionId, companyId, csrfToken);
    }

    const finalUserId = responseUserId || userId;
    if (finalUserId) {
      this.userId = finalUserId;
    }

    return { session_id: sessionId, company_id: companyId };
  }

  /**
   * Redirect URL for Finatic Connect. Pair with `openPortal` in the browser SDK.
   *
   * @example
   * ```typescript-client
   * const portalUrl = await finatic.v1.getPortalUrl({ mode: 'dark' });
   * ```
   */
  async getPortalUrl(params?: PortalUrlParams): Promise<string> {
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call v1.startSession() first.');
    }

    const axiosResponse = await this.sessionApi.finaticV1GetSessionPortal(
      {
        sessionId: this.sessionId,
        xFinaticEnvironment: this.sessionEnvironment(),
      },
      { headers: { 'x-session-id': this.sessionId } }
    );

    const response = unwrapAxiosResponse<FinaticV1Response>(axiosResponse);
    const data = extractFinaticData(response);

    let portalUrl = readSessionField(data, ['portal_url', 'portalUrl']);
    if (!portalUrl) {
      throw new Error('Invalid portal URL response: missing portal_url');
    }

    try {
      new URL(portalUrl);
    } catch {
      throw new Error(`Invalid portal URL received from API: ${portalUrl}`);
    }

    const { theme, brokers, kind, asset_types, stage, email, mode } = params || {};
    if (theme) {
      portalUrl = appendThemeToURL(portalUrl, theme);
    }
    if (brokers) {
      portalUrl = appendBrokerFilterToURL(portalUrl, brokers);
    }
    if (kind) {
      portalUrl = appendKindToURL(portalUrl, kind);
    }
    if (asset_types && asset_types.length > 0) {
      portalUrl = appendAssetTypesToURL(portalUrl, asset_types);
    }
    if (stage && stage.length > 0) {
      portalUrl = appendStageToURL(portalUrl, stage);
    }
    if (email) {
      const url = new URL(portalUrl);
      url.searchParams.set('email', email);
      portalUrl = url.toString();
    }
    if (mode) {
      const url = new URL(portalUrl);
      url.searchParams.set('mode', mode);
      portalUrl = url.toString();
    }

    // Tell Connect which origin embeds the iframe so postMessage is not '*'.
    // Works for arbitrary partner hosts without a Vercel allowlist.
    if (typeof window !== 'undefined' && window.location?.origin) {
      const portalUrlWithParent = new URL(portalUrl);
      if (!portalUrlWithParent.searchParams.has('parent_origin')) {
        portalUrlWithParent.searchParams.set('parent_origin', window.location.origin);
        portalUrl = portalUrlWithParent.toString();
      }
    }

    return portalUrl;
  }

  async getSessionUser(): Promise<{ user_id: string; company_id: string }> {
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call v1.startSession() first.');
    }

    const axiosResponse = await this.sessionApi.finaticV1GetSessionSessionIdUser({
      sessionId: this.sessionId,
      xSessionId: this.sessionId,
      xFinaticEnvironment: this.sessionEnvironment(),
    });

    const response = unwrapAxiosResponse<FinaticV1Response>(axiosResponse);
    const data = extractFinaticData(response);
    const resolvedUserId = readSessionField(data, ['user_id', 'userId']);

    if (resolvedUserId) {
      this.userId = resolvedUserId;
    }

    return {
      user_id: resolvedUserId,
      company_id: this.companyId || '',
    };
  }

  private async unwrap<T>(call: Promise<unknown>): Promise<FinaticV1Response<T>> {
    return unwrapAxiosResponse(await call) as FinaticV1Response<T>;
  }

  private serverOnlySessionRoute(routeName: string): never {
    throw new Error(
      `${routeName} is server-only in the v1 API because it requires a company API key. ` +
        'Create sessions and portal links from a backend/server SDK flow, then initialize ' +
        'the browser Client SDK with the returned one-time token.'
    );
  }

  createSession<T = unknown>(
    _body: unknown,
    _options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.serverOnlySessionRoute('finatic.v1.createSession');
  }

  getSession<T = unknown>(
    _sessionId: string,
    _options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.serverOnlySessionRoute('finatic.v1.getSession');
  }

  createPortalLink<T = unknown>(
    _sessionId: string,
    _body?: unknown,
    _options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.serverOnlySessionRoute('finatic.v1.createPortalLink');
  }

  getSessionSyncStatus<T = unknown>(
    _sessionId: string,
    _options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.serverOnlySessionRoute('finatic.v1.getSessionSyncStatus');
  }

  /**
   * List granted financial accounts. Client envelope is `{ success, error, warning }`.
   *
   * @example
   * ```typescript-client
   * const result = await finatic.v1.listAccounts();
   * if (result.success) {
   *   console.log(result.success.data);
   * }
   * ```
   */
  listAccounts<T = unknown>(
    params: { limit?: number; offset?: number; includeSyncStatus?: boolean } = {},
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountsApi.finaticV1GetAccounts(
        { xFinaticEnvironment },
        Object.keys(params).length > 0 ? { ...axiosOptions, params } : axiosOptions
      )
    );
  }

  getAccount<T = unknown>(
    accountId: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountsApi.finaticV1GetAccountsAccountId(
        { accountId, xFinaticEnvironment },
        axiosOptions
      )
    );
  }

  getAccountSyncStatus<T = unknown>(
    accountId: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.getAccount<T>(accountId, options);
  }

  listBalances<T = unknown>(
    params: AccountScopedParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountsApi.finaticV1GetAccountsAccountIdBalances(
        { ...params, xFinaticEnvironment },
        axiosOptions
      )
    );
  }

  /**
   * Positions for one financial account (`accountId` from listAccounts or a grant event).
   *
   * @example
   * ```typescript-client
   * const result = await finatic.v1.listPositions({ accountId: 'acct_123' });
   * if (result.success) {
   *   console.log(result.success.data);
   * }
   * ```
   */
  listPositions<T = FDXBrokerPosition[]>(
    params: AccountScopedParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountsApi.finaticV1GetAccountsAccountIdPositions(
        { ...params, xFinaticEnvironment },
        axiosOptions
      )
    );
  }

  listTransactions<T = unknown>(
    params: AccountScopedParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountsApi.finaticV1GetAccountsAccountIdTransactions(
        { ...params, xFinaticEnvironment },
        axiosOptions
      )
    );
  }

  listOrders<T = FDXBrokerOrder[]>(
    params: AccountScopedParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountsApi.finaticV1GetAccountsAccountIdOrders(
        { ...params, xFinaticEnvironment },
        axiosOptions
      )
    );
  }

  getAccountOrder<T = FDXBrokerOrder>(
    params: AccountOrderParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountsApi.finaticV1GetAccountsAccountIdOrdersOrderId(
        { ...params, xFinaticEnvironment },
        axiosOptions
      )
    );
  }

  getAccountOrderFills<T = FDXBrokerOrderFill[]>(
    params: AccountOrderParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountsApi.finaticV1GetAccountsAccountIdOrdersOrderIdFills(
        { ...params, xFinaticEnvironment },
        axiosOptions
      )
    );
  }

  getAccountOrderEvents<T = FDXBrokerOrderEvent[]>(
    params: AccountOrderParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountsApi.finaticV1GetAccountsAccountIdOrdersOrderIdEvents(
        { ...params, xFinaticEnvironment },
        axiosOptions
      )
    );
  }

  getAccountOrderSchema<T = unknown>(
    params: AccountOrderSchemaParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountsApi.finaticV1GetAccountsAccountIdOrderSchemas(
        { ...params, xFinaticEnvironment },
        axiosOptions
      )
    );
  }

  createAccountOrder<T = FDXBrokerOrderCommandResult>(
    params: CreateAccountOrderCommandParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    if (!params.body) {
      throw new Error('createAccountOrder requires a body');
    }
    this.validateOrderAssetType(params.body);
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountsApi.finaticV1PostAccountsAccountIdOrders(
        {
          accountId: params.accountId,
          idempotencyKey: params.idempotencyKey,
          accountOrderCommandRequest: params.body,
          xFinaticEnvironment,
        },
        axiosOptions
      )
    );
  }

  modifyAccountOrder<T = FDXBrokerOrderCommandResult>(
    params: AccountOrderCommandParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    if (!params.body) {
      throw new Error('modifyAccountOrder requires a body');
    }
    this.validateOrderAssetType(params.body);
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountsApi.finaticV1PatchAccountsAccountIdOrdersOrderId(
        {
          accountId: params.accountId,
          orderId: params.orderId,
          idempotencyKey: params.idempotencyKey,
          accountOrderCommandRequest: params.body,
          xFinaticEnvironment,
        },
        axiosOptions
      )
    );
  }

  cancelAccountOrder<T = FDXBrokerOrderCommandResult>(
    params: AccountOrderCommandParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountsApi.finaticV1DeleteAccountsAccountIdOrdersOrderId(
        {
          accountId: params.accountId,
          orderId: params.orderId,
          idempotencyKey: params.idempotencyKey,
          ...(typeof params.body?.broker === 'string' ? { broker: params.body.broker } : {}),
          ...(typeof params.body?.paperTradeConfirmed === 'boolean'
            ? { paperTradeConfirmed: params.body.paperTradeConfirmed }
            : {}),
          xFinaticEnvironment,
        },
        axiosOptions
      )
    );
  }

  listAccountGrants<T = unknown>(options?: FinaticV1CallOptions): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountGrantsApi.finaticV1GetAccountGrants({ xFinaticEnvironment }, axiosOptions)
    );
  }

  getAccountGrant<T = unknown>(
    grantId: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountGrantsApi.finaticV1GetAccountGrantsGrantId(
        { grantId, xFinaticEnvironment },
        axiosOptions
      )
    );
  }

  updateAccountGrant<T = unknown>(
    grantId: string,
    body: unknown,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountGrantsApi.finaticV1PatchAccountGrantsGrantId(
        { grantId, fDXAccountGrantUpdate: body as FDXAccountGrantUpdate, xFinaticEnvironment },
        axiosOptions
      )
    );
  }

  revokeAccountGrant<T = unknown>(
    grantId: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountGrantsApi.finaticV1PostAccountGrantsGrantIdRevoke(
        { grantId, xFinaticEnvironment },
        axiosOptions
      )
    );
  }

  offboardBrokerConnection<T = BrokerConnectionOffboardingResult>(
    params: BrokerConnectionOffboardingParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.userLifecycleApi.finaticV1PostUsersUserIdBrokerConnectionsOffboarding(
        {
          userId: params.userId,
          idempotencyKey: params.idempotencyKey,
          brokerConnectionOffboardingRequest: { accountId: params.accountId },
          xFinaticEnvironment,
        },
        axiosOptions
      )
    );
  }

  getWebhookCatalog<T = unknown>(options?: FinaticV1CallOptions): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.webhooksApi.finaticV1GetWebhooksCatalog({ xFinaticEnvironment }, axiosOptions)
    );
  }

  getWebhookPayloadSchema<T = unknown>(
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.webhooksApi.finaticV1GetWebhooksPayloadSchema({ xFinaticEnvironment }, axiosOptions)
    );
  }

  listWebhookSubscriptions<T = unknown>(
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.webhooksApi.finaticV1GetWebhooksSubscriptions({ xFinaticEnvironment }, axiosOptions)
    );
  }

  createWebhookSubscription<T = unknown>(
    body: unknown,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.webhooksApi.finaticV1PostWebhooksSubscriptions(
        {
          fDXWebhookSubscriptionCreate: body as FDXWebhookSubscriptionCreate,
          xFinaticEnvironment,
        },
        axiosOptions
      )
    );
  }

  updateWebhookSubscription<T = unknown>(
    subscriptionId: string,
    body: unknown,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.webhooksApi.finaticV1PatchWebhooksSubscriptionsSubscriptionId(
        {
          subscriptionId,
          fDXWebhookSubscriptionUpdate: body as FDXWebhookSubscriptionUpdate,
          xFinaticEnvironment,
        },
        axiosOptions
      )
    );
  }

  revokeWebhookSubscription<T = unknown>(
    subscriptionId: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.webhooksApi.finaticV1PostWebhooksSubscriptionsSubscriptionIdRevoke(
        { subscriptionId, xFinaticEnvironment },
        axiosOptions
      )
    );
  }

  private listAccountResource<T>(
    resource: AccountResource,
    params: AccountScopedParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    const { xFinaticEnvironment, axiosOptions } = this.requestOptions(options);
    return this.unwrap<T>(
      this.accountsApi.finaticV1GetAccountsAccountIdResource(
        { resource, ...params, xFinaticEnvironment },
        axiosOptions
      )
    );
  }
}
