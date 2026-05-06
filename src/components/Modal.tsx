import { useEffect } from "react";

import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  body?: ReactNode;
  /**
   * Tone of the dialog — controls the icon + primary button color.
   *  - "info"    → amber circle, neutral primary button (default for alerts)
   *  - "confirm" → amber circle, neutral primary button (yes/no)
   *  - "danger"  → red exclamation, red primary button (delete confirms)
   */
  tone?: "info" | "confirm" | "danger";
  /** Label of the primary (right-most) button. Default depends on tone. */
  confirmLabel?: string;
  /** Label of the cancel button. Default "Cancel". Set to null to hide. */
  cancelLabel?: string | null;
  /** Callback when the primary button is tapped. */
  onConfirm?: () => void;
}

export function Modal({
  open,
  onClose,
  title,
  body,
  tone = "info",
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Prevent background scroll while modal is up.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const finalConfirmLabel =
    confirmLabel ?? (tone === "danger" ? "Delete" : tone === "confirm" ? "OK" : "Got it");
  const isDestructive = tone === "danger";
  const showCancel = cancelLabel !== null && (tone === "confirm" || tone === "danger");

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const icon = tone === "danger" ? "!" : "i";

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kanjido-modal-title"
      onClick={onClose}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-icon ${isDestructive ? "danger" : "info"}`}>{icon}</div>
        <div className="modal-title" id="kanjido-modal-title">
          {title}
        </div>
        {body !== undefined && <div className="modal-body">{body}</div>}
        <div className="modal-actions">
          {showCancel && (
            <button className="modal-btn" onClick={onClose}>
              {cancelLabel}
            </button>
          )}
          <button
            className={`modal-btn ${isDestructive ? "danger" : "primary"}`}
            onClick={handleConfirm}
            autoFocus
          >
            {finalConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
