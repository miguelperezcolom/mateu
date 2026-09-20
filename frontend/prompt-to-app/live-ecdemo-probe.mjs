// Live P6 e2e: run the prompt-to-app harness with the ec-demo1 agent as the REAL LLM backend, so the
// LLM actually WRITES the UIDL and the harness validates it against the published schema (+ repairs).
//
//   MATEU_AGENT_URL=… MATEU_AGENT_TOKEN=… node live-ecdemo-probe.mjs "<prompt>"
//
// The ec-demo1 agent (/ai/api/agent/stream) is an app-operating agent (its own system prompt + MCP
// tools) with no separate `system` field, so we fold the harness's system prompt + the running
// transcript into the single `message`, tell it NOT to call tools/navigate, and use a fresh sessionId
// per call so each call is self-contained. We keep only the plain-text SSE chunks (drop token-usage
// and any {event} the agent streams); the harness then extracts + validates the JSON.

import { generateDefinition } from "./generate.mjs";

const AGENT_URL = process.env.MATEU_AGENT_URL;
const TOKEN = process.env.MATEU_AGENT_TOKEN;
const SCHEMA = process.env.PROMPT_SCHEMA || "routes";
if (!AGENT_URL || !TOKEN) {
  console.error("MATEU_AGENT_URL and MATEU_AGENT_TOKEN are required");
  process.exit(2);
}

function flatten(messages, system) {
  const transcript = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
  return (
    `${system}\n\n` +
    `IMPORTANT: You are AUTHORING a definition file, not operating an app. Do NOT call any tools and ` +
    `do NOT navigate. Reply with ONLY the JSON.\n\n${transcript}`
  );
}

function ecDemoAgentLlm() {
  let call = 0;
  return async (messages, { system }) => {
    call += 1;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120000);
    try {
      const res = await fetch(AGENT_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: "Bearer " + TOKEN,
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ message: flatten(messages, system), sessionId: `p2a-${Date.now()}-${call}` }),
      });
      if (!res.ok) throw new Error(`agent ${res.status} ${res.statusText}`);
      const raw = await res.text();
      let text = "";
      for (const line of raw.split("\n")) {
        const l = line.trim();
        if (!l.startsWith("data:")) continue;
        const p = l.slice(5).trim();
        if (!p) continue;
        if (p.startsWith("{")) {
          try {
            const o = JSON.parse(p);
            if ("totalTokens" in o || "event" in o) continue; // skip usage + custom events
          } catch {
            /* not json, treat as text */
          }
        }
        text += p + "\n";
      }
      process.stderr.write(`\n--- agent raw text (call ${call}, ${text.length} chars) ---\n${text.slice(0, 800)}\n`);
      return text.trim();
    } finally {
      clearTimeout(timer);
    }
  };
}

const prompt =
  process.argv.slice(2).join(" ").trim() ||
  'Create a Mateu routes file (type "Routes") with two screens: a bookings list at route "bookings" and a customers list at route "customers". Each route should reference a layout with the same name.';

console.error(`\n=== prompt-to-app LIVE (schema=${SCHEMA}) ===\nPROMPT: ${prompt}\n`);
const result = await generateDefinition(prompt, { llm: ecDemoAgentLlm(), schemaName: SCHEMA, maxAttempts: 3 });

console.error(
  "\n=== attempts ===\n" +
    result.attempts
      .map((a) => `#${a.attempt}: valid=${a.valid} errors=${(a.errors || []).length}${a.errors?.length ? " → " + a.errors.slice(0, 3).map((e) => e.path + " " + e.message).join("; ") : ""}`)
      .join("\n"),
);
console.error(`\nRESULT: ok=${result.ok} attemptsUsed=${result.attemptsUsed}`);
console.log("\n=== FINAL DEFINITION (LLM-authored, schema-validated) ===");
console.log(JSON.stringify(result.definition, null, 2));
process.exit(result.ok ? 0 : 1);
