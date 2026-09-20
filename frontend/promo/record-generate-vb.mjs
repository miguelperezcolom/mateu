#!/usr/bin/env node
// Records the REAL "prompt → screen" flow on the REDWOOD / Oracle Visual Builder renderer and
// narrates it. Opens the /generate route of a running demo-vb, (re)types a prompt, clicks Generate —
// an LLM authors a Mateu definition and Mateu renders it IN THE PAGE, in Redwood styling: the SAME
// wire model as the Vaadin demo, a different renderer. Then lays a `say` voiceover over the clip.
//
//   node record-generate-vb.mjs --lang en --url http://localhost:9005 --out out/redwood-en.mp4
//   node record-generate-vb.mjs --lang es --out out/redwood-es.mp4
//
// Prereqs (see the header of record-chat.mjs): e2e's Playwright+Chromium, macOS `say`, ffmpeg. Run
// demo-vb with a REBUILT redwood bundle (npm run build && npm run copy in apps/redwood, then
// mvn -pl shared/frontend/redwood install) so the JET version matches the CDN and the dynamic
// re-render lands; serve it with MATEU_AGENT_URL pointing at the local agent's plain /chat.
//
// NOTE: this file imports "playwright", which resolves from e2e/node_modules — run it from e2e/
// (copy it there) or with the module path available, exactly like record-chat.mjs.

import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const lang = arg("--lang", "en");
const base = arg("--url", "http://localhost:9005");
const out = arg("--out", join(here, "out", `redwood-${lang}.mp4`));
const prompt = "a hotel check-in screen";
const W = 1360, H = 860;
const BOOT_MS = Number(arg("--boot", "17000")); // JET/visual-runtime boot from the Oracle CDN is slow

const VO = {
  en: {
    voice: "Samantha",
    lines: [
      "The same Mateu app — now rendered by the Redwood, Oracle Visual Builder renderer.",
      "Same model, different renderer. Ask for a screen.",
      "An LLM authors the Mateu definition, and it renders right here, in Redwood styling.",
      "One model. Any renderer. No front-end code.",
    ],
  },
  es: {
    voice: "Monica",
    lines: [
      "La misma app Mateu — ahora con el renderer Redwood, de Oracle Visual Builder.",
      "Mismo modelo, distinto renderer. Pide una pantalla.",
      "Un modelo de lenguaje escribe la definición Mateu, y se renderiza aquí, con estilo Redwood.",
      "Un modelo. Cualquier renderer. Sin código de front-end.",
    ],
  },
}[lang];

// Deep helpers (O(n) shadow-DOM walker; the naive querySelectorAll('*')-per-node is O(n²)).
const TEXT = `function deepText(){let t='';const walk=r=>{r.childNodes.forEach(n=>{if(n.nodeType===3)t+=n.textContent+' ';if(n.shadowRoot)walk(n.shadowRoot);if(n.childNodes)walk(n);});};walk(document.body);return t;}`;
const evalT = (page, fn, a, ms = 5000) =>
  Promise.race([page.evaluate(fn, a), new Promise((r) => setTimeout(() => r(null), ms))]);

async function record() {
  const videoDir = mkdtempSync(join(tmpdir(), "mateu-vb-"));
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: videoDir, size: { width: W, height: H } } });
  const page = await context.newPage();

  await page.goto(base + "/generate", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(BOOT_MS); // Redwood shell + content settle

  // Re-type the prompt into the oj-input-text (proves it is live), best-effort.
  await evalT(page, () => {
    const inp = document.querySelector("oj-input-text input, oj-text-area textarea, .oj-inputtext-input");
    if (inp) { inp.focus(); inp.select && inp.select(); }
  });
  await page.waitForTimeout(300);
  await page.keyboard.press("Meta+A").catch(() => {});
  await page.keyboard.type(prompt, { delay: 55 }).catch(() => {});
  await page.waitForTimeout(800);

  // Click the Generate BUTTON in the content (not the nav item), by its on-screen box.
  const box = await evalT(page, () => {
    const bs = [...document.querySelectorAll("oj-button, oj-c-button, button")];
    const g = bs.find((x) => /generate/i.test(x.textContent || "") && !x.closest('oj-navigation-list, [role="navigation"]'));
    if (!g) return null;
    const r = g.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  if (box) { await page.mouse.move(box.x, box.y); await page.waitForTimeout(400); await page.mouse.click(box.x, box.y); }

  // Wait for the generated screen (canned agent → fast; guarded so it never hangs).
  let rendered = false;
  for (let i = 0; i < 24 && !rendered; i++) {
    const t = await evalT(page, ({ TEXT }) => { eval(TEXT); return deepText(); }, { TEXT }, 3000);
    rendered = !!t && (t.includes("Hotel Check-in") || t.includes("Booking Reference"));
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(rendered ? 5500 : 2500);

  await context.close();
  await browser.close();
  const webm = readdirSync(videoDir).find((f) => f.endsWith(".webm"));
  return { webm: join(videoDir, webm), videoDir, rendered };
}

function narrate(workdir) {
  const parts = VO.lines.map((line, i) => { const a = join(workdir, `vo${i}.aiff`); execFileSync("say", ["-v", VO.voice, "-o", a, line]); return a; });
  const list = join(workdir, "vo.txt");
  writeFileSync(list, parts.map((p) => `file '${p}'`).join("\n") + "\n");
  const vo = join(workdir, "vo.m4a");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-af", "apad=pad_dur=0.5", "-c:a", "aac", vo], { stdio: "inherit" });
  return vo;
}
const probe = (f) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", f]).toString().trim());

const { webm, videoDir, rendered } = await record();
console.log(`recorded redwood (${lang}) rendered=${rendered}`);
const workdir = mkdtempSync(join(tmpdir(), "mateu-vbvo-"));
const vo = narrate(workdir);
const vDur = probe(webm), aDur = probe(vo);
mkdirSync(dirname(out), { recursive: true });
const pad = Math.max(0, aDur - vDur + 0.5);
execFileSync("ffmpeg", [
  "-y", "-loglevel", "error",
  "-i", webm, "-i", vo,
  "-filter_complex", `[0:v]scale=${W}:${H},tpad=stop_mode=clone:stop_duration=${pad.toFixed(2)},format=yuv420p[v]`,
  "-map", "[v]", "-map", "1:a",
  "-c:v", "libx264", "-r", "30", "-c:a", "aac", "-ar", "48000", "-ac", "2", "-shortest", out,
], { stdio: "inherit" });
rmSync(videoDir, { recursive: true, force: true });
rmSync(workdir, { recursive: true, force: true });
console.log(`→ ${out}  (video ${vDur.toFixed(1)}s + VO ${aDur.toFixed(1)}s, rendered=${rendered})`);
if (!rendered) console.log("WARNING: the generated screen did not appear — is the redwood bundle rebuilt (JET version aligned) and the agent serving /chat?");
process.exit(0);
