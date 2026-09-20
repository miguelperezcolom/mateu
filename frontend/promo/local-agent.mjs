// A thin LOCAL agent for the "chat → generated screen" demo. The Mateu chat (@AI(sse=…)) POSTs the
// user's message here; this authors a Mateu page definition (YAML) by delegating to the DEPLOYED
// ec-demo1 LLM agent (so no local API key is needed), and streams back SSE: a friendly line + a
// `{event:"render-screen", detail:{yaml}}` event the chat dispatches, which a @SubscribeTo component
// in the demo renders in the page. It's the equivalent of adding a `[RENDER:{…}]` marker to the real
// agent, kept local so it records without a deploy.
//
//   node local-agent.mjs           # listens on :8777, points at ec1.mateu.io by default

import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";

const PORT = Number(process.env.PORT || 8777);
const DEPLOYED = process.env.DEPLOYED_AGENT || "https://ec1.mateu.io/ai/api/agent/chat";
const TOKEN_URL = "https://auth.ec1.mateu.io/realms/ec-demo1/protocol/openid-connect/token";
// For a snappy on-camera recording: serve a genuinely-LLM-authored YAML (captured earlier) instantly,
// so the video has no dead time waiting on the model's latency. Set CANNED_YAML=/path/to/file.yaml.
const CANNED = process.env.CANNED_YAML && existsSync(process.env.CANNED_YAML) ? process.env.CANNED_YAML : null;

async function token() {
  const body = new URLSearchParams({ grant_type: "password", client_id: "demo", username: "demo", password: "demo", scope: "openid" });
  const r = await fetch(TOKEN_URL, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  return (await r.json()).access_token;
}

const INSTR =
  "Author a Mateu page layout in YAML for the request below. Reply with ONLY YAML (no prose, no markdown fences). " +
  "Do NOT call tools or navigate. Format: top-level 'layout:' whose value is {type: VerticalLayout, content: [ ... ]}. " +
  "Allowed: {type: Text, text: '...', size: xl}; {type: Card, content: {type: FormLayout, content: [ ...fields... ]}}; " +
  "a field is {type: FormField, id: '<camelCaseId>', label: '...', dataType: string|date|integer|number|bool}. " +
  "EVERY FormField MUST have a unique id (camelCase of its label) or it will not render. Request: ";

function stripFences(s) {
  if (!s) return "";
  const m = String(s).match(/```(?:yaml)?\s*([\s\S]*?)```/i);
  return (m ? m[1] : s).trim();
}

async function authorYaml(prompt) {
  if (CANNED) return stripFences(readFileSync(CANNED, "utf8"));
  const t = await token();
  const r = await fetch(DEPLOYED, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer " + t },
    body: JSON.stringify({ message: INSTR + prompt, sessionId: "chatgen-" + Date.now() }),
  });
  return stripFences(await r.text());
}

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type, authorization, x-session-id",
};

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }
  if (req.url.startsWith("/health")) { res.writeHead(200, cors); return res.end("ok"); }
  if (req.method !== "POST") { res.writeHead(404, cors); return res.end(); }

  // Plain-text /chat (no SSE): returns the authored YAML directly, for a server-side caller like
  // Mateu's GenerateScreen button route (which reads the response body as the definition).
  const plain = req.url.startsWith("/chat");

  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", async () => {
    let message = "";
    try { message = JSON.parse(raw).message || ""; } catch { /* ignore */ }
    if (plain) {
      try { const yaml = await authorYaml(message); res.writeHead(200, { ...cors, "content-type": "text/plain" }); return res.end(yaml); }
      catch (e) { res.writeHead(500, cors); return res.end(String(e.message || e)); }
    }
    res.writeHead(200, { ...cors, "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
    try {
      const yaml = await authorYaml(message);
      res.write("data: Here's the screen you asked for — rendering it now.\n\n");
      res.write("data: " + JSON.stringify({ event: "render-screen", detail: { yaml } }) + "\n\n");
    } catch (e) {
      res.write("data: " + JSON.stringify({ event: "agent-error", detail: { message: String(e.message || e) } }) + "\n\n");
    }
    res.end();
  });
});

server.listen(PORT, () => console.log(`local-agent on :${PORT} → ${DEPLOYED}`));
