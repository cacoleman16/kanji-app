#!/usr/bin/env node
/**
 * JLPT vocabulary decks (N5–N1) — built from the standard JLPT word lists.
 *
 * Source data: data/raw/jlpt-vocab/n{1..5}.csv — Jonathan Waller's JLPT
 * vocabulary lists (tanos.co.uk, CC-BY) as mirrored by the MIT-licensed
 * elzup/jlpt-word-list repository. Columns: expression, reading, meaning,
 * tags. ~7,900 words across the five levels.
 *
 * Download once:
 *   mkdir -p data/raw/jlpt-vocab
 *   for n in 1 2 3 4 5; do
 *     curl -sL "https://raw.githubusercontent.com/elzup/jlpt-word-list/master/src/n$n.csv" \
 *       -o "data/raw/jlpt-vocab/n$n.csv"
 *   done
 *
 * Then: node scripts/build-jlpt-vocab-decks.mjs
 *
 * Output: agent-files/vocab_jlpt_n5.json … vocab_jlpt_n1.json (Pro)
 *
 * Processing:
 *  - Words appearing in multiple level lists are assigned to the EASIEST
 *    level only (N5 wins over N4, etc.) so the five decks don't ship
 *    duplicate cards. (Progress is keyed by the word string app-wide;
 *    a duplicate across these sibling decks would be pure redundancy.)
 *  - Meanings split on top-level commas (parenthesized commas preserved),
 *    capped at 5 senses.
 *  - Kana-only entries (no reading column) use the expression as reading.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const RAW_DIR = join(ROOT, "data/raw/jlpt-vocab");
const OUT_DIR = join(ROOT, "agent-files");
mkdirSync(OUT_DIR, { recursive: true });

// ---------- Tiny CSV parser (quotes + embedded newlines) ----------
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field.replace(/\r$/, ""));
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    if (row.length > 1 || row[0] !== "") rows.push(row);
  }
  return rows;
}

/** Split a gloss string on top-level commas, keeping "(a, b)" together. */
function splitMeanings(s) {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out.slice(0, 5);
}

const isKana = (s) => /^[぀-ヿー〜・]+$/.test(s);

// ---------- Load all five levels ----------
const LEVELS = ["N5", "N4", "N3", "N2", "N1"]; // easiest first — claim order
const missing = LEVELS.filter((l) => !existsSync(join(RAW_DIR, `${l.toLowerCase()}.csv`)));
if (missing.length) {
  console.log(`Missing source CSVs for ${missing.join(", ")} under data/raw/jlpt-vocab/.`);
  console.log("See the download instructions in this script's header.");
  process.exit(0);
}

const claimed = new Set(); // word → assigned to an easier level already
const stats = [];

const META = {
  N5: {
    name: "JLPT N5 Vocabulary (語彙)",
    subtitle: "~700 beginner words · the full N5-style list",
  },
  N4: {
    name: "JLPT N4 Vocabulary (語彙)",
    subtitle: "~660 elementary words · everyday verbs & adjectives",
  },
  N3: {
    name: "JLPT N3 Vocabulary (語彙)",
    subtitle: "~2,100 intermediate words · the daily-life bridge",
  },
  N2: {
    name: "JLPT N2 Vocabulary (語彙)",
    subtitle: "~1,700 upper-intermediate words · news & workplace",
  },
  N1: {
    name: "JLPT N1 Vocabulary (語彙)",
    subtitle: "~2,700 advanced words · literature & formal registers",
  },
};

for (const level of LEVELS) {
  const csvPath = join(RAW_DIR, `${level.toLowerCase()}.csv`);
  const rows = parseCsv(readFileSync(csvPath, "utf8"));
  const header = rows[0].map((h) => h.trim());
  const idx = {
    expression: header.indexOf("expression"),
    reading: header.indexOf("reading"),
    meaning: header.indexOf("meaning"),
  };
  if (idx.expression === -1 || idx.meaning === -1) {
    throw new Error(`${csvPath}: unexpected header ${header.join(",")}`);
  }

  const seenInDeck = new Set();
  const cards = [];
  let skippedDupes = 0;
  for (const row of rows.slice(1)) {
    const word = (row[idx.expression] ?? "").trim();
    if (!word) continue;
    if (seenInDeck.has(word) || claimed.has(word)) {
      skippedDupes++;
      continue;
    }
    let reading = (row[idx.reading] ?? "").trim();
    if (!reading && isKana(word)) reading = word;
    const meanings = splitMeanings((row[idx.meaning] ?? "").trim());
    if (meanings.length === 0) continue;
    seenInDeck.add(word);
    claimed.add(word);
    cards.push({
      word,
      reading,
      meanings,
      jlpt: level,
      category: "",
      context: "",
      example_sentence: "",
      example_reading: "",
      example_meaning: "",
    });
  }

  const deck = {
    deck_id: `vocab-jlpt-${level.toLowerCase()}`,
    deck_name: META[level].name,
    subtitle: META[level].subtitle,
    version: "1.0",
    card_count: cards.length,
    notes: `The standard ${level} vocabulary list. Words also present in an easier level's list live in that easier deck instead (no duplicates across the five JLPT vocab decks).`,
    source:
      "JLPT vocabulary lists by Jonathan Waller / JLPT Resources (tanos.co.uk, CC-BY), via the MIT-licensed elzup/jlpt-word-list mirror.",
    cards,
  };

  const filename = `vocab_jlpt_${level.toLowerCase()}.json`;
  writeFileSync(join(OUT_DIR, filename), JSON.stringify(deck, null, 2) + "\n");
  stats.push({ level, count: cards.length, skippedDupes });
  console.log(`✓ ${filename} — ${cards.length} cards (${skippedDupes} duplicates skipped)`);
}

console.log(
  `\nTotal: ${stats.reduce((a, s) => a + s.count, 0).toLocaleString()} JLPT vocabulary cards across ${stats.length} decks.`,
);
