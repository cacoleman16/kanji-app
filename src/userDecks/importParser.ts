/**
 * Bulk-import parsing for user-created decks.
 *
 * Supports three input formats with autodetection:
 *  1. JSON: an array of card objects, or `{ cards: [...] }`, or a single card.
 *     Common Anki-export field names are normalized.
 *  2. TSV: tab-separated, optional header row.
 *  3. CSV: comma-separated, supports quoted fields ("a, b" → "a, b").
 *
 * Field mapping is inferred from headers when present; otherwise positional
 * defaults apply: [front, meaning, reading?, mnemonic?, examples?, jlpt?, notes?].
 *
 * The parser is **forgiving**: unknown columns are dropped, blanks are
 * tolerated, and import never throws — `errors[]` collects per-row issues so
 * the UI can surface them in a preview table before committing.
 */

import type { UserCard } from "@/types";

export type ImportFormat = "json" | "tsv" | "csv";

export interface ParsedImport {
  cards: UserCard[];
  format: ImportFormat;
  /** Detected/used field mapping (column index → UserCard field name). */
  fieldMap: Record<number, keyof UserCard | null>;
  /** Per-row warnings for malformed rows that were dropped or partially parsed. */
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  message: string;
}

/** Aliases (case-insensitive) → canonical {@link UserCard} field. */
const HEADER_ALIASES: Record<string, keyof UserCard> = {
  // front-of-card / progress key
  front: "kanji",
  kanji: "kanji",
  word: "kanji",
  expression: "kanji",
  term: "kanji",
  jp: "kanji",
  japanese: "kanji",

  // meanings / definitions
  meaning: "meanings",
  meanings: "meanings",
  back: "meanings",
  definition: "meanings",
  english: "meanings",
  en: "meanings",
  gloss: "meanings",

  // reading
  reading: "reading",
  hiragana: "reading",
  kana: "reading",
  furigana: "reading",
  pronunciation: "reading",

  // mnemonic
  keyword: "keyword",
  mnemonic: "keyword",
  hint: "keyword",
  etymology: "etymology",

  // jlpt
  jlpt: "jlpt",
  level: "jlpt",

  // readings (kanji-card extras)
  on: "on_yomi",
  on_yomi: "on_yomi",
  onyomi: "on_yomi",
  kun: "kun_yomi",
  kun_yomi: "kun_yomi",
  kunyomi: "kun_yomi",

  // notes / context
  context: "context",
  notes: "context",
  note: "context",
  example: "example_sentence",
  example_sentence: "example_sentence",
  sentence: "example_sentence",
  example_reading: "example_reading",
  example_meaning: "example_meaning",
};

const POSITIONAL_FIELDS: Array<keyof UserCard> = [
  "kanji",
  "meanings",
  "reading",
  "keyword",
  "example_sentence",
  "jlpt",
  "context",
];

const VALID_JLPT = new Set(["N5", "N4", "N3", "N2", "N1"]);

// ============================================================
// Format detection
// ============================================================

export function detectFormat(text: string): ImportFormat {
  const t = text.trim();
  if (!t) return "csv";
  if (t.startsWith("[") || t.startsWith("{")) return "json";
  // First non-empty line
  const firstLine = t.split(/\r?\n/, 1)[0] ?? "";
  // Tab characters are extremely common in Anki exports → prefer TSV when present.
  if (firstLine.includes("\t")) return "tsv";
  return "csv";
}

// ============================================================
// JSON parsing
// ============================================================

function normalizeRecord(rec: Record<string, unknown>): { card: UserCard | null; warning?: string } {
  const out: UserCard = { kanji: "", meanings: [] };
  let hasFront = false;

  for (const [rawKey, rawVal] of Object.entries(rec)) {
    const key = rawKey.trim().toLowerCase();
    const target = HEADER_ALIASES[key] ?? null;
    if (!target) continue;
    if (rawVal == null) continue;
    assignField(out, target, rawVal);
    if (target === "kanji") hasFront = true;
  }

  // Default `meanings` if none provided.
  if (!Array.isArray(out.meanings)) out.meanings = [];
  if (!out.kanji) {
    return { card: null, warning: "row has no front/word/kanji field" };
  }
  if (!hasFront && !out.meanings.length) {
    return { card: null, warning: "row has no recognizable fields" };
  }
  if (out.jlpt && !VALID_JLPT.has(out.jlpt)) {
    delete out.jlpt;
  }
  return { card: out };
}

function parseJson(text: string): ParsedImport {
  const errors: ImportError[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return {
      cards: [],
      format: "json",
      fieldMap: {},
      errors: [{ row: 0, message: `JSON parse error: ${(err as Error).message}` }],
    };
  }

  let records: unknown[];
  if (Array.isArray(parsed)) records = parsed;
  else if (parsed && typeof parsed === "object" && "cards" in parsed) {
    const c = (parsed as { cards: unknown }).cards;
    records = Array.isArray(c) ? c : [];
  } else if (parsed && typeof parsed === "object") {
    records = [parsed]; // single card
  } else {
    return {
      cards: [],
      format: "json",
      fieldMap: {},
      errors: [{ row: 0, message: "Expected an array of cards or `{cards:[…]}`" }],
    };
  }

  const cards: UserCard[] = [];
  records.forEach((rec, idx) => {
    if (!rec || typeof rec !== "object" || Array.isArray(rec)) {
      errors.push({ row: idx + 1, message: "row is not an object" });
      return;
    }
    const { card, warning } = normalizeRecord(rec as Record<string, unknown>);
    if (card) cards.push(card);
    if (warning) errors.push({ row: idx + 1, message: warning });
  });

  return { cards, format: "json", fieldMap: {}, errors };
}

