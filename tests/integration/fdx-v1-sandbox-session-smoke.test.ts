/**
 * FDX v1 sandbox session smoke — Client SDK v1 wrapper against local finaticAPI.
 */

import { getConfig } from '../../src/config';
import { V1Api } from '../../src/openapi/api/v1-api';
import { Configuration } from '../../src/openapi/configuration';
import { V1Wrapper } from '../../src/wrappers/v1';
import {
  assertApiReachable,
  bootstrapSandboxApiKey,
  createSandboxOneTimeToken,
  DEFAULT_API_BASE_URL,
  DEVICE_HEADERS,
  integrationEnabled,
} from './helpers/fdx-sandbox';

const describeIntegration = integrationEnabled() ? describe : describe.skip;

function buildClientV1(): V1Wrapper {
  const sdkConfig = getConfig({
    baseUrl: DEFAULT_API_BASE_URL,
    apiEnvironment: 'sandbox',
    headers: DEVICE_HEADERS,
  });
  const configuration = new Configuration({
    basePath: DEFAULT_API_BASE_URL,
    baseOptions: {
      headers: DEVICE_HEADERS,
    },
  });
  return new V1Wrapper(new V1Api(configuration), configuration, sdkConfig);
}

describeIntegration('FDX v1 sandbox session (Client SDK v1)', () => {
  it('starts a sandbox session with a one-time token', async () => {
    await assertApiReachable();
    const bootstrap = await bootstrapSandboxApiKey();

    try {
      const oneTimeToken = await createSandboxOneTimeToken(bootstrap.sandboxApiKey);
      const v1 = buildClientV1();
      const session = await v1.startSession(oneTimeToken);

      expect(session.session_id).toBeTruthy();
      expect(session.company_id).toBe(bootstrap.accountId);
      expect(v1.getSessionId()).toBe(session.session_id);
      expect(v1.getCompanyId()).toBe(session.company_id);
      expect(v1.isAuthed()).toBe(false);
    } finally {
      await bootstrap.cleanup();
    }
  }, 120_000);
});
