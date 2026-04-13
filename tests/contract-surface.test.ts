/**
 * Contract tests for stable hand-authored sources only (no full barrel import).
 */
import * as fs from "fs";
import * as path from "path";

describe("Client SDK contract surface", () => {
  it("preserves FinaticConnect subclass marker in source", () => {
    const filePath = path.join(__dirname, "../src/FinaticConnect.ts");
    const src = fs.readFileSync(filePath, "utf8");
    expect(src).toContain("__CUSTOM_CLASS__");
  });
});
