import type { ConjugationTable as ConjugationTableData } from "@/types";

/**
 * Renders a structured conjugation reference table for grammar cards.
 *
 * Cells whose text contains any kana/kanji codepoint are tagged with the
 * `.jp` class so they render in the Japanese font. Other cells (rule
 * descriptions, group labels in English) use the UI font and the muted
 * text color.
 */
export function ConjugationTableView({ table }: { table: ConjugationTableData }) {
  const cols = table.headers.length;
  const isJpCell = (text: string): boolean => {
    if (!text) return false;
    // Any hiragana / katakana / CJK ideograph anywhere → treat as Japanese.
    return /[぀-ヿ㐀-䶿一-鿿]/.test(text);
  };
  return (
    <div className="conj-table">
      {table.caption && <div className="conj-table-caption">{table.caption}</div>}
      <div
        className="conj-table-grid"
        role="table"
        style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}
      >
        <div className="conj-table-row header" role="row">
          {table.headers.map((h, i) => (
            <div key={i} className="conj-table-cell" role="columnheader">
              {h}
            </div>
          ))}
        </div>
        {table.rows.map((row, rIdx) => (
          <div key={rIdx} className="conj-table-row" role="row">
            {row.map((cell, cIdx) => {
              const jp = isJpCell(cell);
              return (
                <div
                  key={cIdx}
                  className={`conj-table-cell ${jp ? "jp" : "muted"}`}
                  role="cell"
                  lang={jp ? "ja" : undefined}
                >
                  {cell}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
