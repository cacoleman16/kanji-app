import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EmptyState } from "./EmptyState";

afterEach(cleanup);

describe("<EmptyState />", () => {
  it("renders title only when nothing else is supplied", () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeTruthy();
  });

  it("renders mark, body, cta, and secondary when provided", () => {
    const onCta = vi.fn();
    render(
      <EmptyState
        mark="始"
        title="Get started"
        body="Tap the button below."
        cta={
          <button className="primary-btn" onClick={onCta}>
            Begin
          </button>
        }
        secondary={<button className="link-btn">Maybe later</button>}
      />,
    );
    expect(screen.getByText("始")).toBeTruthy();
    expect(screen.getByText("Tap the button below.")).toBeTruthy();
    expect(screen.getByText("Maybe later")).toBeTruthy();
    fireEvent.click(screen.getByText("Begin"));
    expect(onCta).toHaveBeenCalledTimes(1);
  });

  it("hides decorative mark from screen readers", () => {
    const { container } = render(<EmptyState mark="一" title="Hi" />);
    const mark = container.querySelector(".empty-state-mark");
    expect(mark?.getAttribute("aria-hidden")).not.toBeNull();
  });
});
