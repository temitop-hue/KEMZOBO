import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, X } from "lucide-react";

/**
 * Toast that appears when a new build has been deployed and the service
 * worker has the updated bundles ready. Clicking "Refresh" reloads the
 * page so the new code becomes active.
 */
export default function PWAUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Periodically check for updates so long-lived sessions get notified
      if (r) {
        setInterval(() => r.update(), 60 * 60 * 1000); // every hour
      }
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] max-w-sm w-[calc(100%-2rem)]">
      <div className="rounded-2xl bg-[#0f0806] text-white shadow-2xl shadow-black/40 p-4 flex items-center gap-3">
        <RefreshCw className="h-5 w-5 text-[#E63946] flex-shrink-0" />
        <div className="flex-1 text-sm">
          <p className="font-semibold">New version available</p>
          <p className="text-white/70 text-xs">Refresh to get the latest update.</p>
        </div>
        <button
          onClick={() => updateServiceWorker(true)}
          className="rounded-full bg-[#CC2936] hover:bg-[#E63946] text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 transition-colors"
        >
          Refresh
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="text-white/50 hover:text-white p-1"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
