#!/usr/bin/env node
/**
 * Enrich kanji decks with example compound words drawn from JMdict.
 *
 * Source: scriptin/jmdict-simplified (jmdict-eng-common JSON).
 *   JMdict is licensed CC-BY-SA from EDRDG. We use only the "common"
 *   subset (~22k words tagged as everyday/news vocabulary), pick the
 *   2-3 shortest common compounds containing each kanji, and write
 *   them back into the existing deck JSONs as { kanji, kana, meaning }
 *   triples. Attribution preserved in each deck's `source:` field.
 *
 * Usage:
 *   1. Download once:
 *        curl -sL https://github.com/scriptin/jmdict-simplified/releases/download/<TAG>/jmdict-eng-common-<TAG>.json.tgz \
 *          -o data/raw/jmdict-eng-common.json.tgz
 *        tar -xzf data/raw/jmdict-eng-common.json.tgz -C data/raw/
 *   2. Run:    npm run enrich:examples
 *
 * Re-running rebuilds the examples[] arrays in every kanji_*.json under
 * agent-files/. Cards that already had examples (e.g. hand-authored vocab
 * decks) are skipped.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const RAW_DIR = join(ROOT, "data/raw");
const OUT_DIR = join(ROOT, "agent-files");

// ============================================================
// 1. Locate the JMdict source
// ============================================================

function findJmdictSource() {
  if (!existsSync(RAW_DIR)) return null;
  const candidates = readdirSync(RAW_DIR).filter(
    (f) => f.startsWith("jmdict-eng-common") && f.endsWith(".json"),
  );
  if (candidates.length === 0) return null;
  // Latest version (lexicographic — matches version-sort for these names).
  candidates.sort();
  return join(RAW_DIR, candidates[candidates.length - 1]);
}

const SRC = findJmdictSource();
if (!SRC) {
  console.log("Kanjido example enricher — no JMdict source found.\n");
  console.log("Download once (replace <TAG> with the latest tag):");
  console.log(
    "  curl -sL https://github.com/scriptin/jmdict-simplified/releases/latest -o /tmp/jmdict-rel.json",
  );
  console.log(
    "  TAG=$(jq -r .tag_name /tmp/jmdict-rel.json | sed 's/+/%2B/g')   # url-encode +",
  );
  console.log(
    "  curl -sL https://github.com/scriptin/jmdict-simplified/releases/download/$TAG/jmdict-eng-common-$(echo $TAG | sed 's/%2B/+/').json.tgz \\",
  );
  console.log("    -o data/raw/jmdict-eng-common.json.tgz");
  console.log("  tar -xzf data/raw/jmdict-eng-common.json.tgz -C data/raw/");
  console.log("\nThen re-run: npm run enrich:examples");
  process.exit(0);
}

console.log(`Reading JMdict from ${SRC}...`);
const jmdict = JSON.parse(readFileSync(SRC, "utf8"));
const words = Array.isArray(jmdict.words) ? jmdict.words : [];
console.log(`  ${words.length.toLocaleString()} words loaded.\n`);

// ============================================================
// 2. Build kanji → [word, …] index, biased toward common short words
// ============================================================

/** Test if a code-point is in the CJK Unified Ideographs block. */
function isKanjiChar(ch) {
  const cp = ch.codePointAt(0);
  return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf);
}

/** Pick the most useful kanji form (common, with at least one kanji char). */
function primaryKanjiForm(word) {
  if (!Array.isArray(word.kanji) || word.kanji.length === 0) return null;
  const common = word.kanji.find((k) => k.common && [...(k.text ?? "")].some(isKanjiChar));
  if (common) return common;
  return word.kanji.find((k) => [...(k.text ?? "")].some(isKanjiChar)) ?? null;
}

/** Pick a kana reading that applies to the chosen kanji form. */
function readingFor(word, kanjiForm) {
  if (!Array.isArray(word.kana) || word.kana.length === 0) return "";
  // Prefer a "common" reading that explicitly applies to this kanji form,
  // or applies to all forms (empty appliesToKanji or "*").
  const matches = word.kana.filter(
    (k) =>
      k.common &&
      (!k.appliesToKanji ||
        k.appliesToKanji.length === 0 ||
        k.appliesToKanji.includes("*") ||
        k.appliesToKanji.includes(kanjiForm.text)),
  );
  if (matches.length > 0) return matches[0].text;
  return word.kana[0].text ?? "";
}

