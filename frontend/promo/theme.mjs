// Slide theme for the Mateu promo videos. Each scene is a full 1280x720 HTML page rendered to a PNG
// (via e2e/screenshot.mjs) and muxed with a `say` voiceover by build.mjs. Design-system-neutral,
// self-contained CSS — no build, no deps.

export const VOICE = process.env.PROMO_VOICE || "Samantha"; // macOS `say` voice

const CSS = `
  :root{ --accent:#5b9dff; --accent2:#22d3a6; --ink:#eef3ff; --muted:#9fb2d6; --card:#0e1530; }
  *{ box-sizing:border-box; }
  html,body{ margin:0; width:1280px; height:720px; overflow:hidden;
    font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    background:radial-gradient(1200px 700px at 50% -10%, #1b2b55 0%, transparent 60%),
               linear-gradient(135deg,#0a0f1f 0%,#111a34 100%);
    color:var(--ink); }
  .stage{ width:1280px; height:720px; padding:76px 96px; display:flex; flex-direction:column;
    justify-content:center; gap:22px; position:relative; }
  .center{ align-items:center; text-align:center; justify-content:center; }
  .kicker{ font-size:22px; letter-spacing:3px; text-transform:uppercase; color:var(--accent);
    font-weight:700; }
  h1{ font-size:62px; line-height:1.06; margin:0; letter-spacing:-1px; font-weight:800; }
  h1.sm{ font-size:50px; }
  .sub{ font-size:28px; color:var(--muted); margin:6px 0 0; line-height:1.35; max-width:980px; }
  .k{ color:var(--accent); }
  .k2{ color:var(--accent2); }
  .row{ display:flex; gap:40px; align-items:center; }
  .col{ flex:1; min-width:0; }
  ul.pts{ list-style:none; padding:0; margin:10px 0 0; display:flex; flex-direction:column; gap:18px; }
  ul.pts li{ font-size:30px; line-height:1.3; padding-left:44px; position:relative; color:var(--ink); }
  ul.pts li::before{ content:"→"; position:absolute; left:0; color:var(--accent); font-weight:800; }
  ul.pts li small{ display:block; color:var(--muted); font-size:22px; margin-top:3px; }
  .term{ background:var(--card); border:1px solid #26325c; border-radius:14px; overflow:hidden;
    box-shadow:0 30px 80px rgba(0,0,0,.45); width:100%; }
  .term .bar{ display:flex; align-items:center; gap:8px; padding:12px 16px; background:#0b1226;
    border-bottom:1px solid #26325c; font-size:16px; color:var(--muted); }
  .term .bar i{ width:12px; height:12px; border-radius:50%; display:inline-block; }
  .term .bar .r{ background:#ff5f57 } .term .bar .y{ background:#febc2e } .term .bar .g{ background:#28c840 }
  .term .bar .t{ margin-left:10px; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
  .term pre{ margin:0; padding:22px 24px; font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
    font-size:20px; line-height:1.5; color:#d7e2ff; white-space:pre-wrap; }
  .term .c{ color:var(--muted) } .term .p{ color:var(--accent) } .term .s{ color:var(--accent2) }
  .term .u{ color:#ffd580 }
  .brandbar{ position:absolute; left:96px; bottom:52px; display:flex; align-items:center; gap:14px;
    color:var(--muted); font-size:22px; }
  .brandbar b{ color:var(--ink); font-weight:800; letter-spacing:.5px; }
  .dot{ width:10px; height:10px; border-radius:50%; background:var(--accent); box-shadow:0 0 18px var(--accent); }
  .big{ font-size:120px; font-weight:800; letter-spacing:-2px; }
  .chip{ display:inline-block; font-size:20px; padding:6px 14px; border-radius:999px;
    border:1px solid #33406e; color:var(--muted); margin-right:10px; }
  .chip.on{ color:var(--ink); border-color:var(--accent); }
`;

export function page(inner, { center = false, brand = "Mateu · agent-operability" } = {}) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>
<body><div class="stage ${center ? "center" : ""}">${inner}
${brand ? `<div class="brandbar"><span class="dot"></span><b>Mateu</b><span>${brand}</span></div>` : ""}
</div></body></html>`;
}

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** A terminal card. `body` is HTML (use spans .c/.p/.s/.u for colour); title is the tab label. */
export const term = (title, body) =>
  `<div class="term"><div class="bar"><i class="r"></i><i class="y"></i><i class="g"></i><span class="t">${esc(title)}</span></div><pre>${body}</pre></div>`;
