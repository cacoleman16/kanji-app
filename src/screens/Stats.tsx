import { useMemo } from "react";

import { allDecks } from "@/data/allDecks";
import { isDeckUnlocked } from "@/entitlements/entitlement";
import { todayStr } from "@/storage/state";
import type { AppState, DailyStats, Deck } from "@/types";

interface StatsProps {
  state: AppState;
  onBack: () => void;
}

interface DayBucket {
  iso: string; // yyyy-mm-dd
  reviewed: number;
  again: number;
  good: number;
  easy: number;
  hard: number;
  isToday: boolean;
  shortLabel: string; // "Mo", "Tu", …
}

function isoDaysBack(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const day = new Date(d);
    day.setDate(d.getDate() - i);
    out.push(
      day.getFullYear() +
        "-" +
        String(day.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(day.getDate()).padStart(2, "0"),
    );
  }
  return out;
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function buildLast7(byDay: Record<string, DailyStats>): DayBucket[] {
  const today = todayStr();
  return isoDaysBack(7).map((iso) => {
    const d = byDay[iso] || { reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 };
    const date = new Date(iso);
    return {
      iso,
      reviewed: d.reviewed || 0,
      again: d.again || 0,
      hard: d.hard || 0,
      good: d.good || 0,
      easy: d.easy || 0,
      isToday: iso === today,
      shortLabel: DAY_LABELS[date.getDay()],
    };
  });
}

interface DeckBreakdown {
  deck: Deck;
  total: number;
  /** Cards with any progress entry. */
  learned: number;
  /** Cards considered "mastered" (interval ≥ 21 days, reps ≥ 3). */
  mastered: number;
  /** Pct of mastered/total, 0-100. */
  masteredPct: number;
  /** Pct of learned/total, 0-100. */
  learnedPct: number;
}

function buildDeckBreakdown(state: AppState): DeckBreakdown[] {
  const decks = allDecks(state).filter((d) => isDeckUnlocked(d, state));
  const out: DeckBreakdown[] = [];
  for (const deck of decks) {
    const total = deck.cards.length;
    if (total === 0) continue;
    let learned = 0;
    let mastered = 0;
    for (const c of deck.cards) {
      const p = state.progress[c.kanji];
      if (!p) continue;
      learned++;
      if (p.interval >= 21 && p.reps >= 3) mastered++;
    }
    if (learned === 0) continue; // hide untouched decks for clarity
    out.push({
      deck,
      total,
      learned,
      mastered,
      learnedPct: Math.round((learned / total) * 100),
      masteredPct: Math.round((mastered / total) * 100),
    });
  }
  // Most-progress decks first
  return out.sort((a, b) => b.learnedPct - a.learnedPct);
}

export function Stats({ state, onBack }: StatsProps) {
  const totalReviews = Object.values(state.stats.byDay || {}).reduce(
    (a, b) => a + (b.reviewed || 0),
    0,
  );
  const totalLearned = Object.keys(state.progress).length;

  const allRatings = Object.values(state.stats.byDay || {}).reduce(
    (acc: { again: number; hard: number; good: number; easy: number }, d: DailyStats) => {
      acc.again += d.again || 0;
      acc.hard += d.hard || 0;
      acc.good += d.good || 0;
      acc.easy += d.easy || 0;
      return acc;
    },
    { again: 0, hard: 0, good: 0, easy: 0 },
  );
  const correct = allRatings.hard + allRatings.good + allRatings.easy;
  const accuracy = totalReviews === 0 ? 0 : Math.round((correct / totalReviews) * 100);

  const last7 = useMemo(() => buildLast7(state.stats.byDay || {}), [state.stats.byDay]);
  const last7Total = last7.reduce((a, b) => a + b.reviewed, 0);
  const last7Max = Math.max(1, ...last7.map((b) => b.reviewed));

  const deckBreakdown = useMemo(() => buildDeckBreakdown(state), [state]);

  return (
    <div className="fade-in">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back to home">
          ←
        </button>
        <div className="topbar-title">Stats</div>
        <div style={{ width: 40 }} />
      </div>
      <div className="section-title">Stats</div>

      <div className="streak-row" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-label">Total reviews</div>
          <div className="stat-value">{totalReviews.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Accuracy</div>
          <div className="stat-value">
            {accuracy}
            <span className="stat-unit">%</span>
          </div>
        </div>
      </div>
      <div className="streak-row">
        <div className="stat-card">
          <div className="stat-label">Cards learned</div>
          <div className="stat-value">{totalLearned.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Longest streak</div>
          <div className="stat-value">
            {state.streak.longest}
            <span className="stat-unit">d</span>
          </div>
        </div>
      </div>

      {/* ---------- 7-day bar chart ---------- */}
      <div className="stats-chart" style={{ marginTop: 24 }}>
        <div className="stats-chart-header">
          <div className="stats-chart-title">Last 7 days</div>
          <div className="stats-chart-meta">
            {last7Total} review{last7Total === 1 ? "" : "s"}
          </div>
        </div>
        <div className="stats-bars" role="img" aria-label={`Reviews per day, last 7 days, total ${last7Total}`}>
          {last7.map((day) => {
            const heightPct = day.reviewed === 0 ? 0 : Math.max(8, (day.reviewed / last7Max) * 100);
            return (
              <div
                key={day.iso}
                className="stats-bar-col"
                title={`${day.iso}: ${day.reviewed} review${day.reviewed === 1 ? "" : "s"}`}
              >
                <div
                  className={`stats-bar ${day.reviewed === 0 ? "zero" : ""}`}
                  style={{ height: `${heightPct}%` }}
                >
                  {day.reviewed > 0 && <span className="stats-bar-value">{day.reviewed}</span>}
                </div>
                <div className={`stats-bar-label ${day.isToday ? "today" : ""}`}>
                  {day.shortLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ---------- Per-deck retention / mastery ---------- */}
      <div className="section-label" style={{ marginTop: 24 }}>
        Progress by deck
      </div>
      {deckBreakdown.length === 0 ? (
        <div
          style={{
            color: "var(--text-dim)",
            fontSize: 13,
            textAlign: "center",
            padding: "24px 0",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
          }}
        >
          Start a study session to see deck-level progress here.
        </div>
      ) : (
        <div>
          {deckBreakdown.map((b) => (
            <div key={b.deck.id} className="stats-deck-row">
              <div style={{ minWidth: 0 }}>
                <div className="stats-deck-name">{b.deck.name}</div>
                <div className="stats-deck-progress" aria-hidden>
                  <div
                    className="stats-deck-progress-fill"
                    style={{ width: `${b.learnedPct}%` }}
                  />
                </div>
              </div>
              <div className="stats-deck-meta">
                <strong>
                  {b.learned}
                  <span style={{ color: "var(--text-dim)", fontWeight: 400, fontSize: 11 }}>
                    {" "}
                    / {b.total}
                  </span>
                </strong>
                <div>
                  {b.mastered > 0 ? `${b.mastered} mastered` : `${b.learnedPct}% started`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- Rating breakdown footer ---------- */}
      <div className="section-label" style={{ marginTop: 24 }}>
        Rating breakdown (all-time)
      </div>
      <div
        className="stat-card"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          padding: 16,
        }}
      >
        {(
          [
            { key: "again" as const, label: "Again", color: "var(--again)" },
            { key: "hard" as const, label: "Hard", color: "var(--hard)" },
            { key: "good" as const, label: "Good", color: "var(--good)" },
            { key: "easy" as const, label: "Easy", color: "var(--easy)" },
          ]
        ).map(({ key, label, color }) => (
          <div key={key} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 600, color, fontVariantNumeric: "tabular-nums" }}>
              {allRatings[key]}
            </div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-dim)",
                marginTop: 4,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
