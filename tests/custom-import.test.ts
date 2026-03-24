/**
 * Executes hand-authored SDK surface (custom FinaticConnect) so coverage can measure `src/custom/`.
 * Requires Jest to transform ESM deps under `p-retry` (see jest.config.cjs).
 */
import { FinaticConnect } from '../src/custom/FinaticConnect';

describe('Custom FinaticConnect import', () => {
  it('is the protected subclass with marker', () => {
    expect(FinaticConnect).toBeDefined();
    expect(FinaticConnect.__CUSTOM_CLASS__).toBe(true);
  });
});
