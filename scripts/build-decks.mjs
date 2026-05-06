#!/usr/bin/env node
/**
 * Build default Kanjido decks from public-domain kanji data.
 *
 * Source: davidluzgouveia/kanji-data (kanji.json)
 *   — Aggregates KANJIDIC2 + Jonathan Waller's JLPT Resources + WaniKani.
 *   — KANJIDIC2 is licensed CC-BY-SA from EDRDG; the aggregated JSON inherits
 *     a permissive use license. Attribution preserved in deck metadata.
 *
 * Usage:
 *   1. Download once:
 *        mkdir -p data/raw
 *        curl -sL https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json \
 *          -o data/raw/kanji.json
 *   2. Run:    npm run build:decks
 *
 * Output (overwritten on each run, into agent-files/):
 *   - kanji_jlpt_n5.json … kanji_jlpt_n1.json     (5 decks)
 *   - kanji_jouyou_grade_1.json … grade_6.json + secondary  (7 decks)
 *   - kanji_top_100.json, top_500.json, top_1000.json       (3 decks)
 */
import { existsSync, writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SRC = join(ROOT, "data/raw/kanji.json");
const OUT_DIR = join(ROOT, "agent-files");

if (!existsSync(SRC)) {
  console.log("Kanjido deck builder — no source data found.\n");
  console.log("Download once:");
  console.log("  mkdir -p data/raw");
  console.log(
    "  curl -sL https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json -o data/raw/kanji.json",
  );
  console.log("\nThen re-run `npm run build:decks`.");
  process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });

const raw = JSON.parse(readFileSync(SRC, "utf8"));

// ============================================================
// Helpers
// ============================================================

/** jlpt_new is 1..5; convert to "N1".."N5". */
function jlptCode(n) {
  if (n == null) return null;
  return `N${n}`;
}

function toCard(literal, entry, deckLabels) {
  const meanings = Array.isArray(entry.meanings) ? entry.meanings : [];
  return {
    kanji: literal,
    meanings,
    on_yomi: Array.isArray(entry.readings_on) ? entry.readings_on : [],
    kun_yomi: Array.isArray(entry.readings_kun) ? entry.readings_kun : [],
    examples: [],
    keyword: (entry.wk_meanings?.[0] ?? meanings[0] ?? "").toString(),
    etymology: "",
    stroke_count: entry.strokes ?? null,
    jlpt: jlptCode(entry.jlpt_new),
    grade: entry.grade ?? null,
    decks: deckLabels,
  };
}

function freqSort(a, b) {
  const fa = a._freq ?? Number.POSITIVE_INFINITY;
  const fb = b._freq ?? Number.POSITIVE_INFINITY;
  if (fa !== fb) return fa - fb;
  return (a.stroke_count ?? 99) - (b.stroke_count ?? 99) || a.kanji.localeCompare(b.kanji);
}

function writeDeck({ deckId, deckName, subtitle, notes, cards, fileName }) {
  const cleaned = cards.map(({ _freq: _f, ...rest }) => rest);
  const payload = {
    deck_id: deckId,
    deck_name: deckName,
    subtitle,
    version: "1.0",
    card_count: cleaned.length,
    notes,
    source:
      "Aggregated from KANJIDIC2 (CC-BY-SA, EDRDG), JLPT Resources (Jonathan Waller), and WaniKani.",
    cards: cleaned,
  };
  writeFileSync(join(OUT_DIR, fileName), JSON.stringify(payload, null, 2) + "\n");
  console.log(`  ${fileName.padEnd(36)} ${cleaned.length.toString().padStart(5)} cards  · ${subtitle}`);
}

// ============================================================
// Bucketize the source data
// ============================================================

const jlptBuckets = { N5: [], N4: [], N3: [], N2: [], N1: [] };
const jouyouBuckets = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], secondary: [] };
/** Every kanji that has a frequency rank, sorted by it (1 = most common). */
const allRanked = [];

for (const [literal, entry] of Object.entries(raw)) {
  const jlpt = jlptCode(entry.jlpt_new);
  const grade = entry.grade;

  // Per-card "decks" attribution list (visible in the data, used by future
  // cross-deck features like "this kanji is also in JLPT N4").
  const labels = [];
  if (jlpt) labels.push(`JLPT ${jlpt}`);
  if (grade && grade <= 6) labels.push(`Jōyō Grade ${grade}`);
  else if (grade === 8) labels.push("Jōyō Secondary");

  if (jlpt) {
    const card = toCard(literal, entry, labels);
    card._freq = entry.freq;
    jlptBuckets[jlpt].push(card);
  }
  if (grade) {
    const card = toCard(literal, entry, labels);
    card._freq = entry.freq;
    if (grade <= 6) jouyouBuckets[grade].push(card);
    else if (grade === 8) jouyouBuckets.secondary.push(card);
  }
  if (entry.freq) {
    const card = toCard(literal, entry, labels);
    card._freq = entry.freq;
    allRanked.push(card);
  }
}
allRanked.sort(freqSort);

// ============================================================
// JLPT decks — polished labels + descriptive subtitles
// ============================================================

console.log("Writing JLPT decks → agent-files/\n");

