import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

describe('BrokersWrapper contract', () => {
  it('generated brokers wrapper file exists', () => {
    const file = path.resolve(__dirname, '../../src/generated/wrappers/brokers.ts');
    expect(existsSync(file)).toBe(true);
  });

  it('generated brokers api exports class signature', () => {
    const file = path.resolve(__dirname, '../../src/generated/api/brokers-api.ts');
    const body = readFileSync(file, 'utf8');
    expect(body).toContain('export class BrokersApi');
  });
});
