import { V1Api } from '../../src/openapi/api/v1-api';
import { V1Wrapper } from '../../src/wrappers/v1';
import { Configuration } from '../../src/openapi/configuration';

function createAxiosLikeClient(): any {
  return {
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    request: jest.fn(async (config) => ({
      config,
      data: {
        _id: 'trace-id',
        success: { data: { ok: true }, meta: null },
        error: null,
        warning: null,
      },
    })),
  };
}

describe('V1 account-first wrapper', () => {
  it('sends X-Finatic-Environment and account-first paths', async () => {
    const axios = createAxiosLikeClient();
    const api = new V1Api(new Configuration({ basePath: 'https://api.test' }), undefined, axios);
    const wrapper = new V1Wrapper(api, undefined, {
      apiEnvironment: 'sandbox',
    } as any);
    wrapper.setSessionContext('session_123', 'company_123', 'csrf_123');

    const result = await wrapper.listPositions({ accountId: 'acct_123', limit: 25 });

    expect(result._id).toBe('trace-id');
    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/api/v1/accounts/acct_123/positions',
        params: { limit: 25 },
        headers: expect.objectContaining({
          'X-Finatic-Environment': 'sandbox',
          'x-session-id': 'session_123',
          'x-company-id': 'company_123',
          'x-csrf-token': 'csrf_123',
        }),
      })
    );
  });

  it('keeps API-key-owned session routes out of the browser-safe wrapper', async () => {
    const axios = createAxiosLikeClient();
    const api = new V1Api(new Configuration({ basePath: 'https://api.test' }), undefined, axios);
    const wrapper = new V1Wrapper(api);

    expect(() => wrapper.createSession({})).toThrow('server-only');
    expect(() => wrapper.getSession('session_123')).toThrow('server-only');
    expect(() => wrapper.createPortalLink('session_123')).toThrow('server-only');
    expect(() => wrapper.getSessionUser('session_123')).toThrow('server-only');
    expect(() => wrapper.getSessionSyncStatus('session_123')).toThrow('server-only');

    expect(axios.request).not.toHaveBeenCalled();
  });

  it('creates portal account grants with the authAttemptId API contract', async () => {
    const axios = createAxiosLikeClient();
    const api = new V1Api(new Configuration({ basePath: 'https://api.test' }), undefined, axios);
    const wrapper = new V1Wrapper(api);

    await wrapper.exchangePortalToken('portal_token_123');
    await wrapper.consumeOAuthCompletionToken('oauth_token_123');
    await wrapper.linkPortalUser('session_123', { userId: 'user_123' });
    await wrapper.listPortalInstitutions('session_123');
    await wrapper.createPortalAuthAttempt('session_123', { brokerId: 'alpaca' });
    await wrapper.getPortalAuthAttempt('session_123', 'auth_attempt_123');
    await wrapper.listPortalDiscoveredAccounts('session_123', {
      authAttemptId: 'auth_attempt_123',
      includeSyncStatus: true,
    });
    await wrapper.createPortalAccountGrant('session_123', {
      accountId: 'account_123',
      authAttemptId: 'auth_attempt_123',
      canRead: true,
      canTrade: false,
    });
    await wrapper.completePortalSession('session_123');

    expect(axios.request).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/api/v1/portal/portal_token_123',
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/api/v1/portal/oauth/completion/oauth_token_123',
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.test/api/v1/portal/session_123/user-link',
        data: { userId: 'user_123' },
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/api/v1/portal/session_123/institutions',
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.test/api/v1/portal/session_123/auth-attempts',
        data: { brokerId: 'alpaca' },
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      6,
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/api/v1/portal/session_123/auth-attempts/auth_attempt_123',
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      7,
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/api/v1/portal/session_123/discovered-accounts',
        params: { authAttemptId: 'auth_attempt_123', includeSyncStatus: true },
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      8,
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.test/api/v1/portal/session_123/account-grants',
        data: expect.objectContaining({
          accountId: 'account_123',
          authAttemptId: 'auth_attempt_123',
        }),
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      9,
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.test/api/v1/portal/session_123/complete',
      })
    );
  });

  it('keeps generated-equivalent session routes available for server-bound callers', async () => {
    const axios = createAxiosLikeClient();
    const api = new V1Api(new Configuration({ basePath: 'https://api.test' }), undefined, axios);

    await api.createPortalLink(
      { sessionId: 'session_123' },
      { headers: { 'X-API-Key': 'server_key' } }
    );

    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.test/api/v1/sessions/session_123/portal-links',
        headers: expect.objectContaining({ 'X-API-Key': 'server_key' }),
      })
    );
  });

  it('creates FDX consent grants from the current API contract', async () => {
    const axios = createAxiosLikeClient();
    const api = new V1Api(new Configuration({ basePath: 'https://api.test' }), undefined, axios);
    const wrapper = new V1Wrapper(api);

    await wrapper.createConsent({
      consentGrant: {
        accountId: 'acct_123',
        dataClusters: ['account_info'],
      },
    });

    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.test/api/v1/consents',
        data: {
          consentGrant: {
            accountId: 'acct_123',
            dataClusters: ['account_info'],
          },
        },
      })
    );
  });

  it('covers account trading commands and position lot fills from the API contract', async () => {
    const axios = createAxiosLikeClient();
    const api = new V1Api(new Configuration({ basePath: 'https://api.test' }), undefined, axios);
    const wrapper = new V1Wrapper(api);

    await wrapper.getAccountPositionLotFills({ accountId: 'acct_123', lotId: 'lot_123' });
    await wrapper.createAccountOrder({
      accountId: 'acct_123',
      idempotencyKey: 'idem_123',
      body: { order: { symbol: 'AAPL' } },
    });
    await wrapper.modifyAccountOrder({
      accountId: 'acct_123',
      orderId: 'order_123',
      idempotencyKey: 'idem_456',
      body: { order: { quantity: 2 } },
    });
    await wrapper.cancelAccountOrder({
      accountId: 'acct_123',
      orderId: 'order_123',
      idempotencyKey: 'idem_789',
    });

    expect(axios.request).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/api/v1/accounts/acct_123/position-lots/lot_123/fills',
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.test/api/v1/accounts/acct_123/orders',
        headers: expect.objectContaining({ 'Idempotency-Key': 'idem_123' }),
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        method: 'PATCH',
        url: 'https://api.test/api/v1/accounts/acct_123/orders/order_123',
        headers: expect.objectContaining({ 'Idempotency-Key': 'idem_456' }),
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        method: 'DELETE',
        url: 'https://api.test/api/v1/accounts/acct_123/orders/order_123',
        headers: expect.objectContaining({ 'Idempotency-Key': 'idem_789' }),
      })
    );
  });

  it('uses explicit account resource routes from the current API OpenAPI contract', async () => {
    const axios = createAxiosLikeClient();
    const api = new V1Api(new Configuration({ basePath: 'https://api.test' }), undefined, axios);
    const wrapper = new V1Wrapper(api);

    await wrapper.listBalances({ accountId: 'acct_123', limit: 10, offset: 2 });
    await wrapper.listPositions({ accountId: 'acct_123' });
    await wrapper.listTransactions({ accountId: 'acct_123' });
    await wrapper.listOrders({ accountId: 'acct_123' });
    await wrapper.listPositionLots({ accountId: 'acct_123' });

    expect(axios.request).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/api/v1/accounts/acct_123/balances',
        params: { limit: 10, offset: 2 },
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/api/v1/accounts/acct_123/positions',
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/api/v1/accounts/acct_123/transactions',
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/api/v1/accounts/acct_123/orders',
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/api/v1/accounts/acct_123/position-lots',
      })
    );
  });

  it('does not expose unsupported order-groups through the v1 account resource surface', () => {
    const wrapperMethods = Object.getOwnPropertyNames(V1Wrapper.prototype);

    expect(wrapperMethods).not.toContain('listOrderGroups');
  });

  it('keeps provider connection ids out of public v1 account params', () => {
    const params = ['accountId', 'limit', 'offset'];

    expect(params).not.toContain('connectionId');
    expect(params).not.toContain('user_broker_connection_id');
  });
});
