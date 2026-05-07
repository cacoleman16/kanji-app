import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { DailyStats } from "@/types";

import { ActivityHeatmap } from "./ActivityHeatmap";

afterEach(cleanup);

function isoBack(daysAgo: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function makeDay(reviewed: number): DailyStats {
  return { reviewed, again: 0, hard: 0, good: reviewed, easy: 0 };
}

describe("<ActivityHeatmap />", () => {
  it("renders an empty grid when there's no activity", () => {
    const { container } = render(<ActivityHeatmap byDay={{}} weeks={12} />);
    // 84 cells (12 weeks × 7 days), all level-0.
    const cells = container.querySelectorAll(".activity-heatmap-cell");
    // 84 grid cells + 5 legend cells = 89 total.
    expect(cells.length).toBe(89);
    const level0 = container.querySelectorAll(".activity-heatmap-cell.level-0");
    // 84 grid cells level-0 + 1 legend cell level-0 = 85.
    expect(level0.length).toBe(85);
  });

  it("buckets reviews into 4 intensity levels using window-max", () => {
    const byDay: Record<string, DailyStats> = {
      [isoBack(0)]: makeDay(40), // max → level 4
      [isoBack(2)]: makeDay(30), // 75% → level 4
      [isoBack(4)]: makeDay(20), // 50% → level 3
      [isoBack(6)]: makeDay(10), // 25% → level 2
      [isoBack(8)]: makeDay(2), // small → level 1
    };
    const { container } = render(<ActivityHeatmap byDay={byDay} weeks={12} />);
    expect(container.querySelectorAll(".activity-heatmap-cell.level-4").length).toBeGreaterThan(0);
    expect(container.querySelectorAll(".activity-heatmap-cell.level-3").length).toBeGreaterThan(0);
    expect(container.querySelectorAll(".activity-heatmap-cell.level-2").length).toBeGreaterThan(0);
    expect(container.querySelectorAll(".activity-heatmap-cell.level-1").length).toBeGreaterThan(0);
  });

  it("marks today's cell with the .today class", () => {
    const byDay = { [isoBack(0)]: makeDay(5) };
    const { container } = render(<ActivityHeatmap byDay={byDay} weeks={12} />);
    const todayCells = container.querySelectorAll(".activity-heatmap-cell.today");
    expect(todayCells.length).toBe(1);
  });

  it("provides an aria-label summarizing window totals", () => {
    const byDay = { [isoBack(1)]: makeDay(7), [isoBack(2)]: makeDay(13) };
    render(<ActivityHeatmap byDay={byDay} weeks={12} />);
    const grid = screen.getByRole("img");
    expect(grid.getAttribute("aria-label")).toMatch(/20 reviews total/);
    expect(grid.getAttribute("aria-label")).toMatch(/13 reviews/);
  });
});
