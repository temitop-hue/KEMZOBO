import { useEffect } from "react";

interface PageMetaProps {
  title: string;
  description?: string;
  path?: string;
}

export default function PageMeta({ title, description, path }: PageMetaProps) {
  useEffect(() => {
    const fullTitle = title === "Home"
      ? "KEMZOBO — The Original Zobo Drink"
      : `${title} | KEMZOBO`;
    document.title = fullTitle;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) ||
               document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        if (property.startsWith("og:")) {
          el.setAttribute("property", property);
        } else {
          el.setAttribute("name", property);
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const desc = description || "KEMZOBO, THE ORIGINAL ZOBO DRINK — BOLD hibiscus. Timeless tradition. Ready to drink.";
    const url = `https://kemzobo.com${path || ""}`;

    setMeta("description", desc);
    setMeta("og:title", fullTitle);
    setMeta("og:description", desc);
    setMeta("og:url", url);
    setMeta("og:type", "website");
    setMeta("og:site_name", "KEMZOBO");
  }, [title, description, path]);

  return null;
}
