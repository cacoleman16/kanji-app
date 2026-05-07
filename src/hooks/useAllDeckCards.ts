import { useEffect, useMemo, useState } from "react";

import { preloadAllDefaultDeckCards } from "@/data/decks";
import type { Deck } from "@/types";

interface UseAllDeckCardsResult {
  /** True until every default deck has resolved its lazy-loaded cards. */
  loading: boolean;
  /** The same input list, but each default deck has its `cards` array filled. */
  hydratedDecks: Deck[];
  /** Network error from a dynamic import, if any. */
  error: Error | null;
}

/**
 * Hydrate every default deck in the input list. User-created decks pass
 * through unchanged. Used by `MixedReview` and the synthetic `mixedStudy`
 * route, which need to iterate cards across the whole library to compute
 * due counts and build a cross-deck queue.
 *
 * After the first call (per session) `preloadAllDefaultDeckCards` resolves
 * from cache, so subsequent visits to Mixed Review are instant.
 */
export function useAllDeckCards(decks: Deck[]): UseAllDeckCardsResult {
  const [byId, setById] = useState<Map<string, Deck["cards"]> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    preloadAllDefaultDeckCards()
      .then((map) => {
        if (cancelled) return;
        setById(map);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hydratedDecks = useMemo<Deck[]>(() => {
    if (!byId) return decks;
    return decks.map((d) => {
      if (d.userCreated || d.cards.length > 0) return d;
      const cards = byId.get(d.id);
      return cards ? { ...d, cards } : d;
    });
  }, [decks, byId]);

  return { loading: byId === null && error === null, hydratedDecks, error };
}
