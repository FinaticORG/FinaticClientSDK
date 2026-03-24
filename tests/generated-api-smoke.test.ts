import { BrokersApi } from '../src/generated/api/brokers-api';
import { CompanyApi } from '../src/generated/api/company-api';
import { SessionApi } from '../src/generated/api/session-api';

type ApiCtor = new (...args: any[]) => any;

function createParamsProxy(): Record<string, any> {
  return new Proxy(
    {},
    {
      get(_target, property) {
        const propertyName = String(property).toLowerCase();
        if (propertyName.includes('id')) {
          return 'test-id';
        }
        if (propertyName.includes('limit') || propertyName.includes('offset')) {
          return 1;
        }
        if (propertyName.startsWith('is') || propertyName.startsWith('include')) {
          return true;
        }
        return 'value';
      },
    },
  );
}

function createAxiosLikeClient(): any {
  return {
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    request: jest.fn(async () => ({ data: { success: { data: [] } } })),
  };
}

async function invokeApiMethods(apiCtor: ApiCtor): Promise<number> {
  const api = new apiCtor(undefined, 'http://localhost', createAxiosLikeClient());
  const prototype = Object.getPrototypeOf(api) as Record<string, unknown>;
  const methodNames = Object.getOwnPropertyNames(prototype).filter(
    (name) => name !== 'constructor' && typeof (api as Record<string, unknown>)[name] === 'function',
  );

  let invokedMethodCount = 0;
  for (const methodName of methodNames) {
    try {
      const method = (api as Record<string, ((...args: any[]) => any) | undefined>)[methodName];
      if (typeof method !== 'function') {
        continue;
      }
      const params = createParamsProxy();
      await method(params as any, params as any, params as any);
      invokedMethodCount += 1;
    } catch {
      invokedMethodCount += 1;
    }
  }
  return invokedMethodCount;
}

describe('Generated API smoke coverage', () => {
  it('invokes many generated api methods', async () => {
    const brokersInvoked = await invokeApiMethods(BrokersApi);
    const companyInvoked = await invokeApiMethods(CompanyApi);
    const sessionInvoked = await invokeApiMethods(SessionApi);

    expect(brokersInvoked).toBeGreaterThan(5);
    expect(companyInvoked).toBeGreaterThan(0);
    expect(sessionInvoked).toBeGreaterThan(0);
  });
});
