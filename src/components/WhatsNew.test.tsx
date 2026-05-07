import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { APP_VERSION } from "@/data/version";
import { DEFAULT_STATE } from "@/storage/state";
import type { AppState } from "@/types";

import { WhatsNew } from "./WhatsNew";

function makeState(lastSeenVersion: string | undefined): AppState {
  return {
    ...DEFAULT_STATE,
    settings: { ...DEFAULT_STATE.settings, lastSeenVersion },
  };
}

afterEach(cleanup);

describe("<WhatsNew />", () => {
  it("renders nothing when lastSeenVersion matches current", () => {
    const setState = vi.fn();
    const { container } = render(
      <WhatsNew state={makeState(APP_VERSION)} setState={setState} />,
    );
    expect(container.firstChild).toBeNull();
    expect(setState).not.toHaveBeenCalled();
  });

  it("shows the modal when lastSeenVersion is older than current", () => {
    const setState = vi.fn();
    // The shipping version 1.0.0-beta.1 has a release-notes entry, so an
    // older lastSeenVersion (e.g. unset or pre-1.0) should trigger the modal.
    render(<WhatsNew state={makeState("0.9.0")} setState={setState} />);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText(`v${APP_VERSION}`)).toBeTruthy();
  });

  it("calls setState with new lastSeenVersion when 'Got it' is clicked", () => {
    const setState = vi.fn();
    render(<WhatsNew state={makeState("0.9.0")} setState={setState} />);
    fireEvent.click(screen.getByText("Got it"));
    expect(setState).toHaveBeenCalledTimes(1);
    const updater = setState.mock.calls[0][0] as (s: AppState) => AppState;
    const next = updater(makeState("0.9.0"));
    expect(next.settings.lastSeenVersion).toBe(APP_VERSION);
  });

  it("dismisses on backdrop click", () => {
    const setState = vi.fn();
    render(<WhatsNew state={makeState("0.9.0")} setState={setState} />);
    fireEvent.click(screen.getByRole("dialog"));
    expect(setState).toHaveBeenCalled();
  });
});
