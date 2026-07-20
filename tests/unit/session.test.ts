import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

describe('Session bootstrap contract', () => {
  it('uses generated SessionApi transport at the root client (not finatic.v1)', () => {
    const file = path.resolve(__dirname, '../../src/openapi/api/session-api.ts');
    const body = readFileSync(file, 'utf8');
    expect(body).toContain('export class SessionApi');
  });

  it('does not expose a legacy session wrapper module', () => {
    const file = path.resolve(__dirname, '../../src/wrappers/session.ts');
    expect(existsSync(file)).toBe(false);
  });
});
