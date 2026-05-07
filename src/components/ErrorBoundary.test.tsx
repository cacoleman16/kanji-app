import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ErrorBoundary } from "./ErrorBoundary";

afterEach(cleanup);

// React 18 logs caught errors to console.error during render. Silence the
// expected-error tests so the suite output stays readable.
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

function Boom(): JSX.Element {
  throw new Error("boom");
}

describe("<ErrorBoundary />", () => {
  it("renders children when nothing throws", () => {
    render(
      <ErrorBoundary>
        <div>healthy</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText("healthy")).toBeTruthy();
  });

  it("falls back to the root recovery UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Something broke")).toBeTruthy();
    expect(screen.getByText("Reload Kanjido")).toBeTruthy();
    expect(screen.getByText("Hard reset (erase saved state)")).toBeTruthy();
  });

  it("renders the screen-scoped card when scope='screen' and a child throws", () => {
    const onGoHome = vi.fn();
    render(
      <ErrorBoundary scope="screen" onGoHome={onGoHome} resetKey="route-a">
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText("This screen ran into an error")).toBeTruthy();
    fireEvent.click(screen.getByText("Go home"));
    expect(onGoHome).toHaveBeenCalledTimes(1);
    // Root takeover UI must NOT be present in screen scope.
    expect(screen.queryByText("Something broke")).toBeNull();
  });

  it("auto-clears the error when resetKey changes", () => {
    const { rerender } = render(
      <ErrorBoundary scope="screen" resetKey="route-a">
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText("This screen ran into an error")).toBeTruthy();
    // Simulate navigation: new key, healthy children.
    rerender(
      <ErrorBoundary scope="screen" resetKey="route-b">
        <div>healthy</div>
      </ErrorBoundary>,
    );
    expect(screen.queryByText("This screen ran into an error")).toBeNull();
    expect(screen.getByText("healthy")).toBeTruthy();
  });
});
