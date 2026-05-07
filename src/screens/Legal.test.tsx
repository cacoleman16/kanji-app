import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Legal } from "./Legal";

afterEach(cleanup);

describe("<Legal />", () => {
  it("renders the Privacy Policy with key sections", () => {
    render(<Legal doc="privacy" onBack={vi.fn()} />);
    // Page title appears in topbar + heading.
    expect(screen.getAllByText("Privacy Policy").length).toBeGreaterThanOrEqual(1);
    // Discloses the local-only data model and the iCloud + RevenueCat carve-outs.
    expect(screen.getByText(/stays on your device/i)).toBeTruthy();
    // "iCloud Drive" appears in multiple places — assert at least one matches.
    expect(screen.getAllByText(/iCloud Drive/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/RevenueCat/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders the Terms of Service with subscription + acceptable-use sections", () => {
    render(<Legal doc="terms" onBack={vi.fn()} />);
    expect(screen.getAllByText("Terms of Service").length).toBeGreaterThanOrEqual(1);
    // Section headings are <h2>s — pin to role to avoid colliding with body copy.
    expect(screen.getByRole("heading", { name: "Subscription" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Acceptable use" })).toBeTruthy();
  });

  it("renders the Support page with the GitHub issues link", () => {
    render(<Legal doc="support" onBack={vi.fn()} />);
    expect(screen.getAllByText("Support").length).toBeGreaterThanOrEqual(1);
    const link = screen.getByText(/github\.com\/cacoleman16\/kanji-app\/issues/i);
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toContain("github.com");
  });

  it("calls onBack when the back arrow is clicked", () => {
    const onBack = vi.fn();
    render(<Legal doc="privacy" onBack={onBack} />);
    fireEvent.click(screen.getByLabelText("Back"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
