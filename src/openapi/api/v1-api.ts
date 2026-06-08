// @ts-nocheck - OpenAPI generator-compatible output
/* tslint:disable */
/* eslint-disable */
/**
 * Finatic account-first v1 API surface.
 *
 * Generated-equivalent client pinned to FinaticAPI PR #174 head
 * af42136a4a5efc21395f853955af3ccd4c0949b7.
 */

import type { AxiosInstance, AxiosPromise, RawAxiosRequestConfig } from 'axios';
import globalAxios from 'axios';
import type { Configuration } from '../configuration';
import { BaseAPI } from '../base';

export type FinaticApiEnvironment = 'live' | 'sandbox';

export interface V1RequestOptions extends RawAxiosRequestConfig {
  finaticEnvironment?: FinaticApiEnvironment;
}

export interface V1ListAccountsRequest {
  limit?: number;
  offset?: number;
  includeSyncStatus?: boolean;
}

export interface V1AccountRequest {
  accountId: string;
}

export interface V1AccountResourceRequest extends V1AccountRequest {
  resource: 'balances' | 'positions' | 'transactions' | 'orders' | 'position-lots';
  limit?: number;
  offset?: number;
}

export interface V1AccountOrderRequest extends V1AccountRequest {
  orderId: string;
}

export interface V1AccountPositionLotFillsRequest extends V1AccountRequest {
  lotId: string;
}

export interface V1CreateAccountOrderCommandRequest extends V1AccountRequest {
  body?: unknown;
  idempotencyKey: string;
}

export interface V1AccountOrderCommandRequest extends V1AccountOrderRequest {
  body?: unknown;
  idempotencyKey: string;
}

export interface V1AccountGrantRequest {
  grantId: string;
}

export interface V1PortalAccountGrantRequest {
  sessionId: string;
  body: unknown;
}

export interface V1PortalSessionRequest {
  sessionId: string;
}

export interface V1PortalTokenRequest {
  token: string;
}

export interface V1PortalAuthAttemptRequest extends V1PortalSessionRequest {
  body: unknown;
}

export interface V1PortalAuthAttemptGetRequest extends V1PortalSessionRequest {
  authAttemptId: string;
}

export interface V1PortalDiscoveredAccountsRequest {
  sessionId: string;
  authAttemptId?: string;
}

export interface V1ConsentRequest {
  consentId: string;
}

export interface V1WebhookSubscriptionRequest {
  subscriptionId: string;
}

function withEnvironmentHeader(
  options: V1RequestOptions = {},
  fallbackEnvironment: FinaticApiEnvironment = 'live'
): RawAxiosRequestConfig {
  const { finaticEnvironment, ...axiosOptions } = options;
  return {
    ...axiosOptions,
    headers: {
      'X-Finatic-Environment': finaticEnvironment ?? fallbackEnvironment,
      ...axiosOptions.headers,
    },
  };
}

function query(params: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  );
}

export class V1Api extends BaseAPI {
  private fallbackEnvironment: FinaticApiEnvironment;

  constructor(
    configuration?: Configuration & { finaticEnvironment?: FinaticApiEnvironment },
    basePath?: string,
    axios: AxiosInstance = globalAxios
  ) {
    super(configuration, basePath, axios);
    this.fallbackEnvironment = configuration?.finaticEnvironment ?? 'live';
  }

