import { V1Api, type FinaticApiEnvironment } from '../openapi/api/v1-api';
import type { Configuration } from '../openapi/configuration';
import type { SdkConfig } from '../config';
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

export interface AccountPositionLotFillsParams {
  accountId: string;
  lotId: string;
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

type AccountResource = 'balances' | 'positions' | 'transactions' | 'orders' | 'position-lots';

export class V1Wrapper {
  protected api: V1Api;
  protected config?: Configuration;
  protected sdkConfig?: SdkConfig;
  protected sessionId?: string;
  protected companyId?: string;
  protected csrfToken?: string;

  constructor(api: V1Api, config?: Configuration, sdkConfig?: SdkConfig) {
    this.api = api;
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

  createPortalAccountGrant<T = unknown>(
    sessionId: string,
    body: {
      accountId: string;
      authAttemptId: string;
      canRead?: boolean;
      canTrade?: boolean;
      dataClusters?: string[];
      consentId?: string | null;
    },
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(
      this.api.createPortalAccountGrant({ sessionId, body }, this.headers(options))
    );
  }

  exchangePortalToken<T = unknown>(
    token: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.exchangePortalToken({ token }, this.headers(options)));
  }

  consumeOAuthCompletionToken<T = unknown>(
    token: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.consumeOAuthCompletionToken({ token }, this.headers(options)));
  }

  linkPortalUser<T = unknown>(
    sessionId: string,
    body: { userId: string },
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.linkPortalUser({ sessionId, body }, this.headers(options)));
  }

  listPortalInstitutions<T = unknown>(
    sessionId: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.listPortalInstitutions({ sessionId }, this.headers(options)));
  }

  createPortalAuthAttempt<T = unknown>(
    sessionId: string,
    body: { brokerId: string },
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(
      this.api.createPortalAuthAttempt({ sessionId, body }, this.headers(options))
    );
  }

  getPortalAuthAttempt<T = unknown>(
    sessionId: string,
    authAttemptId: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(
      this.api.getPortalAuthAttempt({ sessionId, authAttemptId }, this.headers(options))
    );
  }

  listPortalDiscoveredAccounts<T = unknown>(
    sessionId: string,
    params: { authAttemptId: string; includeSyncStatus?: boolean },
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(
      this.api.listPortalDiscoveredAccounts({ sessionId, ...params }, this.headers(options))
    );
  }

  completePortalSession<T = unknown>(
    sessionId: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.completePortalSession({ sessionId }, this.headers(options)));
  }

  getSessionUser<T = unknown>(
    _sessionId: string,
    _options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.serverOnlySessionRoute('finatic.v1.getSessionUser');
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

  listPositionLots<T = unknown>(
    params: AccountScopedParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.listAccountPositionLots(params, this.headers(options)));
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

  getAccountPositionLotFills<T = unknown>(
    params: AccountPositionLotFillsParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.getAccountPositionLotFills(params, this.headers(options)));
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

  listConsents<T = unknown>(options?: FinaticV1CallOptions): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.listConsents(this.headers(options)));
  }

  createConsent<T = unknown>(
    body: unknown,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.createConsent(body, this.headers(options)));
  }

  getConsent<T = unknown>(
    consentId: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.getConsent({ consentId }, this.headers(options)));
  }

  revokeConsent<T = unknown>(
    consentId: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.revokeConsent({ consentId }, this.headers(options)));
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
