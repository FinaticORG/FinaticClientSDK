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
        if (propertyName === 'headers') {
          return { 'content-type': 'application/json' };
        }
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
  const prototypeMethodNames = Object.getOwnPropertyNames(prototype).filter(
    (name) =>
      name !== 'constructor' &&
      typeof (api as Record<string, unknown>)[name] === 'function',
  );
  const ownMethodNames = Object.getOwnPropertyNames(api).filter(
    (name) => !name.startsWith('_') && typeof (api as Record<string, unknown>)[name] === 'function',
  );
  const methodNames = [...new Set([...prototypeMethodNames, ...ownMethodNames])];

  let invokedMethodCount = 0;
  let errorCount = 0;
  let firstErrorMethodName: string | null = null;
  let firstError: unknown = null;
  for (const methodName of methodNames) {
    const method = (api as Record<string, ((...args: any[]) => any) | undefined>)[methodName];
    if (typeof method !== 'function') {
      continue;
    }
    const params = createParamsProxy();
    try {
      // Most generated methods treat the first arg as "requestParameters" and the second as "options".
      // Passing the same proxy for both exercises as much code as possible.
      await method.call(api, params as any, params as any);
      invokedMethodCount += 1;
    } catch (e) {
      errorCount += 1;
      if (!firstErrorMethodName) {
        firstErrorMethodName = methodName;
        firstError = e;
      }
    }
  }

  // If generated API calls throw, we won't exercise the target code paths.
  // Failing here will help us align mocks with the generated client's expectations.
  if (errorCount > 0) {
    const firstErrorDetails =
      firstError instanceof Error ? firstError.stack || firstError.message : String(firstError);
    throw new Error(
      `Generated API smoke: ${errorCount} methods threw. First failing method: ${firstErrorMethodName}\n${firstErrorDetails}`,
    );
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
