import { existsSync } from 'node:fs';
import path from 'node:path';

describe('Legacy company wrapper removed', () => {
  it('does not expose a company wrapper module', () => {
    const file = path.resolve(__dirname, '../../src/wrappers/company.ts');
    expect(existsSync(file)).toBe(false);
  });
});
