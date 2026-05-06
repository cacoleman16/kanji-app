import { describe, expect, it } from "vitest";

import type { AppState, Deck, KanjiCard } from "@/types";
import { buildMixedDeck, buildQueue, dueCountsByJlpt } from "./queue";

const NOW = 1_700_000_000_000;

const makeCard = (k: string, jlpt: KanjiCard["jlpt"] = "N5"): KanjiCard => ({
  kanji: k,
  meanings: [],
  on_yomi: [],
  kun_yomi: [],
  examples: [],
  keyword: "",
  jlpt,
});

const cardsA = [makeCard("一"), makeCard("二"), makeCard("三")];
const cardsB = [makeCard("一", "N4"), makeCard("四", "N4")]; // 一 overlaps with deck A

const deckA: Deck = {
  id: "a",
  name: "A",
  kind: "kanji",
  available: true,
  cards: cardsA,
};
const deckB: Deck = {
  id: "b",
  name: "B",
  kind: "kanji",
  available: true,
  cards: cardsB,
};

describe("buildQueue", () => {
  it("queues review cards first, then up to newPerDay fresh cards", () => {
    const progress: AppState["progress"] = {
      二: { ease: 2.5, interval: 1, reps: 1, due: NOW - 1, lastReview: NOW - 1 }, // due
    };
    const q = buildQueue(cardsA, progress, { newPerDay: 1, now: NOW });
    expect(q.map((c) => c.kanji)).toEqual(["二", "一"]);
  });

  it("includeAll returns every card regardless of due/new caps", () => {
    const progress: AppState["progress"] = {
      二: { ease: 2.5, interval: 30, reps: 5, due: NOW + 99 * 86_400_000, lastReview: NOW },
    };
    const q = buildQueue(cardsA, progress, { newPerDay: 0, now: NOW, includeAll: true });
    expect(q).toHaveLength(3);
  });

  it("respects newPerDay cap on fresh cards", () => {
    const q = buildQueue(cardsA, {}, { newPerDay: 2, now: NOW });
    expect(q.map((c) => c.kanji)).toEqual(["一", "二"]);
  });
});

describe("buildMixedDeck", () => {
  it("de-dupes the same kanji across decks and excludes non-due cards", () => {
    const progress: AppState["progress"] = {
      一: { ease: 2.5, interval: 1, reps: 1, due: NOW - 1, lastReview: NOW - 1 }, // due
      四: { ease: 2.5, interval: 5, reps: 2, due: NOW + 5 * 86_400_000, lastReview: NOW }, // not due
    };
    const mixed = buildMixedDeck([deckA, deckB], progress, "all", NOW);
    expect(mixed.cards.map((c) => c.kanji)).toEqual(["一"]);
  });

  it("filters by JLPT level", () => {
    const progress: AppState["progress"] = {
      一: { ease: 2.5, interval: 1, reps: 1, due: NOW - 1, lastReview: NOW - 1 },
      四: { ease: 2.5, interval: 1, reps: 1, due: NOW - 1, lastReview: NOW - 1 },
    };
    const onlyN4 = buildMixedDeck([deckA, deckB], progress, "N4", NOW);
    // 一 from deck A (N5) is filtered out before being added to `seen`, so the
    // N4 entry of 一 in deck B is then accepted; 四 is N4 → included.
    expect(onlyN4.cards.map((c) => c.kanji)).toEqual(["一", "四"]);
  });
});

describe("dueCountsByJlpt", () => {
  it("counts each kanji once across decks and bins by level", () => {
    const progress: AppState["progress"] = {
      一: { ease: 2.5, interval: 1, reps: 1, due: NOW - 1, lastReview: NOW - 1 },
      二: { ease: 2.5, interval: 1, reps: 1, due: NOW - 1, lastReview: NOW - 1 },
      四: { ease: 2.5, interval: 1, reps: 1, due: NOW - 1, lastReview: NOW - 1 },
    };
    const counts = dueCountsByJlpt([deckA, deckB], progress, NOW);
    expect(counts.all).toBe(3);
    expect(counts.N5).toBe(2); // 一, 二 (deck A first-encounter)
    expect(counts.N4).toBe(1); // 四
  });
});
