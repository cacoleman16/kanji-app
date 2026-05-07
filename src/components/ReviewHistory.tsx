import type { CardProgress } from "@/types";

interface ReviewHistoryProps {
  /** Per-card SM-2 state, or null/undefined if the card has never been reviewed. */
  progress: CardProgress | null | undefined;
  /** Epoch ms — pass Date.now() to derive "due now" labels. */
  now?: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Human-readable "X days ago" / "in N days" / "today".
 * Returns "—" when ts is null/undefined/0.
 */
function relTime(ts: number | null | undefined, now: number): string {
  if (!ts) return "—";
  const delta = ts - now;
  const absDays = Math.abs(delta) / DAY_MS;
  if (absDays < 1 / 24) return delta > 0 ? "in <1 hour" : "just now";
  if (absDays < 1) {
    const h = Math.round(absDays * 24);
    return delta > 0 ? `in ${h}h` : `${h}h ago`;
  }
  const d = Math.round(absDays);
  if (d === 0) return "today";
  if (delta > 0) return d === 1 ? "tomorrow" : `in ${d}d`;
  return d === 1 ? "yesterday" : `${d}d ago`;
}

function intervalLabel(intervalDays: number, learning: boolean): string {
  if (learning) return "learning";
  if (intervalDays === 0) return "0 days";
  if (intervalDays < 30) return `${intervalDays}d`;
  if (intervalDays < 365) return `${Math.round(intervalDays / 30)}mo`;
  return `${Math.round(intervalDays / 365)}y`;
}

function statusFor(p: CardProgress, now: number): {
  label: string;
  cls: "dim" | "due" | "mastered" | "";
} {
  if (p.interval >= 21 && p.reps >= 3) return { label: "Mastered", cls: "mastered" };
  if (p.due <= now) return { label: "Due now", cls: "due" };
  if (p.learning) return { label: "Learning", cls: "" };
  return { label: "On schedule", cls: "" };
}

/**
 * Compact 6-cell review-history block for the DeckDetail peek modal.
 * Shows status / last reviewed / next due / interval / ease / reps.
 *
 * For brand-new cards (no progress yet) renders a simple "Not yet studied"
 * line — no dense grid for a card with nothing to show.
 */
export function ReviewHistory({ progress, now = Date.now() }: ReviewHistoryProps) {
  if (!progress) {
    return (
      <div className="review-history" style={{ display: "block", textAlign: "center" }}>
        <div className="review-history-label" style={{ marginBottom: 6 }}>
          Review history
        </div>
        <div className="review-history-value dim" style={{ fontSize: 12 }}>
          Not yet studied — start a session to begin tracking.
        </div>
      </div>
    );
  }
  const status = statusFor(progress, now);
  return (
    <div className="review-history" aria-label="Review history">
      <div className="review-history-row">
        <span className="review-history-label">Status</span>
        <span className={`review-history-value ${status.cls}`}>{status.label}</span>
      </div>
      <div className="review-history-row">
        <span className="review-history-label">Last seen</span>
        <span className="review-history-value">{relTime(progress.lastReview, now)}</span>
      </div>
      <div className="review-history-row">
        <span className="review-history-label">Next due</span>
        <span
          className={`review-history-value ${progress.due <= now ? "due" : ""}`}
        >
          {relTime(progress.due, now)}
        </span>
      </div>
      <div className="review-history-row">
        <span className="review-history-label">Interval</span>
        <span className="review-history-value">
          {intervalLabel(progress.interval, !!progress.learning)}
        </span>
      </div>
      <div className="review-history-row">
        <span className="review-history-label">Reps</span>
        <span className="review-history-value">{progress.reps}</span>
      </div>
      <div className="review-history-row">
        <span className="review-history-label">Ease</span>
        <span className="review-history-value">{progress.ease.toFixed(2)}</span>
      </div>
    </div>
  );
}
