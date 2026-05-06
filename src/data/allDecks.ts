/**
 * Combined deck registry: default decks (compiled in at build time) plus
 * user-created decks (live from {@link AppState.userDecks}).
 *
 * Keep this thin — call sites can use `useMemo(() => allDecks(state), …)` to
 * avoid recomputing on every render.
 */

import type { AppState, Deck } from "@/types";
import { userDeckToRuntime } from "@/userDecks/userDecks";

import { DECKS as DEFAULT_DECKS } from "./decks";

export function allDecks(state: AppState): Deck[] {
  if (state.userDecks.length === 0) return DEFAULT_DECKS;
  return [...DEFAULT_DECKS, ...state.userDecks.map(userDeckToRuntime)];
}

export { DEFAULT_DECKS };
