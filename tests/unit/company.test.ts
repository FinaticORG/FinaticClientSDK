import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

describe('CompanyWrapper contract', () => {
  it('generated company wrapper file exists', () => {
    const file = path.resolve(__dirname, '../../src/generated/wrappers/company.ts');
    expect(existsSync(file)).toBe(true);
  });

  it('generated company api exports class signature', () => {
    const file = path.resolve(__dirname, '../../src/generated/api/company-api.ts');
    const body = readFileSync(file, 'utf8');
    expect(body).toContain('export class CompanyApi');
  });
});
