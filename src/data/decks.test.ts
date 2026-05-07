import { describe, expect, it } from "vitest";

import { DECKS, _resetDeckCardsCacheForTests, loadDeckCards } from "./decks";
import { DECK_INDEX } from "./deck-index.generated";

describe("DECKS registry", () => {
  it("exposes a Deck shell for every entry in the index", () => {
    expect(DECKS.length).toBe(DECK_INDEX.length);
    for (const entry of DECK_INDEX) {
      const deck = DECKS.find((d) => d.id === entry.id);
      expect(deck).toBeDefined();
      expect(deck?.name).toBe(entry.name);
      expect(deck?.cardCount).toBe(entry.cardCount);
    }
  });

  it("starts with empty cards (lazy-loaded on demand)", () => {
    for (const d of DECKS) {
      expect(d.cards).toEqual([]);
    }
  });

  it("exposes cardKeys synchronously for default decks", () => {
    const n5 = DECKS.find((d) => d.id === "kanji-jlpt-n5");
    expect(n5).toBeDefined();
    expect(n5?.cardKeys?.length).toBe(n5?.cardCount);
  });
});

describe("loadDeckCards", () => {
  it("rejects unknown deck ids", async () => {
    _resetDeckCardsCacheForTests();
    await expect(loadDeckCards("does-not-exist")).rejects.toThrow(/unknown deck/i);
  });

  it("returns the same Promise on repeated calls (caches)", () => {
    _resetDeckCardsCacheForTests();
    const a = loadDeckCards("kana-hiragana");
    const b = loadDeckCards("kana-hiragana");
    expect(a).toBe(b);
  });

  it("dynamic import resolves to a populated card array", async () => {
    _resetDeckCardsCacheForTests();
    const cards = await loadDeckCards("kana-hiragana");
    expect(Array.isArray(cards)).toBe(true);
    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0]).toHaveProperty("kanji");
  });
});
