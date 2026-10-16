import { AccountsApi } from '../src/openapi/api/accounts-api';
import { SessionApi } from '../src/openapi/api/session-api';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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
    }
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
    (name) => name !== 'constructor' && typeof (api as Record<string, unknown>)[name] === 'function'
  );
  const ownMethodNames = Object.getOwnPropertyNames(api).filter(
    (name) => !name.startsWith('_') && typeof (api as Record<string, unknown>)[name] === 'function'
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
      `Generated API smoke: ${errorCount} methods threw. First failing method: ${firstErrorMethodName}\n${firstErrorDetails}`
    );
  }
  return invokedMethodCount;
}

describe('Generated API smoke coverage', () => {
  it('keeps the generated resource-model dependency closure aligned to the pinned artifact', () => {
    const modelsDirectory = join(process.cwd(), 'src', 'openapi', 'models');
    const assetType = readFileSync(join(modelsDirectory, 'fdxasset-type.ts'), 'utf8');
    const capability = readFileSync(
      join(modelsDirectory, 'event-contract-capability-response.ts'),
      'utf8'
    );
    const schema = readFileSync(join(modelsDirectory, 'account-order-schema-response.ts'), 'utf8');

    expect(assetType).toContain("Bond = 'BOND'");
    expect(assetType).toContain("Cfd = 'CFD'");
    expect(assetType).toContain("EventContract = 'EVENT_CONTRACT'");
    expect(capability).toContain('providerOffered: boolean');
    expect(capability).toContain('implementationEvidenced: boolean');
    expect(capability).toContain('publicEnabled: boolean');
    expect(capability).toContain('accountEntitled: boolean | null');
    expect(capability).toContain('closingOnly: boolean | null');
    expect(schema).toContain('eventContract: EventContractCapabilityResponse');
  });

  it('invokes the generated v1/session api methods that ship in 1.0', async () => {
    const sessionInvoked = await invokeApiMethods(SessionApi);
    const accountsInvoked = await invokeApiMethods(AccountsApi);

    expect(sessionInvoked).toBeGreaterThan(0);
    expect(accountsInvoked).toBeGreaterThan(10);
  });

  it('returns account resource descriptors without client-side remapping', async () => {
    const axios = createAxiosLikeClient();
    const api = new AccountsApi(undefined, 'http://localhost', axios);
    const descriptor = {
      version: '1.0',
      assetType: 'FUTURE',
      displaySymbol: 'MGCZ6',
      finaticInstrumentId: 'fininst_mgcz6',
      future: { identityQuality: 'EXACT', contractCode: 'MGCZ6' },
    };
    axios.request.mockResolvedValueOnce({
      data: { success: { data: [{ instrument: descriptor }] } },
    });

    const response = await api.finaticV1GetAccountsAccountIdPositions({
      accountId: 'acct_123',
    });
    const data = response.data as {
      success: { data: Array<{ instrument: unknown }> };
    };

    expect(data.success.data[0]?.instrument).toBe(descriptor);
  });
});
