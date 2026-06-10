/**
 * Persistent app-state load/save with versioned migrations.
 *
 * Ported from legacy/kanji-app.html lines 3658–3753. The schema (v2) is
 * intentionally identical to the old shape so existing localStorage entries
 * continue to load unchanged.
 */

import { APP_VERSION } from "@/data/version";
import type { AppState } from "@/types";
import { LocalStorageProvider, type StorageProvider } from "./provider";

export const STORAGE_KEY = "kanji-app";
export const LEGACY_V1_KEY = "kanji-app-v1";
export const SCHEMA_VERSION = 5;

export const DEFAULT_STATE: AppState = {
  schemaVersion: SCHEMA_VERSION,
  progress: {},
  stats: { byDay: {} },
  settings: {
    dailyGoal: 30,
    newPerDay: 10,
    cardBackFontSize: "medium",
    // "system" follows OS appearance and updates live; users who set an
    // explicit dark/light value keep it (settings merge favors stored values).
    theme: "system",
    vocabDirection: "ja-en",
    onboardingComplete: false,
    // Fresh installs start "caught up" with the running version so they
    // don't see a What's-New modal for a release they never lived through.
    lastSeenVersion: APP_VERSION,
  },
  streak: { current: 0, longest: 0, lastActiveDay: null },
  userDecks: [],
  pro: { active: false },
};

type RawState = Partial<AppState> & { schemaVersion?: number };

/**
 * Map of from-version → function(oldState) → newState.
 *
 * v1 → v2: added `schemaVersion` field (shape otherwise identical).
 * v2 → v3: added `userDecks: UserDeck[]` to support custom decks (M2 Phase 3).
 * v3 → v4: added `pro: Entitlement` for paywall gates (M3).
 * v4 → v5: added `settings.onboardingComplete` for first-run flow.
 *          Existing users of v1–v4 are treated as already-onboarded so the
 *          flow doesn't disrupt them; only fresh installs see it.
 */
const MIGRATIONS: Record<number, (s: RawState) => RawState> = {
  1: (s) => ({ ...s, schemaVersion: 2 }),
  2: (s) => ({ ...s, schemaVersion: 3, userDecks: s.userDecks ?? [] }),
  3: (s) => ({ ...s, schemaVersion: 4, pro: s.pro ?? { active: false } }),
  4: (s) => ({
    ...s,
    schemaVersion: 5,
    settings: { ...(s.settings ?? {}), onboardingComplete: true } as RawState["settings"],
  }),
};

export function migrate(state: RawState): RawState {
  let s = state;
  let v = s.schemaVersion ?? 1;
  while (v < SCHEMA_VERSION) {
    const fn = MIGRATIONS[v];
    if (!fn) throw new Error(`No migration from schema v${v}`);
    s = fn(s);
    v = s.schemaVersion ?? v + 1;
  }
  return s;
}

/** Merge with DEFAULT_STATE so new top-level keys always exist. */
export function hydrate(parsed: RawState): AppState {
  return {
    ...structuredClone(DEFAULT_STATE),
    ...parsed,
    settings: { ...DEFAULT_STATE.settings, ...(parsed.settings ?? {}) },
    streak: { ...DEFAULT_STATE.streak, ...(parsed.streak ?? {}) },
    stats: { ...DEFAULT_STATE.stats, ...(parsed.stats ?? {}) },
    userDecks: parsed.userDecks ?? DEFAULT_STATE.userDecks,
    pro: { ...DEFAULT_STATE.pro, ...(parsed.pro ?? {}) },
  } as AppState;
}

export function loadState(provider: StorageProvider = new LocalStorageProvider()): AppState {
  try {
    let raw = provider.get(STORAGE_KEY);
    let fromLegacy = false;
    if (!raw) {
      raw = provider.get(LEGACY_V1_KEY);
      fromLegacy = !!raw;
    }
    if (!raw) return structuredClone(DEFAULT_STATE);
    let parsed = JSON.parse(raw) as RawState;
    if (fromLegacy && parsed.schemaVersion == null) parsed.schemaVersion = 1;
    parsed = migrate(parsed);
    const hydrated = hydrate(parsed);
    if (fromLegacy) {
      try {
        provider.set(STORAGE_KEY, JSON.stringify(hydrated));
      } catch {
        /* ignore */
      }
    }
    return hydrated;
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export interface SaveResult {
  /** False when the primary store rejected the write (quota, private mode). */
  ok: boolean;
  /** The serialized payload — reusable by callers (e.g. the native mirror). */
  serialized: string;
}

export function saveState(
  s: AppState,
  provider: StorageProvider = new LocalStorageProvider(),
): SaveResult {
  const serialized = JSON.stringify(s);
  const ok = provider.set(STORAGE_KEY, serialized);
  return { ok, serialized };
}

/** Validate + migrate an imported JSON blob. Returns hydrated state or throws. */
export function parseImport(text: string): AppState {
  const parsed = JSON.parse(text) as RawState;
  if (typeof parsed !== "object" || parsed === null) throw new Error("Not an object");
  if (!("progress" in parsed)) throw new Error("Missing `progress` field");
  if (parsed.schemaVersion == null) parsed.schemaVersion = 1;
  if (parsed.schemaVersion > SCHEMA_VERSION) {
    throw new Error(
      `Backup is schema v${parsed.schemaVersion}; this app only knows up to v${SCHEMA_VERSION}`,
    );
  }
  return hydrate(migrate(parsed));
}

export function todayStr(d: Date = new Date()): string {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function daysBetween(a: string, b: string): number {
  const d1 = new Date(a);
  const d2 = new Date(b);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000));
}

export function updateStreak(streak: AppState["streak"], nowStr: string): AppState["streak"] {
  if (streak.lastActiveDay === nowStr) return streak; // already counted
  if (!streak.lastActiveDay) {
    return { current: 1, longest: Math.max(1, streak.longest), lastActiveDay: nowStr };
  }
  const gap = daysBetween(streak.lastActiveDay, nowStr);
  const current = gap === 1 ? streak.current + 1 : 1;
  return {
    current,
    longest: Math.max(streak.longest, current),
    lastActiveDay: nowStr,
  };
}
