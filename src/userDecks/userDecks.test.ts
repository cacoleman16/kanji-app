import { describe, expect, it } from "vitest";

import { DEFAULT_STATE } from "@/storage/state";
import type { AppState, UserCard } from "@/types";
import {
  addCard,
  createDeck,
  deleteCard,
  deleteDeck,
  makeUserDeckId,
  renameDeck,
  setDeckCards,
  updateCard,
  userDeckToRuntime,
} from "./userDecks";

const card = (kanji: string, meaning: string): UserCard => ({
  kanji,
  meanings: [meaning],
});

const seedState = (): AppState => structuredClone(DEFAULT_STATE);

describe("makeUserDeckId", () => {
  it("slugifies the name and stamps the epoch", () => {
    const id = makeUserDeckId("My テスト Deck!!!", 1700000000000);
    expect(id).toBe("user-my-deck-1700000000000");
  });

  it("falls back to 'deck' for all-non-ascii names", () => {
    const id = makeUserDeckId("テスト", 1);
    expect(id).toBe("user-deck-1");
  });
});

describe("createDeck / renameDeck / deleteDeck", () => {
  it("creates a deck and returns a new state", () => {
    const s0 = seedState();
    const s1 = createDeck(s0, "Mine", "kanji");
    expect(s0.userDecks).toHaveLength(0); // unchanged
    expect(s1.userDecks).toHaveLength(1);
    expect(s1.userDecks[0].name).toBe("Mine");
    expect(s1.userDecks[0].kind).toBe("kanji");
  });

  it("trims whitespace and falls back to a placeholder name", () => {
    const s = createDeck(seedState(), "   ", "vocab");
    expect(s.userDecks[0].name).toBe("Untitled deck");
  });

  it("renames an existing deck and bumps updatedAt", () => {
    const s1 = createDeck(seedState(), "Old", "kanji");
    const id = s1.userDecks[0].id;
    const before = s1.userDecks[0].updatedAt;
    const s2 = renameDeck(s1, id, "New");
    expect(s2.userDecks[0].name).toBe("New");
    expect(s2.userDecks[0].updatedAt).toBeGreaterThanOrEqual(before);
  });

  it("deleteDeck removes only the targeted deck", () => {
    const s = createDeck(createDeck(seedState(), "A", "kanji"), "B", "vocab");
    const idA = s.userDecks[0].id;
    const next = deleteDeck(s, idA);
    expect(next.userDecks).toHaveLength(1);
    expect(next.userDecks[0].name).toBe("B");
  });
});

describe("card mutations", () => {
  const setup = () => {
    const s1 = createDeck(seedState(), "Mine", "kanji");
    return { state: s1, deckId: s1.userDecks[0].id };
  };

  it("addCard appends to the deck's cards", () => {
    const { state, deckId } = setup();
    const next = addCard(state, deckId, card("一", "one"));
    expect(next.userDecks[0].cards).toHaveLength(1);
    expect(next.userDecks[0].cards[0].kanji).toBe("一");
  });

  it("setDeckCards replaces the entire card list", () => {
    const { state, deckId } = setup();
    const next = setDeckCards(state, deckId, [card("一", "one"), card("二", "two")]);
    expect(next.userDecks[0].cards.map((c) => c.kanji)).toEqual(["一", "二"]);
  });

  it("updateCard replaces the card at the given index", () => {
    const { state, deckId } = setup();
    const s = setDeckCards(state, deckId, [card("一", "one"), card("二", "two")]);
    const next = updateCard(s, deckId, 1, card("三", "three"));
    expect(next.userDecks[0].cards[1].kanji).toBe("三");
  });

  it("updateCard ignores out-of-range indices", () => {
    const { state, deckId } = setup();
    const s = setDeckCards(state, deckId, [card("一", "one")]);
    const next = updateCard(s, deckId, 99, card("二", "two"));
    expect(next).toEqual(s);
  });

  it("deleteCard removes the card at the given index", () => {
    const { state, deckId } = setup();
    const s = setDeckCards(state, deckId, [card("一", "one"), card("二", "two")]);
    const next = deleteCard(s, deckId, 0);
    expect(next.userDecks[0].cards).toEqual([card("二", "two")]);
  });
});

describe("userDeckToRuntime", () => {
  it("produces a Deck with userCreated=true and a kanji subtitle", () => {
    const s = setDeckCards(createDeck(seedState(), "K", "kanji"), "tmp", []);
    // setDeckCards on a non-existent deck is a no-op; use the real deck
    const real = s.userDecks[0];
    const cards = [card("一", "one"), card("二", "two")];
    const ud = { ...real, cards };
    const rt = userDeckToRuntime(ud);
    expect(rt.kind).toBe("kanji");
    expect(rt.userCreated).toBe(true);
    expect(rt.subtitle).toBe("2 kanji");
    expect(rt.cards).toHaveLength(2);
  });

  it("uses 'words' subtitle for vocab decks", () => {
    const s = createDeck(seedState(), "V", "vocab");
    const ud = s.userDecks[0];
    const rt = userDeckToRuntime(ud);
    expect(rt.subtitle).toBe("0 words");
  });
});
