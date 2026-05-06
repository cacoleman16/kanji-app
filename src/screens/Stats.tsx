import type { AppState, DailyStats } from "@/types";

interface StatsProps {
  state: AppState;
  onBack: () => void;
}

export function Stats({ state, onBack }: StatsProps) {
  const days = Object.entries(state.stats.byDay || {})
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 7);
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

  return (
    <div className="fade-in">
      <div className="topbar">
        <button className="icon-btn" onClick={onBack}>
          ←
        </button>
        <div className="topbar-title">Stats</div>
        <div style={{ width: 40 }} />
      </div>
      <div className="section-title">Stats</div>

      <div className="streak-row" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-label">Reviews</div>
          <div className="stat-value">{totalReviews}</div>
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
          <div className="stat-label">Learned</div>
          <div className="stat-value">{totalLearned}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Longest streak</div>
          <div className="stat-value">
            {state.streak.longest}
            <span className="stat-unit">d</span>
          </div>
        </div>
      </div>

      <div className="section-label" style={{ marginTop: 28 }}>
        Last 7 days
      </div>
      <div className="deck-list">
        {days.length === 0 && (
          <div className="stat-card" style={{ color: "var(--text-dim)", fontSize: 13 }}>
            No reviews yet. Start a session!
          </div>
        )}
        {days.map(([d, s]) => (
          <div
            key={d}
            className="stat-card"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{d}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
                {s.again || 0} again · {(s.good || 0) + (s.easy || 0)} correct
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              {s.reviewed || 0}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
