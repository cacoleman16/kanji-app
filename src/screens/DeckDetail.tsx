import { useMemo, useState } from "react";

import { ConjugationTableView } from "@/components/ConjugationTable";
import type { AnyCard, AppState, Deck, Jlpt, KanjiCard, VocabCard } from "@/types";
import { vocabWordSize } from "@/utils/format";

type Level = Jlpt | "all";

interface DeckDetailProps {
  deck: Deck | undefined;
  state: AppState;
  onBack: () => void;
  onStudy: (opts: { includeAll?: boolean }) => void;
}

export function DeckDetail({ deck, state, onBack, onStudy }: DeckDetailProps) {
  const [peekIdx, setPeekIdx] = useState<number | null>(null);
  const [jlptFilter, setJlptFilter] = useState<Level>("all");

  const jlptLevels = useMemo<Level[]>(() => {
    if (!deck || (deck.kind !== "vocab" && deck.kind !== "grammar")) return [];
    const levels = new Set<Jlpt>();
    for (const c of deck.cards) {
      const j = (c as VocabCard).jlpt;
      if (j) levels.add(j);
    }
    return ["all", ...(["N5", "N4", "N3", "N2", "N1"] as Jlpt[]).filter((l) => levels.has(l))];
  }, [deck]);

  const displayCards = useMemo<AnyCard[]>(() => {
    if (!deck) return [];
    if (jlptFilter === "all") return deck.cards;
    if (deck.kind !== "vocab" && deck.kind !== "grammar") return deck.cards;
    return deck.cards.filter((c) => (c as VocabCard).jlpt === jlptFilter);
  }, [deck, jlptFilter]);

  if (!deck) {
    return (
      <div className="fade-in session-done">
        <div className="done-title">Deck not found</div>
        <button className="primary-btn" onClick={onBack}>
          Home
        </button>
      </div>
    );
  }

  const peek = peekIdx !== null ? deck.cards[peekIdx] : null;
  const peekVocab = peek as VocabCard | null;
  const peekKanji = peek as KanjiCard | null;

  const now = Date.now();
  let learned = 0;
  let due = 0;
  let newCount = 0;
  let mastered = 0;
  for (const c of deck.cards) {
    const p = state.progress[c.kanji];
    if (!p) newCount++;
    else {
      learned++;
      if (p.due <= now) due++;
      if (p.interval >= 21 && p.reps >= 3) mastered++;
    }
  }
  const total = deck.cards.length;
  const pctLearned = total === 0 ? 0 : Math.round((learned / total) * 100);
  const allCaughtUp = due === 0 && newCount === 0;

  const statusFor = (c: AnyCard): "new" | "learning" | "due" | "mastered" => {
    const p = state.progress[c.kanji];
    if (!p) return "new";
    if (p.interval >= 21 && p.reps >= 3) return "mastered";
    if (p.due <= now) return "due";
    return "learning";
  };

  return (
    <div className="fade-in">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="topbar-title">{deck.name}</div>
        <div style={{ width: 40 }} />
      </div>

      <div className="deck-detail-header">
        <div className="deck-detail-title">{deck.name}</div>
        <div className="deck-detail-sub">{deck.subtitle}</div>
      </div>

      <div className="deck-stats-grid">
        <div className="mini-stat">
          <div className="mini-stat-lbl">Learned</div>
          <div className="mini-stat-val">
            {learned}
            <span className="sub">
              / {total} · {pctLearned}%
            </span>
          </div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-lbl">Mastered</div>
          <div className="mini-stat-val">
            {mastered}
            <span className="sub">cards</span>
          </div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-lbl">Due now</div>
          <div
            className="mini-stat-val"
            style={{ color: due > 0 ? "var(--again)" : "var(--text)" }}
          >
            {due}
          </div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-lbl">New left</div>
          <div className="mini-stat-val">{newCount}</div>
        </div>
      </div>

      <button className="study-cta" onClick={() => onStudy(allCaughtUp ? { includeAll: true } : {})}>
        {due > 0 && newCount > 0
          ? `Study (${due} due · ${newCount} new)`
          : due > 0
            ? `Study ${due} due card${due === 1 ? "" : "s"}`
            : newCount > 0
              ? `Start ${Math.min(newCount, state.settings.newPerDay)} new card${newCount === 1 ? "" : "s"}`
              : `Review all ${total} cards`}
      </button>

      <div className="section-label">All cards</div>
      {(deck.kind === "vocab" || deck.kind === "grammar") && jlptLevels.length > 1 && (
        <div className="filter-row">
          {jlptLevels.map((lvl) => (
            <button
              key={lvl}
              className={`filter-chip ${jlptFilter === lvl ? "active" : ""}`}
              onClick={() => setJlptFilter(lvl)}
            >
              {lvl === "all" ? "All" : lvl}
            </button>
          ))}
        </div>
      )}
      <div className="legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ background: "var(--text-dim)", opacity: 0.35 }} />
          New
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: "var(--accent)" }} />
          Learning
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: "var(--again)" }} />
          Due
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ background: "var(--good)" }} />
          Mastered
        </span>
      </div>
      {deck.kind === "grammar" ? (
        <div className="grammar-list">
          {displayCards.map((c) => {
            const i = deck.cards.indexOf(c);
            const v = c as VocabCard;
            return (
              <button
                key={c.kanji}
                className="grammar-row"
                onClick={() => setPeekIdx(i)}
                aria-label={`${c.kanji} — ${c.meanings[0] ?? ""}`}
              >
                <span className={`status-dot ${statusFor(c)}`} />
                <div style={{ minWidth: 0 }}>
                  <div className="grammar-row-pattern" lang="ja">
                    {c.kanji}
                  </div>
                  <div className="grammar-row-meaning">
                    {(c.meanings || []).slice(0, 2).join(" · ")}
                  </div>
                </div>
                {v.jlpt && <span className="grammar-row-jlpt">{v.jlpt}</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="card-grid">
          {displayCards.map((c) => {
            const i = deck.cards.indexOf(c);
            return (
              <button key={c.kanji} className="card-tile" onClick={() => setPeekIdx(i)}>
                <span className={`status-dot ${statusFor(c)}`} />
                <span className="card-tile-kanji" lang="ja">
                  {c.kanji}
                </span>
                <span className="card-tile-keyword">{c.keyword || c.meanings[0]}</span>
              </button>
            );
          })}
        </div>
      )}

      {peek && peekIdx !== null && (
        <div className="peek-backdrop" onClick={() => setPeekIdx(null)}>
          <div className="peek-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="peek-close"
              onClick={() => setPeekIdx(null)}
              aria-label="Close"
            >
              ✕
            </button>
            {deck.kind === "grammar" ? (
              <div
                className="grammar-pattern-large"
                lang="ja"
                style={{ marginBottom: 4, marginTop: 4 }}
              >
                {peek.kanji}
              </div>
            ) : (
              <div className="peek-kanji" lang="ja" style={vocabWordSize(peek.kanji, "peek")}>
                {peek.kanji}
              </div>
            )}
            <div className="meaning">
              {peek.meanings[0]}
              {peek.meanings.length > 1 && (
                <div className="secondary">{peek.meanings.slice(1).join(" · ")}</div>
              )}
            </div>
            {deck.kind === "grammar" ? (
              <>
                {peekVocab?.conjugation_table && (
                  <ConjugationTableView table={peekVocab.conjugation_table} />
                )}
                {peekVocab?.context && (
                  <div className="keyword-block">
                    <div className="keyword-label">
                      {peekVocab.conjugation_table ? "Note" : "How to use"}
                    </div>
                    <div className="etymology">{peekVocab.context}</div>
                  </div>
                )}
                {peekVocab?.example_sentence && (
                  <div className="vocab-example">
                    <div className="vocab-example-label">Example</div>
                    <div className="vocab-example-jp" lang="ja">
                      {peekVocab.example_sentence}
                    </div>
                    {peekVocab.example_reading && (
                      <div className="vocab-example-reading" lang="ja">
                        {peekVocab.example_reading}
                      </div>
                    )}
                    {peekVocab.example_meaning && (
                      <div className="vocab-example-en">{peekVocab.example_meaning}</div>
                    )}
                  </div>
                )}
              </>
            ) : deck.id.startsWith("kana-") && peekKanji ? (
              // Kana peek: paired kana + voiced variants + example words + mnemonic.
              <>
                {peekKanji.paired_kana && (
                  <div className="kana-pair-block">
                    <div className="kana-pair-cell">
                      <div className="kana-pair-label">
                        {deck.id === "kana-hiragana" ? "Hiragana" : "Katakana"}
                      </div>
                      <div className="kana-pair-char" lang="ja">
                        {peek.kanji}
                      </div>
                      <div className="kana-pair-romaji">{peekKanji.keyword}</div>
                    </div>
                    <div className="kana-pair-cell">
                      <div className="kana-pair-label">
                        {deck.id === "kana-hiragana" ? "Katakana" : "Hiragana"}
                      </div>
                      <div className="kana-pair-char" lang="ja">
                        {peekKanji.paired_kana}
                      </div>
                      <div className="kana-pair-romaji">{peekKanji.keyword}</div>
                    </div>
                  </div>
                )}
                {(peekKanji.dakuten || peekKanji.handakuten) && (
                  <div>
                    {peekKanji.dakuten && (
                      <div className="kana-variant-row">
                        <span className="kana-variant-label">+ Dakuten ゛</span>
                        <span className="kana-variant-char" lang="ja">
                          {peekKanji.dakuten.kana}
                        </span>
                        <span className="kana-variant-romaji">{peekKanji.dakuten.romaji}</span>
                      </div>
                    )}
                    {peekKanji.handakuten && (
                      <div className="kana-variant-row">
                        <span className="kana-variant-label">+ Handakuten ゜</span>
                        <span className="kana-variant-char" lang="ja">
                          {peekKanji.handakuten.kana}
                        </span>
                        <span className="kana-variant-romaji">{peekKanji.handakuten.romaji}</span>
                      </div>
                    )}
                  </div>
                )}
                {(peekKanji.examples || []).length > 0 && (
                  <div className="examples">
                    {(peekKanji.examples || []).map((ex, i) => (
                      <div className="example" key={i}>
                        <span className="ex-kanji" lang="ja">
                          {ex.kanji}
                        </span>
                        <span className="ex-kana">{ex.kana}</span>
                        <span className="ex-meaning">{ex.meaning}</span>
                      </div>
                    ))}
                  </div>
                )}
                {peekKanji.etymology && (
                  <div className="keyword-block">
                    <div className="keyword-label">Mnemonic</div>
                    <div className="etymology">{peekKanji.etymology}</div>
                  </div>
                )}
              </>
            ) : deck.kind === "vocab" ? (
              <>
                {peekVocab?.reading && (
                  <div className="readings">
                    <div className="reading-row">
                      <span className="reading-label">Reading</span>
                      <span className="reading-value" style={{ fontFamily: "var(--font-jp)" }}>
                        {peekVocab.reading}
                      </span>
                    </div>
                  </div>
                )}
                {peekVocab?.example_sentence && (
                  <div className="vocab-example">
                    <div className="vocab-example-label">Example</div>
                    <div className="vocab-example-jp">{peekVocab.example_sentence}</div>
                    {peekVocab.example_reading && (
                      <div className="vocab-example-reading">{peekVocab.example_reading}</div>
                    )}
                    {peekVocab.example_meaning && (
                      <div className="vocab-example-en">{peekVocab.example_meaning}</div>
                    )}
                  </div>
                )}
                {peekVocab?.category && (
                  <div className="readings">
                    <div className="reading-row">
                      <span className="reading-label">Category</span>
                      <span className="reading-value">{peekVocab.category}</span>
                    </div>
                  </div>
                )}
                {peekVocab?.context && (
                  <div className="keyword-block">
                    <div className="keyword-label">Context</div>
                    <div className="etymology">{peekVocab.context}</div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="examples">
                  {(peek.examples || []).map((ex, i) => (
                    <div className="example" key={i}>
                      <span className="ex-kanji">{ex.kanji}</span>
                      <span className="ex-kana">{ex.kana}</span>
                      <span className="ex-meaning">{ex.meaning}</span>
                    </div>
                  ))}
                </div>
                <div className="readings">
                  {(peek.on_yomi || []).length > 0 && (
                    <div className="reading-row">
                      <span className="reading-label">On</span>
                      <span className="reading-value">{(peek.on_yomi || []).join(", ")}</span>
                    </div>
                  )}
                  {(peek.kun_yomi || []).length > 0 && (
                    <div className="reading-row">
                      <span className="reading-label">Kun</span>
                      <span className="reading-value">{(peek.kun_yomi || []).join(", ")}</span>
                    </div>
                  )}
                </div>
                <div className="keyword-block">
                  <div className="keyword-label">Keyword</div>
                  <div className="keyword">{peek.keyword}</div>
                  <div className="etymology">{peek.etymology}</div>
                </div>
              </>
            )}
            <div className="peek-nav">
              <button
                className="peek-nav-btn"
                onClick={() => setPeekIdx((i) => (i === null ? 0 : Math.max(0, i - 1)))}
                disabled={peekIdx === 0}
              >
                ←
              </button>
              <span className="peek-nav-counter">
                {peekIdx + 1} / {deck.cards.length}
              </span>
              <button
                className="peek-nav-btn"
                onClick={() =>
                  setPeekIdx((i) =>
                    i === null ? 0 : Math.min(deck.cards.length - 1, i + 1),
                  )
                }
                disabled={peekIdx === deck.cards.length - 1}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
