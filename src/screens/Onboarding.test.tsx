import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { DEFAULT_STATE } from "@/storage/state";
import type { AppState } from "@/types";

import { Onboarding } from "./Onboarding";

afterEach(cleanup);

function setup() {
  const state: AppState = structuredClone(DEFAULT_STATE);
  const setState = vi.fn((updater: (s: AppState) => AppState) => {
    Object.assign(state, updater(state));
  });
  return { state, setState };
}

describe("<Onboarding />", () => {
  it("starts on step 1 (welcome)", () => {
    const { setState } = setup();
    render(<Onboarding setState={setState} />);
    expect(screen.getByText("Welcome to Kanjido")).toBeTruthy();
  });

  it("advances to step 2 on Continue", () => {
    const { setState } = setup();
    render(<Onboarding setState={setState} />);
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Spaced repetition, automatic")).toBeTruthy();
  });

  it("advances to step 3 on second Continue", () => {
    const { setState } = setup();
    render(<Onboarding setState={setState} />);
    fireEvent.click(screen.getByText("Continue"));
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Pick where to start")).toBeTruthy();
  });

  it("step 3 shows 'Start studying' instead of Continue", () => {
    const { setState } = setup();
    render(<Onboarding setState={setState} />);
    fireEvent.click(screen.getByText("Continue"));
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.getByText("Start studying")).toBeTruthy();
    expect(screen.queryByText("Continue")).toBeNull();
  });

  it("'Start studying' on the final step flips onboardingComplete=true", () => {
    const { setState } = setup();
    render(<Onboarding setState={setState} />);
    fireEvent.click(screen.getByText("Continue"));
    fireEvent.click(screen.getByText("Continue"));
    fireEvent.click(screen.getByText("Start studying"));
    expect(setState).toHaveBeenCalled();
    const updater = setState.mock.calls[0][0];
    const next = updater(structuredClone(DEFAULT_STATE));
    expect(next.settings.onboardingComplete).toBe(true);
  });

  it("'Skip intro' on early steps short-circuits the flow", () => {
    const { setState } = setup();
    render(<Onboarding setState={setState} />);
    fireEvent.click(screen.getByText("Skip intro"));
    expect(setState).toHaveBeenCalled();
    const updater = setState.mock.calls[0][0];
    const next = updater(structuredClone(DEFAULT_STATE));
    expect(next.settings.onboardingComplete).toBe(true);
  });

  it("Skip intro is hidden on the final step (only Start studying remains)", () => {
    const { setState } = setup();
    render(<Onboarding setState={setState} />);
    fireEvent.click(screen.getByText("Continue"));
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.queryByText("Skip intro")).toBeNull();
  });

  it("rating-button preview labels show correct intervals", () => {
    const { setState } = setup();
    render(<Onboarding setState={setState} />);
    fireEvent.click(screen.getByText("Continue"));
    // Step 2 shows the 4-button SRS demo with the actual intervals.
    expect(screen.getByText("Again")).toBeTruthy();
    expect(screen.getByText("Hard")).toBeTruthy();
    expect(screen.getByText("Good")).toBeTruthy();
    expect(screen.getByText("Easy")).toBeTruthy();
    expect(screen.getByText("10m")).toBeTruthy();
    expect(screen.getByText("6d")).toBeTruthy();
  });

  it("step 3 lists the 3 free decks", () => {
    const { setState } = setup();
    render(<Onboarding setState={setState} />);
    fireEvent.click(screen.getByText("Continue"));
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.getByText(/Hiragana/i)).toBeTruthy();
    expect(screen.getByText(/Katakana/i)).toBeTruthy();
    expect(screen.getByText(/JLPT N5/i)).toBeTruthy();
  });

  it("offers a restore-a-backup link on the first step only", () => {
    const { setState } = setup();
    render(<Onboarding setState={setState} />);
    expect(screen.getByText(/Restore a backup/i)).toBeTruthy();
    fireEvent.click(screen.getByText("Continue"));
    expect(screen.queryByText(/Restore a backup/i)).toBeNull();
  });

  it("restoring a valid backup file replaces state and completes onboarding", async () => {
    const { setState } = setup();
    const { container } = render(<Onboarding setState={setState} />);
    const backup = {
      ...structuredClone(DEFAULT_STATE),
      progress: { 学: { ease: 2.5, interval: 6, reps: 2, due: 1, lastReview: 1 } },
      streak: { current: 9, longest: 12, lastActiveDay: "2026-05-01" },
    };
    const file = new File([JSON.stringify(backup)], "kanjido-progress-2026-05-01.json", {
      type: "application/json",
    });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await vi.waitFor(async () => {
      fireEvent.change(input, { target: { files: [file] } });
      expect(setState).toHaveBeenCalled();
    });
    const updater = setState.mock.calls.at(-1)![0];
    const next = updater(structuredClone(DEFAULT_STATE));
    expect(next.progress["学"]).toBeDefined();
    expect(next.streak.current).toBe(9);
    expect(next.settings.onboardingComplete).toBe(true);
  });

  it("shows an inline error for a non-backup file", async () => {
    const { setState } = setup();
    const { container } = render(<Onboarding setState={setState} />);
    const file = new File(["definitely not json"], "notes.json", { type: "application/json" });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await vi.waitFor(() => {
      expect(screen.getByText(/doesn't look like a Kanjido backup/i)).toBeTruthy();
    });
    expect(setState).not.toHaveBeenCalled();
  });
});
