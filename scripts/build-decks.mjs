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
 *   - kanji_jouyou_grade_1.json … kanji_jouyou_grade_6.json
 *   - kanji_jouyou_secondary.json
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

/**
 * Convert one entry from kanji-data into our runtime KanjiCard shape.
 * Examples are intentionally empty — we don't have JMdict joined here yet.
 * Keyword is the first (most-prototypical) meaning.
 */
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

/** Sort cards by frequency rank (most common first), with unranked at the end. */
function freqSort(a, b) {
  const fa = a._freq ?? Number.POSITIVE_INFINITY;
  const fb = b._freq ?? Number.POSITIVE_INFINITY;
  if (fa !== fb) return fa - fb;
  // Stable secondary: stroke count, then literal codepoint
  return (a.stroke_count ?? 99) - (b.stroke_count ?? 99) || a.kanji.localeCompare(b.kanji);
}

/** Write one deck JSON in the existing agent-files schema. */
function writeDeck({ deckId, deckName, notes, cards, fileName }) {
  // Strip the internal _freq sort key before serializing.
  const cleaned = cards.map(({ _freq: _f, ...rest }) => rest);
  const payload = {
    deck_id: deckId,
    deck_name: deckName,
    version: "1.0",
    card_count: cleaned.length,
    notes,
    source:
      "Aggregated from KANJIDIC2 (CC-BY-SA, EDRDG), JLPT Resources (Jonathan Waller), and WaniKani.",
    cards: cleaned,
  };
  const path = join(OUT_DIR, fileName);
  writeFileSync(path, JSON.stringify(payload, null, 2) + "\n");
  console.log(`  ${fileName.padEnd(36)} ${cleaned.length} cards`);
}

// ============================================================
// Build JLPT N5–N1 decks
// ============================================================

const jlptBuckets = { N5: [], N4: [], N3: [], N2: [], N1: [] };
const jouyouBuckets = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
  secondary: [], // grade 8 in the dataset
};

for (const [literal, entry] of Object.entries(raw)) {
  const jlpt = jlptCode(entry.jlpt_new);
  const grade = entry.grade;

  // Build the per-card "decks" attribution list.
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
}

console.log("Writing JLPT decks → agent-files/\n");
const JLPT_NOTES = {
  N5: "Beginner kanji (~80 characters). The starter set learners encounter first.",
  N4: "Elementary kanji. Builds on N5; covers basic everyday vocabulary.",
  N3: "Intermediate kanji. Newspaper headlines and practical reading start here.",
  N2: "Upper-intermediate kanji. Required for most professional work in Japan.",
  N1: "Advanced kanji. Literary, technical, and rarely-used characters.",
};

for (const level of /** @type {const} */ (["N5", "N4", "N3", "N2", "N1"])) {
  const cards = jlptBuckets[level].sort(freqSort);
  writeDeck({
    deckId: `kanji-jlpt-${level.toLowerCase()}`,
    deckName: `JLPT ${level} Kanji`,
    notes: JLPT_NOTES[level],
    cards,
    fileName: `kanji_jlpt_${level.toLowerCase()}.json`,
  });
}

console.log("\nWriting Jōyō-by-grade decks → agent-files/\n");
const GRADE_NOTES = {
  1: "First-grade Jōyō kanji (80 characters). What Japanese first-graders learn.",
  2: "Second-grade Jōyō kanji (160 characters).",
  3: "Third-grade Jōyō kanji (200 characters).",
  4: "Fourth-grade Jōyō kanji (200 characters).",
  5: "Fifth-grade Jōyō kanji (185 characters).",
  6: "Sixth-grade Jōyō kanji (181 characters).",
  secondary:
    "Secondary-school Jōyō kanji (~1,110 characters not covered in elementary grades).",
};

for (const grade of [1, 2, 3, 4, 5, 6]) {
  const cards = jouyouBuckets[grade].sort(freqSort);
  writeDeck({
    deckId: `kanji-jouyou-grade-${grade}`,
    deckName: `Jōyō Kanji — Grade ${grade}`,
    notes: GRADE_NOTES[grade],
    cards,
    fileName: `kanji_jouyou_grade_${grade}.json`,
  });
}
{
  const cards = jouyouBuckets.secondary.sort(freqSort);
  writeDeck({
    deckId: "kanji-jouyou-secondary",
    deckName: "Jōyō Kanji — Secondary School",
    notes: GRADE_NOTES.secondary,
    cards,
    fileName: "kanji_jouyou_secondary.json",
  });
}

console.log("\n✓ Default decks rebuilt.");
console.log(
  "  Note: examples[] are empty (KANJIDIC2 doesn't ship example sentences).",
);
console.log(
  "  Wire JMdict in a follow-up if you want example words populated automatically.",
);
