/**
 * Deck registry for the migrated app.
 *
 * For Phase 1 we glob-import every JSON file in /agent-files at build time and
 * normalize them into the runtime {@link Deck} shape. Phase 2 replaces this
 * with a curated set of public-domain decks (JLPT N5–N1, Top Frequency, Jōyō
 * by grade) hosted under /src/data/decks/.
 */

import type { AnyCard, Deck, KanjiCard, VocabCard } from "@/types";

interface RawDeckFile {
  deck_id: string;
  deck_name: string;
  card_count?: number;
  cards: Array<Record<string, unknown>>;
}

/** Eagerly inline every agent-files JSON at build time. */
const filesKanjiTopFreq = import.meta.glob<RawDeckFile>("/agent-files/kanji_*.json", {
  eager: true,
  import: "default",
});
const filesIntegrated = import.meta.glob<RawDeckFile>("/agent-files/integrated_*.json", {
  eager: true,
  import: "default",
});
const filesVocab = import.meta.glob<RawDeckFile>("/agent-files/vocab_*.json", {
  eager: true,
  import: "default",
});

function normalizeVocabCard(c: Record<string, unknown>): VocabCard {
  // Vocab JSONs use `word` for the headword; runtime keys progress by `kanji`.
  const meanings = (c.meanings as string[] | undefined) ?? [];
  return {
    kanji: (c.word as string) ?? (c.kanji as string) ?? "",
    meanings,
    reading: (c.reading as string) ?? "",
    category: (c.category as string) ?? "",
    context: (c.context as string) ?? "",
    jlpt: (c.jlpt as VocabCard["jlpt"]) ?? undefined,
    example_sentence: (c.example_sentence as string) ?? "",
    example_reading: (c.example_reading as string) ?? "",
    example_meaning: (c.example_meaning as string) ?? "",
    on_yomi: [],
    kun_yomi: [],
    examples: [],
    keyword: meanings[0] ?? "",
    etymology: (c.context as string) ?? "",
  };
}

function asKanjiCard(c: Record<string, unknown>): KanjiCard {
  return c as unknown as KanjiCard;
}

function buildDecks(): Deck[] {
  const out: Deck[] = [];

  // Curated kanji decks (frequency-ranked, themed). Already in KanjiCard shape.
  for (const raw of Object.values(filesKanjiTopFreq)) {
    out.push({
      id: raw.deck_id,
      name: raw.deck_name,
      subtitle: `${raw.cards.length} kanji`,
      kind: "kanji",
      available: true,
      cards: raw.cards.map(asKanjiCard) as AnyCard[],
    });
  }

  // Integrated Approach chapter decks. Sorted by chapter for stable order.
  const integratedSorted = Object.entries(filesIntegrated).sort(([a], [b]) => a.localeCompare(b));
  for (const [, raw] of integratedSorted) {
    out.push({
      id: raw.deck_id,
      name: raw.deck_name,
      subtitle: `${raw.cards.length} kanji`,
      kind: "kanji",
      available: true,
      cards: raw.cards.map(asKanjiCard) as AnyCard[],
    });
  }

  // Vocab decks need normalization (word → kanji).
  const vocabSorted = Object.entries(filesVocab).sort(([a], [b]) => a.localeCompare(b));
  for (const [, raw] of vocabSorted) {
    out.push({
      id: raw.deck_id,
      name: raw.deck_name,
      subtitle: `${raw.cards.length} words`,
      kind: "vocab",
      available: true,
      cards: raw.cards.map(normalizeVocabCard) as AnyCard[],
    });
  }

  return out;
}

export const DECKS: Deck[] = buildDecks();
