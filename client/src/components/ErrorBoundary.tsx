import React from "react";

interface State {
  hasError: boolean;
  error?: Error;
}

const RELOAD_KEY = "kz_chunk_reload_attempt";

function isChunkLoadError(error: Error | undefined): boolean {
  if (!error) return false;
  const msg = error.message || "";
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Loading chunk") ||
    msg.includes("Importing a module script failed") ||
    /ChunkLoadError/i.test(error.name)
  );
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // Stale-bundle recovery: if a lazy chunk fails to load (deploy changed
    // the chunk hash since the user opened the tab), force-reload once so
    // they get the fresh index.html. sessionStorage prevents reload loops.
    if (isChunkLoadError(error)) {
      const alreadyTried = sessionStorage.getItem(RELOAD_KEY);
      if (!alreadyTried) {
        sessionStorage.setItem(RELOAD_KEY, "1");
        window.location.reload();
      }
    } else {
      // Successful render after non-chunk error → clear the flag for next time
      sessionStorage.removeItem(RELOAD_KEY);
    }
  }

  render() {
    if (this.state.hasError) {
      const chunkError = isChunkLoadError(this.state.error);
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-8">
          <div className="max-w-md text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">
              {chunkError ? "Refreshing to the latest version..." : "Something went wrong"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {chunkError
                ? "Hold tight, we're loading the latest update."
                : this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => {
                sessionStorage.removeItem(RELOAD_KEY);
                window.location.reload();
              }}
              className="rounded-lg bg-primary px-6 py-2 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
