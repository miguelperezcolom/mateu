#!/usr/bin/env node
// Records the REAL "chat → generated screen" flow on the REDWOOD / Oracle Visual Builder renderer,
// exactly like the Vaadin demo: open the AI assistant (the chat FAB), ask for a screen in plain
// language, and it renders IN THE PAGE — in Redwood styling. Then narrates EN/ES over the clip.
//
//   node record-chat-vb.mjs --lang en --url http://localhost:9005 --out out/redwood-chat-en.mp4
//   node record-chat-vb.mjs --lang es --out out/redwood-chat-es.mp4
//
// Run demo-vb (with the rebuilt redwood bundle) + the local agent on :8777 (CANNED_YAML for a snappy
// take). Import resolves "playwright" from e2e/node_modules — run from e2e/ (copy it there).

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
const out = arg("--out", join(here, "out", `redwood-chat-${lang}.mp4`));
const prompt = "a hotel check-in screen";
const W = 1360, H = 860;
const BOOT_MS = Number(arg("--boot", "17000"));

const VO = {
  en: {
    voice: "Samantha",
    lines: [
      "The same Mateu app — now on the Redwood, Oracle Visual Builder renderer.",
      "Open the assistant, and ask for a screen in plain language.",
      "The assistant authors a Mateu definition, and it renders right here — in Redwood styling.",
      "Same model. A different renderer. No front-end code.",
    ],
  },
  es: {
    voice: "Monica",
    lines: [
      "La misma app Mateu — ahora con el renderer Redwood, de Oracle Visual Builder.",
      "Abre el asistente y pídele una pantalla en lenguaje natural.",
      "El asistente escribe una definición Mateu, y se renderiza aquí — con estilo Redwood.",
      "Mismo modelo. Distinto renderer. Sin código de front-end.",
    ],
  },
}[lang];

const DEEP = `(sel,all)=>{const o=[];const w=r=>{r.querySelectorAll&&r.querySelectorAll(sel).forEach(e=>o.push(e));r.querySelectorAll&&r.querySelectorAll('*').forEach(e=>{if(e.shadowRoot)w(e.shadowRoot);});};w(document);return all?o:o[0];}`;
const TEXT = `function deepText(){let t='';const walk=r=>{r.childNodes&&r.childNodes.forEach(n=>{if(n.nodeType===3)t+=n.textContent+' ';if(n.shadowRoot)walk(n.shadowRoot);if(n.childNodes)walk(n);});};walk(document.body);return t;}`;
const evalT = (page, fn, a, ms = 5000) =>
  Promise.race([page.evaluate(fn, a), new Promise((r) => setTimeout(() => r(null), ms))]);
const boxOf = (page, finder) => evalT(page, ({ DEEP, finder }) => {
  const deep = eval(DEEP); const el = eval(finder); if (!el) return null;
  const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}, { DEEP, finder });

async function record() {
  const videoDir = mkdtempSync(join(tmpdir(), "mateu-vbchat-"));
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: videoDir, size: { width: W, height: H } } });
  const page = await context.newPage();
  await page.goto(base + "/ai-screen", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(BOOT_MS);

  // Open the chat FAB, then the 💬 Chat toggle.
  const fab = await boxOf(page, `eval(DEEP)('[class*="chat"],button,oj-button',true).find(e=>/chat/i.test((e.className||'')+((e.getAttribute&&e.getAttribute('aria-label'))||'')))`);
  if (fab) { await page.mouse.move(fab.x, fab.y); await page.waitForTimeout(400); await page.mouse.click(fab.x, fab.y); }
  await page.waitForTimeout(1500);
  const tog = await boxOf(page, `eval(DEEP)('oj-button,button',true).find(x=>/chat|💬/i.test(x.textContent||''))`);
  if (tog) await page.mouse.click(tog.x, tog.y);
  await page.waitForTimeout(1200);

  // Type into the chat and send (real keystrokes are unreliable on the oj-input; set the value).
  await evalT(page, ({ DEEP, prompt }) => {
    const deep = eval(DEEP); const w = deep("#mateuChatInput");
    const inp = w ? (w.querySelector("input") || (w.shadowRoot && w.shadowRoot.querySelector("input"))) : null;
    if (inp) { inp.focus(); inp.value = prompt; inp.dispatchEvent(new Event("input", { bubbles: true })); inp.dispatchEvent(new Event("change", { bubbles: true })); }
  }, { DEEP, prompt });
  await page.waitForTimeout(900);
  const snd = await boxOf(page, `eval(DEEP)('#mateuChatSend')`);
  if (snd) await page.mouse.click(snd.x, snd.y);

  // Wait for the generated screen (canned agent → fast).
  let rendered = false;
  for (let i = 0; i < 24 && !rendered; i++) {
    const t = await evalT(page, ({ TEXT }) => { eval(TEXT); return deepText(); }, { TEXT }, 3000);
    rendered = !!t && (t.includes("Booking Reference") || t.includes("Hotel Check-in"));
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(2500); // let the reader see the chat reply + the form behind
  // Close the Ask Oracle panel so the generated screen is fully visible.
  const close = await boxOf(page, `eval(DEEP)('[title*="Close" i],[aria-label*="Close" i],[aria-label*="Cerrar" i],button',true).find(e=>/close|cerrar|✕|×/i.test((e.getAttribute&&(e.getAttribute('aria-label')||e.getAttribute('title'))||'')+(e.textContent||'')))`);
  if (close) await page.mouse.click(close.x, close.y);
  await page.waitForTimeout(rendered ? 5000 : 2500);

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
console.log(`recorded redwood chat (${lang}) rendered=${rendered}`);
const workdir = mkdtempSync(join(tmpdir(), "mateu-vbchatvo-"));
const vo = narrate(workdir);
const vDur = probe(webm), aDur = probe(vo);
mkdirSync(dirname(out), { recursive: true });
// Keep the FULL video; pad the narration with trailing silence so nothing is cut (the generated
// screen appears late in the clip, so -shortest to the VO length would drop it).
execFileSync("ffmpeg", [
  "-y", "-loglevel", "error",
  "-i", webm, "-i", vo,
  "-filter_complex", `[0:v]scale=${W}:${H},format=yuv420p[v];[1:a]apad[a]`,
  "-map", "[v]", "-map", "[a]", "-t", vDur.toFixed(2),
  "-c:v", "libx264", "-r", "30", "-c:a", "aac", "-ar", "48000", "-ac", "2", out,
], { stdio: "inherit" });
rmSync(videoDir, { recursive: true, force: true });
rmSync(workdir, { recursive: true, force: true });
console.log(`→ ${out}  (video ${vDur.toFixed(1)}s + VO ${aDur.toFixed(1)}s, rendered=${rendered})`);
if (!rendered) console.log("WARNING: the generated screen did not appear.");
process.exit(0);
