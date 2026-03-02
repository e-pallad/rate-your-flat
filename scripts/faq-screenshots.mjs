/**
 * FAQ Screenshot Capture Script
 *
 * Living FAQ screenshots — re-run this script whenever the UI changes
 * so the FAQ images stay up to date with the current look of the app.
 *
 * Prerequisites:
 *   1. Run `npm run dev` in a separate terminal (app must be on http://localhost:3000)
 *   2. Then run `npm run faq:screenshots` from the project root
 *
 * Output: public/faq/faq-search.png
 *         public/faq/faq-review-form.png
 *         public/faq/faq-add-flat.png
 *
 * Add new screenshots here whenever a new FAQ entry covers a visual UI flow.
 */

import puppeteer from "puppeteer";
import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import net from "net";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const OUTPUT_DIR = join(PROJECT_ROOT, "public", "faq");
const BASE_URL = "http://localhost:3000";
const VIEWPORT = { width: 1280, height: 800 };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

async function waitForPort(port, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const open = await new Promise((resolve) => {
      const socket = net.connect(port, "127.0.0.1");
      socket.once("connect", () => { socket.destroy(); resolve(true); });
      socket.once("error", () => { socket.destroy(); resolve(false); });
    });
    if (open) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(
    `Dev server not reachable on port ${port} after ${timeout}ms.\n` +
    "Make sure 'npm run dev' is running before executing this script."
  );
}

async function screenshot(page, outputFile, captureSelector = null) {
  const dest = join(OUTPUT_DIR, outputFile);
  if (captureSelector) {
    const el = await page.$(captureSelector);
    if (el) {
      await el.screenshot({ path: dest });
      console.log(`  saved ${outputFile} (element crop)`);
      return;
    }
  }
  await page.screenshot({ path: dest, fullPage: false });
  console.log(`  saved ${outputFile} (viewport)`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  ensureOutputDir();

  console.log("Checking dev server on port 3000...");
  await waitForPort(3000);
  console.log("Dev server is up.\n");

  // Uses Puppeteer's bundled Chromium. If launch fails with a missing .so
  // error, install the required system libraries first:
  //   sudo apt-get install -y libnspr4 libnss3 libasound2
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    // ------------------------------------------------------------------
    // 1. Homepage — search bar + flat grid
    // ------------------------------------------------------------------
    console.log("1/3 Capturing homepage (search + grid)...");
    await page.goto(BASE_URL, { waitUntil: "networkidle2" });
    // Capture just the top portion (search + first row of cards)
    await page.evaluate(() => window.scrollTo(0, 0));
    await screenshot(page, "faq-search.png");

    // ------------------------------------------------------------------
    // 2. Add Flat form — /flat/new
    //    The page redirects to /login if unauthenticated, so we capture
    //    the login page as a fallback and note it in the alt text.
    //    To get the real form, run after logging in manually and set a
    //    session cookie below.
    // ------------------------------------------------------------------
    console.log("2/3 Capturing add flat form (/flat/new)...");
    await page.goto(`${BASE_URL}/flat/new`, { waitUntil: "networkidle2" });
    await screenshot(page, "faq-add-flat.png", "form");

    // ------------------------------------------------------------------
    // 3. Review form — /flat/<first-slug>/review
    //    Try to find the first flat slug from the homepage and navigate
    //    to its review page.
    // ------------------------------------------------------------------
    console.log("3/3 Capturing review form...");
    await page.goto(BASE_URL, { waitUntil: "networkidle2" });

    // Grab the first flat card link
    const firstFlatHref = await page.evaluate(() => {
      const link = document.querySelector('a[href^="/flat/"]');
      return link ? link.getAttribute("href") : null;
    });

    if (firstFlatHref) {
      await page.goto(`${BASE_URL}${firstFlatHref}/review`, {
        waitUntil: "networkidle2",
      });
      await screenshot(page, "faq-review-form.png", "form");
    } else {
      console.log(
        "  No flats found on homepage — skipping review form screenshot.\n" +
        "  Add at least one flat and re-run to capture faq-review-form.png."
      );
    }

    console.log("\nAll screenshots saved to public/faq/");
    console.log(
      "\nNote: Pages that require login (add flat, review form) will show the\n" +
      "login redirect instead of the actual form unless you are already logged in.\n" +
      "To capture authenticated pages:\n" +
      "  1. Log in via the browser at http://localhost:3000/login\n" +
      "  2. Copy your session cookie value\n" +
      "  3. Set it in this script using page.setCookie(...) before navigating"
    );
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Screenshot capture failed:", err.message);
  process.exit(1);
});
