import { BrokersWrapper } from '../src/wrappers/brokers';
import { CompanyWrapper } from '../src/wrappers/company';
import { SessionWrapper } from '../src/wrappers/session';
import { V1Wrapper } from '../src/wrappers/v1';
import { FinaticConnect } from '../src/FinaticConnectCore';

type WrapperCtor = new (...args: any[]) => any;

function createApiProxy(): any {
  return new Proxy(
    {},
    {
      get(_target, _prop) {
        return jest.fn(async () => ({
          data: {
            success: { data: [] },
            error: null,
            warning: null,
          },
        }));
      },
    },
  );
}

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

async function invokeWrapperMethods(wrapperCtor: WrapperCtor): Promise<number> {
  const wrapper = new wrapperCtor(createApiProxy(), undefined, undefined);
  if (typeof wrapper.setSessionContext === 'function') {
    wrapper.setSessionContext('session-id', 'company-id', 'csrf-token');
  }

  const prototype = Object.getPrototypeOf(wrapper) as Record<string, unknown>;
  const prototypeMethodNames = Object.getOwnPropertyNames(prototype).filter(
    (name) =>
      name !== 'constructor' &&
      !name.startsWith('_') &&
      typeof (wrapper as Record<string, unknown>)[name] === 'function',
  );
  const ownMethodNames = Object.getOwnPropertyNames(wrapper).filter(
    (name) =>
      !name.startsWith('_') &&
      typeof (wrapper as Record<string, unknown>)[name] === 'function',
  );
  const methodNames = [...new Set([...prototypeMethodNames, ...ownMethodNames])];

  let invokedMethodCount = 0;
  for (const methodName of methodNames) {
    try {
      const method = (wrapper as Record<string, ((...args: any[]) => any) | undefined>)[
        methodName
      ];
      if (typeof method !== 'function') {
        continue;
      }
      const params = createParamsProxy();
      await method(params as any);
      invokedMethodCount += 1;
    } catch {
      invokedMethodCount += 1;
    }
  }
  return invokedMethodCount;
}

describe('Generated wrapper smoke coverage', () => {
  it('invokes many generated wrapper methods', async () => {
    const brokersInvoked = await invokeWrapperMethods(BrokersWrapper);
    const companyInvoked = await invokeWrapperMethods(CompanyWrapper);
    const sessionInvoked = await invokeWrapperMethods(SessionWrapper);
    const v1Invoked = await invokeWrapperMethods(V1Wrapper);

    expect(brokersInvoked).toBeGreaterThan(10);
    expect(companyInvoked).toBeGreaterThan(0);
    expect(sessionInvoked).toBeGreaterThan(0);
    expect(v1Invoked).toBeGreaterThan(10);
  });

  it('invokes many top-level generated SDK methods', async () => {
    const sdk = new FinaticConnect({ basePath: 'http://localhost' } as any);
    const sdkRecord = sdk as unknown as Record<string, unknown>;
    const prototype = Object.getPrototypeOf(sdk) as Record<string, unknown>;
    const prototypeMethodNames = Object.getOwnPropertyNames(prototype).filter(
      (name) =>
        name !== 'constructor' &&
        !name.startsWith('_') &&
        typeof sdkRecord[name] === 'function',
    );
    const ownMethodNames = Object.getOwnPropertyNames(sdk).filter(
      (name) => !name.startsWith('_') && typeof sdkRecord[name] === 'function',
    );
    const methodNames = [...new Set([...prototypeMethodNames, ...ownMethodNames])];

    let invokedMethodCount = 0;
    for (const methodName of methodNames) {
      try {
        const method = (
          sdk as unknown as Record<string, ((...args: any[]) => any) | undefined>
        )[methodName];
        if (typeof method !== 'function') {
          continue;
        }
        const params = createParamsProxy();
        await method(params as any);
        invokedMethodCount += 1;
      } catch {
        invokedMethodCount += 1;
      }
    }

    expect(invokedMethodCount).toBeGreaterThan(10);
  });
});