// ============================================================
// CSV / TSV parsing
// ============================================================

/** Minimal CSV/TSV splitter with quoted-field support. */
function splitDelimited(text: string, delim: "," | "\t"): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
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
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delim) {
        cur.push(field);
        field = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        cur.push(field);
        field = "";
        if (cur.some((c) => c.length)) rows.push(cur);
        cur = [];
      } else {
        field += ch;
      }
    }
  }
  if (field.length || cur.length) {
    cur.push(field);
    if (cur.some((c) => c.length)) rows.push(cur);
  }
  return rows;
}

function lookupAlias(header: string): keyof UserCard | null {
  const k = header.trim().toLowerCase();
  return HEADER_ALIASES[k] ?? null;
}

/** Heuristic: rows[0] looks like a header if any cell maps to a known alias. */
function looksLikeHeader(row: string[]): boolean {
  return row.some((cell) => lookupAlias(cell) !== null);
}

function buildFieldMap(headerRow: string[] | null): Record<number, keyof UserCard | null> {
  const map: Record<number, keyof UserCard | null> = {};
  if (headerRow) {
    headerRow.forEach((h, i) => {
      map[i] = lookupAlias(h);
    });
    return map;
  }
  // Positional fallback
  POSITIONAL_FIELDS.forEach((f, i) => {
    map[i] = f;
  });
  return map;
}

function assignField(card: UserCard, field: keyof UserCard, raw: unknown): void {
  if (field === "meanings") {
    if (Array.isArray(raw)) card.meanings = raw.map(String).filter(Boolean);
    else if (typeof raw === "string") {
      card.meanings = raw
        .split(/[;|/,]| · /)
        .map((m) => m.trim())
        .filter(Boolean);
      // Single-word values are still valid (single-element array).
      if (!card.meanings.length) card.meanings = [String(raw).trim()].filter(Boolean);
    }
    return;
  }
  if (field === "on_yomi" || field === "kun_yomi") {
    if (Array.isArray(raw)) card[field] = raw.map(String).filter(Boolean);
    else if (typeof raw === "string") {
      card[field] = raw
        .split(/[;,|]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return;
  }
  if (field === "examples") {
    if (Array.isArray(raw)) {
      card.examples = raw
        .filter((e): e is { kanji?: string; kana?: string; meaning?: string } =>
          Boolean(e && typeof e === "object"),
        )
        .map((e) => ({
          kanji: String(e.kanji ?? ""),
          kana: String(e.kana ?? ""),
          meaning: String(e.meaning ?? ""),
        }));
    }
    return;
  }
  // Strings: kanji, reading, keyword, etymology, context, jlpt, example_sentence, etc.
  const str = typeof raw === "string" ? raw.trim() : String(raw ?? "").trim();
  if (!str) return;
  if (field === "jlpt") {
    const norm = str.toUpperCase().replace(/^L?(N\d)$/i, "$1");
    if (VALID_JLPT.has(norm)) card.jlpt = norm as UserCard["jlpt"];
    return;
  }
  assignStringField(card, field, str);
}

/**
 * Type-safe string-field assignment for the simple string fields on UserCard
 * (everything that isn't `meanings` / `on_yomi` / `kun_yomi` / `examples` /
 * `jlpt`). Narrowing here avoids the `as any` we previously had.
 */
type StringField = Exclude<
  keyof UserCard,
  "meanings" | "on_yomi" | "kun_yomi" | "examples" | "jlpt"
>;

const STRING_FIELDS: ReadonlySet<StringField> = new Set<StringField>([
  "kanji",
  "reading",
  "keyword",
  "etymology",
  "context",
  "example_sentence",
  "example_reading",
  "example_meaning",
]);

function assignStringField(card: UserCard, field: keyof UserCard, value: string): void {
  if (STRING_FIELDS.has(field as StringField)) {
    card[field as StringField] = value;
  }
}

function parseDelimited(text: string, format: "csv" | "tsv"): ParsedImport {
  const rows = splitDelimited(text, format === "csv" ? "," : "\t");
  const errors: ImportError[] = [];

  if (rows.length === 0) {
    return { cards: [], format, fieldMap: {}, errors: [] };
  }

  const headerRow = looksLikeHeader(rows[0]) ? rows[0] : null;
  const fieldMap = buildFieldMap(headerRow);
  const dataRows = headerRow ? rows.slice(1) : rows;

  const cards: UserCard[] = [];
  dataRows.forEach((row, idx) => {
    const card: UserCard = { kanji: "", meanings: [] };
    row.forEach((cell, col) => {
      const field = fieldMap[col];
      if (!field) return;
      assignField(card, field, cell);
    });
    if (!Array.isArray(card.meanings)) card.meanings = [];
    if (!card.kanji) {
      errors.push({
        row: (headerRow ? idx + 2 : idx + 1),
        message: "row has no front/word/kanji",
      });
      return;
    }
    cards.push(card);
  });

  return { cards, format, fieldMap, errors };
}

// ============================================================
// Public entry point
// ============================================================

export function parseDeckImport(text: string, hint?: ImportFormat): ParsedImport {
  const format = hint ?? detectFormat(text);
  if (format === "json") return parseJson(text);
  return parseDelimited(text, format);
}
