import { Component, type ErrorInfo, type ReactNode } from "react";

import { STORAGE_KEY } from "@/storage/state";

interface Props {
  children: ReactNode;
  /**
   * "root" (default) — full-page takeover with reload/export/reset escape
   * hatches. Use for the topmost boundary in main.tsx.
   *
   * "screen" — compact in-place error card with a single "Go home" button.
   * One of these wraps each screen in App.tsx so that a crash in (say) Stats
   * doesn't kill the whole app — the user can still navigate to Home/Study.
   */
  scope?: "root" | "screen";
  /**
   * When this value changes, the boundary forgets any prior error and re-
   * renders its children. Pass the current route key here so navigating
   * away from a broken screen automatically clears the boundary.
   */
  resetKey?: unknown;
  /** Screen-scope only: handler for the "Go home" button. */
  onGoHome?: () => void;
}

interface State {
  error: Error | null;
  info: ErrorInfo | null;
  /** Snapshot of the resetKey at the time the error was captured. */
  errorKey: unknown;
}

/**
 * Error boundary supporting two modes (see Props.scope).
 *
 * Without this, any thrown render error blanks the screen — Apple's reviewers
 * have rejected apps for white-screening on edge cases. The root boundary
 * shows a recovery UI with three escape hatches (reload, export, reset).
 * Per-screen boundaries show a compact card so the user can navigate away
 * from a broken screen without losing the rest of the app.
 *
 * In dev (Vite's import.meta.env.DEV), the actual error stack is shown.
 * In production we keep the user-facing UI clean and friendly.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null, errorKey: undefined };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console in case the user is sharing logs with support.
    console.error("Kanjido error boundary caught:", error, info);
    this.setState({ error, info, errorKey: this.props.resetKey });
  }

  componentDidUpdate(prevProps: Props) {
    // Auto-clear when the resetKey changes after an error was captured
    // (e.g. user navigated to a different screen). Without this a screen-
    // scope boundary would stay error'd forever and the user couldn't get
    // back even via navigation. We compare against the key that was active
    // when the error was *captured* (stashed in `errorKey`), not the
    // previous prop, so this works regardless of the order of state +
    // props updates within a render.
    if (this.state.error && this.props.resetKey !== this.state.errorKey) {
      this.setState({ error: null, info: null });
    }
    // Touch prevProps so the unused-arg check doesn't fire.
    void prevProps;
  }

  private reload = () => {
    window.location.reload();
  };

  private exportRaw = async () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? "";
      if (typeof navigator.clipboard?.writeText === "function") {
        await navigator.clipboard.writeText(raw);
        alert("Your saved state was copied to the clipboard. Paste it into a note before resetting.");
      } else {
        // Fallback: open in a new window so the user can copy.
        const blob = new Blob([raw], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      }
    } catch (err) {
      alert(`Could not export: ${(err as Error).message}`);
    }
  };

  private hardReset = () => {
    if (
      !confirm(
        "Erase the app's saved state and reload? This is the last-resort fix when reload doesn't work. Your iCloud backups (Pro) will survive — only on-device data is removed.",
      )
    )
      return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      // Also drop the legacy v1 key in case migration is what crashed.
      localStorage.removeItem("kanji-app-v1");
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  override render() {
    if (!this.state.error) return this.props.children;

    if (this.props.scope === "screen") {
      return (
        <div role="alert" className="screen-error-card">
          <div className="screen-error-icon" aria-hidden>
            !
          </div>
          <div className="screen-error-title">This screen ran into an error</div>
          <div className="screen-error-body">
            Your data is fine — head back to Home and try again. If it keeps happening, the
            root reload below clears any transient state.
          </div>
          <div className="screen-error-actions">
            {this.props.onGoHome && (
              <button className="modal-btn primary" onClick={this.props.onGoHome}>
                Go home
              </button>
            )}
            <button className="modal-btn" onClick={this.reload}>
              Reload app
            </button>
          </div>
          {import.meta.env.DEV && (
            <details className="screen-error-detail">
              <summary>Stack (dev only)</summary>
              <code>
                {String(this.state.error?.stack ?? this.state.error)}
                {"\n\n"}
                {String(this.state.info?.componentStack ?? "")}
              </code>
            </details>
          )}
        </div>
      );
    }

    return (
      <div
        role="alert"
        style={{
          padding: "48px 24px",
          maxWidth: 480,
          margin: "0 auto",
          fontFamily: "var(--font-ui), -apple-system, sans-serif",
          color: "var(--text)",
          lineHeight: 1.5,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-jp)",
            fontSize: 56,
            color: "var(--again)",
            marginBottom: 18,
          }}
          aria-hidden
        >
          壊
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            marginBottom: 10,
          }}
        >
          Something broke
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
          Kanjido hit a runtime error and stopped rendering. Your study progress is still saved
          locally — most issues clear up with a reload.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          <button
            onClick={this.reload}
            style={{
              appearance: "none",
              padding: "14px 18px",
              border: "none",
              borderRadius: 12,
              background: "var(--accent)",
              color: "#000",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reload Kanjido
          </button>
          <button
            onClick={this.exportRaw}
            style={{
              appearance: "none",
              padding: "12px 18px",
              border: "1px solid var(--border)",
              borderRadius: 12,
              background: "var(--surface)",
              color: "var(--text)",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Copy saved state to clipboard
          </button>
          <button
            onClick={this.hardReset}
            style={{
              appearance: "none",
              padding: "12px 18px",
              border: "1px solid var(--again)",
              borderRadius: 12,
              background: "transparent",
              color: "var(--again)",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Hard reset (erase saved state)
          </button>
        </div>

        {import.meta.env.DEV && (
          <details
            style={{
              fontSize: 12,
              color: "var(--text-dim)",
              padding: 14,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            <summary style={{ cursor: "pointer", marginBottom: 6 }}>Stack (dev only)</summary>
            {String(this.state.error?.stack ?? this.state.error)}
            {"\n\n"}
            {String(this.state.info?.componentStack ?? "")}
          </details>
        )}

        <div
          style={{
            marginTop: 24,
            fontSize: 12,
            color: "var(--text-dim)",
            textAlign: "center",
          }}
        >
          Email{" "}
          <a href="mailto:hello@kanjido.app" style={{ color: "var(--text-muted)" }}>
            hello@kanjido.app
          </a>{" "}
          if it keeps happening.
        </div>
      </div>
    );
  }
}
