// The prompt-to-app harness: prompt → LLM → definition → validate against the published schema →
// repair on failure. The LLM is INJECTED (an `llm(messages, {system}) => Promise<string>` function),
// so the loop is fully unit-testable with a fake; a real Anthropic adapter lives in llm.mjs.
//
// Spike / direction (not GA): it proves the mechanism — schema-gated generation with a repair loop —
// which is the honest half of "AI-native authoring". It does NOT yet trim the schema in the prompt,
// render the result, or check semantics beyond the schema. See README.

import { makeValidator } from "./validate.mjs";
import { loadSchema } from "./schemas.mjs";

/** Pull the first JSON value out of an LLM reply (handles ```json fences and surrounding prose). */
export function extractJson(text) {
  if (!text || typeof text !== "string") return null;
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  try {
    return JSON.parse(t);
  } catch {
    /* fall through */
  }
  // Fall back: from the first { or [ to the last } or ].
  const starts = ["{", "["].map((c) => t.indexOf(c)).filter((i) => i >= 0);
  const start = starts.length ? Math.min(...starts) : -1;
  const end = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(t.slice(start, end + 1));
    } catch {
      /* give up */
    }
  }
  return null;
}

function systemPrompt(schemaName) {
  const schema = loadSchema(schemaName);
  return (
    `You author Mateu UIs as DATA, not code. Emit ONE JSON value that conforms to Mateu's published ` +
    `'${schemaName}' JSON Schema below. Respond with ONLY the JSON — no prose, no markdown fence.\n\n` +
    `SCHEMA:\n${JSON.stringify(schema)}`
  );
}

function repairMessage(errors) {
  const lines = errors
    .slice(0, 20)
    .map((e) => `- ${e.path || "/"}: ${e.message}`)
    .join("\n");
  return `Your JSON did not validate against the schema. Fix these errors and resend ONLY the corrected JSON:\n${lines}`;
}

/**
 * Generate a schema-valid Mateu definition from a natural-language prompt.
 * @param {string} prompt
 * @param {object} opts
 * @param {(messages: {role:string,content:string}[], ctx:{system:string}) => Promise<string>} opts.llm
 * @param {string} [opts.schemaName="specs"]
 * @param {number} [opts.maxAttempts=3]
 * @param {(def:unknown)=>{valid:boolean,errors:any[]}} [opts.validator] — override (tests)
 * @returns {Promise<{ok:boolean, definition:unknown, attempts:object[], attemptsUsed:number}>}
 */
export async function generateDefinition(prompt, { llm, schemaName = "specs", maxAttempts = 3, validator } = {}) {
  if (typeof llm !== "function") throw new Error("opts.llm must be a function (an LLM adapter)");
  const validate = validator ?? makeValidator(schemaName);
  const system = systemPrompt(schemaName);
  const messages = [{ role: "user", content: prompt }];
  const attempts = [];
  let last = null;

  for (let i = 1; i <= maxAttempts; i++) {
    const raw = await llm(messages, { system });
    const definition = extractJson(raw);
    if (definition == null) {
      attempts.push({ attempt: i, valid: false, errors: [{ path: "/", message: "no JSON in reply" }] });
      messages.push({ role: "assistant", content: raw ?? "" });
      messages.push({ role: "user", content: "Your reply contained no JSON. Respond with ONLY the JSON definition." });
      continue;
    }
    last = definition;
    const { valid, errors } = validate(definition);
    attempts.push({ attempt: i, valid, errors });
    if (valid) return { ok: true, definition, attempts, attemptsUsed: i };
    messages.push({ role: "assistant", content: JSON.stringify(definition) });
    messages.push({ role: "user", content: repairMessage(errors) });
  }
  return { ok: false, definition: last, attempts, attemptsUsed: maxAttempts };
}
