// Records a REAL screen video (Playwright) of "type a prompt → the LLM's screen appears, rendered by
// the real Vaadin/Lumo frontend". It loads a running Mateu app (so the Vaadin bundle + Lumo theme are
// live), replaces the page with a small prompt playground, types the prompt, then mounts a real
// <mateu-component> with the increment from the backend's __preview__ action (the YAML the LLM wrote).
//
//   node record-generate.mjs --backend http://localhost:8080 --yaml page.yaml --prompt "..." --out out.mp4
//
// The webm Playwright records is converted to mp4 with ffmpeg.

import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const backend = arg("--backend", "http://localhost:8080");
const yaml = readFileSync(arg("--yaml"), "utf8");
const promptText = arg("--prompt", "a hotel guest check-in screen");
const out = arg("--out", "generate.mp4");
const W = 1280, H = 800;

// 1. Pre-expand the LLM's YAML into a wire increment (real mapper) so the mount is instant on camera.
const res = await fetch(`${backend}/mateu/v3/sync/_no_route`, {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ route: "", actionId: "__preview__", parameters: { _yaml: yaml } }),
});
const inc = await res.json();
const comp = inc.fragments?.[0]?.component;
const state = inc.fragments?.[0]?.state ?? {};

const videoDir = mkdtempSync(join(tmpdir(), "mateu-rec-"));
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: videoDir, size: { width: W, height: H } } });
const page = await context.newPage();
await page.goto(backend + "/", { waitUntil: "networkidle" });
await page.waitForFunction(() => !!customElements.get("mateu-component"), { timeout: 15000 }).catch(() => {});

// 2. A clean playground: a title, a prompt bar, and an empty stage.
await page.evaluate(({ promptText }) => {
  document.title = "Mateu · prompt to screen";
  document.body.style.cssText = "margin:0;background:#fbf9f8;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1a1a1a";
  document.body.innerHTML = `
    <div style="max-width:980px;margin:0 auto;padding:28px 24px">
      <div style="font:700 15px/1 system-ui;letter-spacing:2px;text-transform:uppercase;color:#2a6cf5">Mateu · prompt → screen</div>
      <div style="display:flex;gap:10px;margin-top:14px">
        <input id="pp" style="flex:1;font-size:20px;padding:14px 16px;border:1px solid #cfcac5;border-radius:12px;background:#fff;outline:none" placeholder="Describe the screen you want…"/>
        <button id="pg" style="font-size:18px;padding:0 22px;border:0;border-radius:12px;background:#2a6cf5;color:#fff;cursor:pointer">Generate</button>
      </div>
      <div id="status" style="margin-top:14px;color:#6b6560;font-size:16px;min-height:22px"></div>
      <div id="stage" style="margin-top:8px"></div>
    </div>`;
  document.getElementById("pp").focus();
}, { promptText });

await page.waitForTimeout(700);
await page.type("#pp", promptText, { delay: 55 }); // typed on camera
await page.waitForTimeout(500);
await page.click("#pg");

// 3. Show the two honest steps, then mount the real generated screen.
await page.evaluate(() => (document.getElementById("status").textContent = "✍️  the LLM is writing the Mateu definition…"));
await page.waitForTimeout(1800);
await page.evaluate(() => (document.getElementById("status").textContent = "🎨  Mateu is rendering it — real Vaadin components…"));
await page.waitForTimeout(1400);
await page.evaluate(({ comp, state }) => {
  document.getElementById("status").textContent = "✓  generated and rendered — a real, live screen";
  const stage = document.getElementById("stage");
  const el = document.createElement("mateu-component");
  el.component = comp; el.state = state; el.initialData = state;
  el.style.cssText = "display:block;opacity:0;transition:opacity .5s ease";
  stage.appendChild(el);
  requestAnimationFrame(() => (el.style.opacity = "1"));
}, { comp, state });
await page.waitForTimeout(4200);

await context.close();
await browser.close();

// 4. webm → mp4
const webm = readdirSync(videoDir).find((f) => f.endsWith(".webm"));
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", join(videoDir, webm), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-vf", `scale=${W}:${H}`, "-r", "30", out], { stdio: "inherit" });
rmSync(videoDir, { recursive: true, force: true });
console.log("recorded →", out);
