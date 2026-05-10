import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const outDir = resolve(repoRoot, "docs/screenshots");
const DEV_URL = "http://localhost:5173";
const STARTUP_TIMEOUT_MS = 60_000;

async function waitForServer(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // server not up yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Dev server didn't respond at ${url} within ${timeoutMs}ms`);
}

// Click a sidebar item by its visible label, then wait for the page swap.
async function navigateTo(page, label) {
  const item = page.locator(".bui-sidebar__item", { hasText: new RegExp(`^${label}$`) });
  await item.click();
  // The demo swaps pages via React state — wait a frame plus a tick for
  // transitions, then return.
  await page.waitForTimeout(500);
}

async function setTheme(page, theme) {
  // The demo's ThemeProvider owns theme state in React; setting the attribute
  // directly gets overridden on the next render. Click the topbar toggle
  // instead — its aria-label tells us what state the button is *moving to*.
  const current = await page.evaluate(() =>
    document.documentElement.getAttribute("data-theme"),
  );
  if (current === theme) return;
  const wantLabel =
    theme === "dark" ? "Switch to dark theme" : "Switch to light theme";
  await page.locator(`button[aria-label="${wantLabel}"]`).click();
  // Move the cursor off the toggle AND blur it — the bakerui Tooltip shows
  // on focus too, so leaving the button focused after click would leak the
  // tooltip into the screenshot.
  await page.mouse.move(0, 0);
  await page.evaluate(() =>
    (document.activeElement instanceof HTMLElement) && document.activeElement.blur(),
  );
  await page.waitForTimeout(500);
}

async function capturePage(page, name, { fullPage = true } = {}) {
  const file = resolve(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage, type: "png" });
  console.log(`✓ ${name}.png`);
}

async function tryOpenFirstDialog(page) {
  // Look for any button on the page that triggers a dialog. Click the
  // first one we find; bail quietly if none exist.
  const trigger = page.locator('button[aria-haspopup="dialog"]').first();
  if ((await trigger.count()) === 0) return false;
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  // Wait for the dialog to actually mount.
  await page
    .locator('[role="dialog"]')
    .first()
    .waitFor({ state: "visible", timeout: 3000 })
    .catch(() => {});
  await page.waitForTimeout(500);
  return true;
}

async function main() {
  await mkdir(outDir, { recursive: true });

  console.log("Spawning `npm run demo`...");
  const child = spawn("npm", ["run", "demo"], {
    cwd: repoRoot,
    stdio: ["ignore", "inherit", "inherit"],
    // Detach so we get a process group we can SIGTERM as a unit — Vite
    // forks workers and we don't want orphans.
    detached: true,
  });

  try {
    await waitForServer(DEV_URL, STARTUP_TIMEOUT_MS);
    console.log("Dev server up. Launching Chromium...");

    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();

      await page.goto(DEV_URL, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);

      // Home — viewport-only for a clean hero crop. Capture light first.
      await navigateTo(page, "Overview");
      await page.waitForTimeout(500);
      await capturePage(page, "home-light", { fullPage: false });

      // Dark variant of the same view.
      await setTheme(page, "dark");
      await capturePage(page, "home-dark", { fullPage: false });
      await setTheme(page, "light");

      // Forms & Feedback — closest match for "buttons & inputs showcase".
      await navigateTo(page, "Forms & Feedback");
      await capturePage(page, "inputs");

      // Overlays — try to open the first dialog for a more interesting shot.
      await navigateTo(page, "Overlays");
      const dialogOpen = await tryOpenFirstDialog(page);
      if (dialogOpen) {
        // Dialog visible — viewport screenshot frames it better than full-page.
        await capturePage(page, "overlays", { fullPage: false });
        // Dismiss the dialog before navigating away, or its backdrop will
        // intercept the next sidebar click.
        await page.keyboard.press("Escape");
        await page.waitForTimeout(400);
      } else {
        await capturePage(page, "overlays");
      }

      // Data — the DataTable showcase lives on this page.
      await navigateTo(page, "Data");
      await capturePage(page, "data-table");

      // Theming playground.
      await navigateTo(page, "Theming");
      await capturePage(page, "theming");

      await context.close();
    } finally {
      await browser.close();
    }
  } finally {
    // Kill the entire process group so Vite's children go down with it.
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      try {
        child.kill("SIGTERM");
      } catch {}
    }
    console.log("Dev server stopped.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
