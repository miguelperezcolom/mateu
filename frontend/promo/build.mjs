#!/usr/bin/env node
// Build the Mateu promo videos: each scene's HTML → PNG (via e2e/screenshot.mjs, which has Playwright)
// → + a `say` voiceover → an MP4 clip; then concat the clips → out/<target>.mp4.
//
//   node build.mjs [--target explainer|teaser|both]
//
// Needs: macOS `say`, `ffmpeg`/`ffprobe`, and e2e's Playwright+Chromium. No new dependencies.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { targets, VOICES } from "./scenes.mjs";
import { VOICE } from "./theme.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..");
const screenshot = join(repo, "e2e", "screenshot.mjs");
const PAD = 0.6; // seconds of silence after each narration

const arg = (name, def) => {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
};
const target = arg("--target", "both");
const names = target === "both" ? ["explainer", "teaser"] : [target];

const run = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
const probeDuration = (file) =>
  parseFloat(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file]).toString().trim());

function buildScene(workdir, scene, i, voice) {
  const html = join(workdir, `s${i}.html`);
  const png = join(workdir, `s${i}.png`);
  const aiff = join(workdir, `s${i}.aiff`);
  const mp4 = join(workdir, `s${i}.mp4`);
  writeFileSync(html, scene.html);
  run("node", [screenshot, "--url", "file://" + html, "--output", png, "--wait-for", "body", "--settle", "250", "--width", "1280", "--height", "720"]);
  run("say", ["-v", voice, "-o", aiff, scene.vo]);
  const dur = (probeDuration(aiff) + PAD).toFixed(2);
  run("ffmpeg", [
    "-y", "-loglevel", "error",
    "-loop", "1", "-i", png,
    "-i", aiff,
    "-t", dur,
    "-r", "30",
    "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p",
    "-vf", "scale=1280:720,format=yuv420p",
    "-c:a", "aac", "-ar", "48000", "-ac", "2", "-af", "apad",
    mp4,
  ]);
  return { mp4, dur: Number(dur) };
}

function buildTarget(name) {
  const scenes = targets[name];
  if (!scenes) throw new Error(`Unknown target '${name}'. Known: ${Object.keys(targets).join(", ")}`);
  const voice = VOICES[name] || VOICE;
  const workdir = join(here, "build", name);
  rmSync(workdir, { recursive: true, force: true });
  mkdirSync(workdir, { recursive: true });
  const outDir = join(here, "out");
  mkdirSync(outDir, { recursive: true });

  console.log(`  [${name}] voice=${voice}`);
  let total = 0;
  const listLines = [];
  scenes.forEach((scene, i) => {
    process.stdout.write(`  [${name}] scene ${i + 1}/${scenes.length} · ${scene.id} … `);
    const { mp4, dur } = buildScene(workdir, scene, i, voice);
    total += dur;
    listLines.push(`file '${mp4.replace(/'/g, "'\\''")}'`);
    process.stdout.write(`${dur.toFixed(1)}s\n`);
  });

  const list = join(workdir, "list.txt");
  writeFileSync(list, listLines.join("\n") + "\n");
  const out = join(outDir, `${name}.mp4`);
  run("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", out]);
  console.log(`  → out/${name}.mp4  (${total.toFixed(1)}s, ${scenes.length} scenes)\n`);
  return out;
}

if (!existsSync(screenshot)) {
  console.error(`Cannot find ${screenshot} (needed for slide rendering).`);
  process.exit(2);
}
console.log(`Building promo video(s): ${names.join(", ")}\n`);
for (const n of names) buildTarget(n);
console.log("Done. Videos in frontend/promo/out/.");
