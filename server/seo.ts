/**
 * SEO endpoints — sitemap.xml + robots.txt.
 * Plain Express routes (not tRPC) so search-engine crawlers can fetch them.
 */
import type { Request, Response } from "express";
import * as db from "./db";

const BASE = "https://kemzobo.com";

const STATIC_PATHS: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/products", changefreq: "weekly", priority: "0.9" },
  { path: "/recipes", changefreq: "monthly", priority: "0.8" },
  { path: "/find-us", changefreq: "weekly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/wholesale", changefreq: "monthly", priority: "0.7" },
  { path: "/gallery", changefreq: "monthly", priority: "0.6" },
  { path: "/press", changefreq: "monthly", priority: "0.5" },
  { path: "/faq", changefreq: "monthly", priority: "0.5" },
  { path: "/contact", changefreq: "yearly", priority: "0.4" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
];

export async function serveSitemap(_req: Request, res: Response) {
  const products = await db.getAllProducts(true).catch(() => []);
  const today = new Date().toISOString().slice(0, 10);

  const staticUrls = STATIC_PATHS.map(
    (p) => `<url>
    <loc>${BASE}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ).join("\n  ");

  const productUrls = products
    .map(
      (p) => `<url>
    <loc>${BASE}/products/${p.slug}</loc>
    <lastmod>${p.updatedAt ? new Date(p.updatedAt).toISOString().slice(0, 10) : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("\n  ");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticUrls}
  ${productUrls}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600"); // 1 hour
  res.send(xml);
}

export function serveRobots(_req: Request, res: Response) {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /login
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /my-account
Disallow: /order/
Disallow: /checkout
Disallow: /cart

Sitemap: ${BASE}/sitemap.xml
`;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400"); // 1 day
  res.send(body);
}
