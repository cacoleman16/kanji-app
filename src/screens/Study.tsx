import { useCallback, useEffect, useRef, useState } from "react";

import { ConjugationTableView } from "@/components/ConjugationTable";
import { allDecks } from "@/data/allDecks";
import { recommendNextDeck } from "@/data/recommendDeck";
import { tryAutoBackup } from "@/native/autoBackup";
import { haptic, hapticSelection } from "@/native/bridge";
import { previewIntervals, sm2 } from "@/srs/sm2";
import { buildQueue, shuffleArray } from "@/srs/queue";
import { todayStr, updateStreak } from "@/storage/state";
import type {
  AnyCard,
  AppState,
  CardProgress,
  DailyStats,
  Deck,
  KanjiCard,
  Rating,
  VocabCard,
} from "@/types";
import { vocabWordSize } from "@/utils/format";

interface StudyProps {
  deck: Deck | undefined;
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
  onDone: () => void;
  /** Optional — when provided, the post-session screen shows a "what's next?"
      card that can navigate the user directly into the recommended deck. */
  onPickNext?: (deckId: string) => void;
  includeAll?: boolean;
}

interface UndoSnapshot {
  kanji: string;
  rating: Rating;
  prevProgressForKanji: CardProgress | undefined;
  prevQueue: AnyCard[];
  prevIdx: number;
  prevSessionStats: SessionStats;
  prevStats: AppState["stats"];
  prevStreak: AppState["streak"];
}

interface SessionStats {
  reviewed: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
  skipped: number;
}

const EMPTY_DAILY: DailyStats = { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 };

