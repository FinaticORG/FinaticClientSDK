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

    const result = await wrapper.listPositions({ accountId: 'acct_123', limit: 25 });

    expect(result._id).toBe('trace-id');
    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.test/api/v1/accounts/acct_123/positions',
        params: { limit: 25 },
        headers: expect.objectContaining({
          'X-Finatic-Environment': 'sandbox',
        }),
      })
    );
  });

  it('keeps provider connection ids out of public v1 account params', () => {
    const params = ['accountId', 'limit', 'offset'];

    expect(params).not.toContain('connectionId');
    expect(params).not.toContain('user_broker_connection_id');
  });
});
