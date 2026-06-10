import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { bootRestoreIfNeeded } from "./native/stateMirror";
import "./styles/app.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root not found in index.html");
const root = createRoot(rootEl);

function mount() {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}

// On iOS, check whether WKWebView evicted localStorage and recover from the
// native mirror BEFORE React mounts — App's useState initializer calls
// loadState() synchronously, so the restore must win that race. On web this
// resolves immediately (isNative() is false) with no flash. Mount regardless
// of the outcome: a failed restore still means a working (fresh) app.
bootRestoreIfNeeded()
  .catch(() => undefined)
  .then(mount);
