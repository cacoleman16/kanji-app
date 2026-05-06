/**
 * Deck-group definitions. Groups bundle related decks (e.g. "Integrated
 * Approach Ch.1–15") under a single Home tile that opens a chapter list.
 *
 * Ported from legacy/kanji-app.html lines 3475–3506.
 */

import type { Deck } from "@/types";
import { DECKS } from "./decks";

export interface DeckGroup {
  id: string;
  name: string;
  short: string;
  match: (d: Deck) => boolean;
  chapterNum: (d: Deck) => number;
  variant: (d: Deck) => "writing" | "reading";
  variantLabel: (d: Deck) => string;
  variantOrder: (d: Deck) => number;
}

export const DECK_GROUPS: DeckGroup[] = [
  {
    id: "integrated-intermediate",
    name: "An Integrated Approach to Intermediate Japanese",
    short: "Integrated Intermediate",
    match: (d) => d.id.startsWith("integrated-intermediate-ch"),
    chapterNum: (d) => {
      const m = d.id.match(/ch(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    },
    variant: (d) => (d.id.endsWith("-recognition") ? "reading" : "writing"),
    variantLabel: (d) =>
      d.id.endsWith("-recognition") ? "Reading only 読めればいい" : "Writing",
    variantOrder: (d) => (d.id.endsWith("-recognition") ? 1 : 0),
  },
];

export function groupFor(deck: Deck): DeckGroup | null {
  return DECK_GROUPS.find((g) => g.match(deck)) ?? null;
}

export function decksInGroup(group: DeckGroup): Deck[] {
  return DECKS.filter((d) => group.match(d)).sort((a, b) => {
    const dc = group.chapterNum(a) - group.chapterNum(b);
    if (dc !== 0) return dc;
    return group.variantOrder(a) - group.variantOrder(b);
  });
}

export function ungroupedDecks(): Deck[] {
  return DECKS.filter((d) => !groupFor(d));
}
