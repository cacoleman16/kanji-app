import { useMemo, useRef, useState, type ChangeEvent } from "react";

import { canImportApkg, isPro, userDeckCardLimit } from "@/entitlements/entitlement";
import type { AppState, UserCard } from "@/types";
import { parseDeckImport, type ImportError, type ImportFormat } from "@/userDecks/importParser";
import { setDeckCards } from "@/userDecks/userDecks";

import type { Route } from "../routes";

interface MyDeckImportProps {
  deckId: string;
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
  onBack: () => void;
  go: (r: Route) => void;
}

const SAMPLE_PLACEHOLDER = `One card per row. Examples:

# CSV with header
Kanji,Meaning,Reading
学,study,がく
校,school,こう

# Anki-export TSV (Front<TAB>Back)
学\tstudy
校\tschool

# JSON
[{"kanji":"学","meanings":["study"],"reading":"がく"}]`;

interface ApkgResult {
  cards: UserCard[];
  errors: ImportError[];
  source: string;
}

export function MyDeckImport({ deckId, state, setState, onBack, go }: MyDeckImportProps) {
  const deck = state.userDecks.find((d) => d.id === deckId);
  const userIsPro = isPro(state);
  const cardCap = userDeckCardLimit(state);
  const [text, setText] = useState("");
  const [hint, setHint] = useState<ImportFormat | "auto">("auto");
  const [mode, setMode] = useState<"replace" | "append">("append");
  const [apkg, setApkg] = useState<ApkgResult | null>(null);
  const [apkgLoading, setApkgLoading] = useState(false);
  const apkgInputRef = useRef<HTMLInputElement>(null);

  const textParsed = useMemo(() => {
    if (!text.trim()) return null;
    return parseDeckImport(text, hint === "auto" ? undefined : hint);
  }, [text, hint]);

  /** The active source — Anki .apkg if loaded, else the textarea. */
  const parsed = apkg ? { cards: apkg.cards, errors: apkg.errors } : textParsed;

  const handleApkgFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!canImportApkg(state)) {
      go({
        name: "paywall",
        reason: "Anki .apkg import is a Kanjido Pro feature.",
      });
      return;
    }
    setApkgLoading(true);
    setApkg(null);
    try {
      const buffer = await file.arrayBuffer();
      const { parseAnkiPackage } = await import("@/userDecks/ankiImport");
      const result = await parseAnkiPackage(buffer);
      setApkg({ cards: result.cards, errors: result.errors, source: file.name });
    } catch (err) {
      setApkg({
        cards: [],
        errors: [{ row: 0, message: `Failed to read .apkg: ${(err as Error).message}` }],
        source: file.name,
      });
    } finally {
      setApkgLoading(false);
    }
  };

  const clearApkg = () => setApkg(null);

  if (!deck) {
    return (
      <div className="fade-in session-done">
        <div className="done-title">Deck not found</div>
        <button className="primary-btn" onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  const handleImport = () => {
    if (!parsed || parsed.cards.length === 0) return;
    setState((s) => {
      const existing = s.userDecks.find((d) => d.id === deckId);
      if (!existing) return s;
      let next = mode === "replace" ? parsed.cards : [...existing.cards, ...parsed.cards];
      // Free-tier card cap.
      if (next.length > cardCap) next = next.slice(0, cardCap);
      return setDeckCards(s, deckId, next);
    });
    onBack();
  };

  const wouldExceedFreeCap =
    parsed &&
    !userIsPro &&
    (mode === "replace" ? parsed.cards.length : (deck?.cards.length ?? 0) + parsed.cards.length) >
      cardCap;

  const previewRows = parsed?.cards.slice(0, 5) ?? [];

  return (
    <div className="fade-in">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="topbar-title">Import cards</div>
        <div style={{ width: 40 }} />
      </div>

      <div className="deck-detail-header">
        <div className="deck-detail-title">Import into "{deck.name}"</div>
        <div className="deck-detail-sub">
          Upload an Anki <code>.apkg</code> or paste CSV / TSV / JSON. Format auto-detected.
        </div>
      </div>

      <div className="settings-row" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <div className="settings-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            Anki .apkg file
            {!userIsPro && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  background: "var(--accent-soft)",
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                Pro
              </span>
            )}
          </div>
          <div className="settings-sub">
            {apkg
              ? `Loaded: ${apkg.source} (${apkg.cards.length} card${apkg.cards.length === 1 ? "" : "s"})`
              : "From Anki: File → Export → 'Anki Deck Package (.apkg)'"}
          </div>
        </div>
        <input
          ref={apkgInputRef}
          type="file"
          accept=".apkg,application/zip"
          style={{ display: "none" }}
          onChange={handleApkgFile}
        />
        {apkg ? (
          <button className="skip-btn" onClick={clearApkg}>
            Clear
          </button>
        ) : (
          <button
            className="primary-btn"
            style={{ padding: "8px 14px", fontSize: 13 }}
            onClick={() => {
              if (!userIsPro) {
                go({
                  name: "paywall",
                  reason: "Anki .apkg import is a Kanjido Pro feature.",
                });
                return;
              }
              apkgInputRef.current?.click();
            }}
            disabled={apkgLoading}
          >
            {apkgLoading ? "Reading…" : "Upload .apkg"}
          </button>
        )}
      </div>

      <div className="section-label" style={{ marginTop: 24 }}>
        Or paste cards directly
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={SAMPLE_PLACEHOLDER}
        rows={10}
        spellCheck={false}
        disabled={!!apkg}
        style={{
          width: "100%",
          background: "var(--surface)",
          color: "var(--text)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 14,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 13,
          marginBottom: 14,
          resize: "vertical",
          minHeight: 180,
          opacity: apkg ? 0.4 : 1,
        }}
      />

      {!apkg && (
        <div className="filter-row" style={{ marginBottom: 8 }}>
          <span className="section-label" style={{ marginRight: 8, marginBottom: 0 }}>
            Format
          </span>
          {(["auto", "csv", "tsv", "json"] as const).map((f) => (
            <button
              key={f}
              className={`filter-chip ${hint === f ? "active" : ""}`}
              onClick={() => setHint(f)}
            >
              {f === "auto" ? "Auto-detect" : f.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div className="filter-row">
        <span className="section-label" style={{ marginRight: 8, marginBottom: 0 }}>
          Mode
        </span>
        <button
          className={`filter-chip ${mode === "append" ? "active" : ""}`}
          onClick={() => setMode("append")}
        >
          Append ({deck.cards.length} → {deck.cards.length + (parsed?.cards.length ?? 0)})
        </button>
        <button
          className={`filter-chip ${mode === "replace" ? "active" : ""}`}
          onClick={() => setMode("replace")}
        >
          Replace deck
        </button>
      </div>

      {parsed && (
        <>
          <div className="section-label" style={{ marginTop: 16 }}>
            Preview ({parsed.cards.length} card{parsed.cards.length === 1 ? "" : "s"} parsed
            {parsed.errors.length > 0
              ? `, ${parsed.errors.length} skipped`
              : ""}
            )
          </div>
          {parsed.errors.length > 0 && (
            <div
              className="stat-card"
              style={{
                marginBottom: 12,
                color: "var(--again)",
                fontSize: 12,
                whiteSpace: "pre-wrap",
              }}
            >
              {parsed.errors
                .slice(0, 5)
                .map((e) => `Row ${e.row}: ${e.message}`)
                .join("\n")}
              {parsed.errors.length > 5 && `\n+ ${parsed.errors.length - 5} more`}
            </div>
          )}
          <div className="deck-list" style={{ marginBottom: 16 }}>
            {previewRows.map((c, i) => (
              <div key={i} className="stat-card" style={{ display: "flex", gap: 12 }}>
                <span
                  style={{
                    fontFamily: "var(--font-jp)",
                    fontSize: 22,
                    minWidth: 36,
                    textAlign: "center",
                  }}
                >
                  {c.kanji}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {c.meanings.slice(0, 3).join(" · ")}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
                    {[c.reading, c.jlpt, c.keyword].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
            ))}
            {parsed.cards.length > previewRows.length && (
              <div className="stat-card" style={{ color: "var(--text-dim)", fontSize: 12 }}>
                + {parsed.cards.length - previewRows.length} more
              </div>
            )}
          </div>

          {wouldExceedFreeCap && (
            <div
              className="stat-card"
              style={{
                marginBottom: 12,
                color: "var(--accent)",
                background: "var(--accent-soft)",
                fontSize: 12,
                cursor: "pointer",
              }}
              onClick={() =>
                go({
                  name: "paywall",
                  reason: `Free decks cap at ${cardCap} cards. Upgrade for unlimited.`,
                })
              }
            >
              Free tier cap: {cardCap} cards. Only the first {cardCap} will be saved. Tap to
              upgrade.
            </div>
          )}
          <button
            className="study-cta"
            onClick={handleImport}
            disabled={parsed.cards.length === 0}
            style={parsed.cards.length === 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
          >
            {mode === "replace"
              ? `Replace deck with ${Math.min(parsed.cards.length, cardCap)} card${Math.min(parsed.cards.length, cardCap) === 1 ? "" : "s"}`
              : `Append ${Math.min(parsed.cards.length, cardCap - (deck?.cards.length ?? 0))} card${Math.min(parsed.cards.length, cardCap - (deck?.cards.length ?? 0)) === 1 ? "" : "s"}`}
          </button>
        </>
      )}
    </div>
  );
}
