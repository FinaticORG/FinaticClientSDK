/**
 * FDX v1 sandbox portal smoke — Client SDK v1 wrapper against local finaticAPI.
 */

import { Configuration } from '../../src/openapi/configuration';
import { V1Api } from '../../src/openapi/api/v1-api';
import { getConfig } from '../../src/config';
import { V1Wrapper } from '../../src/wrappers/v1';
import {
  assertApiReachable,
  assertClientV1Success,
  bootstrapSandboxApiKey,
  createSandboxPortalAccountGrant,
  createSandboxPortalSessionHttp,
  DEFAULT_API_BASE_URL,
  DEVICE_HEADERS,
  integrationEnabled,
} from './helpers/fdx-sandbox';

const describeIntegration = integrationEnabled() ? describe : describe.skip;

function buildClientV1(apiKey: string): V1Wrapper {
  const sdkConfig = getConfig({
    baseUrl: DEFAULT_API_BASE_URL,
    apiEnvironment: 'sandbox',
    headers: DEVICE_HEADERS,
  });
  const configuration = new Configuration({
    basePath: DEFAULT_API_BASE_URL,
    apiKey,
  });
  return new V1Wrapper(new V1Api(configuration), configuration, sdkConfig);
}

describeIntegration('FDX v1 sandbox portal (Client SDK v1)', () => {
  const linkEmail = 'fdx-client-sdk-smoke@finatic.test';

  it('lists institutions and grants fidelity via portal v1 routes', async () => {
    await assertApiReachable();
    const bootstrap = await bootstrapSandboxApiKey();
    const v1 = buildClientV1(bootstrap.sandboxApiKey);

    try {
      const { sessionId } = await createSandboxPortalSessionHttp(
        bootstrap.sandboxApiKey,
        linkEmail,
        v1
      );

      const institutionsResponse = await v1.listPortalInstitutions(sessionId, {
        environment: 'sandbox',
      });
      const institutions = assertClientV1Success(institutionsResponse) as unknown[];
      expect(Array.isArray(institutions)).toBe(true);
      expect(institutions.length).toBeGreaterThanOrEqual(12);

      const authAttemptResponse = await v1.createPortalAuthAttempt(
        sessionId,
        { brokerId: 'fidelity' },
        { environment: 'sandbox' }
      );
      const authAttempt = assertClientV1Success(authAttemptResponse) as Record<string, unknown>;
      expect(['discovered', 'accounts_discovered']).toContain(authAttempt['status']);

      const grant = await createSandboxPortalAccountGrant(v1, sessionId, authAttempt);
      expect(grant['status']).toBe('active');
      expect(grant['id'] ?? grant['grantId']).toBeTruthy();
    } finally {
      await bootstrap.cleanup();
    }
  }, 120_000);
});
