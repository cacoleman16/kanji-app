import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { Modal } from "./Modal";

afterEach(cleanup);

describe("<Modal />", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}} title="Hidden" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders title + body when open", () => {
    render(
      <Modal
        open
        onClose={() => {}}
        title="Are you sure?"
        body="This will delete the deck."
      />,
    );
    expect(screen.getByText("Are you sure?")).toBeTruthy();
    expect(screen.getByText("This will delete the deck.")).toBeTruthy();
  });

  it("info modals show only the primary button (no Cancel)", () => {
    render(<Modal open onClose={() => {}} title="FYI" tone="info" />);
    // Default tone="info" with cancelLabel="Cancel" should NOT render Cancel
    // (showCancel is false unless tone is confirm or danger).
    expect(screen.queryByText("Cancel")).toBeNull();
    expect(screen.getByText("Got it")).toBeTruthy();
  });

  it("confirm modals show both Cancel and primary buttons", () => {
    render(<Modal open onClose={() => {}} title="Sure?" tone="confirm" />);
    expect(screen.getByText("Cancel")).toBeTruthy();
    expect(screen.getByText("OK")).toBeTruthy();
  });

  it("danger modals use a Delete primary button + danger styling", () => {
    render(<Modal open onClose={() => {}} title="Wipe data?" tone="danger" />);
    const btn = screen.getByText("Delete");
    expect(btn).toBeTruthy();
    expect(btn.className).toContain("danger");
  });

  it("clicking Cancel closes without firing onConfirm", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <Modal open onClose={onClose} onConfirm={onConfirm} title="Sure?" tone="confirm" />,
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("clicking the primary button fires onConfirm then closes", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <Modal open onClose={onClose} onConfirm={onConfirm} title="Sure?" tone="confirm" />,
    );
    fireEvent.click(screen.getByText("OK"));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("clicking the backdrop closes without confirming", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const { container } = render(
      <Modal open onClose={onClose} onConfirm={onConfirm} title="Sure?" tone="confirm" />,
    );
    const backdrop = container.querySelector(".modal-backdrop") as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("clicking inside the modal card does not bubble to close", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Sure?" tone="confirm" />);
    fireEvent.click(screen.getByText("Sure?"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("Escape key closes the modal", () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Sure?" tone="confirm" />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("respects custom button labels", () => {
    render(
      <Modal
        open
        onClose={() => {}}
        title="Replace deck?"
        tone="confirm"
        confirmLabel="Replace"
        cancelLabel="Keep current"
      />,
    );
    expect(screen.getByText("Replace")).toBeTruthy();
    expect(screen.getByText("Keep current")).toBeTruthy();
  });
});
