/**
 * Session-queue construction. Decides which cards a learner should see right now.
 *
 * Ported from legacy/kanji-app.html lines 3596–3648.
 */

import type { AnyCard, AppState, Deck, Jlpt } from "@/types";

export interface BuildQueueOpts {
  newPerDay: number;
  now: number;
  /** When true, ignore `due` and `newPerDay` and queue every card. */
  includeAll?: boolean;
}

/**
 * Build the queue of cards for a single deck.
 *
 * Order: review (already due) → new (capped) → not-due (only if includeAll).
 */
export function buildQueue(
  deckCards: AnyCard[],
  progress: AppState["progress"],
  { newPerDay, now, includeAll = false }: BuildQueueOpts,
): AnyCard[] {
  const review: AnyCard[] = [];
  const fresh: AnyCard[] = [];
  const notDue: AnyCard[] = [];
  for (const c of deckCards) {
    const p = progress[c.kanji];
    if (!p) fresh.push(c);
    else if (p.due <= now) review.push(c);
    else notDue.push(c);
  }
  if (includeAll) return [...review, ...notDue, ...fresh];
  return [...review, ...fresh.slice(0, newPerDay)];
}

/**
 * Pool due kanji cards across every deck, optionally filtered by JLPT level.
 *
 * De-dupes by `kanji` because the same kanji appears in multiple decks but
 * shares one progress entry — we should only review it once per session.
 *
 * Returns a synthetic deck so the Study screen can consume it like any other deck.
 */
export function buildMixedDeck(
  decks: Deck[],
  progress: AppState["progress"],
  jlptFilter: Jlpt | "all",
  now: number,
): Deck {
  const seen = new Set<string>();
  const cards: AnyCard[] = [];
  for (const d of decks) {
    if (d.available === false) continue;
    if (d.kind !== "kanji") continue;
    for (const c of d.cards) {
      if (seen.has(c.kanji)) continue;
      const p = progress[c.kanji];
      if (!p || p.due > now) continue;
      if (jlptFilter !== "all" && c.jlpt !== jlptFilter) continue;
      seen.add(c.kanji);
      cards.push(c);
    }
  }
  return {
    id: "__mixed__",
    name: "Mixed Review",
    subtitle: `${cards.length} due`,
    kind: "kanji",
    available: true,
    cards,
  };
}

export type DueCounts = Record<"all" | Jlpt | "none", number>;

/** Per-level breakdown of due kanji across all kanji decks. */
export function dueCountsByJlpt(
  decks: Deck[],
  progress: AppState["progress"],
  now: number,
): DueCounts {
  const seen = new Set<string>();
  const counts: DueCounts = { all: 0, N5: 0, N4: 0, N3: 0, N2: 0, N1: 0, none: 0 };
  for (const d of decks) {
    if (d.available === false) continue;
    if (d.kind !== "kanji") continue;
    for (const c of d.cards) {
      if (seen.has(c.kanji)) continue;
      const p = progress[c.kanji];
      if (!p || p.due > now) continue;
      seen.add(c.kanji);
      counts.all++;
      const lvl = c.jlpt && counts[c.jlpt] !== undefined ? c.jlpt : "none";
      counts[lvl]++;
    }
  }
  return counts;
}

/** In-place Fisher–Yates shuffle. */
export function shuffleArray<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
