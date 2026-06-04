/**
 * Contract tests for stable public exports (regen-safe).
 * See docs/sdk-public-api-inventory.md at repo root.
 */
import {
  BrokersWrapper,
  CompanyWrapper,
  FinaticConnect,
  SessionWrapper,
  V1Api,
  V1Wrapper,
} from "../../src/index";

describe("public surface @finatic/client", () => {
  it("exports FinaticConnect", () => {
    expect(FinaticConnect).toBeDefined();
    expect(typeof FinaticConnect).toBe("function");
    expect(FinaticConnect.init).toBeDefined();
    expect(typeof FinaticConnect.init).toBe("function");
  });

  it("exports domain wrappers", () => {
    expect(BrokersWrapper).toBeDefined();
    expect(CompanyWrapper).toBeDefined();
    expect(SessionWrapper).toBeDefined();
    expect(V1Wrapper).toBeDefined();
    expect(V1Api).toBeDefined();
  });
});
