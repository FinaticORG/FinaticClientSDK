import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

describe('SessionWrapper contract', () => {
  it('generated session wrapper file exists', () => {
    const file = path.resolve(__dirname, '../../src/generated/wrappers/session.ts');
    expect(existsSync(file)).toBe(true);
  });

  it('generated session api exports class signature', () => {
    const file = path.resolve(__dirname, '../../src/generated/api/session-api.ts');
    const body = readFileSync(file, 'utf8');
    expect(body).toContain('export class SessionApi');
  });
});
