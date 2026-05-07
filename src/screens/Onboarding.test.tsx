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
});
