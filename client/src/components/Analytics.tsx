import { useEffect } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics 4 — env-gated.
 * Set VITE_GA_MEASUREMENT_ID to a value like "G-XXXXXXXXXX" to enable.
 * Tracks initial pageview + every wouter route change automatically.
 */
export default function Analytics() {
  const [location] = useLocation();
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID;

  // Inject the gtag.js loader once
  useEffect(() => {
    if (!id) return;
    if (document.getElementById("ga4-loader")) return;

    const loader = document.createElement("script");
    loader.id = "ga4-loader";
    loader.async = true;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(loader);

    window.dataLayer = window.dataLayer ?? [];
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    // send_page_view: false — we'll fire pageviews manually on every route change
    gtag("config", id, { send_page_view: false });
  }, [id]);

  // Fire a page_view on route change
  useEffect(() => {
    if (!id || !window.gtag) return;
    window.gtag("event", "page_view", {
      page_path: location,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [id, location]);

  return null;
}
