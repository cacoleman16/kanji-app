import { describe, expect, it } from "vitest";

import type { CardProgress } from "@/types";
import { DEFAULT_EASE, EASE_FLOOR, MS_DAY, MS_MIN, previewIntervals, sm2 } from "./sm2";

const NOW = 1_700_000_000_000; // arbitrary fixed epoch ms

describe("sm2", () => {
  describe("new card (no prior progress)", () => {
    it("rates 'again' as a 10-minute relearn with default ease minus 0.2", () => {
      const next = sm2(null, "again", NOW);
      expect(next.reps).toBe(0);
      expect(next.interval).toBe(0);
      expect(next.due).toBe(NOW + 10 * MS_MIN);
      expect(next.ease).toBeCloseTo(DEFAULT_EASE - 0.2, 6);
      expect(next.learning).toBe(true);
      expect(next.lastReview).toBe(NOW);
    });

    it("rates 'hard' as 1 day, ease decreases by 0.15", () => {
      const next = sm2(null, "hard", NOW);
      expect(next.interval).toBe(1);
      expect(next.reps).toBe(1);
      expect(next.due).toBe(NOW + 1 * MS_DAY);
      expect(next.ease).toBeCloseTo(DEFAULT_EASE - 0.15, 6);
      expect(next.learning).toBe(false);
    });

    it("rates 'good' as 1 day, ease unchanged", () => {
      const next = sm2(null, "good", NOW);
      expect(next.interval).toBe(1);
      expect(next.reps).toBe(1);
      expect(next.ease).toBe(DEFAULT_EASE);
    });

    it("rates 'easy' as 4 days, ease increases by 0.15", () => {
      const next = sm2(null, "easy", NOW);
      expect(next.interval).toBe(4);
      expect(next.reps).toBe(1);
      expect(next.ease).toBeCloseTo(DEFAULT_EASE + 0.15, 6);
    });
  });

  describe("after first review (reps = 1)", () => {
    const after1: CardProgress = {
      ease: DEFAULT_EASE,
      interval: 1,
      reps: 1,
      due: NOW + MS_DAY,
      lastReview: NOW,
    };

    it("rates 'good' as exactly 6 days", () => {
      const next = sm2(after1, "good", NOW);
      expect(next.interval).toBe(6);
      expect(next.reps).toBe(2);
      expect(next.ease).toBe(DEFAULT_EASE);
    });

    it("rates 'easy' as round(6 * 1.3) = 8 days, ease +0.15", () => {
      const next = sm2(after1, "easy", NOW);
      expect(next.interval).toBe(8);
      expect(next.ease).toBeCloseTo(DEFAULT_EASE + 0.15, 6);
    });

    it("rates 'hard' as max(1, round(interval * 1.2)) and ease -0.15", () => {
      const next = sm2(after1, "hard", NOW);
      // round(1 * 1.2) = 1, and max(1, 1) = 1
      expect(next.interval).toBe(1);
      expect(next.ease).toBeCloseTo(DEFAULT_EASE - 0.15, 6);
    });

    it("rates 'again' resets reps to 0 and schedules a 10-minute relearn", () => {
      const next = sm2(after1, "again", NOW);
      expect(next.reps).toBe(0);
      expect(next.interval).toBe(0);
      expect(next.due).toBe(NOW + 10 * MS_MIN);
      expect(next.learning).toBe(true);
    });
  });

  describe("mature card (reps >= 2)", () => {
    const mature: CardProgress = {
      ease: 2.5,
      interval: 10,
      reps: 5,
      due: NOW + 10 * MS_DAY,
      lastReview: NOW - MS_DAY,
    };

    it("rates 'good' as round(interval * ease) and ease unchanged", () => {
      const next = sm2(mature, "good", NOW);
      expect(next.interval).toBe(25); // round(10 * 2.5)
      expect(next.ease).toBe(2.5);
      expect(next.due).toBe(NOW + 25 * MS_DAY);
    });

    it("rates 'easy' as round(interval * ease * 1.3) with ease +0.15", () => {
      const next = sm2(mature, "easy", NOW);
      expect(next.interval).toBe(33); // round(10 * 2.5 * 1.3) = round(32.5) = 33
      expect(next.ease).toBeCloseTo(2.65, 6);
    });

    it("rates 'hard' as round(interval * 1.2) with ease -0.15", () => {
      const next = sm2(mature, "hard", NOW);
      expect(next.interval).toBe(12); // round(10 * 1.2)
      expect(next.ease).toBeCloseTo(2.35, 6);
    });
  });

  describe("ease floor", () => {
    it("never drops ease below 1.3 on repeated 'again'", () => {
      let p: CardProgress = sm2(null, "again", NOW);
      for (let i = 0; i < 20; i++) p = sm2(p, "again", NOW);
      expect(p.ease).toBeGreaterThanOrEqual(EASE_FLOOR);
      expect(p.ease).toBe(EASE_FLOOR);
    });

    it("never drops ease below 1.3 on repeated 'hard'", () => {
      let p: CardProgress = sm2(null, "good", NOW);
      for (let i = 0; i < 20; i++) p = sm2(p, "hard", NOW);
      expect(p.ease).toBeGreaterThanOrEqual(EASE_FLOOR);
      expect(p.ease).toBe(EASE_FLOOR);
    });
  });

  describe("preserved invariants", () => {
    it("lastReview always equals now", () => {
      const t = NOW + 12345;
      expect(sm2(null, "good", t).lastReview).toBe(t);
      expect(sm2(null, "again", t).lastReview).toBe(t);
    });

    it("'good' on a graduating card uses interval 1 (matches legacy behavior)", () => {
      // legacy: reps === 0 && rating === "good" => interval = 1
      expect(sm2(null, "good", NOW).interval).toBe(1);
    });

    it("'hard' interval has a min of 1 day on mature cards", () => {
      const tiny: CardProgress = {
        ease: EASE_FLOOR,
        interval: 0,
        reps: 3,
        due: NOW,
        lastReview: NOW,
      };
      const next = sm2(tiny, "hard", NOW);
      expect(next.interval).toBeGreaterThanOrEqual(1);
    });
  });
});

describe("previewIntervals", () => {
  it("formats new-card preview with day units", () => {
    const labels = previewIntervals(null);
    expect(labels.again).toBe("10m");
    expect(labels.hard).toBe("1d");
    expect(labels.good).toBe("1d");
    expect(labels.easy).toBe("4d");
  });

  it("formats months and years", () => {
    const big: CardProgress = {
      ease: 2.5,
      interval: 100,
      reps: 5,
      due: NOW,
      lastReview: NOW,
    };
    const labels = previewIntervals(big);
    // round(100 * 2.5) = 250 days → ~8 months
    expect(labels.good).toMatch(/mo$/);
    // round(100 * 2.5 * 1.3) = 325 days → still months (>= 365 is years)
    const veryBig: CardProgress = { ...big, interval: 365 };
    const big2 = previewIntervals(veryBig);
    // 365 * 2.5 = ~912 days → years
    expect(big2.good).toMatch(/y$/);
  });
});
