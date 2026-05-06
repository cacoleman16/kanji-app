/**
 * Deck registry for the migrated app.
 *
 * Glob-imports every JSON file in /agent-files at build time and normalizes
 * them into the runtime {@link Deck} shape. Default decks are emitted by
 * scripts/build-decks.mjs (KANJIDIC2-derived kanji decks) and a small set of
 * hand-authored kana decks under /agent-files/kana_*.json.
 */

import type { AnyCard, Deck, KanjiCard, VocabCard } from "@/types";

interface RawDeckFile {
  deck_id: string;
  deck_name: string;
  /** Optional descriptive subtitle. Falls back to a card-count line when absent. */
  subtitle?: string;
  card_count?: number;
  cards: Array<Record<string, unknown>>;
}

/** Eagerly inline every agent-files JSON at build time. */
const filesKana = import.meta.glob<RawDeckFile>("/agent-files/kana_*.json", {
  eager: true,
  import: "default",
});
const filesKanji = import.meta.glob<RawDeckFile>("/agent-files/kanji_*.json", {
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

/**
 * Default-deck Home order. Lower numbers float to the top. Anything not in
 * the map sorts after these by deck_id.
 */
const ORDER: Record<string, number> = {
  // Kana — beginner gateway
  "kana-hiragana": 10,
  "kana-katakana": 20,

  // Themed vocab (free) — bridges kana to first kanji study
  "vocab-numbers": 30,
  "vocab-time": 40,

  // JLPT progression
  "kanji-jlpt-n5": 100,
  "kanji-jlpt-n4": 110,
  "kanji-jlpt-n3": 120,
  "kanji-jlpt-n2": 130,
  "kanji-jlpt-n1": 140,

  // Frequency tiers
  "kanji-top-100": 200,
  "kanji-top-500": 210,
  "kanji-top-1000": 220,

  // Jōyō by grade (Japanese school curriculum)
  "kanji-jouyou-grade-1": 300,
  "kanji-jouyou-grade-2": 310,
  "kanji-jouyou-grade-3": 320,
  "kanji-jouyou-grade-4": 330,
  "kanji-jouyou-grade-5": 340,
  "kanji-jouyou-grade-6": 350,
  "kanji-jouyou-secondary": 360,

  // Themed vocab (Pro)
  "vocab-counters": 400,
  "vocab-body": 410,
  "vocab-family": 420,
  "vocab-food": 430,
  "vocab-verbs": 440,
  "vocab-adjectives": 450,
};

function rank(id: string): number {
  return ORDER[id] ?? 9999;
}

function unitFor(kind: "kanji" | "vocab" | "kana"): string {
  if (kind === "vocab") return "words";
  if (kind === "kana") return "characters";
  return "kanji";
}

function buildDecks(): Deck[] {
  const out: Deck[] = [];

  // Hand-authored kana decks (id pattern: kana-*).
  for (const raw of Object.values(filesKana)) {
    out.push({
      id: raw.deck_id,
      name: raw.deck_name,
      subtitle: raw.subtitle ?? `${raw.cards.length} characters`,
      kind: "kanji", // shape-compatible with KanjiCard; "kanji" runtime route works
      available: true,
      cards: raw.cards.map(asKanjiCard) as AnyCard[],
    });
  }

  // KANJIDIC-derived default kanji decks.
  for (const raw of Object.values(filesKanji)) {
    out.push({
      id: raw.deck_id,
      name: raw.deck_name,
      subtitle: raw.subtitle ?? `${raw.cards.length} kanji`,
      kind: "kanji",
      available: true,
      cards: raw.cards.map(asKanjiCard) as AnyCard[],
    });
  }

  // (Legacy) Integrated Approach chapter decks — currently empty after M2.
  for (const raw of Object.values(filesIntegrated)) {
    out.push({
      id: raw.deck_id,
      name: raw.deck_name,
      subtitle: raw.subtitle ?? `${raw.cards.length} kanji`,
      kind: "kanji",
      available: true,
      cards: raw.cards.map(asKanjiCard) as AnyCard[],
    });
  }

  // Vocab decks (currently just the curated top-frequency vocab).
  for (const raw of Object.values(filesVocab)) {
    out.push({
      id: raw.deck_id,
      name: raw.deck_name,
      subtitle: raw.subtitle ?? `${raw.cards.length} ${unitFor("vocab")}`,
      kind: "vocab",
      available: true,
      cards: raw.cards.map(normalizeVocabCard) as AnyCard[],
    });
  }

  return out.sort((a, b) => rank(a.id) - rank(b.id) || a.name.localeCompare(b.name));
}

export const DECKS: Deck[] = buildDecks();
