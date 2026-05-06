import { describe, expect, it } from "vitest";

import {
  DEFAULT_STATE,
  LEGACY_V1_KEY,
  SCHEMA_VERSION,
  STORAGE_KEY,
  daysBetween,
  hydrate,
  loadState,
  migrate,
  parseImport,
  saveState,
  updateStreak,
} from "./state";
import { MemoryStorageProvider } from "./provider";

describe("migrate", () => {
  it("upgrades v1 → current by chaining migrations", () => {
    const v1 = { progress: {}, schemaVersion: 1 };
    const after = migrate(v1);
    expect(after.schemaVersion).toBe(SCHEMA_VERSION);
    expect(after.userDecks).toEqual([]);
    expect(after.pro).toEqual({ active: false });
  });

  it("treats missing schemaVersion as v1 and upgrades to current", () => {
    const v1 = { progress: { 一: { ease: 2.5, interval: 1, reps: 1, due: 1, lastReview: 1 } } };
    const after = migrate(v1);
    expect(after.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it("upgrades v2 → current with userDecks + pro defaults", () => {
    const v2 = { schemaVersion: 2, progress: {} };
    const after = migrate(v2);
    expect(after.schemaVersion).toBe(SCHEMA_VERSION);
    expect(after.userDecks).toEqual([]);
    expect(after.pro).toEqual({ active: false });
  });

  it("upgrades v3 → v4 by adding pro: { active: false }", () => {
    const v3 = { schemaVersion: 3, progress: {}, userDecks: [] };
    const after = migrate(v3);
    expect(after.schemaVersion).toBe(4);
    expect(after.pro).toEqual({ active: false });
  });

  it("returns current-version state untouched", () => {
    const current = {
      schemaVersion: SCHEMA_VERSION,
      progress: {},
      userDecks: [],
      pro: { active: false },
    };
    const after = migrate(current);
    expect(after).toEqual(current);
  });

  it("preserves existing userDecks during v2 → v3 (defensive)", () => {
    // Defensive: if a future client somehow set userDecks on a v2 blob, keep it.
    const v2 = {
      schemaVersion: 2,
      progress: {},
      userDecks: [
        {
          id: "u-1",
          name: "Mine",
          kind: "kanji" as const,
          createdAt: 1,
          updatedAt: 1,
          cards: [],
        },
      ],
    };
    const after = migrate(v2);
    expect(after.userDecks).toHaveLength(1);
  });
});

describe("hydrate", () => {
  it("backfills missing top-level keys from DEFAULT_STATE", () => {
    const sparse = { schemaVersion: 2, progress: { 一: {} } } as never;
    const hydrated = hydrate(sparse);
    expect(hydrated.settings).toEqual(DEFAULT_STATE.settings);
    expect(hydrated.streak).toEqual(DEFAULT_STATE.streak);
    expect(hydrated.stats).toEqual(DEFAULT_STATE.stats);
  });

  it("merges partial settings without losing user choices", () => {
    const partial = { schemaVersion: 2, progress: {}, settings: { dailyGoal: 50 } } as never;
    const hydrated = hydrate(partial);
    expect(hydrated.settings.dailyGoal).toBe(50);
    expect(hydrated.settings.newPerDay).toBe(DEFAULT_STATE.settings.newPerDay);
  });
});

describe("loadState (regression: schema migrations)", () => {
  it("loads an existing v2 snapshot, migrating it forward without losing data", () => {
    const provider = new MemoryStorageProvider();
    const v2Snapshot = {
      schemaVersion: 2,
      progress: {
        学: { ease: 2.5, interval: 6, reps: 2, due: 1700000000000, lastReview: 1699000000000 },
        校: { ease: 2.35, interval: 1, reps: 1, due: 1700000000000, lastReview: 1700000000000 },
      },
      stats: { byDay: { "2026-04-17": { reviewed: 12, again: 1, hard: 2, good: 7, easy: 2 } } },
      settings: {
        dailyGoal: 30,
        newPerDay: 10,
        cardBackFontSize: "medium",
        theme: "dark",
        vocabDirection: "ja-en",
      },
      streak: { current: 7, longest: 12, lastActiveDay: "2026-04-17" },
    };
    provider.set(STORAGE_KEY, JSON.stringify(v2Snapshot));

    const loaded = loadState(provider);
    expect(loaded.schemaVersion).toBe(SCHEMA_VERSION);
    expect(loaded.userDecks).toEqual([]);
    expect(loaded.pro).toEqual({ active: false });
    // Everything else preserved unchanged.
    expect(loaded.progress).toEqual(v2Snapshot.progress);
    expect(loaded.stats).toEqual(v2Snapshot.stats);
    expect(loaded.settings).toEqual(v2Snapshot.settings);
    expect(loaded.streak).toEqual(v2Snapshot.streak);
  });

  it("upgrades a legacy v1 snapshot under the legacy key and writes back as current", () => {
    const provider = new MemoryStorageProvider();
    const v1 = {
      progress: { 学: { ease: 2.5, interval: 6, reps: 2, due: 1, lastReview: 0 } },
      stats: { byDay: {} },
      settings: { dailyGoal: 20, newPerDay: 8 },
      streak: { current: 0, longest: 0, lastActiveDay: null },
    };
    provider.set(LEGACY_V1_KEY, JSON.stringify(v1));

    const loaded = loadState(provider);
    expect(loaded.schemaVersion).toBe(SCHEMA_VERSION);
    expect(loaded.progress["学"].ease).toBe(2.5);
    expect(loaded.settings.dailyGoal).toBe(20);

    // The migrated state is also written back to the new key.
    const written = provider.get(STORAGE_KEY);
    expect(written).not.toBeNull();
    expect(JSON.parse(written as string).schemaVersion).toBe(SCHEMA_VERSION);
  });

  it("returns DEFAULT_STATE when nothing is stored", () => {
    const provider = new MemoryStorageProvider();
    expect(loadState(provider)).toEqual(DEFAULT_STATE);
  });

  it("returns DEFAULT_STATE on corrupt JSON without throwing", () => {
    const provider = new MemoryStorageProvider();
    provider.set(STORAGE_KEY, "{not valid json");
    expect(loadState(provider)).toEqual(DEFAULT_STATE);
  });
});

describe("saveState round-trips through loadState", () => {
  it("stores and reloads identical state", () => {
    const provider = new MemoryStorageProvider();
    const s = {
      ...DEFAULT_STATE,
      progress: { 一: { ease: 2.5, interval: 6, reps: 2, due: 12345, lastReview: 1234 } },
    };
    saveState(s, provider);
    expect(loadState(provider)).toEqual(s);
  });
});

describe("parseImport", () => {
  it("rejects non-object payloads", () => {
    expect(() => parseImport("[]")).toThrow(/Missing `progress`/);
    expect(() => parseImport("null")).toThrow(/Not an object/);
  });

  it("rejects payloads missing the progress field", () => {
    expect(() => parseImport(JSON.stringify({ schemaVersion: 2 }))).toThrow(/Missing `progress`/);
  });

  it("rejects payloads from a future schema version", () => {
    expect(() => parseImport(JSON.stringify({ progress: {}, schemaVersion: 99 }))).toThrow(
      /schema v99/,
    );
  });

  it("upgrades a v1 import to current schema", () => {
    const v1 = JSON.stringify({ progress: { 学: { ease: 2.5, interval: 6, reps: 2, due: 1, lastReview: 0 } } });
    const out = parseImport(v1);
    expect(out.schemaVersion).toBe(SCHEMA_VERSION);
    expect(out.progress["学"].interval).toBe(6);
    expect(out.userDecks).toEqual([]);
  });
});

describe("updateStreak", () => {
  it("first-ever review sets current=1 and lastActiveDay", () => {
    const next = updateStreak({ current: 0, longest: 0, lastActiveDay: null }, "2026-04-17");
    expect(next).toEqual({ current: 1, longest: 1, lastActiveDay: "2026-04-17" });
  });

  it("same-day review is a no-op", () => {
    const start = { current: 5, longest: 10, lastActiveDay: "2026-04-17" };
    expect(updateStreak(start, "2026-04-17")).toEqual(start);
  });

  it("consecutive days extend the streak", () => {
    const next = updateStreak({ current: 5, longest: 10, lastActiveDay: "2026-04-17" }, "2026-04-18");
    expect(next.current).toBe(6);
    expect(next.longest).toBe(10);
  });

  it("a gap resets current to 1 but preserves longest", () => {
    const next = updateStreak({ current: 5, longest: 10, lastActiveDay: "2026-04-17" }, "2026-04-19");
    expect(next.current).toBe(1);
    expect(next.longest).toBe(10);
  });
});

describe("daysBetween", () => {
  it("counts whole days regardless of clock time", () => {
    expect(daysBetween("2026-04-17", "2026-04-18")).toBe(1);
    expect(daysBetween("2026-04-17", "2026-04-17")).toBe(0);
    expect(daysBetween("2026-01-01", "2026-02-01")).toBe(31);
  });
});
