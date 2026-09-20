// Scene lists for the two promo videos. Each scene = { id, vo (voiceover), html }.
// The demo scenes show the REAL captured output (the routes definition a live LLM authored, the
// live booking read, the navigation command) — not mock-ups.

import { page, term } from "./theme.mjs";
import { explainerEs, teaserEs } from "./scenes.es.mjs";

const routesJson =
  `<span class="c">// a live LLM wrote this from "create a routes file with two screens"</span>\n` +
  `{\n  <span class="p">"type"</span>: <span class="s">"Routes"</span>,\n` +
  `  <span class="p">"routes"</span>: [\n` +
  `    { <span class="p">"route"</span>: <span class="s">"bookings"</span>,  <span class="p">"layout"</span>: <span class="s">"bookings"</span>  },\n` +
  `    { <span class="p">"route"</span>: <span class="s">"customers"</span>, <span class="p">"layout"</span>: <span class="s">"customers"</span> }\n` +
  `  ]\n}\n\n<span class="s">✓ valid against the published routes-schema.json — first attempt</span>`;

const operateTerm =
  `<span class="u">you ▸</span> "list the bookings"\n\n` +
  `<span class="c">the agent, over MCP:</span>\n` +
  `  → mateu_search("bookings")        <span class="c">// reads real data</span>\n` +
  `  → navigation-requested → <span class="p">/booking/bookings</span>  <span class="c">// drives the UI</span>\n\n` +
  `<span class="s">47 bookings — 28 confirmed, 19 cancelled.</span>`;

export const explainer = [
  {
    id: "hook",
    vo: "Every team building internal software hits the same wall: the user interface. You design it, then you build it by hand, screen after screen. Mateu asks a different question. What if the UI were just data?",
    html: page(
      `<div class="kicker">The UI problem</div>
       <h1>You design the UI.<br>Then you <span class="k">build it by hand</span>.<br>Screen after screen.</h1>
       <p class="sub">Mateu asks a different question — what if the UI were just <span class="k2">data</span>?</p>`,
    ),
  },
  {
    id: "ui-is-data",
    vo: "In Mateu you declare the model once. Fields, forms, listings, navigation — as a definition, not as code. From that one definition Mateu renders web, native, and static. But here is the part that changes everything in the age of A.I.",
    html: page(
      `<div class="kicker">One idea</div>
       <h1>Declare the model <span class="k">once</span>.</h1>
       <p class="sub">Forms, CRUDs, filters, navigation, wizards — as a <span class="k2">definition</span>, not code.
       One definition renders web, native and static.</p>
       <ul class="pts" style="margin-top:26px">
         <li>Code — <b>@UI</b> in Java, C# or Python</li>
         <li>Or data — YAML / the visual builder</li>
       </ul>`,
    ),
  },
  {
    id: "two-planes",
    vo: "Because the UI is self-describing data, it isn't only something a renderer turns into pixels. It's something an agent can read — and even write. That's a whole second plane, on the same contract.",
    html: page(
      `<div class="kicker">Why it matters now</div>
       <h1>Self-describing data isn't just for <span class="k">pixels</span>.<br>It's for <span class="k2">agents</span>.</h1>
       <p class="sub">Two planes over one contract: renderers turn the model into a UI — and agents
       <b>operate</b> it and even <b>author</b> it.</p>`,
    ),
  },
  {
    id: "operate",
    vo: "Every Mateu app is now also an M.C.P. server. One endpoint turns each screen into tools any agent can discover and run: list the routes, describe a screen's fields and actions, run an action, search a listing.",
    html: page(
      `<div class="kicker">Half one · operate</div>
       <h1>Every app is also an <span class="k">MCP</span> server.</h1>
       <ul class="pts">
         <li>mateu_list_routes <small>the app's navigable screens</small></li>
         <li>mateu_describe_screen <small>fields, actions, current state</small></li>
         <li>mateu_run_action · mateu_search <small>act and query</small></li>
       </ul>
       <p class="sub" style="margin-top:18px">Sidecar for any backend, or native at <b>POST /mateu/mcp</b> — Java, .NET, Python.</p>`,
    ),
  },
  {
    id: "rbac",
    vo: "And it's safe by construction. Permissions are enforced on the server, over the user's token. A field or action a caller may not touch never even reaches the agent. No security theater.",
    html: page(
      `<div class="kicker">Safe by construction</div>
       <h1>RBAC on the <span class="k">server</span>. Not theater.</h1>
       <p class="sub"><b>@EyesOnly</b>, <b>@ReadOnlyUnless</b>, <b>@DisabledUnless</b> — applied over the JWT.
       What a token may not touch <span class="k2">never reaches the agent</span>.</p>`,
    ),
  },
  {
    id: "operate-demo",
    vo: "This is real. We pointed a live L.L.M. agent at a Mateu booking app, and said: list the bookings. It called the tools, read forty-seven real records, and drove the UI to the bookings screen — on its own.",
    html: page(
      `<div class="kicker">Live · the agent operates the app</div>
       ${term("agent ▸ booking app (MCP)", operateTerm)}`,
      { center: false },
    ),
  },
  {
    id: "author",
    vo: "The other half is authoring. Because the UI is data, and Mateu publishes JSON Schemas for it, an L.L.M. can write the definition — and the output is checked mechanically against the contract.",
    html: page(
      `<div class="kicker">Half two · author</div>
       <h1>The LLM can <span class="k2">write the UI</span>.</h1>
       <p class="sub">Mateu publishes JSON Schemas for the definition. So the model's output is
       <b>validated against the contract</b> — with a repair loop.</p>
       <p class="sub" style="margin-top:8px"><span class="chip on">prompt</span><span class="chip on">→ definition</span><span class="chip on">→ validate</span><span class="chip on">→ repair</span></p>`,
    ),
  },
  {
    id: "vs-react",
    vo: "That's the difference from letting an A.I. generate React. The A.I. emits a small, reviewable definition, validated against a schema, repaired if it's wrong — not thousands of lines of code that nobody reads.",
    html: page(
      `<div class="kicker">Why it's different</div>
       <h1>AI + React vs <span class="k">AI + Mateu</span></h1>
       <div class="row" style="margin-top:14px">
         <div class="col"><span class="chip">AI + React</span>
           <p class="sub">thousands of lines of imperative code · unreviewable · the volume is the liability</p></div>
         <div class="col"><span class="chip on">AI + Mateu</span>
           <p class="sub"><b>a small definition</b> · reviewable · <span class="k2">validated against a schema</span></p></div>
       </div>`,
    ),
  },
  {
    id: "author-demo",
    vo: "Again — real. Create a routes file with two screens. A live L.L.M. wrote this definition, and it passed the published schema on the first try. The L.L.M. authored the UI.",
    html: page(
      `<div class="kicker">Live · the LLM authors the UI</div>
       ${term("prompt-to-app ▸ routes-schema.json", routesJson)}`,
    ),
  },
  {
    id: "recap",
    vo: "One idea, two consequences. The UI is data — so agents can operate your apps, and help write them. Runtime operability, shipped across Java, dot-NET and Python. Prompt-to-app, a working proof of concept.",
    html: page(
      `<div class="kicker">The whole thing</div>
       <h1>The UI is <span class="k">data</span>.<br>Agents <span class="k">operate</span> it. Agents <span class="k2">author</span> it.</h1>
       <ul class="pts" style="margin-top:20px">
         <li>Operate — shipped, Java · .NET · Python, RBAC-safe</li>
         <li>Author — prompt-to-app, schema-validated (proof of concept)</li>
       </ul>`,
    ),
  },
  {
    id: "cta",
    vo: "Mateu. Define your UI once. Let humans and agents build the rest. Open source, Apache two point zero.",
    html: page(
      `<div class="big">Mateu</div>
       <h1 class="sm" style="margin-top:6px">Define your UI once.<br>Let <span class="k">humans and agents</span> build the rest.</h1>
       <p class="sub">Open source · Apache 2.0 · <span class="k2">mateu.io</span></p>`,
      { center: true, brand: "" },
    ),
  },
];

