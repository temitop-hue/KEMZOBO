/**
 * Generate the 1200x630 OG image for social shares.
 * Composites: lifestyle photo background → dark left-side gradient → branded
 * SVG text overlay (headline, subhead, CTA, logo).
 *
 *   node scripts/build-og-image.mjs
 */
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

const OUT = path.resolve("client/public/images/og-cover.jpg");
const SOURCE = path.resolve("client/public/images/Hero picture.jpeg");

// 1200x630 is the OG/Twitter standard
const W = 1200;
const H = 630;

// 1) Resize the source photo to cover the full canvas
const photo = await sharp(SOURCE)
  .resize(W, H, { fit: "cover", position: "right" }) // keep cans on the right
  .modulate({ brightness: 0.92 }) // darken slightly so text reads cleaner
  .toBuffer();

// 2) SVG overlay — left dark gradient panel + headline/subhead/CTA
//    Using inline SVG keeps everything self-contained, no font files needed
//    (we use system fonts that browsers/social platforms render server-side).
const overlaySvg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="leftFade" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#000" stop-opacity="0.85" />
      <stop offset="55%" stop-color="#000" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#000" stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Cinematic gradient on the left so text reads cleanly over the photo -->
  <rect width="${W}" height="${H}" fill="url(#leftFade)" />

  <!-- Eyebrow -->
  <text x="80" y="200"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="22" font-weight="700"
    letter-spacing="6"
    fill="#E63946">KEMZOBO</text>

  <!-- Headline -->
  <text x="80" y="285"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="60" font-weight="900"
    fill="#FFFFFF">The Original</text>
  <text x="80" y="355"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="60" font-weight="900"
    font-style="italic"
    fill="#E63946">Zobo Drink.</text>

  <!-- Subhead -->
  <text x="80" y="425"
    font-family="'Helvetica Neue', Arial, sans-serif"
    font-size="26" font-weight="400"
    fill="#FFFFFF" fill-opacity="0.85">Bold Hibiscus. Ready to Sip.</text>

  <!-- CTA pill (red rounded rect with white text) -->
  <rect x="80" y="470" width="220" height="58" rx="29" ry="29" fill="#CC2936" />
  <text x="190" y="507"
    font-family="'Helvetica Neue', Arial, sans-serif"
    font-size="18" font-weight="700"
    letter-spacing="3"
    text-anchor="middle"
    fill="#FFFFFF">SHOP NOW</text>

  <!-- Domain in bottom-left corner -->
  <text x="80" y="582"
    font-family="'Helvetica Neue', Arial, sans-serif"
    font-size="18" font-weight="500"
    letter-spacing="2"
    fill="#FFFFFF" fill-opacity="0.7">kemzobo.com</text>
</svg>
`;

const overlay = Buffer.from(overlaySvg);

// 3) Composite the SVG over the darkened photo
await sharp(photo)
  .composite([{ input: overlay, top: 0, left: 0 }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(OUT);

const stats = await fs.stat(OUT);
console.log(`✓ Wrote ${OUT}`);
console.log(`  ${W}x${H}, ${(stats.size / 1024).toFixed(1)} KB`);
