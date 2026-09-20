// Records the REAL in-app "prompt → screen" flow (Playwright video): open the /generate route of a
// running Mateu Vaadin app, type a prompt, click Generate — the app calls an LLM server-side, which
// authors the Mateu definition, and it renders IN THE PAGE through the normal pipeline (polished
// Lumo). No injection: this is the actual app rendering a live-generated screen.
//
//   node record-generate-inapp.mjs --url http://localhost:8091/generate --prompt "..." --out out.mp4

import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const url = arg("--url", "http://localhost:8091/generate");
const promptText = arg("--prompt", "a customer support ticket form");
const out = arg("--out", "generate-inapp.mp4");
const W = 1280, H = 900;

const videoDir = mkdtempSync(join(tmpdir(), "mateu-rec-"));
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: videoDir, size: { width: W, height: H } } });
const page = await context.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(2200);

// Type a fresh prompt into the Vaadin text field (proves it's live, not canned).
const input = page.locator("vaadin-text-field input, input").first();
await input.click();
await input.press("Meta+A").catch(() => {});
await input.fill("");
await page.waitForTimeout(300);
await input.pressSequentially(promptText, { delay: 55 });
await page.waitForTimeout(600);

// Click Generate → the app calls the LLM server-side and re-renders.
await page.getByRole("button", { name: /generate/i }).first().click();
await page.waitForTimeout(14000); // real server-side LLM round-trip
await page.waitForTimeout(3500);

await context.close();
await browser.close();

const webm = readdirSync(videoDir).find((f) => f.endsWith(".webm"));
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", join(videoDir, webm), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-vf", `scale=${W}:${H}`, "-r", "30", out], { stdio: "inherit" });
rmSync(videoDir, { recursive: true, force: true });
console.log("recorded →", out);
