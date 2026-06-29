import { V1Api, type FinaticApiEnvironment } from '../openapi/api/v1-api';
import { SessionApi } from '../openapi/api/session-api';
import type { Configuration } from '../openapi/configuration';
import type { SdkConfig } from '../config';
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

export interface CreateAccountOrderCommandParams {
  accountId: string;
  body?: unknown;
  idempotencyKey: string;
}

export interface AccountOrderCommandParams extends AccountOrderParams {
  body?: unknown;
  idempotencyKey: string;
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

function extractFinaticData(response: FinaticV1Response | null | undefined): Record<string, unknown> {
  if (!response) {
    throw new Error('Empty response from API');
  }
  if (response.error) {
    throw new Error(
      typeof response.error['message'] === 'string'
        ? response.error['message']
        : 'Request failed'
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
  protected api: V1Api;
  protected sessionApi: SessionApi;
  protected config?: Configuration;
  protected sdkConfig?: SdkConfig;
  protected sessionId?: string;
  protected companyId?: string;
  protected csrfToken?: string;
  protected userId?: string;

  constructor(api: V1Api, config?: Configuration, sdkConfig?: SdkConfig) {
    this.api = api;
    this.sessionApi = new SessionApi(config);
    if (config !== undefined) {
      this.config = config;
    }
    if (sdkConfig !== undefined) {
      this.sdkConfig = sdkConfig;
    }
  }

  private headers(options?: FinaticV1CallOptions): {
    headers: Record<string, string>;
    finaticEnvironment: FinaticApiEnvironment;
  } {
    return {
      finaticEnvironment: options?.environment ?? this.sdkConfig?.apiEnvironment ?? 'live',
      headers: {
        'x-request-id': generateRequestId(),
        ...(this.sessionId ? { 'x-session-id': this.sessionId } : {}),
        ...(this.companyId ? { 'x-company-id': this.companyId } : {}),
        ...(this.csrfToken ? { 'x-csrf-token': this.csrfToken } : {}),
      },
    };
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
    const requestBody = userId !== undefined ? { user_id: userId } : null;
    const axiosResponse = await this.sessionApi.startSessionApiV1SessionStartPost({
      oneTimeToken,
      sessionStartRequest: requestBody,
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

  async getPortalUrl(params?: PortalUrlParams): Promise<string> {
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call v1.startSession() first.');
    }

    const axiosResponse = await this.sessionApi.getPortalUrlApiV1SessionPortalGet(
      { sessionId: this.sessionId },
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

    return portalUrl;
  }

  async getSessionUser(): Promise<{ user_id: string; company_id: string }> {
    if (!this.sessionId) {
      throw new Error('Session not initialized. Call v1.startSession() first.');
    }

    const axiosResponse = await this.sessionApi.getSessionUserApiV1SessionSessionIdUserGet({
      sessionId: this.sessionId,
      xSessionId: this.sessionId,
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

  listAccounts<T = unknown>(
    params: { limit?: number; offset?: number; includeSyncStatus?: boolean } = {},
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.listAccounts(params, this.headers(options)));
  }

  getAccount<T = unknown>(
    accountId: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.getAccount({ accountId }, this.headers(options)));
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
    return this.unwrap<T>(this.api.listAccountBalances(params, this.headers(options)));
  }

  listPositions<T = unknown>(
    params: AccountScopedParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.listAccountPositions(params, this.headers(options)));
  }

  listTransactions<T = unknown>(
    params: AccountScopedParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.listAccountTransactions(params, this.headers(options)));
  }

  listOrders<T = unknown>(
    params: AccountScopedParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.listAccountOrders(params, this.headers(options)));
  }

  getAccountOrder<T = unknown>(
    params: AccountOrderParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.getAccountOrder(params, this.headers(options)));
  }

  getAccountOrderFills<T = unknown>(
    params: AccountOrderParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.getAccountOrderFills(params, this.headers(options)));
  }

  getAccountOrderEvents<T = unknown>(
    params: AccountOrderParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.getAccountOrderEvents(params, this.headers(options)));
  }

  createAccountOrder<T = unknown>(
    params: CreateAccountOrderCommandParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.createAccountOrder(params, this.headers(options)));
  }

  modifyAccountOrder<T = unknown>(
    params: AccountOrderCommandParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.modifyAccountOrder(params, this.headers(options)));
  }

  cancelAccountOrder<T = unknown>(
    params: AccountOrderCommandParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.cancelAccountOrder(params, this.headers(options)));
  }

  listAccountGrants<T = unknown>(options?: FinaticV1CallOptions): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.listAccountGrants(this.headers(options)));
  }

  getAccountGrant<T = unknown>(
    grantId: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.getAccountGrant({ grantId }, this.headers(options)));
  }

  updateAccountGrant<T = unknown>(
    grantId: string,
    body: unknown,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.updateAccountGrant({ grantId, body }, this.headers(options)));
  }

  revokeAccountGrant<T = unknown>(
    grantId: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.revokeAccountGrant({ grantId }, this.headers(options)));
  }

  getWebhookCatalog<T = unknown>(options?: FinaticV1CallOptions): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.getWebhookCatalog(this.headers(options)));
  }

  getWebhookPayloadSchema<T = unknown>(
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.getWebhookPayloadSchema(this.headers(options)));
  }

  listWebhookSubscriptions<T = unknown>(
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.listWebhookSubscriptions(this.headers(options)));
  }

  createWebhookSubscription<T = unknown>(
    body: unknown,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.createWebhookSubscription(body, this.headers(options)));
  }

  updateWebhookSubscription<T = unknown>(
    subscriptionId: string,
    body: unknown,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(
      this.api.updateWebhookSubscription({ subscriptionId, body }, this.headers(options))
    );
  }

  revokeWebhookSubscription<T = unknown>(
    subscriptionId: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(
      this.api.revokeWebhookSubscription({ subscriptionId }, this.headers(options))
    );
  }

  private listAccountResource<T>(
    resource: AccountResource,
    params: AccountScopedParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(
      this.api.listAccountResource({ resource, ...params }, this.headers(options))
    );
  }
}
