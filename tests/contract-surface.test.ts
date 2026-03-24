/**
 * Contract tests for stable custom sources only (no full barrel import — avoids ESM deps in Jest).
 */
import * as fs from 'fs';
import * as path from 'path';

describe('Client SDK contract surface', () => {
  it('preserves custom FinaticConnect subclass marker in source', () => {
    const filePath = path.join(__dirname, '../src/custom/FinaticConnect.ts');
    const src = fs.readFileSync(filePath, 'utf8');
    expect(src).toContain('__CUSTOM_CLASS__');
  });
});