export function Study({
  deck,
  state,
  setState,
  onDone,
  onPickNext,
  includeAll = false,
}: StudyProps) {
  const [queue, setQueue] = useState<AnyCard[]>(() => {
    if (!deck) return [];
    return buildQueue(deck.cards, state.progress, {
      newPerDay: state.settings.newPerDay,
      now: Date.now(),
      includeAll,
    });
  });
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    reviewed: 0,
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
    skipped: 0,
  });
  const [undoStack, setUndoStack] = useState<UndoSnapshot[]>([]);
  const skippedCards = useRef(new Set<string>());

  const total = queue.length;
  const current = queue[idx];

  const rate = useCallback(
    (rating: Rating) => {
      if (!current) return;
      // Soft haptic tick on iOS so the rate registers physically.
      void haptic(rating === "again" ? "medium" : "light");
      const prev = state.progress[current.kanji];
      const next = sm2(prev, rating);
      const today = todayStr();

      const snapshot: UndoSnapshot = {
        kanji: current.kanji,
        rating,
        prevProgressForKanji: prev,
        prevQueue: queue,
        prevIdx: idx,
        prevSessionStats: sessionStats,
        prevStats: state.stats,
        prevStreak: state.streak,
      };
      setUndoStack((stk) => [...stk, snapshot]);

      setState((s) => {
        const byDay = { ...(s.stats.byDay || {}) };
        const d: DailyStats = byDay[today] || { ...EMPTY_DAILY };
        byDay[today] = {
          ...d,
          reviewed: d.reviewed + 1,
          [rating]: (d[rating] || 0) + 1,
        };
        return {
          ...s,
          progress: { ...s.progress, [current.kanji]: next },
          stats: { ...s.stats, byDay },
          streak: updateStreak(s.streak, today),
        };
      });
      setSessionStats((ss) => ({
        ...ss,
        reviewed: ss.reviewed + 1,
        [rating]: ss[rating] + 1,
      }));

      if (rating === "again") {
        setQueue((q) => {
          const rest = q.slice(idx + 1);
          const insertAt = Math.min(rest.length, 3);
          const newRest = [...rest.slice(0, insertAt), current, ...rest.slice(insertAt)];
          return [...q.slice(0, idx + 1), ...newRest];
        });
      }

      setFlipped(false);
      setIdx((i) => i + 1);
    },
    [current, idx, queue, sessionStats, state.progress, state.stats, state.streak, setState],
  );

  const undo = useCallback(() => {
    setUndoStack((stk) => {
      if (stk.length === 0) return stk;
      const last = stk[stk.length - 1];
      setState((s) => {
        const newProgress = { ...s.progress };
        if (last.prevProgressForKanji === undefined) delete newProgress[last.kanji];
        else newProgress[last.kanji] = last.prevProgressForKanji;
        return { ...s, progress: newProgress, stats: last.prevStats, streak: last.prevStreak };
      });
      setSessionStats(last.prevSessionStats);
      setQueue(last.prevQueue);
      setIdx(last.prevIdx);
      setFlipped(true);
      return stk.slice(0, -1);
    });
  }, [setState]);

  const skip = useCallback(() => {
    if (!current) return;
    setFlipped(false);
    setSessionStats((ss) => ({ ...ss, skipped: ss.skipped + 1 }));
    const wasSkipped = skippedCards.current.has(current.kanji);
    if (wasSkipped || idx >= queue.length - 1) {
      setIdx((i) => i + 1);
    } else {
      skippedCards.current.add(current.kanji);
      setQueue((q) => [...q.slice(0, idx), ...q.slice(idx + 1), current]);
    }
  }, [current, idx, queue]);

  const shuffleRemaining = useCallback(() => {
    setQueue((q) => {
      const seen = q.slice(0, idx + 1);
      const remaining = q.slice(idx + 1);
      shuffleArray(remaining);
      return [...seen, ...remaining];
    });
  }, [idx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!current) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
      if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        undo();
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        skip();
      }
      if (flipped) {
        if (e.key === "1") rate("again");
        if (e.key === "2") rate("hard");
        if (e.key === "3") rate("good");
        if (e.key === "4") rate("easy");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, flipped, rate, undo, skip]);

  if (!deck) {
    return (
      <div className="session-done">
        <div className="done-title">Deck not found</div>
        <button className="primary-btn" onClick={onDone}>
          Home
        </button>
      </div>
    );
  }

  if (!current) {
    // Session complete. Fire-and-forget auto-backup if eligible. Throttled
    // to once per 12 hours inside tryAutoBackup; cheap to call always.
    if (sessionStats.reviewed > 0) {
      void tryAutoBackup(state, (timestamp) =>
        setState((s) => ({ ...s, settings: { ...s.settings, lastAutoBackupAt: timestamp } })),
      );
    }
    // Compute "what's next?" recommendation. Skipped when no navigation
    // handler was wired (paranoia for callers that don't care) or when the
    // user did 0 reviews (this is just an empty post-session screen).
    const recommendation =
      onPickNext && sessionStats.reviewed > 0 && deck
        ? recommendNextDeck(deck, allDecks(state), state)
        : null;
    return (
      <div className="fade-in session-done">
        <div className="done-emoji">よくできました</div>
        <div className="done-title">Session complete</div>
        <div className="done-sub">
          {total === 0
            ? "No cards were due. Come back later."
            : "Nice work. Progress saved locally."}
        </div>
        {total > 0 && (
          <div className="done-stats">
            <div>
              <div className="done-stat-val" style={{ color: "var(--again)" }}>
                {sessionStats.again}
              </div>
              <div className="done-stat-lbl">Again</div>
            </div>
            <div>
              <div className="done-stat-val" style={{ color: "var(--good)" }}>
                {sessionStats.good + sessionStats.easy}
              </div>
              <div className="done-stat-lbl">Correct</div>
            </div>
            <div>
              <div className="done-stat-val">{sessionStats.reviewed}</div>
              <div className="done-stat-lbl">Total</div>
            </div>
          </div>
        )}
        {recommendation && onPickNext && (
          <button
            className="next-deck-card"
            onClick={() => onPickNext(recommendation.deck.id)}
            aria-label={`What's next: ${recommendation.deck.name}, ${recommendation.reason}`}
          >
            <div className="next-deck-card-eyebrow">What's next</div>
            <div className="next-deck-card-name">{recommendation.deck.name}</div>
            <div className="next-deck-card-reason">{recommendation.reason}</div>
          </button>
        )}
        <button className="primary-btn" onClick={onDone}>
          Done
        </button>
      </div>
    );
  }

  const progressPct = total === 0 ? 0 : Math.round((idx / total) * 100);
  const intervals = previewIntervals(state.progress[current.kanji]);
  const isVocab = deck.kind === "vocab";
  const isGrammar = deck.kind === "grammar";
  const isKana = deck.id.startsWith("kana-");
  /** Decks that support the EN ↔ JP direction toggle. */
  const supportsDirection = isVocab || isKana;
  const direction = state.settings.vocabDirection || "ja-en";
  /** Show the kana reading on vocab card fronts (default true). Toggleable. */
  const showFurigana = state.settings.showFurigana !== false;
  const cardBackScale = { small: 0.8, medium: 1, large: 1.3 }[
    state.settings.cardBackFontSize || "medium"
  ];
  // Treat as vocab if the deck is vocab; expose the vocab-only fields safely.
  const v = current as VocabCard;

  return (
    <div className="fade-in">
      <div className="study-topbar">
        <button className="icon-btn" onClick={onDone} aria-label="Back">
          ←
        </button>
        <div className="study-progress-text">
          {idx + 1} / {total}
        </div>
        <div className="topbar-actions">
          {supportsDirection && (
            <button
              className="undo-btn"
              onClick={() =>
                setState((s) => ({
                  ...s,
                  settings: {
                    ...s.settings,
                    vocabDirection:
                      (s.settings.vocabDirection || "ja-en") === "en-ja" ? "ja-en" : "en-ja",
                  },
                }))
              }
              aria-label="Toggle direction"
              title="Swap front/back: Japanese ↔ English"
            >
              {direction === "en-ja" ? "EN → JP" : "JP → EN"}
            </button>
          )}
          {isVocab && (
            <button
              className="undo-btn"
              onClick={() =>
                setState((s) => ({
                  ...s,
                  settings: { ...s.settings, showFurigana: !showFurigana },
                }))
              }
              aria-label={showFurigana ? "Hide furigana on card fronts" : "Show furigana on card fronts"}
              title={
                showFurigana
                  ? "Hide reading on card front (recall test)"
                  : "Show reading on card front"
              }
              style={{
                opacity: showFurigana ? 1 : 0.55,
                fontFamily: "var(--font-jp)",
              }}
            >
              ふ {showFurigana ? "on" : "off"}
            </button>
          )}
          <button
            className="undo-btn"
            onClick={shuffleRemaining}
            disabled={total - idx - 1 < 2}
            aria-label="Shuffle remaining cards"
            title="Shuffle remaining cards"
          >
            ⇌ Shuffle
          </button>
          <button
            className="undo-btn"
            onClick={undo}
            disabled={undoStack.length === 0}
            aria-label="Undo last rating"
            title="Undo last rating (U)"
          >
            <span className="undo-glyph">↶</span>
            Undo
          </button>
        </div>
      </div>
      <div
        className="study-progress-bar"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Session progress: card ${idx + 1} of ${total}`}
      >
        <div className="study-progress-fill" style={{ width: progressPct + "%" }} />
      </div>

      <div className="card-stage">
        <div
          key={idx}
          className={`card ${flipped ? "flipped" : ""}`}
          onClick={() => {
            void hapticSelection();
            setFlipped((f) => !f);
          }}
          role="button"
          tabIndex={0}
          aria-label={
            flipped
              ? `Showing answer for ${current.kanji}. Activate to flip back to question.`
              : `Question card: ${current.kanji}. Activate to reveal the answer.`
          }
          aria-pressed={flipped}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              void hapticSelection();
              setFlipped((f) => !f);
            }
          }}
        >
          <div
            className={`face face-front${isVocab ? " vocab-front" : ""}${isGrammar ? " grammar-front" : ""}`}
          >
            {isKana ? (
              direction === "en-ja" ? (
                // Romaji on the front; user has to recall the kana
                <span
                  className="meaning"
                  style={{
                    padding: 0,
                    fontSize: "clamp(72px, 18vw, 120px)",
                    fontWeight: 600,
                    fontFamily: "var(--font-ui)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {(current as KanjiCard).keyword || current.meanings[0]}
                </span>
              ) : (
                <span className="kanji-huge" lang="ja">
                  {current.kanji}
                </span>
              )
            ) : isGrammar ? (
              <>
                <span className="grammar-pattern-large" lang="ja">
                  {current.kanji}
                </span>
                {v.reading && v.reading !== current.kanji && (
                  <span className="grammar-reading">{v.reading}</span>
                )}
                {v.category && <span className="grammar-category">{v.category}</span>}
              </>
            ) : isVocab ? (
              direction === "en-ja" ? (
                <span className="meaning" style={{ padding: 0 }}>
                  {current.meanings[0]}
                  {current.meanings.length > 1 && (
                    <div className="secondary">{current.meanings.slice(1).join(" · ")}</div>
                  )}
                </span>
              ) : (
                <>
                  <span className="vocab-word" lang="ja" style={vocabWordSize(current.kanji)}>
                    {current.kanji}
                  </span>
                  {v.reading && showFurigana && (
                    <span className="vocab-reading" lang="ja">
                      {v.reading}
                    </span>
                  )}
                </>
              )
            ) : (
              <span className="kanji-huge" lang="ja">
                {current.kanji}
              </span>
            )}
            <span className="tap-hint">Tap to flip</span>
          </div>
          <div
            className="face face-back"
            style={{ ["--back-font-scale" as string]: cardBackScale } as React.CSSProperties}
          >
            {isKana ? (
              <KanaBack
                card={current as KanjiCard}
                deckLabel={deck.id === "kana-hiragana" ? "Hiragana" : "Katakana"}
                direction={direction}
              />
            ) : isGrammar ? (
              <>
                {/* Pattern repeated at the top of the back so the user can re-verify */}
                <div
                  className="meaning"
                  style={{ fontFamily: "var(--font-jp)", fontSize: "calc(18px * var(--back-font-scale, 1))" }}
                >
                  <span lang="ja">{current.kanji}</span>
                  {current.meanings.length > 0 && (
                    <div className="secondary">{current.meanings.join(" · ")}</div>
                  )}
                </div>
                {v.conjugation_table && <ConjugationTableView table={v.conjugation_table} />}
                {v.context && (
                  <div className="keyword-block">
                    <div className="keyword-label">{v.conjugation_table ? "Note" : "How to use"}</div>
                    <div className="etymology">{v.context}</div>
                  </div>
                )}
                {v.example_sentence && (
                  <div className="vocab-example">
                    <div className="vocab-example-label">Example</div>
                    <div className="vocab-example-jp" lang="ja">
                      {v.example_sentence}
                    </div>
                    {v.example_reading && (
                      <div className="vocab-example-reading" lang="ja">
                        {v.example_reading}
                      </div>
                    )}
                    {v.example_meaning && (
                      <div className="vocab-example-en">{v.example_meaning}</div>
                    )}
                  </div>
                )}
                {v.category && (
                  <div className="readings">
                    <div className="reading-row">
                      <span className="reading-label">Category</span>
                      <span className="reading-value">{v.category}</span>
                    </div>
                  </div>
                )}
                {v.jlpt && (
                  <div className="readings">
                    <div className="reading-row">
                      <span className="reading-label">JLPT</span>
                      <span className="reading-value">{v.jlpt}</span>
                    </div>
                  </div>
                )}
              </>
            ) : isVocab ? (
              direction === "en-ja" ? (
                <>
                  <div className="meaning" style={{ fontFamily: "var(--font-jp)" }}>
                    <span style={vocabWordSize(current.kanji)}>{current.kanji}</span>
                  </div>
                  {v.reading && (
                    <div className="readings">
                      <div className="reading-row">
                        <span className="reading-label">Reading</span>
                        <span className="reading-value" style={{ fontFamily: "var(--font-jp)" }}>
                          {v.reading}
                        </span>
                      </div>
                    </div>
                  )}
                  {v.example_sentence && (
                    <div className="vocab-example">
                      <div className="vocab-example-label">Example</div>
                      <div className="vocab-example-jp">{v.example_sentence}</div>
                      {v.example_reading && (
                        <div className="vocab-example-reading">{v.example_reading}</div>
                      )}
                      {v.example_meaning && (
                        <div className="vocab-example-en">{v.example_meaning}</div>
                      )}
                    </div>
                  )}
                  {v.category && (
                    <div className="readings">
                      <div className="reading-row">
                        <span className="reading-label">Category</span>
                        <span className="reading-value">{v.category}</span>
                      </div>
                    </div>
                  )}
                  {v.context && (
                    <div className="keyword-block">
                      <div className="keyword-label">Context</div>
                      <div className="etymology">{v.context}</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="meaning">
                    {current.meanings[0]}
                    {current.meanings.length > 1 && (
                      <div className="secondary">{current.meanings.slice(1).join(" · ")}</div>
                    )}
                  </div>
                  {v.reading && (
                    <div className="readings">
                      <div className="reading-row">
                        <span className="reading-label">Reading</span>
                        <span className="reading-value" style={{ fontFamily: "var(--font-jp)" }}>
                          {v.reading}
                        </span>
                      </div>
                    </div>
                  )}
                  {v.example_sentence && (
                    <div className="vocab-example">
                      <div className="vocab-example-label">Example</div>
                      <div className="vocab-example-jp">{v.example_sentence}</div>
                      {v.example_reading && (
                        <div className="vocab-example-reading">{v.example_reading}</div>
                      )}
                      {v.example_meaning && (
                        <div className="vocab-example-en">{v.example_meaning}</div>
                      )}
                    </div>
                  )}
                  {v.category && (
                    <div className="readings">
                      <div className="reading-row">
                        <span className="reading-label">Category</span>
                        <span className="reading-value">{v.category}</span>
                      </div>
                    </div>
                  )}
                  {v.context && (
                    <div className="keyword-block">
                      <div className="keyword-label">Context</div>
                      <div className="etymology">{v.context}</div>
                    </div>
                  )}
                </>
              )
            ) : (
              <>
                <div className="meaning">
                  {current.meanings[0]}
                  {current.meanings.length > 1 && (
                    <div className="secondary">{current.meanings.slice(1).join(" · ")}</div>
                  )}
                </div>
                <div className="examples">
                  {(current.examples || []).map((ex, i) => (
                    <div className="example" key={i}>
                      <span className="ex-kanji">{ex.kanji}</span>
                      <span className="ex-kana">{ex.kana}</span>
                      <span className="ex-meaning">{ex.meaning}</span>
                    </div>
                  ))}
                </div>
                <div className="readings">
                  {(current.on_yomi || []).length > 0 && (
                    <div className="reading-row">
                      <span className="reading-label">On</span>
                      <span className="reading-value">{(current.on_yomi || []).join(", ")}</span>
                    </div>
                  )}
                  {(current.kun_yomi || []).length > 0 && (
                    <div className="reading-row">
                      <span className="reading-label">Kun</span>
                      <span className="reading-value">{(current.kun_yomi || []).join(", ")}</span>
                    </div>
                  )}
                </div>
                <div className="keyword-block">
                  <div className="keyword-label">Keyword</div>
                  <div className="keyword">{current.keyword}</div>
                  <div className="etymology">{current.etymology}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="rating-area">
        {!flipped ? (
          <div className="flip-prompt">
            <button
              className="flip-btn"
              onClick={() => setFlipped(true)}
              aria-label="Show the answer for this card. Press space or enter."
            >
              Show answer
            </button>
          </div>
        ) : (
          <div className="rating-grid" role="group" aria-label="Rate how well you knew this card">
            <button
              className="rating-btn again"
              onClick={() => rate("again")}
              aria-label={`Again, didn't remember. Card returns in ${intervals.again}. Press 1.`}
            >
              Again
              <span className="rating-interval" aria-hidden>{intervals.again}</span>
            </button>
            <button
              className="rating-btn hard"
              onClick={() => rate("hard")}
              aria-label={`Hard, barely got it. Next review in ${intervals.hard}. Press 2.`}
            >
              Hard
              <span className="rating-interval" aria-hidden>{intervals.hard}</span>
            </button>
            <button
              className="rating-btn good"
              onClick={() => rate("good")}
              aria-label={`Good, got it. Next review in ${intervals.good}. Press 3.`}
            >
              Good
              <span className="rating-interval" aria-hidden>{intervals.good}</span>
            </button>
            <button
              className="rating-btn easy"
              onClick={() => rate("easy")}
              aria-label={`Easy, instant recall. Next review in ${intervals.easy}. Press 4.`}
            >
              Easy
              <span className="rating-interval" aria-hidden>{intervals.easy}</span>
            </button>
          </div>
        )}
        <div className="skip-area">
          <button className="skip-btn" onClick={skip} title="Skip card (S)">
            Skip →
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Dedicated back-of-card layout for kana decks. The kanji-card schema would
 * render OK for kana (since on_yomi/kun_yomi are empty), but kana have unique
 * structure (paired character from the other syllabary, voiced variants) that
 * deserve dedicated visual treatment.
 *
 * Direction handling:
 *   - ja-en: front shows the kana, back leads with the romaji answer + the
 *     paired kana / examples / mnemonic
 *   - en-ja: front shows the romaji, back leads with the kana answer
 */
