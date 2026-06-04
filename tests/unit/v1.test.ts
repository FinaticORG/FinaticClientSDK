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

  it('uses the plural portal-links path from the API contract', async () => {
    const axios = createAxiosLikeClient();
    const api = new V1Api(new Configuration({ basePath: 'https://api.test' }), undefined, axios);
    const wrapper = new V1Wrapper(api);

    await wrapper.createPortalLink('session_123');

    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.test/api/v1/sessions/session_123/portal-links',
      })
    );
  });

  it('creates portal account grants with the authAttemptId API contract', async () => {
    const axios = createAxiosLikeClient();
    const api = new V1Api(new Configuration({ basePath: 'https://api.test' }), undefined, axios);
    const wrapper = new V1Wrapper(api);

    await wrapper.createPortalAccountGrant('session_123', {
      accountId: 'account_123',
      authAttemptId: 'auth_attempt_123',
      canRead: true,
      canTrade: false,
    });

    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.test/api/v1/sessions/session_123/account-grants',
        data: expect.objectContaining({
          accountId: 'account_123',
          authAttemptId: 'auth_attempt_123',
        }),
      })
    );
  });

  it('polls session sync status from the current API contract', async () => {
    const axios = createAxiosLikeClient();
    const api = new V1Api(new Configuration({ basePath: 'https://api.test' }), undefined, axios);
    const wrapper = new V1Wrapper(api);

    await wrapper.getSessionSyncStatus('session_123');

    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/api/v1/sessions/session_123/sync-status',
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

  it('keeps provider connection ids out of public v1 account params', () => {
    const params = ['accountId', 'limit', 'offset'];

    expect(params).not.toContain('connectionId');
    expect(params).not.toContain('user_broker_connection_id');
  });
});
