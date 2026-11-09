// Full-page screenshots of every page at phone and laptop width, for the
// before/after evidence each sprint keeps.
// Usage: node scripts/screenshots.mjs <base-url> <out-dir>
//   node scripts/screenshots.mjs https://www.kitsonexus.com shots/live
//   node scripts/screenshots.mjs http://127.0.0.1:8080 shots/local
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const [baseUrl, outDir] = process.argv.slice(2);
if (!baseUrl || !outDir) {
  console.error("Usage: node scripts/screenshots.mjs <base-url> <out-dir>");
  process.exit(1);
}

const PAGES = { home: "/", services: "/services", about: "/about", contact: "/contact" };
const WIDTHS = { phone: 390, laptop: 1440 };

fs.mkdirSync(outDir, { recursive: true });
// Uses the Chrome already installed on this computer, so no extra browser download.
const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const [widthName, width] of Object.entries(WIDTHS)) {
    // reducedMotion settles the fade-in animations so shots are comparable.
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    for (const [pageName, route] of Object.entries(PAGES)) {
      await page.goto(new URL(route, baseUrl).href, { waitUntil: "networkidle" });
      // Scroll through the page so lazy-loaded pictures load, then wait for all of them.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
        await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
      });
      await page.waitForTimeout(800);
      const file = path.join(outDir, `${pageName}-${widthName}.png`);
      await page.screenshot({ path: file, fullPage: true, animations: "disabled" });
      console.log(file);
    }
    await context.close();
  }
} finally {
  await browser.close();
}
