import { useMemo } from "react";

import { todayStr } from "@/storage/state";
import type { DailyStats } from "@/types";

interface HeatmapProps {
  byDay: Record<string, DailyStats>;
  /** How many trailing weeks to render. Default 12 (~3 months). */
  weeks?: number;
}

interface Cell {
  iso: string;
  reviewed: number;
  /** 0 = no reviews, 1-4 = intensity bucket. */
  level: 0 | 1 | 2 | 3 | 4;
  isToday: boolean;
  weekday: number; // 0 = Sun
  /** True if the date is in the future relative to today. */
  isFuture: boolean;
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Stable yyyy-mm-dd from a Date (local time, matches the state.byDay key format). */
function isoOf(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Calendar-style activity heatmap inspired by GitHub's contribution graph.
 *
 * The grid is 7 rows (weekdays Sun→Sat, top to bottom) by N week-columns.
 * The right-most column is the current (partial) week ending today; older
 * weeks fill columns to the left. Cells fill from the bottom-up:
 *
 *   Sun  □ □ ▤ ▤ ■
 *   Mon  □ ▤ ■ ▤ ■   ← darker = more reviews
 *   …
 *
 * We bucket review counts into 5 levels using the actual max within the
 * window, so a learner doing 5 reviews/day still sees variation rather
 * than a uniformly-pale chart. Today's cell is outlined in the accent
 * color regardless of fill so it's findable at a glance.
 *
 * Future dates (right of today within the current week) are rendered as
 * empty placeholders so the grid stays rectangular.
 */
export function ActivityHeatmap({ byDay, weeks = 12 }: HeatmapProps) {
  const { cells, monthMarks, totalReviews, max } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Right-most column ends on today; back up enough days to fill `weeks`
    // columns of 7. Start at the Sunday of the week that's `weeks-1` weeks
    // before this Sunday.
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - today.getDay()); // back up to Sunday
    const start = new Date(lastSunday);
    start.setDate(lastSunday.getDate() - (weeks - 1) * 7);

    const totalDays = weeks * 7;
    const todayIso = todayStr();
    const out: Cell[] = [];
    let max = 0;
    let totalReviews = 0;
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = isoOf(d);
      const stat = byDay[iso];
      const reviewed = stat?.reviewed ?? 0;
      if (reviewed > max) max = reviewed;
      totalReviews += reviewed;
      out.push({
        iso,
        reviewed,
        level: 0,
        isToday: iso === todayIso,
        weekday: d.getDay(),
        isFuture: d > today,
      });
    }
    // Bucket: thresholds at 25%, 50%, 75% of the window-max (min 1).
    const safeMax = Math.max(1, max);
    for (const c of out) {
      if (c.reviewed === 0) c.level = 0;
      else if (c.reviewed >= safeMax * 0.75) c.level = 4;
      else if (c.reviewed >= safeMax * 0.5) c.level = 3;
      else if (c.reviewed >= safeMax * 0.25) c.level = 2;
      else c.level = 1;
    }

    // Month label positions: a column gets a label if its first cell's day-
    // of-month is <= 7 (= column straddles a month boundary). Use the cell
    // in the top row (Sunday) of each column.
    const monthMarks: { col: number; label: string }[] = [];
    for (let col = 0; col < weeks; col++) {
      const cell = out[col * 7]; // Sunday of column
      const date = new Date(cell.iso);
      if (date.getDate() <= 7) {
        monthMarks.push({ col, label: MONTH_LABELS[date.getMonth()] });
      }
    }

    return { cells: out, monthMarks, totalReviews, max };
  }, [byDay, weeks]);

  // Pivot to row-major (7 rows × weeks cols) for rendering.
  // cells[] is column-major as built — 7 entries per week starting Sunday.
  const rows: Cell[][] = Array.from({ length: 7 }, () => []);
  for (let i = 0; i < cells.length; i++) {
    const row = i % 7;
    rows[row].push(cells[i]);
  }

  return (
    <div
      className="activity-heatmap"
      role="img"
      aria-label={`Daily activity heatmap, last ${weeks} weeks. ${totalReviews} reviews total. Highest single day: ${max} reviews.`}
    >
      {/* Month labels along the top */}
      <div className="activity-heatmap-months" aria-hidden>
        {monthMarks.map((m) => (
          <span
            key={`${m.col}-${m.label}`}
            className="activity-heatmap-month"
            style={{ left: `calc(var(--hm-day-label-w) + ${m.col} * (var(--hm-cell-size) + var(--hm-gap)))` }}
          >
            {m.label}
          </span>
        ))}
      </div>
      <div className="activity-heatmap-body">
        {/* Day-of-week labels (left edge, Mon/Wed/Fri visible). */}
        <div className="activity-heatmap-day-labels" aria-hidden>
          {DAY_LABELS.map((d, i) => (
            <span
              key={i}
              className="activity-heatmap-day-label"
              style={{ visibility: i % 2 === 1 ? "visible" : "hidden" }}
            >
              {d}
            </span>
          ))}
        </div>
        {/* The 7-row grid. */}
        <div className="activity-heatmap-grid">
          {rows.map((row, r) => (
            <div key={r} className="activity-heatmap-row">
              {row.map((cell) => (
                <span
                  key={cell.iso}
                  className={`activity-heatmap-cell level-${cell.level}${cell.isToday ? " today" : ""}${cell.isFuture ? " future" : ""}`}
                  title={
                    cell.isFuture
                      ? cell.iso
                      : `${cell.iso}: ${cell.reviewed} review${cell.reviewed === 1 ? "" : "s"}`
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Color-intensity legend */}
      <div className="activity-heatmap-legend" aria-hidden>
        <span className="activity-heatmap-legend-label">Less</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <span key={lvl} className={`activity-heatmap-cell level-${lvl}`} />
        ))}
        <span className="activity-heatmap-legend-label">More</span>
      </div>
    </div>
  );
}
