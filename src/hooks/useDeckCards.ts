import { useEffect, useState } from "react";

import { loadDeckCards } from "@/data/decks";
import type { AnyCard, Deck } from "@/types";

interface UseDeckCardsResult {
  /** True while the dynamic import is in flight. */
  loading: boolean;
  /** Same Deck shell as the input, but with `cards` hydrated from the JSON. */
  hydratedDeck: Deck | null;
  /** Error from the dynamic import (rare — usually a network blip on first run). */
  error: Error | null;
}

/**
 * Hydrate a default deck's `cards` array on mount.
 *
 * The `Deck` shells exported by `DECKS` come from `deck-index.generated.ts`
 * and have `cards: []`. Screens that need to iterate cards (Study, DeckDetail,
 * MixedReview) call this hook with the deck shell and get back a fully-
 * populated deck once the dynamic import resolves.
 *
 * User-created decks (`deck.userCreated === true`) bypass the loader: their
 * cards live in `state.userDecks` and are already populated, so the hook
 * resolves synchronously on first render.
 *
 * Subsequent calls for the same deck id resolve from cache (set inside
 * `loadDeckCards`) so navigating Study → Done → re-Study is instant.
 */
export function useDeckCards(deck: Deck | undefined | null): UseDeckCardsResult {
  // User decks (or pre-hydrated decks like the Mixed-Review aggregate) come
  // in already-populated. Skip the dynamic import entirely.
  const alreadyLoaded = !!deck && (deck.cards.length > 0 || deck.userCreated);

  const [hydratedDeck, setHydratedDeck] = useState<Deck | null>(
    alreadyLoaded && deck ? deck : null,
  );
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(!alreadyLoaded && !!deck);

  useEffect(() => {
    if (!deck) {
      setHydratedDeck(null);
      setLoading(false);
      return;
    }
    if (deck.cards.length > 0 || deck.userCreated) {
      setHydratedDeck(deck);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadDeckCards(deck.id)
      .then((cards: AnyCard[]) => {
        if (cancelled) return;
        setHydratedDeck({ ...deck, cards });
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [deck]);

  return { hydratedDeck, loading, error };
}