  public createSession(body: unknown, options?: V1RequestOptions): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'POST',
      url: `${this.basePath}/api/v1/sessions`,
      data: body,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public getSession(
    requestParameters: { sessionId: string },
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/sessions/${encodeURIComponent(requestParameters.sessionId)}`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public createPortalLink(
    requestParameters: { sessionId: string; body?: unknown },
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'POST',
      url: `${this.basePath}/api/v1/sessions/${encodeURIComponent(requestParameters.sessionId)}/portal-links`,
      data: requestParameters.body,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public createPortalAccountGrant(
    requestParameters: V1PortalAccountGrantRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'POST',
      url: `${this.basePath}/api/v1/portal/${encodeURIComponent(requestParameters.sessionId)}/account-grants`,
      data: requestParameters.body,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public exchangePortalToken(
    requestParameters: V1PortalTokenRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/portal/${encodeURIComponent(requestParameters.token)}`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public consumeOAuthCompletionToken(
    requestParameters: V1PortalTokenRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/portal/oauth/completion/${encodeURIComponent(requestParameters.token)}`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public linkPortalUser(
    requestParameters: V1PortalSessionRequest & { body: unknown },
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'POST',
      url: `${this.basePath}/api/v1/portal/${encodeURIComponent(requestParameters.sessionId)}/user-link`,
      data: requestParameters.body,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public listPortalInstitutions(
    requestParameters: V1PortalSessionRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/portal/${encodeURIComponent(requestParameters.sessionId)}/institutions`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public createPortalAuthAttempt(
    requestParameters: V1PortalAuthAttemptRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'POST',
      url: `${this.basePath}/api/v1/portal/${encodeURIComponent(requestParameters.sessionId)}/auth-attempts`,
      data: requestParameters.body,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public getPortalAuthAttempt(
    requestParameters: V1PortalAuthAttemptGetRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/portal/${encodeURIComponent(requestParameters.sessionId)}/auth-attempts/${encodeURIComponent(requestParameters.authAttemptId)}`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public listPortalDiscoveredAccounts(
    requestParameters: V1PortalDiscoveredAccountsRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/portal/${encodeURIComponent(requestParameters.sessionId)}/discovered-accounts`,
      params: query({ authAttemptId: requestParameters.authAttemptId }),
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public completePortalSession(
    requestParameters: V1PortalSessionRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'POST',
      url: `${this.basePath}/api/v1/portal/${encodeURIComponent(requestParameters.sessionId)}/complete`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public getSessionUser(
    requestParameters: { sessionId: string },
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/sessions/${encodeURIComponent(requestParameters.sessionId)}/user`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public getSessionSyncStatus(
    requestParameters: { sessionId: string },
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/sessions/${encodeURIComponent(requestParameters.sessionId)}/sync-status`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public listAccounts(
    requestParameters: V1ListAccountsRequest = {},
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/accounts`,
      params: query(requestParameters),
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public getAccount(
    requestParameters: V1AccountRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/accounts/${encodeURIComponent(requestParameters.accountId)}`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public listAccountResource(
    requestParameters: V1AccountResourceRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    const { accountId, resource, ...params } = requestParameters;
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/accounts/${encodeURIComponent(accountId)}/${encodeURIComponent(resource)}`,
      params: query(params),
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public listAccountBalances(
    requestParameters: AccountScopedRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return listExplicitAccountResource(
      this,
      this.fallbackEnvironment,
      'balances',
      requestParameters,
      options
    );
  }

  public listAccountPositions(
    requestParameters: AccountScopedRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return listExplicitAccountResource(
      this,
      this.fallbackEnvironment,
      'positions',
      requestParameters,
      options
    );
  }

  public listAccountTransactions(
    requestParameters: AccountScopedRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return listExplicitAccountResource(
      this,
      this.fallbackEnvironment,
      'transactions',
      requestParameters,
      options
    );
  }

  public listAccountOrders(
    requestParameters: AccountScopedRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return listExplicitAccountResource(
      this,
      this.fallbackEnvironment,
      'orders',
      requestParameters,
      options
    );
  }

  public listAccountPositionLots(
    requestParameters: AccountScopedRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return listExplicitAccountResource(
      this,
      this.fallbackEnvironment,
      'position-lots',
      requestParameters,
      options
    );
  }

  public getAccountOrder(
    requestParameters: V1AccountOrderRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/accounts/${encodeURIComponent(requestParameters.accountId)}/orders/${encodeURIComponent(requestParameters.orderId)}`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public getAccountOrderFills(
    requestParameters: V1AccountOrderRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/accounts/${encodeURIComponent(requestParameters.accountId)}/orders/${encodeURIComponent(requestParameters.orderId)}/fills`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public getAccountOrderEvents(
    requestParameters: V1AccountOrderRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/accounts/${encodeURIComponent(requestParameters.accountId)}/orders/${encodeURIComponent(requestParameters.orderId)}/events`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public getAccountPositionLotFills(
    requestParameters: V1AccountPositionLotFillsRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/accounts/${encodeURIComponent(requestParameters.accountId)}/position-lots/${encodeURIComponent(requestParameters.lotId)}/fills`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public createAccountOrder(
    requestParameters: V1CreateAccountOrderCommandRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'POST',
      url: `${this.basePath}/api/v1/accounts/${encodeURIComponent(requestParameters.accountId)}/orders`,
      data: requestParameters.body,
      ...withEnvironmentHeader(
        {
          ...options,
          headers: {
            ...options?.headers,
            'Idempotency-Key': requestParameters.idempotencyKey,
          },
        },
        this.fallbackEnvironment
      ),
    });
  }

  public modifyAccountOrder(
    requestParameters: V1AccountOrderCommandRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'PATCH',
      url: `${this.basePath}/api/v1/accounts/${encodeURIComponent(requestParameters.accountId)}/orders/${encodeURIComponent(requestParameters.orderId)}`,
      data: requestParameters.body,
      ...withEnvironmentHeader(
        {
          ...options,
          headers: {
            ...options?.headers,
            'Idempotency-Key': requestParameters.idempotencyKey,
          },
        },
        this.fallbackEnvironment
      ),
    });
  }

  public cancelAccountOrder(
    requestParameters: V1AccountOrderCommandRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'DELETE',
      url: `${this.basePath}/api/v1/accounts/${encodeURIComponent(requestParameters.accountId)}/orders/${encodeURIComponent(requestParameters.orderId)}`,
      data: requestParameters.body,
      ...withEnvironmentHeader(
        {
          ...options,
          headers: {
            ...options?.headers,
            'Idempotency-Key': requestParameters.idempotencyKey,
          },
        },
        this.fallbackEnvironment
      ),
    });
  }

  public listAccountGrants(options?: V1RequestOptions): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/account-grants`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public getAccountGrant(
    requestParameters: V1AccountGrantRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/account-grants/${encodeURIComponent(requestParameters.grantId)}`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public updateAccountGrant(
    requestParameters: V1AccountGrantRequest & { body: unknown },
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'PATCH',
      url: `${this.basePath}/api/v1/account-grants/${encodeURIComponent(requestParameters.grantId)}`,
      data: requestParameters.body,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public revokeAccountGrant(
    requestParameters: V1AccountGrantRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'POST',
      url: `${this.basePath}/api/v1/account-grants/${encodeURIComponent(requestParameters.grantId)}/revoke`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public listConsents(options?: V1RequestOptions): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/consents`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public createConsent(body: unknown, options?: V1RequestOptions): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'POST',
      url: `${this.basePath}/api/v1/consents`,
      data: body,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public getConsent(
    requestParameters: V1ConsentRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/consents/${encodeURIComponent(requestParameters.consentId)}`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public revokeConsent(
    requestParameters: V1ConsentRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'POST',
      url: `${this.basePath}/api/v1/consents/${encodeURIComponent(requestParameters.consentId)}/revoke`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public getWebhookCatalog(options?: V1RequestOptions): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/webhooks/catalog`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public getWebhookPayloadSchema(options?: V1RequestOptions): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/webhooks/payload-schema`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public listWebhookSubscriptions(options?: V1RequestOptions): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'GET',
      url: `${this.basePath}/api/v1/webhooks/subscriptions`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public createWebhookSubscription(
    body: unknown,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'POST',
      url: `${this.basePath}/api/v1/webhooks/subscriptions`,
      data: body,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public updateWebhookSubscription(
    requestParameters: V1WebhookSubscriptionRequest & { body: unknown },
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'PATCH',
      url: `${this.basePath}/api/v1/webhooks/subscriptions/${encodeURIComponent(requestParameters.subscriptionId)}`,
      data: requestParameters.body,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }

  public revokeWebhookSubscription(
    requestParameters: V1WebhookSubscriptionRequest,
    options?: V1RequestOptions
  ): AxiosPromise<unknown> {
    return this.axios.request({
      method: 'POST',
      url: `${this.basePath}/api/v1/webhooks/subscriptions/${encodeURIComponent(requestParameters.subscriptionId)}/revoke`,
      ...withEnvironmentHeader(options, this.fallbackEnvironment),
    });
  }
}

interface AccountScopedRequest extends V1AccountRequest {
  limit?: number;
  offset?: number;
}

function listExplicitAccountResource(
  api: BaseAPI,
  fallbackEnvironment: FinaticApiEnvironment,
  resource: 'balances' | 'positions' | 'transactions' | 'orders' | 'position-lots',
  requestParameters: AccountScopedRequest,
  options?: V1RequestOptions
): AxiosPromise<unknown> {
  const { accountId, ...params } = requestParameters;
  return api.axios.request({
    method: 'GET',
    url: `${api.basePath}/api/v1/accounts/${encodeURIComponent(accountId)}/${resource}`,
    params: query(params),
    ...withEnvironmentHeader(options, fallbackEnvironment),
  });
}
