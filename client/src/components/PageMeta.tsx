import { useEffect } from "react";

interface PageMetaProps {
  title: string;
  description?: string;
  path?: string;
  /** Override the social-share image. Defaults to the hero cheers shot. */
  image?: string;
  /** JSON-LD structured data — pass any schema.org payload. */
  jsonLd?: Record<string, unknown>;
}

const DEFAULT_OG_IMAGE = "https://kemzobo.com/images/Hero%20picture.jpeg";

export default function PageMeta({ title, description, path, image, jsonLd }: PageMetaProps) {
  useEffect(() => {
    const fullTitle = title === "Home"
      ? "KEMZOBO — The Original Zobo Drink"
      : `${title} | KEMZOBO`;
    document.title = fullTitle;

    const setMeta = (key: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const desc = description || "KEMZOBO, THE ORIGINAL ZOBO DRINK — BOLD hibiscus. Timeless tradition. Ready to drink.";
    const url = `https://kemzobo.com${path || ""}`;
    const ogImage = image || DEFAULT_OG_IMAGE;

    setMeta("description", desc);

    // Open Graph (Facebook, iMessage, WhatsApp, LinkedIn, Slack...)
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", desc, true);
    setMeta("og:url", url, true);
    setMeta("og:type", "website", true);
    setMeta("og:site_name", "KEMZOBO", true);
    setMeta("og:image", ogImage, true);
    setMeta("og:image:width", "1200", true);
    setMeta("og:image:height", "630", true);
    setMeta("og:image:alt", "KEMZOBO — friends sharing the original Zobo drink", true);

    // Twitter (X) — large image card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", desc);
    setMeta("twitter:image", ogImage);

    // Canonical URL
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // JSON-LD structured data (managed by id so re-renders replace cleanly)
    const ldId = "kz-jsonld";
    document.querySelectorAll(`script#${ldId}`).forEach((s) => s.remove());
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = ldId;
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, path, image, jsonLd]);

  return null;
}
