import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import * as provider from "@/entitlements/provider";
import type { AppState } from "@/types";

import { Paywall } from "./Paywall";

vi.mock("@/entitlements/provider", async () => {
  const actual = await vi.importActual<typeof import("@/entitlements/provider")>(
    "@/entitlements/provider",
  );
  return {
    ...actual,
    getSubscriptionProvider: vi.fn(() => actual.stubProvider),
  };
});

afterEach(cleanup);

function makeProps() {
  const setState = vi.fn((updater: (s: AppState) => AppState) => updater);
  const onBack = vi.fn();
  return { setState, onBack };
}

describe("<Paywall />", () => {
  it("renders both offers with badges", () => {
    const { setState, onBack } = makeProps();
    render(<Paywall setState={setState} onBack={onBack} />);
    expect(screen.getByText("Yearly")).toBeTruthy();
    expect(screen.getByText("Monthly")).toBeTruthy();
    expect(screen.getByText(/Save 27%/i)).toBeTruthy();
    // "7-day free trial" appears in both the offer label AND the fineprint.
    expect(screen.getAllByText(/7-day free trial/i).length).toBeGreaterThanOrEqual(1);
  });

  it("yearly is selected by default; CTA reads 'Start 7-day free trial'", () => {
    const { setState, onBack } = makeProps();
    render(<Paywall setState={setState} onBack={onBack} />);
    expect(screen.getByText(/Start 7-day free trial/i)).toBeTruthy();
  });

  it("selecting monthly switches the CTA to monthly price", () => {
    const { setState, onBack } = makeProps();
    render(<Paywall setState={setState} onBack={onBack} />);
    fireEvent.click(screen.getByText("Monthly"));
    expect(screen.getByText(/Continue — \$3\.99 \/ month/i)).toBeTruthy();
  });

  it("displays the feature list", () => {
    const { setState, onBack } = makeProps();
    render(<Paywall setState={setState} onBack={onBack} />);
    expect(screen.getByText(/All/)).toBeTruthy();
    expect(screen.getByText(/12 default decks/)).toBeTruthy();
    expect(screen.getByText(/Unlimited custom decks/)).toBeTruthy();
    expect(screen.getByText(/Anki .apkg import/)).toBeTruthy();
  });

  it("trust row shows Apple-secured + cancel-anytime", () => {
    const { setState, onBack } = makeProps();
    render(<Paywall setState={setState} onBack={onBack} />);
    expect(screen.getByText(/Apple-secured payment/i)).toBeTruthy();
    // "Cancel anytime" appears in both the trust row AND the feature list.
    expect(screen.getAllByText(/Cancel anytime/i).length).toBeGreaterThanOrEqual(1);
  });

  it("pressing the CTA fires the stub purchase and shows the welcome screen", async () => {
    const { setState, onBack } = makeProps();
    render(<Paywall setState={setState} onBack={onBack} />);
    fireEvent.click(screen.getByText(/Start 7-day free trial/i));
    // Stub provider has a 600ms delay.
    await waitFor(
      () => {
        expect(screen.getByText(/Welcome to Kanjido Pro/i)).toBeTruthy();
      },
      { timeout: 2000 },
    );
    expect(setState).toHaveBeenCalled();
  });

  it("shows custom reason text when provided", () => {
    const { setState, onBack } = makeProps();
    render(<Paywall setState={setState} onBack={onBack} reason="Custom unlock reason." />);
    expect(screen.getByText("Custom unlock reason.")).toBeTruthy();
  });

  it("falls back to default subtitle when no reason is provided", () => {
    const { setState, onBack } = makeProps();
    render(<Paywall setState={setState} onBack={onBack} />);
    expect(
      screen.getByText(/Full library, unlimited custom decks, and Anki import/),
    ).toBeTruthy();
  });

  it("Restore button is present", () => {
    const { setState, onBack } = makeProps();
    render(<Paywall setState={setState} onBack={onBack} />);
    expect(screen.getByText(/Restore purchases/i)).toBeTruthy();
  });

  it("after a successful purchase, 'Start studying' on the welcome screen calls onBack", async () => {
    const { setState, onBack } = makeProps();
    render(<Paywall setState={setState} onBack={onBack} />);
    fireEvent.click(screen.getByText(/Start 7-day free trial/i));
    await waitFor(() => screen.getByText(/Welcome to Kanjido Pro/i), { timeout: 2000 });
    fireEvent.click(screen.getByText(/Start studying/i));
    expect(onBack).toHaveBeenCalledOnce();
  });
});

// Suppress an unused-import lint warning — `act` is part of @testing-library
// helpers but we rely on waitFor for async assertions in this file.
void act;
void provider;
