import { describe, expect, it } from "vitest";

import { compareVersions } from "./version";

describe("compareVersions", () => {
  it("returns 0 for identical versions", () => {
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
    expect(compareVersions("1.0.0-beta.1", "1.0.0-beta.1")).toBe(0);
  });

  it("orders major/minor/patch correctly", () => {
    expect(compareVersions("1.0.0", "2.0.0")).toBeLessThan(0);
    expect(compareVersions("1.1.0", "1.0.0")).toBeGreaterThan(0);
    expect(compareVersions("1.0.5", "1.0.10")).toBeLessThan(0); // numeric, not lex
  });

  it("treats pre-release as less than the matching release", () => {
    expect(compareVersions("1.0.0-beta.1", "1.0.0")).toBeLessThan(0);
    expect(compareVersions("1.0.0", "1.0.0-beta.1")).toBeGreaterThan(0);
  });

  it("orders pre-release tags lexicographically", () => {
    expect(compareVersions("1.0.0-beta.1", "1.0.0-beta.2")).toBeLessThan(0);
    expect(compareVersions("1.0.0-rc.1", "1.0.0-beta.5")).toBeGreaterThan(0);
  });

  it("handles missing patch component as 0", () => {
    expect(compareVersions("1.0", "1.0.0")).toBe(0);
    expect(compareVersions("1.1", "1.0.99")).toBeGreaterThan(0);
  });
});
