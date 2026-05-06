/**
 * Anki .apkg → UserCard[] importer.
 *
 * An .apkg is a zip archive containing:
 *   - collection.anki2  (or collection.anki21 / .anki21b)  — the SQLite db
 *   - media             — JSON map { "0": "filename.png", … } (we ignore media)
 *   - 0, 1, 2, …        — the actual media files (we ignore)
 *
 * We extract notes from the SQLite `notes` table and parse field names from
 * `col.models` (a JSON blob of all note types). Field separator is U+001F.
 *
 * Both `fflate` (zip) and `sql.js` (SQLite WASM) are loaded **dynamically** so
 * they don't bloat the initial bundle. The parser is async and the WASM only
 * downloads when the user actually opens an Anki file.
 */

import type { ImportError } from "./importParser";
import { parseDeckImport } from "./importParser";
import type { UserCard } from "@/types";

export interface AnkiImportResult {
  cards: UserCard[];
  /** Note-type names found in the file, with their field labels. Useful for the field-mapping UI. */
  models: Array<{ id: string; name: string; fields: string[] }>;
  errors: ImportError[];
}

/** Anki note field separator. */
const FIELD_SEP = "\x1f";

/** Strip HTML tags + Anki cloze markers commonly seen in note fields. Exported for tests. */
export function stripAnkiFormatting(s: string): string {
  return s
    .replace(/\{\{c\d+::([^:}]*?)(::[^}]*)?\}\}/g, "$1") // {{c1::answer}} or {{c1::answer::hint}}
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

interface AnkiModel {
  id: string;
  name: string;
  fields: string[];
}

interface AnkiNote {
  modelId: string;
  fields: string[];
}

async function unzipApkg(buffer: ArrayBuffer): Promise<Map<string, Uint8Array>> {
  const fflate = await import("fflate");
  return new Promise((resolve, reject) => {
    fflate.unzip(new Uint8Array(buffer), (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const map = new Map<string, Uint8Array>();
      for (const [name, bytes] of Object.entries(data)) {
        map.set(name, bytes);
      }
      resolve(map);
    });
  });
}

/**
 * Pick the SQLite db out of the unzipped archive. Modern Anki (.apkg21) writes
 * `collection.anki21b` (zstd-compressed) or `collection.anki21`; older files
 * write `collection.anki2`. We try in that order and pick the first one we
 * can read.
 */
function pickCollection(files: Map<string, Uint8Array>): { name: string; bytes: Uint8Array } | null {
  for (const candidate of ["collection.anki21", "collection.anki2", "collection.anki21b"]) {
    const bytes = files.get(candidate);
    if (bytes) return { name: candidate, bytes };
  }
  return null;
}

async function openSqlite(bytes: Uint8Array) {
  const initSqlJs = (await import("sql.js")).default;
  const SQL = await initSqlJs({
    // Load the WASM from the public CDN so we don't have to wire up a bundler asset.
    // For offline / self-host, replace with `/sql-wasm.wasm` and bundle it.
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });
  return new SQL.Database(bytes);
}

interface SqlJsDatabase {
  exec(query: string): Array<{ columns: string[]; values: unknown[][] }>;
}

function readModels(db: SqlJsDatabase): AnkiModel[] {
  // The col.models column is a JSON blob keyed by model id.
  const res = db.exec("SELECT models FROM col LIMIT 1");
  if (!res[0]?.values?.[0]) return [];
  const raw = res[0].values[0][0];
  if (typeof raw !== "string") return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!parsed || typeof parsed !== "object") return [];
  const models: AnkiModel[] = [];
  for (const [id, model] of Object.entries(parsed as Record<string, unknown>)) {
    if (!model || typeof model !== "object") continue;
    const m = model as { name?: unknown; flds?: unknown };
    const flds = Array.isArray(m.flds)
      ? m.flds
          .map((f): string =>
            f && typeof f === "object" && "name" in f && typeof (f as { name: unknown }).name === "string"
              ? ((f as { name: string }).name as string)
              : "",
          )
          .filter(Boolean)
      : [];
    models.push({ id, name: typeof m.name === "string" ? m.name : `Model ${id}`, fields: flds });
  }
  return models;
}

function readNotes(db: SqlJsDatabase): AnkiNote[] {
  const res = db.exec("SELECT mid, flds FROM notes");
  if (!res[0]) return [];
  return res[0].values.map((row) => ({
    modelId: String(row[0]),
    fields: typeof row[1] === "string" ? row[1].split(FIELD_SEP) : [],
  }));
}

/**
 * Convert raw (modelFields, noteFields) to a record { fieldName: value } that
 * the existing CSV/JSON parser knows how to ingest.
 */
function noteToRecord(modelFields: string[], noteFields: string[]): Record<string, string> {
  const rec: Record<string, string> = {};
  for (let i = 0; i < modelFields.length; i++) {
    const name = modelFields[i];
    const val = noteFields[i] ?? "";
    if (!name) continue;
    rec[name] = stripAnkiFormatting(val);
  }
  return rec;
}

/**
 * Public entry point. Pass the user-selected `.apkg` file's bytes; get back
 * cards + the discovered note-type metadata for the field-mapping UI.
 */
export async function parseAnkiPackage(buffer: ArrayBuffer): Promise<AnkiImportResult> {
  const errors: ImportError[] = [];
  let files: Map<string, Uint8Array>;
  try {
    files = await unzipApkg(buffer);
  } catch (err) {
    return {
      cards: [],
      models: [],
      errors: [{ row: 0, message: `Could not unzip .apkg: ${(err as Error).message}` }],
    };
  }
  const col = pickCollection(files);
  if (!col) {
    return {
      cards: [],
      models: [],
      errors: [{ row: 0, message: "No collection.anki2/anki21 inside .apkg" }],
    };
  }
  if (col.name === "collection.anki21b") {
    return {
      cards: [],
      models: [],
      errors: [
        {
          row: 0,
          message:
            "This .apkg uses Anki's newer .anki21b (zstd-compressed) format. Re-export from Anki with 'Support older Anki versions' enabled, or export the deck as plain-text .txt.",
        },
      ],
    };
  }
  let db: SqlJsDatabase;
  try {
    db = (await openSqlite(col.bytes)) as unknown as SqlJsDatabase;
  } catch (err) {
    return {
      cards: [],
      models: [],
      errors: [{ row: 0, message: `Could not open SQLite: ${(err as Error).message}` }],
    };
  }
  const models = readModels(db);
  const modelById = new Map(models.map((m) => [m.id, m]));
  const notes = readNotes(db);

  // Build cards by funnelling through the existing import parser:
  // for each note we emit a JSON record with fieldName→value, and feed that
  // batch through `parseDeckImport` so all the same alias rules apply.
  const records: Record<string, string>[] = [];
  notes.forEach((note, idx) => {
    const model = modelById.get(note.modelId);
    if (!model) {
      errors.push({ row: idx + 1, message: `note has unknown model id ${note.modelId}` });
      return;
    }
    const rec = noteToRecord(model.fields, note.fields);
    if (Object.values(rec).every((v) => !v)) return;
    records.push(rec);
  });

  const parsed = parseDeckImport(JSON.stringify(records), "json");
  return {
    cards: parsed.cards,
    models,
    errors: [...errors, ...parsed.errors],
  };
}
