/**
 * Contract tests for stable public exports.
 */
import { FinaticConnect, V1Wrapper } from '../../src/index';

describe('public surface @finatic/client', () => {
  it('exports FinaticConnect', () => {
    expect(FinaticConnect).toBeDefined();
    expect(typeof FinaticConnect).toBe('function');
    expect(FinaticConnect.init).toBeDefined();
    expect(typeof FinaticConnect.init).toBe('function');
  });

  it('exports V1Wrapper for versioned API access', () => {
    expect(V1Wrapper).toBeDefined();
  });

  it('exposes versioned v1 API including session and account data', () => {
    const sdk = new FinaticConnect({ token: 'test-token' } as any);
    expect(typeof sdk.v1.startSession).toBe('function');
    expect(typeof sdk.v1.getPortalUrl).toBe('function');
    expect(typeof sdk.v1.listAccounts).toBe('function');
    expect(typeof sdk.v1.listBalances).toBe('function');
    expect(typeof sdk.v1.listPositions).toBe('function');
    expect(typeof (sdk as unknown as Record<string, unknown>)['getPortalUrl']).toBe('undefined');
    expect(typeof (sdk as unknown as Record<string, unknown>)['getSessionId']).toBe('undefined');
    expect(typeof (sdk as unknown as Record<string, unknown>)['isAuthed']).toBe('undefined');
  });
});
