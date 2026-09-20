// Render a Mateu page DEFINITION (YAML) to a real screenshot — the "generate a screen on the fly and
// see it" path. It POSTs the YAML to a live backend's __preview__ action (YAML → wire increment, the
// real mapper the visual builder uses) and paints the increment with the zero-dep reference renderer,
// then screenshots it. So: definition in → real rendered screen out.
//
//   node render-preview.mjs --backend http://localhost:8080 --yaml page.yaml --out out.png
//   cat page.yaml | node render-preview.mjs > out.png   (reads YAML from stdin, --out required otherwise)

import { readFileSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..", "..");
const rr = join(repo, "frontend", "reference-renderer");
const screenshot = join(repo, "e2e", "screenshot.mjs");

const arg = (n, d) => {
  const i = process.argv.indexOf(n);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : d;
};
const backend = arg("--backend", "http://localhost:8080");
const yamlFile = arg("--yaml", null);
const out = arg("--out", join(here, "build", "generated.png"));
const yaml = yamlFile ? readFileSync(yamlFile, "utf8") : readFileSync(0, "utf8");

// 1. YAML → wire increment (the real server-side mapper, via the live-preview action).
const res = await fetch(`${backend}/mateu/v3/sync/_no_route`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ route: "", actionId: "__preview__", parameters: { _yaml: yaml } }),
});
if (!res.ok) throw new Error(`preview ${res.status} ${res.statusText}`);
const inc = await res.json();

// The base Core CSS from the reference renderer (mateu-* classes) — inlined so the harness is self-contained.
const css = `
  :root{ font-family: system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; color:#1a1a1a; }
  body{ margin:0; background:#fbf9f8; }
  #app{ padding:2.2rem; max-width:900px; margin:0 auto; }
  .mateu-page-title{ font-size:1.6rem; margin:0 0 .25rem; font-weight:700; }
  .mateu-page-subtitle{ color:#6b6560; margin-bottom:1rem; }
  .mateu-card{ background:#fff; border:1px solid #e5e2df; border-radius:12px; padding:1.1rem 1.3rem; margin:.8rem 0; box-shadow:0 8px 30px rgba(0,0,0,.05); }
  .mateu-col{ display:flex; flex-direction:column; gap:.5rem; }
  .mateu-row{ display:flex; gap:1rem; flex-wrap:wrap; }
  .mateu-form{ display:grid; grid-template-columns:repeat(2,1fr); gap:.85rem 1.3rem; }
  .mateu-formrow{ display:contents; }
  .mateu-field{ display:flex; flex-direction:column; gap:.3rem; }
  .mateu-label{ font-size:.82rem; color:#6b6560; }
  .mateu-input{ padding:.5rem .6rem; border:1px solid #cfcac5; border-radius:8px; font:inherit; background:#fff; }
  .mateu-button{ padding:.5rem 1.1rem; border:0; border-radius:8px; background:#2a6cf5; color:#fff; cursor:pointer; font:inherit; }
  .mateu-table{ width:100%; border-collapse:collapse; background:#fff; }
  .mateu-table th,.mateu-table td{ text-align:left; padding:.55rem .65rem; border-bottom:1px solid #eee; }
  mateu-unsupported{ display:inline-block; padding:.25rem .5rem; background:#fff3cd; border:1px dashed #e0b400; border-radius:6px; color:#7a5b00; font-size:.85rem; }
`;

// Inline the reference renderer's source (it is zero-dependency, no imports) rather than importing
// it — Chromium blocks ES-module imports from a file:// page, which left the mount blank.
const rendererSrc = readFileSync(join(rr, "renderer.mjs"), "utf8").replace(/^export /gm, "");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
<body><div id="app"></div>
<script type="module">
  ${rendererSrc}
  const inc = ${JSON.stringify(inc)};
  applyIncrement({ mount: document.getElementById('app'), baseUrl: ${JSON.stringify(backend)} }, inc);
  document.body.dataset.ready = '1';
</script></body></html>`;

const genPath = join(here, "build", "_generated-preview.html");
mkdirSync(dirname(genPath), { recursive: true });
writeFileSync(genPath, html);
mkdirSync(dirname(out), { recursive: true });
try {
  execFileSync("node", [screenshot, "--url", "file://" + genPath, "--output", out, "--wait-for", "#app", "--settle", "600", "--width", "1000", "--height", "760"], { stdio: "inherit" });
} finally {
  rmSync(genPath, { force: true });
}
console.log("rendered →", out);
