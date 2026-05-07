import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_STATE } from "@/storage/state";
import type { AppState } from "@/types";

import { Settings } from "./Settings";

afterEach(cleanup);

function makeState(overrides: Partial<AppState> = {}): AppState {
  return {
    ...DEFAULT_STATE,
    ...overrides,
    settings: { ...DEFAULT_STATE.settings, ...(overrides.settings ?? {}) },
  };
}

describe("<Settings />", () => {
  it("renders the Settings header and core sections", () => {
    render(
      <Settings
        state={makeState()}
        setState={vi.fn()}
        onBack={vi.fn()}
        go={vi.fn()}
      />,
    );
    // "Settings" appears as both topbar title and section heading.
    expect(screen.getAllByText("Settings").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Daily goal")).toBeTruthy();
    expect(screen.getByText("Theme")).toBeTruthy();
  });

  it("calls setState when changing the daily-goal input", () => {
    const setState = vi.fn();
    render(
      <Settings
        state={makeState()}
        setState={setState}
        onBack={vi.fn()}
        go={vi.fn()}
      />,
    );
    const input = screen.getByDisplayValue(String(DEFAULT_STATE.settings.dailyGoal));
    fireEvent.change(input, { target: { value: "60" } });
    expect(setState).toHaveBeenCalledTimes(1);
    const updater = setState.mock.calls[0][0] as (s: AppState) => AppState;
    expect(updater(makeState()).settings.dailyGoal).toBe(60);
  });

  it("switches the theme when the Light button is clicked", () => {
    const setState = vi.fn();
    render(
      <Settings
        state={makeState({ settings: { ...DEFAULT_STATE.settings, theme: "dark" } })}
        setState={setState}
        onBack={vi.fn()}
        go={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Light"));
    expect(setState).toHaveBeenCalledTimes(1);
    const updater = setState.mock.calls[0][0] as (s: AppState) => AppState;
    expect(updater(makeState()).settings.theme).toBe("light");
  });

  it("offers a system 'Auto' theme option that follows OS appearance", () => {
    const setState = vi.fn();
    render(
      <Settings
        state={makeState({ settings: { ...DEFAULT_STATE.settings, theme: "dark" } })}
        setState={setState}
        onBack={vi.fn()}
        go={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Auto"));
    const updater = setState.mock.calls[0][0] as (s: AppState) => AppState;
    expect(updater(makeState()).settings.theme).toBe("system");
  });

  it("opens a confirmation modal when the danger Delete button is clicked", () => {
    render(
      <Settings
        state={makeState()}
        setState={vi.fn()}
        onBack={vi.fn()}
        go={vi.fn()}
      />,
    );
    // The row labeled "Delete all my data" has a button labeled just "Delete".
    expect(screen.getByText("Delete all my data")).toBeTruthy();
    fireEvent.click(screen.getByText("Delete"));
    expect(screen.getByText("Delete all your data?")).toBeTruthy();
    expect(screen.getByText("Cancel")).toBeTruthy();
    expect(screen.getByText("Delete everything")).toBeTruthy();
  });

  it("renders 'Free tier' for non-Pro users with an Upgrade button", () => {
    const go = vi.fn();
    render(
      <Settings
        state={makeState({ pro: { active: false } })}
        setState={vi.fn()}
        onBack={vi.fn()}
        go={go}
      />,
    );
    expect(screen.getByText("Free tier")).toBeTruthy();
    fireEvent.click(screen.getByText("Upgrade"));
    expect(go).toHaveBeenCalledWith({ name: "paywall" });
  });

  it("renders 'Kanjido Pro' for Pro users (no Upgrade button)", () => {
    render(
      <Settings
        state={makeState({ pro: { active: true, plan: "yearly" } })}
        setState={vi.fn()}
        onBack={vi.fn()}
        go={vi.fn()}
      />,
    );
    expect(screen.getByText("Kanjido Pro")).toBeTruthy();
    expect(screen.queryByText("Upgrade")).toBeNull();
  });

  it("calls onBack when the back arrow is clicked", () => {
    const onBack = vi.fn();
    render(
      <Settings
        state={makeState()}
        setState={vi.fn()}
        onBack={onBack}
        go={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Back to home"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
