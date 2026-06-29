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
    expect(() => wrapper.getSessionSyncStatus('session_123')).toThrow('server-only');

    expect(axios.request).not.toHaveBeenCalled();
  });

  it('does not expose portal consent flow methods on the client SDK', () => {
    const wrapperMethods = Object.getOwnPropertyNames(V1Wrapper.prototype);

    expect(wrapperMethods).not.toContain('exchangePortalToken');
    expect(wrapperMethods).not.toContain('consumeOAuthCompletionToken');
    expect(wrapperMethods).not.toContain('linkPortalUser');
    expect(wrapperMethods).not.toContain('listPortalInstitutions');
    expect(wrapperMethods).not.toContain('createPortalAuthAttempt');
    expect(wrapperMethods).not.toContain('getPortalAuthAttempt');
    expect(wrapperMethods).not.toContain('listPortalDiscoveredAccounts');
    expect(wrapperMethods).not.toContain('createPortalAccountGrant');
    expect(wrapperMethods).not.toContain('completePortalSession');
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

  it('covers account trading commands from the API contract', async () => {
    const axios = createAxiosLikeClient();
    const api = new V1Api(new Configuration({ basePath: 'https://api.test' }), undefined, axios);
    const wrapper = new V1Wrapper(api);

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
        method: 'POST',
        url: 'https://api.test/api/v1/accounts/acct_123/orders',
        headers: expect.objectContaining({ 'Idempotency-Key': 'idem_123' }),
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        method: 'PATCH',
        url: 'https://api.test/api/v1/accounts/acct_123/orders/order_123',
        headers: expect.objectContaining({ 'Idempotency-Key': 'idem_456' }),
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      3,
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
    await wrapper.listPositionLots({ accountId: 'acct_123', limit: 5 });
    await wrapper.listTransactions({ accountId: 'acct_123' });
    await wrapper.listOrders({ accountId: 'acct_123' });
    await wrapper.getAccountPositionLotFills({ accountId: 'acct_123', lotId: 'lot_123' });

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
        url: 'https://api.test/api/v1/accounts/acct_123/position-lots',
        params: { limit: 5 },
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/api/v1/accounts/acct_123/transactions',
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/api/v1/accounts/acct_123/orders',
      })
    );
    expect(axios.request).toHaveBeenNthCalledWith(
      6,
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/api/v1/accounts/acct_123/position-lots/lot_123/fills',
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