function KanaBack({
  card,
  deckLabel,
  direction,
}: {
  card: KanjiCard;
  deckLabel: "Hiragana" | "Katakana";
  direction: "ja-en" | "en-ja";
}) {
  const isAnswer = direction === "en-ja";
  const otherLabel = deckLabel === "Hiragana" ? "Katakana" : "Hiragana";

  return (
    <>
      {/* The "answer" line: in en-ja the user just guessed at the kana, so show
          it big; in ja-en they guessed at the romaji, so the answer is the sound. */}
      {isAnswer ? (
        <div
          className="meaning"
          style={{
            fontFamily: "var(--font-jp)",
            fontSize: "calc(72px * var(--back-font-scale, 1))",
            textAlign: "center",
            padding: "8px 0 16px",
            border: "none",
          }}
          lang="ja"
        >
          {card.kanji}
          <div
            className="secondary"
            style={{ fontSize: "calc(13px * var(--back-font-scale, 1))", marginTop: 8 }}
          >
            "{card.keyword}" sound
          </div>
        </div>
      ) : (
        <div
          className="meaning"
          style={{
            fontSize: "calc(36px * var(--back-font-scale, 1))",
            textAlign: "center",
            padding: "8px 0 16px",
            border: "none",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          {card.keyword}
          <div
            className="secondary"
            style={{ fontSize: "calc(13px * var(--back-font-scale, 1))", marginTop: 8 }}
          >
            ({deckLabel.toLowerCase()})
          </div>
        </div>
      )}

      {/* Paired kana from the other syllabary — learn both at once */}
      {card.paired_kana && (
        <div className="kana-pair-block">
          <div className="kana-pair-cell">
            <div className="kana-pair-label">{deckLabel}</div>
            <div className="kana-pair-char" lang="ja">
              {card.kanji}
            </div>
            <div className="kana-pair-romaji">{card.keyword}</div>
          </div>
          <div className="kana-pair-cell">
            <div className="kana-pair-label">{otherLabel}</div>
            <div className="kana-pair-char" lang="ja">
              {card.paired_kana}
            </div>
            <div className="kana-pair-romaji">{card.keyword}</div>
          </div>
        </div>
      )}

      {/* Voiced variants */}
      {(card.dakuten || card.handakuten) && (
        <div>
          {card.dakuten && (
            <div className="kana-variant-row">
              <span className="kana-variant-label">+ ダクテン (゛)</span>
              <span className="kana-variant-char" lang="ja">
                {card.dakuten.kana}
              </span>
              <span className="kana-variant-romaji">{card.dakuten.romaji}</span>
            </div>
          )}
          {card.handakuten && (
            <div className="kana-variant-row">
              <span className="kana-variant-label">+ ハンダクテン (゜)</span>
              <span className="kana-variant-char" lang="ja">
                {card.handakuten.kana}
              </span>
              <span className="kana-variant-romaji">{card.handakuten.romaji}</span>
            </div>
          )}
        </div>
      )}

      {/* Real example words */}
      {card.examples.length > 0 && (
        <div className="examples">
          {card.examples.map((ex, i) => (
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

      {/* Mnemonic */}
      {card.etymology && (
        <div className="keyword-block">
          <div className="keyword-label">Mnemonic</div>
          <div className="etymology">{card.etymology}</div>
        </div>
      )}
    </>
  );
}
