import { describe, it, expect } from "vitest";
import { OHIO_COUNTIES } from "./ohio-counties";

describe("OHIO_COUNTIES", () => {
  it("contains all 88 Ohio counties", () => {
    expect(Object.keys(OHIO_COUNTIES)).toHaveLength(88);
  });

  it("has non-empty SVG path strings for every county", () => {
    for (const [name, path] of Object.entries(OHIO_COUNTIES)) {
      expect(path, `${name} has empty path`).toBeTruthy();
      expect(path, `${name} path doesn't start with M`).toMatch(/^M/);
    }
  });

  it("includes well-known counties", () => {
    expect(OHIO_COUNTIES).toHaveProperty("Adams");
    expect(OHIO_COUNTIES).toHaveProperty("Cuyahoga");
    expect(OHIO_COUNTIES).toHaveProperty("Franklin");
    expect(OHIO_COUNTIES).toHaveProperty("Hamilton");
    expect(OHIO_COUNTIES).toHaveProperty("Montgomery");
  });
});
