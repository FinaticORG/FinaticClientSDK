import { FinaticConnect, getConfig } from "../src/index";

describe("SDK environment configuration", () => {
  afterEach(() => {
    FinaticConnect.reset();
  });

  it("resolves named environment presets", () => {
    const config = getConfig({ environment: "staging" });

    expect(config.environment).toBe("staging");
    expect(config.baseUrl).toBe("https://staging-api.finatic.dev");
    expect(config.portalConfig.baseUrl).toBe("https://staging-portal.finatic.dev");
  });

  it("keeps explicit custom URLs when environment is custom", () => {
    const config = getConfig({
      environment: "custom",
      baseUrl: "https://api.example.test",
      portalConfig: { baseUrl: "https://portal.example.test" },
    });

    expect(config.environment).toBe("custom");
    expect(config.baseUrl).toBe("https://api.example.test");
    expect(config.portalConfig.baseUrl).toBe("https://portal.example.test");
  });

  it("rebuilds clients when configuration changes at runtime", () => {
    const finatic = new FinaticConnect({
      token: "one-time-token",
      sdkConfig: { environment: "development" },
    });

    expect(finatic.getConfig().baseUrl).toBe("http://localhost:8000");

    const updated = finatic.configure({
      environment: "sandbox",
      headers: { "x-test": "true" },
    });

    expect(updated.environment).toBe("sandbox");
    expect(updated.baseUrl).toBe("https://sandbox-api.finatic.dev");
    expect(updated.portalConfig.baseUrl).toBe("https://sandbox-portal.finatic.dev");
    expect(updated.headers["x-test"]).toBe("true");
    expect((finatic as any).config.basePath).toBe("https://sandbox-api.finatic.dev");
  });
});