export const teaser = [
  {
    id: "hook",
    vo: "Your UI is data. Watch what that unlocks.",
    html: page(
      `<h1 style="font-size:76px">Your UI is <span class="k">data</span>.</h1>
       <p class="sub" style="font-size:32px">Watch what that unlocks.</p>`,
      { center: true },
    ),
  },
  {
    id: "operate",
    vo: "Every Mateu app is also an M.C.P. server, so any A.I. agent can operate it. We told a live L.L.M.: list the bookings. It read forty-seven real records, and drove the UI itself.",
    html: page(
      `<div class="kicker">Agents operate your app</div>
       ${term("agent ▸ booking app (MCP)", operateTerm)}`,
    ),
  },
  {
    id: "author",
    vo: "And because Mateu publishes a schema for the UI, an L.L.M. can write it too. Create a routes file with two screens. The model authored this — valid against the published schema, first try.",
    html: page(
      `<div class="kicker">Agents author your app</div>
       ${term("prompt-to-app ▸ routes-schema.json", routesJson)}`,
    ),
  },
  {
    id: "why",
    vo: "Small, reviewable, verifiable — not thousands of lines of A.I.-generated code nobody reads. The framework supplies the behavior, the accessibility, the security.",
    html: page(
      `<div class="kicker">Why it matters</div>
       <h1 class="sm">Small. Reviewable. <span class="k2">Verifiable.</span></h1>
       <p class="sub">Not thousands of lines of AI-generated code. The framework supplies behavior,
       accessibility and security — once.</p>`,
    ),
  },
  {
    id: "cta",
    vo: "Define your UI once. Let humans and agents build the rest. Mateu — open source.",
    html: page(
      `<div class="big">Mateu</div>
       <h1 class="sm" style="margin-top:6px">Define once.<br>Humans and <span class="k">agents</span> build the rest.</h1>
       <p class="sub">Open source · <span class="k2">mateu.io</span></p>`,
      { center: true, brand: "" },
    ),
  },
];

export const targets = {
  explainer,
  teaser,
  "explainer-es": explainerEs,
  "teaser-es": teaserEs,
};

// Per-target `say` voice (English scenes use the theme default; Spanish scenes use a Spanish voice).
export const VOICES = {
  "explainer-es": "Mónica",
  "teaser-es": "Mónica",
};
