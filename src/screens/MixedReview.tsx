import { useMemo, useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { useAllDeckCards } from "@/hooks/useAllDeckCards";
import { allDecks } from "@/data/allDecks";
import { dueCountsByJlpt } from "@/srs/queue";
import type { AppState, Jlpt } from "@/types";

type Level = Jlpt | "all";

interface MixedReviewProps {
  state: AppState;
  onBack: () => void;
  onStart: (jlpt: Level) => void;
}

export function MixedReview({ state, onBack, onStart }: MixedReviewProps) {
  const [jlpt, setJlpt] = useState<Level>("all");
  // dueCountsByJlpt reads `c.jlpt` per card; the JLPT level isn't in the
  // build-time cardKeys index. Preload every default deck on mount so the
  // counts come out accurate. First visit pays a brief loader; subsequent
  // visits resolve from cache instantly.
  const decks = useMemo(() => allDecks(state), [state]);
  const { hydratedDecks, loading } = useAllDeckCards(decks);
  const counts = useMemo(
    () => dueCountsByJlpt(hydratedDecks, state.progress, Date.now()),
    [hydratedDecks, state.progress],
  );
  const selectedCount = jlpt === "all" ? counts.all : counts[jlpt] || 0;
  const levels: Level[] = ["all", "N5", "N4", "N3", "N2", "N1"];

  return (
    <div className="fade-in">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="topbar-title">Review Due</div>
        <div style={{ width: 40 }} />
      </div>

      <div className="deck-detail-header">
        <div className="deck-detail-title">Mixed review</div>
        <div className="deck-detail-sub">Due cards across all kanji decks</div>
      </div>

      <div className="deck-stats-grid">
        <div className="mini-stat">
          <div className="mini-stat-lbl">Total due</div>
          <div
            className="mini-stat-val"
            style={{ color: counts.all > 0 ? "var(--again)" : "var(--text)" }}
          >
            {loading ? "…" : counts.all}
          </div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-lbl">In selection</div>
          <div className="mini-stat-val">{loading ? "…" : selectedCount}</div>
        </div>
      </div>

      {!loading && counts.all === 0 ? (
        <EmptyState
          mark="静"
          title="All caught up"
          body={
            <>
              Nothing's due across your unlocked decks right now. Come back later — or open a
              deck and tap <strong>Review all</strong> to drill through learned cards anyway.
            </>
          }
          secondary={
            <button className="link-btn" onClick={onBack}>
              Back to Home
            </button>
          }
          style={{ marginTop: 16 }}
        />
      ) : (
        <>
          <div className="section-label">Filter by JLPT level</div>
          <div className="filter-row">
            {levels.map((lvl) => {
              const c = lvl === "all" ? counts.all : counts[lvl] || 0;
              const disabled = c === 0 && lvl !== "all";
              return (
                <button
                  key={lvl}
                  className={`filter-chip ${jlpt === lvl ? "active" : ""}`}
                  onClick={() => !disabled && setJlpt(lvl)}
                  disabled={disabled}
                  style={disabled ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
                >
                  {lvl === "all" ? "All" : lvl} <span style={{ opacity: 0.7 }}>· {c}</span>
                </button>
              );
            })}
          </div>

          <button
            className="study-cta"
            onClick={() => onStart(jlpt)}
            disabled={loading || selectedCount === 0}
            style={
              loading || selectedCount === 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined
            }
          >
            {loading
              ? "Loading…"
              : selectedCount > 0
                ? `Start review (${selectedCount} card${selectedCount === 1 ? "" : "s"})`
                : "Nothing due"}
          </button>
        </>
      )}
    </div>
  );
}
