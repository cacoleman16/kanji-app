import { describe, expect, it } from "vitest";

import { DEFAULT_STATE } from "@/storage/state";
import type { AppState, CardProgress, Deck, KanjiCard } from "@/types";

import { recommendNextDeck } from "./recommendDeck";

function card(kanji: string): KanjiCard {
  return {
    kanji,
    meanings: [kanji],
    on_yomi: [],
    kun_yomi: [],
    examples: [],
    keyword: kanji,
  };
}

function deck(id: string, kanjis: string[], opts?: { name?: string }): Deck {
  return {
    id,
    name: opts?.name ?? id,
    kind: "kanji",
    cardCount: kanjis.length,
    cards: kanjis.map(card),
  };
}

function masteredProgress(): CardProgress {
  return {
    ease: 2.6,
    interval: 60,
    reps: 5,
    due: Date.now() + 60 * 86_400_000,
    lastReview: Date.now(),
  };
}

function makeState(progressKeys: string[] = [], pro = true): AppState {
  const progress: Record<string, CardProgress> = {};
  for (const k of progressKeys) progress[k] = masteredProgress();
  return {
    ...DEFAULT_STATE,
    pro: pro ? { active: true, plan: "comp" } : { active: false },
    progress,
  };
}

describe("recommendNextDeck", () => {
  it("recommends staying in the current deck when new cards remain", () => {
    const current = deck("kanji-x", ["a", "b", "c"]);
    const all = [current, deck("kanji-y", ["d"])];
    const rec = recommendNextDeck(current, all, makeState([]));
    expect(rec?.deck.id).toBe("kanji-x");
    expect(rec?.reason).toMatch(/3 new/);
  });

  it("recommends staying when learned but unmastered cards remain", () => {
    const current = deck("kanji-x", ["a", "b"]);
    // Both cards learned but not yet mastered → still maturing.
    const learning: CardProgress = {
      ease: 2.5,
      interval: 5,
      reps: 1,
      due: Date.now() + 5 * 86_400_000,
      lastReview: Date.now(),
    };
    const state: AppState = {
      ...DEFAULT_STATE,
      pro: { active: true, plan: "comp" },
      progress: { a: learning, b: learning },
    };
    const all = [current, deck("kanji-y", ["c"])];
    const rec = recommendNextDeck(current, all, state);
    expect(rec?.deck.id).toBe("kanji-x");
    expect(rec?.reason).toMatch(/maturing/);
  });

  it("walks the JLPT series N5 → N4 → N3 …", () => {
    const n5 = deck("kanji-jlpt-n5", ["五"]);
    const n4 = deck("kanji-jlpt-n4", ["四"]);
    const n3 = deck("kanji-jlpt-n3", ["三"]);
    const all = [n5, n4, n3];
    const rec = recommendNextDeck(n5, all, makeState(["五"]));
    expect(rec?.deck.id).toBe("kanji-jlpt-n4");
    expect(rec?.reason).toMatch(/N4/i);
  });

  it("walks the Jōyō grade series", () => {
    const g1 = deck("kanji-jouyou-g1", ["一"]);
    const g2 = deck("kanji-jouyou-g2", ["二"]);
    const rec = recommendNextDeck(g1, [g1, g2], makeState(["一"]));
    expect(rec?.deck.id).toBe("kanji-jouyou-g2");
  });

  it("falls back to the deck with the most new cards when out of series", () => {
    const current = deck("kanji-z", ["x"]);
    const small = deck("kanji-small", ["a"]);
    const big = deck("kanji-big", ["a", "b", "c", "d", "e"]);
    const rec = recommendNextDeck(current, [current, small, big], makeState(["x"]));
    expect(rec?.deck.id).toBe("kanji-big");
    expect(rec?.reason).toMatch(/5 new/);
  });

  it("never recommends a locked deck", () => {
    const current = deck("kanji-x", ["a"]);
    // Free user — non-free decks are locked.
    const locked = deck("kanji-jlpt-n4", ["b", "c"]);
    const rec = recommendNextDeck(current, [current, locked], makeState(["a"], false));
    // Current deck has nothing left, locked deck can't be suggested → null.
    expect(rec).toBeNull();
  });

  it("returns null when the user has no work left anywhere", () => {
    const current = deck("kanji-x", ["a"]);
    const other = deck("kanji-y", ["b"]);
    const rec = recommendNextDeck(current, [current, other], makeState(["a", "b"]));
    expect(rec).toBeNull();
  });
});
