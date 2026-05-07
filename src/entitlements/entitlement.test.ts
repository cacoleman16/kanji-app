import { describe, expect, it } from "vitest";

import { DEFAULT_STATE } from "@/storage/state";
import type { AppState, Deck } from "@/types";
import {
  FREE_LIMITS,
  canCreateUserDeck,
  canImportApkg,
  grantPro,
  isDeckUnlocked,
  isPro,
  revokePro,
  userDeckCardLimit,
} from "./entitlement";

const free = (): AppState => structuredClone(DEFAULT_STATE);
const pro = (): AppState => grantPro(free(), "monthly");

const fakeDeck = (id: string, overrides: Partial<Deck> = {}): Deck => ({
  id,
  name: id,
  kind: "kanji",
  cardCount: 0,
  cards: [],
  available: true,
  ...overrides,
});

describe("isPro", () => {
  it("free state is not Pro", () => {
    expect(isPro(free())).toBe(false);
  });

  it("granted state is Pro", () => {
    expect(isPro(pro())).toBe(true);
  });

  it("expired entitlement reverts to free", () => {
    const s = grantPro(free(), "monthly", { expiresAt: Date.now() - 1000 });
    expect(isPro(s)).toBe(false);
  });

  it("revokePro turns Pro off", () => {
    expect(isPro(revokePro(pro()))).toBe(false);
  });

  it("future expiry is still Pro", () => {
    const s = grantPro(free(), "yearly", { expiresAt: Date.now() + 365 * 86_400_000 });
    expect(isPro(s)).toBe(true);
  });
});

describe("isDeckUnlocked", () => {
  it("user-created decks are always unlocked", () => {
    expect(isDeckUnlocked(fakeDeck("user-1", { userCreated: true }), free())).toBe(true);
  });

  it("free users get the kana decks + JLPT N5 (the beginner gateway)", () => {
    expect(isDeckUnlocked(fakeDeck("kana-hiragana"), free())).toBe(true);
    expect(isDeckUnlocked(fakeDeck("kana-katakana"), free())).toBe(true);
    expect(isDeckUnlocked(fakeDeck("kanji-jlpt-n5"), free())).toBe(true);
  });

  it("free users do not get later JLPT levels or Jouyou or Top 100/500/1000", () => {
    expect(isDeckUnlocked(fakeDeck("kanji-jlpt-n4"), free())).toBe(false);
    expect(isDeckUnlocked(fakeDeck("kanji-jlpt-n3"), free())).toBe(false);
    expect(isDeckUnlocked(fakeDeck("kanji-jouyou-grade-1"), free())).toBe(false);
    expect(isDeckUnlocked(fakeDeck("kanji-top-100"), free())).toBe(false);
  });

  it("pro users get every default deck", () => {
    expect(isDeckUnlocked(fakeDeck("kanji-jlpt-n1"), pro())).toBe(true);
    expect(isDeckUnlocked(fakeDeck("kanji-jouyou-secondary"), pro())).toBe(true);
  });
});

describe("user-deck limits", () => {
  it("free users can create up to FREE_LIMITS.maxUserDecks", () => {
    const s0 = free();
    expect(canCreateUserDeck(s0)).toBe(true);
    const filled: AppState = {
      ...s0,
      userDecks: Array(FREE_LIMITS.maxUserDecks).fill(null).map((_, i) => ({
        id: `u-${i}`,
        name: `D${i}`,
        kind: "kanji",
        createdAt: 0,
        updatedAt: 0,
        cards: [],
      })),
    };
    expect(canCreateUserDeck(filled)).toBe(false);
  });

  it("pro users can create unlimited user decks", () => {
    const filled: AppState = {
      ...pro(),
      userDecks: Array(99).fill(null).map((_, i) => ({
        id: `u-${i}`,
        name: `D${i}`,
        kind: "kanji",
        createdAt: 0,
        updatedAt: 0,
        cards: [],
      })),
    };
    expect(canCreateUserDeck(filled)).toBe(true);
  });

  it("free users have a card cap; pro is Infinity", () => {
    expect(userDeckCardLimit(free())).toBe(FREE_LIMITS.maxCardsPerUserDeck);
    expect(userDeckCardLimit(pro())).toBe(Infinity);
  });
});

describe("canImportApkg", () => {
  it("is Pro-only", () => {
    expect(canImportApkg(free())).toBe(false);
    expect(canImportApkg(pro())).toBe(true);
  });
});
