import { FinaticConnect } from '../src/FinaticConnectCore';
import { V1Wrapper } from '../src/wrappers/v1';

describe('v1 wrapper smoke coverage', () => {
  it('constructs FinaticConnect and v1 without legacy broker methods', () => {
    const sdk = new FinaticConnect({ basePath: 'http://localhost' } as any);
    expect(sdk.v1).toBeInstanceOf(V1Wrapper);
    expect(typeof sdk.v1.startSession).toBe('function');
    expect(typeof sdk.v1.getPortalUrl).toBe('function');
    expect(typeof sdk.v1.listBalances).toBe('function');
    expect('getBrokerConnections' in sdk).toBe(false);
  });
});
