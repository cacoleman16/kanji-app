import { describe, expect, it } from "vitest";

import { APP_VERSION } from "@/data/version";
import { DEFAULT_STATE } from "@/storage/state";
import type { AppState, CardProgress } from "@/types";

import { buildBackupFilename, parseBackupName } from "./backupFilename";

function progress(): CardProgress {
  return {
    ease: 2.5,
    interval: 1,
    reps: 1,
    due: Date.now(),
    lastReview: Date.now(),
  };
}

function makeState(entryCount: number): AppState {
  const out: AppState = {
    ...DEFAULT_STATE,
    progress: {},
  };
  for (let i = 0; i < entryCount; i++) out.progress[`k${i}`] = progress();
  return out;
}

describe("buildBackupFilename", () => {
  it("includes date, version, and entry count", () => {
    const name = buildBackupFilename(makeState(420), "2026-05-07");
    expect(name).toBe(`kanjido-progress-2026-05-07-v${APP_VERSION}-N420.json`);
  });

  it("works for an empty state (N0)", () => {
    const name = buildBackupFilename(makeState(0), "2026-01-01");
    expect(name).toMatch(/-N0\.json$/);
  });

  it("uses today by default", () => {
    const today = new Date();
    const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const name = buildBackupFilename(makeState(5));
    expect(name.startsWith(`kanjido-progress-${ymd}-`)).toBe(true);
  });
});

describe("parseBackupName", () => {
  it("parses the new format with version + count", () => {
    const parsed = parseBackupName(
      "kanjido-progress-2026-05-07-v1.0.0-beta.1-N420.json",
    );
    expect(parsed).not.toBeNull();
    expect(parsed?.date).toBe("2026-05-07");
    expect(parsed?.version).toBe("1.0.0-beta.1");
    expect(parsed?.entryCount).toBe(420);
  });

  it("tolerates the legacy format with no version metadata", () => {
    const parsed = parseBackupName("kanjido-progress-2025-12-31.json");
    expect(parsed).not.toBeNull();
    expect(parsed?.date).toBe("2025-12-31");
    expect(parsed?.version).toBeNull();
    expect(parsed?.entryCount).toBeNull();
  });

  it("returns null for non-Kanjido filenames", () => {
    expect(parseBackupName("anki-deck-export.apkg")).toBeNull();
    expect(parseBackupName("kanji-app-v1.json")).toBeNull();
    expect(parseBackupName("")).toBeNull();
  });

  it("round-trips with buildBackupFilename", () => {
    const built = buildBackupFilename(makeState(99), "2026-03-15");
    const parsed = parseBackupName(built);
    expect(parsed?.date).toBe("2026-03-15");
    expect(parsed?.entryCount).toBe(99);
  });
});
