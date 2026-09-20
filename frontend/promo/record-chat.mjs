#!/usr/bin/env node
// Records the REAL "chat → generated screen" flow on a running Mateu Vaadin app and narrates it.
// Opens /assistant (the AI chat FAB + a content view), opens the chat, types a request, and the
// assistant authors a Mateu screen definition that renders IN THE PAGE through the normal pipeline —
// polished Vaadin/Lumo, no injection. Then it lays a `say` voiceover over the clip → an MP4.
//
//   node record-chat.mjs --lang en --url http://localhost:8091 --out out/chat-en.mp4
//   node record-chat.mjs --lang es --out out/chat-es.mp4
//
// Needs: e2e's Playwright+Chromium, macOS `say`, ffmpeg/ffprobe. Serve the app with the local agent
// in canned mode (CANNED_YAML=…) so there is no model latency on camera.

import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const lang = arg("--lang", "en");
const base = arg("--url", "http://localhost:8091");
const out = arg("--out", join(here, "out", `chat-${lang}.mp4`));
const prompt = "a hotel check-in screen";
const W = 1360, H = 860;

// Narration: one line per beat, timed to the recording below.
const VO = {
  en: {
    voice: "Samantha",
    lines: [
      "This is a Mateu app. Down in the corner, the built-in AI assistant.",
      "Ask it for a screen — in plain language.",
      "The assistant writes a Mateu definition, and Mateu renders it right here.",
      "A real Vaadin form — fields, dates, numbers, a checkbox — from one sentence.",
      "No front-end code. The model is the app.",
    ],
  },
  es: {
    voice: "Monica",
    lines: [
      "Esto es una app Mateu. Abajo, el asistente de inteligencia artificial integrado.",
      "Pídele una pantalla, en lenguaje natural.",
      "El asistente escribe una definición Mateu, y Mateu la renderiza aquí mismo.",
      "Un formulario Vaadin real — campos, fechas, números, una casilla — desde una frase.",
      "Sin código de front-end. El modelo es la app.",
    ],
  },
}[lang];

// A CORRECT deep walker: visit each element once, descending into open shadow roots. (The naive
// "querySelectorAll('*') on every node" is O(n²) and hangs on a heavy Vaadin page.)
const WALK = `function collect(sel){const r=[];const walk=root=>{root.querySelectorAll(sel).forEach(e=>r.push(e));root.querySelectorAll('*').forEach(e=>{if(e.shadowRoot)walk(e.shadowRoot);});};walk(document);return r;}`;
const TEXT = `function deepText(){let t='';const walk=root=>{root.childNodes.forEach(n=>{if(n.nodeType===3)t+=n.textContent;if(n.shadowRoot)walk(n.shadowRoot);if(n.childNodes)walk(n);});};walk(document.body);return t;}`;

// Evaluate with a hard timeout so a heavy page can never hang the recording.
const evalT = (page, fn, arg2, ms = 5000) =>
  Promise.race([page.evaluate(fn, arg2), new Promise((res) => setTimeout(() => res(null), ms))]);

const centerOf = async (page, selector) => {
  return evalT(page, ({ WALK, selector }) => {
    eval(WALK);
    const el = collect(selector)[0];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, { WALK, selector });
};

async function record() {
  const videoDir = mkdtempSync(join(tmpdir(), "mateu-chat-"));
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: videoDir, size: { width: W, height: H } } });
  const page = await context.newPage();

  await page.goto(base + "/assistant", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(6500); // let the shell + content settle (beat 1)

  // Open the chat: real mouse click on the FAB.
  const fab = await centerOf(page, ".ai-fab");
  if (fab) { await page.mouse.move(fab.x, fab.y); await page.waitForTimeout(500); await page.mouse.click(fab.x, fab.y); }
  await page.waitForTimeout(2500); // chat opens (beat 2)

  // Focus the chat input and type the request (real keystrokes, visible on camera).
  await evalT(page, ({ WALK }) => { eval(WALK); const i = collect(".msg-input")[0]; if (i) i.focus(); }, { WALK });
  await page.waitForTimeout(300);
  await page.keyboard.type(prompt, { delay: 55 });
  await page.waitForTimeout(900); // read the typed line (beat 3)
  await page.keyboard.press("Enter");

  // Wait for the generated screen (canned agent → near-instant), guarded so it can't hang.
  let rendered = false;
  for (let i = 0; i < 20 && !rendered; i++) {
    const t = await evalT(page, ({ TEXT }) => { eval(TEXT); return deepText(); }, { TEXT }, 3000);
    rendered = !!t && (t.includes("Booking Reference") || t.includes("Hotel Check-in"));
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(rendered ? 5500 : 2500); // hold on the rendered screen (beats 4-5)

  await context.close();
  await browser.close();
  const webm = readdirSync(videoDir).find((f) => f.endsWith(".webm"));
  return { webm: join(videoDir, webm), videoDir, rendered };
}

function narrate(workdir) {
  // One aiff per line, concatenated with small gaps, → a single voiceover track.
  const parts = [];
  VO.lines.forEach((line, i) => {
    const aiff = join(workdir, `vo${i}.aiff`);
    execFileSync("say", ["-v", VO.voice, "-o", aiff, line]);
    parts.push(aiff);
  });
  // concat with 0.5s silence between lines
  const listed = parts.map((p) => `file '${p}'`).join("\n");
  const list = join(workdir, "vo.txt");
  writeFileSync(list, listed + "\n");
  const vo = join(workdir, "vo.m4a");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-af", "apad=pad_dur=0.5", "-c:a", "aac", vo], { stdio: "inherit" });
  return vo;
}

const probe = (f) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", f]).toString().trim());

const { webm, videoDir, rendered } = await record();
console.log(`recorded (${lang}) rendered=${rendered}`);
const workdir = mkdtempSync(join(tmpdir(), "mateu-vo-"));
const vo = narrate(workdir);
const vDur = probe(webm), aDur = probe(vo);
mkdirSync(dirname(out), { recursive: true });
// Mux: video + voiceover. Freeze the last frame if the narration outlasts the clip.
const pad = Math.max(0, aDur - vDur + 0.5);
execFileSync("ffmpeg", [
  "-y", "-loglevel", "error",
  "-i", webm,
  "-i", vo,
  "-filter_complex", `[0:v]scale=${W}:${H},tpad=stop_mode=clone:stop_duration=${pad.toFixed(2)},format=yuv420p[v]`,
  "-map", "[v]", "-map", "1:a",
  "-c:v", "libx264", "-r", "30", "-c:a", "aac", "-ar", "48000", "-ac", "2",
  "-shortest", out,
], { stdio: "inherit" });
rmSync(videoDir, { recursive: true, force: true });
rmSync(workdir, { recursive: true, force: true });
console.log(`→ ${out}  (video ${vDur.toFixed(1)}s + VO ${aDur.toFixed(1)}s)`);
process.exit(0);
