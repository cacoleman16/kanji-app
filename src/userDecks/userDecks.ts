/**
 * User-deck CRUD helpers. All operations return a new {@link AppState} so they
 * compose cleanly with React's `setState((s) => updater(s))` pattern.
 */

import type { AnyCard, AppState, Deck, DeckKind, UserCard, UserDeck } from "@/types";

/** Generate a stable user-deck id from a name + epoch ms. */
export function makeUserDeckId(name: string, now: number = Date.now()): string {
  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "deck";
  return `user-${slug}-${now}`;
}

export function newUserDeck(name: string, kind: DeckKind, now: number = Date.now()): UserDeck {
  return {
    id: makeUserDeckId(name, now),
    name: name.trim() || "Untitled deck",
    kind,
    createdAt: now,
    updatedAt: now,
    cards: [],
  };
}

export function createDeck(state: AppState, name: string, kind: DeckKind): AppState {
  return { ...state, userDecks: [...state.userDecks, newUserDeck(name, kind)] };
}

export function renameDeck(state: AppState, deckId: string, name: string): AppState {
  return {
    ...state,
    userDecks: state.userDecks.map((d) =>
      d.id === deckId ? { ...d, name: name.trim() || d.name, updatedAt: Date.now() } : d,
    ),
  };
}

export function deleteDeck(state: AppState, deckId: string): AppState {
  return { ...state, userDecks: state.userDecks.filter((d) => d.id !== deckId) };
}

export function setDeckCards(state: AppState, deckId: string, cards: UserCard[]): AppState {
  return {
    ...state,
    userDecks: state.userDecks.map((d) =>
      d.id === deckId ? { ...d, cards, updatedAt: Date.now() } : d,
    ),
  };
}

export function addCard(state: AppState, deckId: string, card: UserCard): AppState {
  return setDeckCards(
    state,
    deckId,
    [...(state.userDecks.find((d) => d.id === deckId)?.cards ?? []), card],
  );
}

export function updateCard(
  state: AppState,
  deckId: string,
  cardIndex: number,
  card: UserCard,
): AppState {
  const deck = state.userDecks.find((d) => d.id === deckId);
  if (!deck) return state;
  const next = deck.cards.slice();
  if (cardIndex < 0 || cardIndex >= next.length) return state;
  next[cardIndex] = card;
  return setDeckCards(state, deckId, next);
}

export function deleteCard(state: AppState, deckId: string, cardIndex: number): AppState {
  const deck = state.userDecks.find((d) => d.id === deckId);
  if (!deck) return state;
  const next = deck.cards.slice();
  if (cardIndex < 0 || cardIndex >= next.length) return state;
  next.splice(cardIndex, 1);
  return setDeckCards(state, deckId, next);
}

/**
 * Convert a {@link UserDeck} into the runtime {@link Deck} shape so it can be
 * passed into the existing study/queue pipeline alongside default decks.
 */
export function userDeckToRuntime(ud: UserDeck): Deck {
  const subtitle = ud.kind === "vocab" ? `${ud.cards.length} words` : `${ud.cards.length} kanji`;
  return {
    id: ud.id,
    name: ud.name,
    subtitle,
    kind: ud.kind,
    available: true,
    userCreated: true,
    cards: ud.cards as AnyCard[],
  };
}
