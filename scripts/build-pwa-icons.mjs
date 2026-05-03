/**
 * Generate PWA icons from the KEMZOBO logo.
 *
 * Outputs (in client/public/icons/):
 *   - icon-192.png        (Android home screen, standard)
 *   - icon-512.png        (Android splash screen, standard)
 *   - icon-maskable-512.png (Android adaptive icon — content padded so it
 *                            survives the safe-zone mask)
 *   - apple-touch-icon.png  180x180, white background (iOS Home Screen)
 *
 *   node scripts/build-pwa-icons.mjs
 */
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

const SOURCE = path.resolve("client/public/images/Kem Logo.png");
const OUT_DIR = path.resolve("client/public/icons");

await fs.mkdir(OUT_DIR, { recursive: true });

const BRAND_BG = "#FDF2F2"; // matches site --background

// Standard icons: logo on brand background, no padding needed
async function standardIcon(size, filename) {
  // Logo takes ~80% of the canvas, centered, with brand bg fill
  const inner = Math.round(size * 0.8);
  const logo = await sharp(SOURCE)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BRAND_BG },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(path.join(OUT_DIR, filename));

  console.log(`  Wrote ${filename} (${size}x${size})`);
}

// Maskable icon: Android masks crop to a circle/rounded square — keep content
// inside a ~80% safe zone so the mark isn't clipped
async function maskableIcon(size, filename) {
  const inner = Math.round(size * 0.6);
  const logo = await sharp(SOURCE)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BRAND_BG },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(path.join(OUT_DIR, filename));

  console.log(`  Wrote ${filename} (${size}x${size}, maskable safe zone)`);
}

// iOS apple-touch-icon: must be opaque, no transparency. 180x180 is what
// modern iOS uses (older sizes auto-scale).
async function appleTouchIcon() {
  const size = 180;
  const inner = Math.round(size * 0.78);
  const logo = await sharp(SOURCE)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BRAND_BG },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(path.join(OUT_DIR, "apple-touch-icon.png"));

  console.log(`  Wrote apple-touch-icon.png (180x180)`);
}

console.log("Generating PWA icons...\n");
await standardIcon(192, "icon-192.png");
await standardIcon(512, "icon-512.png");
await maskableIcon(512, "icon-maskable-512.png");
await appleTouchIcon();
console.log("\nDone.");
