/**
 * Browser-safe Client SDK session smoke against local finaticAPI.
 */

import { FinaticConnect } from '../../src/FinaticConnect';
import {
  assertApiReachable,
  bootstrapSandboxApiKey,
  bootstrapSandboxOneTimeToken,
  DEFAULT_API_BASE_URL,
  DEVICE_HEADERS,
  integrationEnabled,
} from './helpers/fdx-sandbox';

const describeIntegration = integrationEnabled() ? describe : describe.skip;

describeIntegration('FDX v1 sandbox session (Client SDK)', () => {
  beforeEach(() => FinaticConnect.reset());
  afterEach(() => FinaticConnect.reset());

  it('starts a sandbox session and obtains a portal URL', async () => {
    await assertApiReachable();
    const bootstrap = await bootstrapSandboxApiKey();

    try {
      const token = await bootstrapSandboxOneTimeToken(bootstrap.sandboxApiKey);
      const finatic = await FinaticConnect.init(token, undefined, {
        environment: 'custom',
        baseUrl: DEFAULT_API_BASE_URL,
        apiEnvironment: 'sandbox',
        headers: {
          ...DEVICE_HEADERS,
          'X-Finatic-Environment': 'sandbox',
        },
        portalConfig: { baseUrl: DEFAULT_API_BASE_URL },
        logLevel: 'silent',
      });

      expect(finatic.v1.getSessionId()).toBeTruthy();
      expect(finatic.v1.getCompanyId()).toBe(bootstrap.accountId);

      const portalUrl = await finatic.v1.getPortalUrl({
        brokers: ['fidelity'],
        mode: 'light',
      });
      expect(() => new URL(portalUrl)).not.toThrow();
      expect(portalUrl).toContain('token=');
    } finally {
      await bootstrap.cleanup();
    }
  }, 120_000);
});
