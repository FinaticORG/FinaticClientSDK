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

type AccountResource =
  | 'balances'
  | 'positions'
  | 'transactions'
  | 'orders'
  | 'order-groups'
  | 'position-lots';

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

  createSession<T = unknown>(
    body: unknown,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.createSession(body, this.headers(options)));
  }

  getSession<T = unknown>(
    sessionId: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.getSession({ sessionId }, this.headers(options)));
  }

  createPortalLink<T = unknown>(
    sessionId: string,
    body?: unknown,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.createPortalLink({ sessionId, body }, this.headers(options)));
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

  getSessionUser<T = unknown>(
    sessionId: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.getSessionUser({ sessionId }, this.headers(options)));
  }

  getSessionSyncStatus<T = unknown>(
    sessionId: string,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.unwrap<T>(this.api.getSessionSyncStatus({ sessionId }, this.headers(options)));
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

  listOrderGroups<T = unknown>(
    params: AccountScopedParams,
    options?: FinaticV1CallOptions
  ): Promise<FinaticV1Response<T>> {
    return this.listAccountResource<T>('order-groups', params, options);
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