/** Pick a short English gloss. */
function meaningFor(word) {
  if (!Array.isArray(word.sense) || word.sense.length === 0) return "";
  // Prefer the first sense's first gloss.
  const first = word.sense[0];
  if (Array.isArray(first.gloss) && first.gloss.length > 0) {
    return (first.gloss[0].text ?? "").toString();
  }
  return "";
}

const index = new Map(); // kanji char → array of { text, kana, meaning, length, score }

for (const word of words) {
  const k = primaryKanjiForm(word);
  if (!k || !k.text) continue;
  const text = k.text;
  const len = [...text].length;
  // Shorter compounds make better example learners' material.
  // Single-char "compounds" (just the kanji itself) are deprioritized.
  const score = len === 1 ? 100 : len * 10;
  const kana = readingFor(word, k);
  const meaning = meaningFor(word);
  if (!meaning) continue;
  const entry = { text, kana, meaning, length: len, score };
  // For each unique kanji char in the form, register this word as an example.
  const seen = new Set();
  for (const ch of text) {
    if (!isKanjiChar(ch)) continue;
    if (seen.has(ch)) continue;
    seen.add(ch);
    const list = index.get(ch);
    if (list) list.push(entry);
    else index.set(ch, [entry]);
  }
}

console.log(`  ${index.size.toLocaleString()} unique kanji characters indexed.\n`);

// ============================================================
// 3. Enrich each deck card with up to 3 example compounds
// ============================================================

/** Pick top N example compounds for a kanji literal, prioritizing 2-character compounds. */
function pickExamples(literal, n = 3) {
  const all = index.get(literal);
  if (!all) return [];
  // Sort: shorter first, but skip single-char "compounds" if 2+-char options exist.
  const sorted = [...all].sort((a, b) => a.score - b.score || a.length - b.length);
  const multiChar = sorted.filter((e) => e.length >= 2);
  const pool = multiChar.length >= n ? multiChar : sorted;
  // Dedupe by text and cap at n.
  const seen = new Set();
  const out = [];
  for (const e of pool) {
    if (seen.has(e.text)) continue;
    seen.add(e.text);
    out.push({ kanji: e.text, kana: e.kana, meaning: e.meaning });
    if (out.length >= n) break;
  }
  return out;
}

// Find every kanji_*.json deck under agent-files/ that's KANJIDIC-derived
// (skip kana_*.json + vocab_*.json). Cards are enriched in-place.
const deckFiles = readdirSync(OUT_DIR).filter(
  (f) => f.startsWith("kanji_") && f.endsWith(".json"),
);

let totalCards = 0;
let cardsEnriched = 0;
let totalExamples = 0;

for (const fileName of deckFiles) {
  const path = join(OUT_DIR, fileName);
  const deck = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(deck.cards)) continue;
  let enrichedHere = 0;
  for (const card of deck.cards) {
    totalCards++;
    if (typeof card.kanji !== "string" || card.kanji.length === 0) continue;
    // Only enrich cards that don't already have hand-curated examples.
    if (Array.isArray(card.examples) && card.examples.length > 0) continue;
    const examples = pickExamples(card.kanji, 3);
    if (examples.length === 0) continue;
    card.examples = examples;
    enrichedHere++;
    cardsEnriched++;
    totalExamples += examples.length;
  }
  // Update source attribution to credit JMdict if any examples landed.
  if (enrichedHere > 0) {
    deck.source =
      "Aggregated from KANJIDIC2 (CC-BY-SA, EDRDG), JMdict (CC-BY-SA, EDRDG), and Jonathan Waller's JLPT Resources.";
  }
  writeFileSync(path, JSON.stringify(deck, null, 2) + "\n");
  console.log(
    `  ${fileName.padEnd(36)} ${enrichedHere}/${deck.cards.length} cards enriched`,
  );
}

console.log(
  `\n✓ Done. Enriched ${cardsEnriched.toLocaleString()} of ${totalCards.toLocaleString()} cards with ${totalExamples.toLocaleString()} example compounds.`,
);
