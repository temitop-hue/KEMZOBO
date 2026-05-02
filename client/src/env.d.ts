/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_TAWK_PROPERTY_ID?: string;
  readonly VITE_TAWK_WIDGET_ID?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string; // e.g. G-XXXXXXXXXX
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
