import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Auto-register a service worker that pre-caches the app shell and
      // does runtime caching for product images. Update prompt fires when
      // a new build is deployed.
      registerType: "prompt",
      includeAssets: [
        "favicon.ico",
        "icons/apple-touch-icon.png",
        "images/og-cover.jpg",
      ],
      manifest: {
        name: "KEMZOBO — The Original Zobo Drink",
        short_name: "KEMZOBO",
        description:
          "Bold hibiscus, ready to sip. Order Original Zobo and track delivery.",
        theme_color: "#CC2936",
        background_color: "#FDF2F2",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          { name: "Shop", short_name: "Shop", url: "/products" },
          { name: "Track Order", short_name: "Track", url: "/track" },
          { name: "Recipes", short_name: "Recipes", url: "/recipes" },
        ],
      },
      workbox: {
        // Pre-cache all built JS/CSS/HTML/icons/fonts at install time
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp,woff2}"],
        // SPA fallback so /products/anything works offline if previously visited
        navigateFallback: "/index.html",
        // Don't cache the API or admin routes
        navigateFallbackDenylist: [/^\/api\//, /^\/admin/],
        // Runtime caching tuned per resource type
        runtimeCaching: [
          {
            // Google Fonts CSS — stale-while-revalidate keeps it fresh
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-css" },
          },
          {
            // Font files — long-lived, cache-first is safe
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-files",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Same-origin product photos / lifestyle images
            urlPattern: ({ request, url }) =>
              request.destination === "image" && url.origin === self.location.origin,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "kz-images",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: { enabled: false }, // keep dev fast; opt in only when testing PWA locally
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist", "public"),
    emptyOutDir: true,
  },
  envDir: path.resolve(import.meta.dirname),
  server: {
    fs: {
      strict: true,
    },
    allowedHosts: ["localhost", "127.0.0.1"],
  },
});
