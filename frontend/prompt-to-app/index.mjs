#!/usr/bin/env node
// prompt-to-app CLI (spike): turn a natural-language prompt into a schema-valid Mateu definition.
//
//   ANTHROPIC_API_KEY=… node index.mjs --schema routes "an app with a bookings list and a customers list"
//
// Prints the validated definition (or the last attempt + errors) as JSON. The generation loop is the
// verified part (see generate.test.mjs); the LLM call is the pluggable edge (llm.mjs).

import { generateDefinition } from "./generate.mjs";
import { anthropicLlm } from "./llm.mjs";
import { SCHEMAS } from "./schemas.mjs";

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const schemaName = opt("--schema", "specs");
const maxAttempts = Number(opt("--attempts", "3"));
const prompt = args.filter((a, i) => !a.startsWith("--") && args[i - 1]?.startsWith("--") !== true).join(" ").trim()
  || args.filter((a) => !a.startsWith("--")).join(" ").trim();

if (!prompt) {
  console.error(`Usage: node index.mjs [--schema ${Object.keys(SCHEMAS).join("|")}] [--attempts N] "<prompt>"`);
  process.exit(2);
}

const result = await generateDefinition(prompt, { llm: anthropicLlm(), schemaName, maxAttempts });
if (result.ok) {
  console.error(`✓ valid after ${result.attemptsUsed} attempt(s)`);
  console.log(JSON.stringify(result.definition, null, 2));
} else {
  console.error(`✗ still invalid after ${result.attemptsUsed} attempt(s). Last errors:`);
  console.error(JSON.stringify(result.attempts.at(-1)?.errors ?? [], null, 2));
  console.log(JSON.stringify(result.definition, null, 2));
  process.exit(1);
}
