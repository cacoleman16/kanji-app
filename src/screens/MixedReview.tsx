import { useMemo, useState } from "react";

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
  const counts = useMemo(
    () => dueCountsByJlpt(allDecks(state), state.progress, Date.now()),
    [state],
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
            {counts.all}
          </div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-lbl">In selection</div>
          <div className="mini-stat-val">{selectedCount}</div>
        </div>
      </div>

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
        disabled={selectedCount === 0}
        style={selectedCount === 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
      >
        {selectedCount > 0
          ? `Start review (${selectedCount} card${selectedCount === 1 ? "" : "s"})`
          : "Nothing due"}
      </button>
    </div>
  );
}
