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

/**
 * Returns JMdict source files in priority order:
 *  1. jmdict-eng-common-*.json — small (~16 MB unzipped), only "common"
 *     words. Preferred because the example compounds are everyday vocab.
 *  2. jmdict-eng-*.json (full) — larger (~110 MB), includes long-tail.
 *     Used as a fallback for rare kanji not in the common-words subset.
 *
 * If both are present, the script runs two passes: common first, full
 * second, each filling in cards that still have empty examples[].
 */
function findJmdictSources() {
  if (!existsSync(RAW_DIR)) return [];
  const all = readdirSync(RAW_DIR).filter(
    (f) => f.startsWith("jmdict-eng") && f.endsWith(".json") && !f.includes("examples"),
  );
  const commons = all.filter((f) => f.startsWith("jmdict-eng-common")).sort();
  const fulls = all.filter((f) => !f.startsWith("jmdict-eng-common")).sort();
  const out = [];
  if (commons.length) out.push({ kind: "common", path: join(RAW_DIR, commons.at(-1)) });
  if (fulls.length) out.push({ kind: "full", path: join(RAW_DIR, fulls.at(-1)) });
  return out;
}

const SOURCES = findJmdictSources();
if (SOURCES.length === 0) {
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

/**
 * Build a kanji-char → array-of-example-words index from a JMdict words list.
 * `commonOnly` filters to only word entries whose primary kanji form is
 * tagged common — used for the "common" pass to prioritize everyday vocab.
 */
function buildIndex(words, commonOnly) {
  const idx = new Map();
  for (const word of words) {
    const k = primaryKanjiForm(word);
    if (!k || !k.text) continue;
    if (commonOnly && !k.common) continue;
    const text = k.text;
    const len = [...text].length;
    const score = len === 1 ? 100 : len * 10;
    const kana = readingFor(word, k);
    const meaning = meaningFor(word);
    if (!meaning) continue;
    const entry = { text, kana, meaning, length: len, score };
    const seen = new Set();
    for (const ch of text) {
      if (!isKanjiChar(ch)) continue;
      if (seen.has(ch)) continue;
      seen.add(ch);
      const list = idx.get(ch);
      if (list) list.push(entry);
      else idx.set(ch, [entry]);
    }
  }
  return idx;
}

// ============================================================
// 3. Enrich each deck card with up to 3 example compounds
// ============================================================

/** Pick top N example compounds for a kanji literal, prioritizing 2-character compounds. */
function pickExamples(index, literal, n = 3) {
  const all = index.get(literal);
  if (!all) return [];
  const sorted = [...all].sort((a, b) => a.score - b.score || a.length - b.length);
  const multiChar = sorted.filter((e) => e.length >= 2);
  const pool = multiChar.length >= n ? multiChar : sorted;
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

const deckFiles = readdirSync(OUT_DIR).filter(
  (f) => f.startsWith("kanji_") && f.endsWith(".json"),
);

// Load all decks into memory once, run multiple enrichment passes against them.
const decks = deckFiles.map((fileName) => ({
  fileName,
  path: join(OUT_DIR, fileName),
  json: JSON.parse(readFileSync(join(OUT_DIR, fileName), "utf8")),
}));

let totalCards = 0;
for (const d of decks) totalCards += Array.isArray(d.json.cards) ? d.json.cards.length : 0;

let cumulativeEnriched = 0;
let cumulativeExamples = 0;
let anyJmdictHit = false;

for (const source of SOURCES) {
  console.log(`\n[Pass: ${source.kind}] reading ${source.path}...`);
  const data = JSON.parse(readFileSync(source.path, "utf8"));
  const words = Array.isArray(data.words) ? data.words : [];
  const idx = buildIndex(words, source.kind === "common");
  console.log(
    `  ${words.length.toLocaleString()} words → ${idx.size.toLocaleString()} kanji indexed.\n`,
  );

  let passEnriched = 0;
  let passExamples = 0;
  for (const d of decks) {
    if (!Array.isArray(d.json.cards)) continue;
    let here = 0;
    for (const card of d.json.cards) {
      if (typeof card.kanji !== "string" || card.kanji.length === 0) continue;
      // Skip cards that already have examples (from a previous pass or
      // hand-curation).
      if (Array.isArray(card.examples) && card.examples.length > 0) continue;
      const examples = pickExamples(idx, card.kanji, 2);
      if (examples.length === 0) continue;
      card.examples = examples;
      here++;
      passEnriched++;
      passExamples += examples.length;
    }
    if (here > 0) console.log(`    ${d.fileName.padEnd(36)} +${here} (this pass)`);
  }
  cumulativeEnriched += passEnriched;
  cumulativeExamples += passExamples;
  if (passEnriched > 0) anyJmdictHit = true;
  console.log(`  ✓ ${source.kind}: enriched ${passEnriched.toLocaleString()} new cards`);
}

// Final write — update source attribution + persist.
for (const d of decks) {
  if (anyJmdictHit) {
    d.json.source =
      "Aggregated from KANJIDIC2 (CC-BY-SA, EDRDG), JMdict (CC-BY-SA, EDRDG), and Jonathan Waller's JLPT Resources.";
  }
  writeFileSync(d.path, JSON.stringify(d.json, null, 2) + "\n");
}

// Count cards that *still* have no examples after every pass — rare kanji
// completely absent from JMdict.
let stillEmpty = 0;
let withExamples = 0;
for (const d of decks) {
  for (const card of d.json.cards ?? []) {
    if (Array.isArray(card.examples) && card.examples.length > 0) withExamples++;
    else stillEmpty++;
  }
}
console.log(
  `\n✓ Done. ${withExamples.toLocaleString()} of ${totalCards.toLocaleString()} cards have examples (${Math.round((withExamples / totalCards) * 100)}%). ${stillEmpty.toLocaleString()} rare kanji absent from JMdict entirely.`,
);
console.log(
  `  This run: +${cumulativeEnriched.toLocaleString()} cards enriched, +${cumulativeExamples.toLocaleString()} examples added.`,
);
