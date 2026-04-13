/**
 * Executes hand-authored SDK surface (FinaticConnect subclass).
 * Requires Jest to transform ESM deps under `p-retry` (see jest.config.cjs).
 */
import { FinaticConnect } from "../src/FinaticConnect";

describe("Custom FinaticConnect import", () => {
  it("is the protected subclass with marker", () => {
    expect(FinaticConnect).toBeDefined();
    expect(FinaticConnect.__CUSTOM_CLASS__).toBe(true);
  });
});
