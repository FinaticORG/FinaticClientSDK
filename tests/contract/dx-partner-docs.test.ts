import { readFileSync } from 'fs';
import { resolve } from 'path';

const readme = readFileSync(resolve(__dirname, '../../README.md'), 'utf8');

const FORBIDDEN = [
  'linkPortalUser',
  'exchangePortalToken',
  'completePortalSession',
  'listPortalInstitutions',
  'createPortalAuthAttempt',
  'listPositionLots',
  'VITE_FINATIC_API_KEY',
  'getAccounts(',
];

describe('partner-facing README matches published v1', () => {
  it('documents init, openPortal onEvent, and listAccounts', () => {
    expect(readme).toContain('FinaticConnect.init');
    expect(readme).toContain('account.grant.created');
    expect(readme).toContain('v1.listAccounts');
    expect(readme).toContain('Never set an API key');
    expect(readme).toContain('90 seconds');
    expect(readme).toContain(
      'https://github.com/FinaticORG/FinaticServerSDK-Node/blob/develop/README.md',
    );
    expect(readme).toContain('https://finatic.dev/AGENTS.md');
    expect(readme).toContain('https://finatic.dev/openapi.json');
  });

  it('does not document unpublished Client v1 methods', () => {
    for (const snippet of FORBIDDEN) {
      expect(readme).not.toContain(snippet);
    }
  });
});