const JLPT_DECKS = {
  N5: {
    name: "JLPT N5 — Beginner",
    subtitle: "Beginner · the first 80 kanji you'll meet",
    notes:
      "The starter set for JLPT N5. Numbers, days of the week, basic action verbs, and the most common content kanji.",
  },
  N4: {
    name: "JLPT N4 — Elementary",
    subtitle: "Elementary · everyday vocabulary kanji",
    notes:
      "Builds on N5; covers most of the kanji used in basic conversation and everyday written Japanese.",
  },
  N3: {
    name: "JLPT N3 — Intermediate",
    subtitle: "Intermediate · newspapers + practical reading",
    notes:
      "The biggest jump in the JLPT ladder. With N3 you can start reading manga, signage, and simplified news.",
  },
  N2: {
    name: "JLPT N2 — Upper-intermediate",
    subtitle: "Upper-intermediate · 95% of professional texts",
    notes:
      "Required for most professional work in Japan and for university-level reading. Rich kanji density.",
  },
  N1: {
    name: "JLPT N1 — Advanced",
    subtitle: "Advanced · literature, technical, archaic",
    notes:
      "The longest tier — over 1,000 advanced kanji including literary, technical, and rarely-used characters.",
  },
};

for (const level of /** @type {const} */ (["N5", "N4", "N3", "N2", "N1"])) {
  const cfg = JLPT_DECKS[level];
  const cards = jlptBuckets[level].sort(freqSort);
  writeDeck({
    deckId: `kanji-jlpt-${level.toLowerCase()}`,
    deckName: cfg.name,
    subtitle: cfg.subtitle,
    notes: cfg.notes,
    cards,
    fileName: `kanji_jlpt_${level.toLowerCase()}.json`,
  });
}

// ============================================================
// Jōyō by grade — with Japanese grade markers in the name
// ============================================================

console.log("\nWriting Jōyō-by-grade decks → agent-files/\n");

const GRADE_DECKS = {
  1: {
    name: "Jōyō · 1st grade (1年生)",
    subtitle: "First-grade kanji · Japanese 6-year-olds learn these",
    notes: "First grade Jōyō kanji — the foundational 80 every Japanese child learns first.",
  },
  2: {
    name: "Jōyō · 2nd grade (2年生)",
    subtitle: "Second-grade kanji · simple verbs + nature",
    notes: "Second grade Jōyō kanji — 160 characters covering basic verbs, nature, and time.",
  },
  3: {
    name: "Jōyō · 3rd grade (3年生)",
    subtitle: "Third-grade kanji · everyday objects + actions",
    notes: "Third grade Jōyō kanji — 200 more characters for everyday objects and actions.",
  },
  4: {
    name: "Jōyō · 4th grade (4年生)",
    subtitle: "Fourth-grade kanji · social + abstract concepts",
    notes: "Fourth grade Jōyō kanji — 200 characters covering more abstract concepts.",
  },
  5: {
    name: "Jōyō · 5th grade (5年生)",
    subtitle: "Fifth-grade kanji · complex compounds",
    notes: "Fifth grade Jōyō kanji — 185 characters used in formal writing.",
  },
  6: {
    name: "Jōyō · 6th grade (6年生)",
    subtitle: "Sixth-grade kanji · final elementary set",
    notes: "Sixth grade Jōyō kanji — the last 181 of the elementary curriculum.",
  },
  secondary: {
    name: "Jōyō · Secondary school (中学・高校)",
    subtitle: "Secondary kanji · everything past 6th grade",
    notes:
      "The remaining ~1,100 Jōyō kanji learners encounter in middle and high school. Covers most adult writing.",
  },
};

for (const grade of [1, 2, 3, 4, 5, 6]) {
  const cfg = GRADE_DECKS[grade];
  const cards = jouyouBuckets[grade].sort(freqSort);
  writeDeck({
    deckId: `kanji-jouyou-grade-${grade}`,
    deckName: cfg.name,
    subtitle: cfg.subtitle,
    notes: cfg.notes,
    cards,
    fileName: `kanji_jouyou_grade_${grade}.json`,
  });
}
{
  const cfg = GRADE_DECKS.secondary;
  const cards = jouyouBuckets.secondary.sort(freqSort);
  writeDeck({
    deckId: "kanji-jouyou-secondary",
    deckName: cfg.name,
    subtitle: cfg.subtitle,
    notes: cfg.notes,
    cards,
    fileName: "kanji_jouyou_secondary.json",
  });
}

// ============================================================
// Frequency tiers — Top 100 / 500 / 1000
// ============================================================

console.log("\nWriting frequency-tier decks → agent-files/\n");

const FREQ_TIERS = [
  {
    n: 100,
    deckId: "kanji-top-100",
    deckName: "Top 100 Kanji",
    subtitle: "Most-used kanji · covers ~50% of all written Japanese",
    notes:
      "The 100 most frequent kanji in Japanese newspapers (KANJIDIC2 newspaper-corpus rank). About 50% of all kanji you encounter in a newspaper are in this set.",
    fileName: "kanji_top_100.json",
  },
  {
    n: 500,
    deckId: "kanji-top-500",
    deckName: "Top 500 Kanji",
    subtitle: "High-frequency kanji · covers ~80% of newspapers",
    notes:
      "Top 500 by newspaper-corpus frequency. Knowing this set unlocks ~80% of news and contemporary reading material.",
    fileName: "kanji_top_500.json",
  },
  {
    n: 1000,
    deckId: "kanji-top-1000",
    deckName: "Top 1,000 Kanji",
    subtitle: "Common kanji · covers ~93% of contemporary text",
    notes:
      "Top 1,000 by frequency. Roughly 93% coverage of modern written Japanese, including most genres beyond technical literature.",
    fileName: "kanji_top_1000.json",
  },
];

for (const tier of FREQ_TIERS) {
  const cards = allRanked.slice(0, tier.n);
  writeDeck({ ...tier, cards });
}

console.log("\n✓ Default decks rebuilt.");
