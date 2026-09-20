// Tests for the prompt-to-app harness. The verified core is the validate + repair loop and the
// real schema validation — the LLM is a scripted fake, so no API key is needed.
//   node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateDefinition, extractJson } from "./generate.mjs";
import { makeValidator } from "./validate.mjs";
import { scriptedLlm } from "./llm.mjs";

// A valid routes.yaml (routes-schema.json: {type:"Routes", routes:[RouteEntry]}).
const VALID_ROUTES = { type: "Routes", routes: [{ route: "bookings", layout: "bookings" }] };
// Invalid: missing the required `routes`, and not a bare array either → fails both oneOf branches.
const INVALID_ROUTES = { type: "Routes" };

test("the published routes schema really compiles and validates", () => {
  const validate = makeValidator("routes");
  assert.equal(validate(VALID_ROUTES).valid, true);
  const bad = validate(INVALID_ROUTES);
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.length > 0);
});

test("every published schema compiles under ajv", () => {
  for (const name of ["specs", "uidl", "routes", "sources", "mount"]) {
    assert.doesNotThrow(() => makeValidator(name), `${name} should compile`);
  }
});

test("valid on the first attempt → ok, one attempt", async () => {
  const llm = scriptedLlm([JSON.stringify(VALID_ROUTES)]);
  const r = await generateDefinition("bookings list", { llm, schemaName: "routes" });
  assert.equal(r.ok, true);
  assert.equal(r.attemptsUsed, 1);
  assert.deepEqual(r.definition, VALID_ROUTES);
});

test("invalid then valid → the repair loop recovers on attempt 2", async () => {
  const llm = scriptedLlm([JSON.stringify(INVALID_ROUTES), JSON.stringify(VALID_ROUTES)]);
  const r = await generateDefinition("bookings list", { llm, schemaName: "routes", maxAttempts: 3 });
  assert.equal(r.ok, true);
  assert.equal(r.attemptsUsed, 2);
  assert.equal(r.attempts[0].valid, false);
  assert.equal(r.attempts[1].valid, true);
});

test("the repair message carries the schema errors back to the LLM", async () => {
  const seen = [];
  const llm = async (messages) => {
    seen.push(messages);
    return JSON.stringify(INVALID_ROUTES); // never fixes → forces the loop to surface errors
  };
  const r = await generateDefinition("x", { llm, schemaName: "routes", maxAttempts: 2 });
  assert.equal(r.ok, false);
  // the 2nd call must have received a user 'repair' message mentioning the validation failure
  const secondCall = seen[1];
  const repair = secondCall.find((m) => m.role === "user" && /did not validate/i.test(m.content));
  assert.ok(repair, "expected a repair message with the errors");
});

test("always invalid → ok:false after maxAttempts, last definition + errors reported", async () => {
  const llm = scriptedLlm([JSON.stringify(INVALID_ROUTES)]);
  const r = await generateDefinition("x", { llm, schemaName: "routes", maxAttempts: 3 });
  assert.equal(r.ok, false);
  assert.equal(r.attemptsUsed, 3);
  assert.deepEqual(r.definition, INVALID_ROUTES);
  assert.ok(r.attempts.at(-1).errors.length > 0);
});

test("a reply with no JSON is handled and re-prompted", async () => {
  const llm = scriptedLlm(["I cannot help with that.", JSON.stringify(VALID_ROUTES)]);
  const r = await generateDefinition("x", { llm, schemaName: "routes", maxAttempts: 3 });
  assert.equal(r.ok, true);
  assert.equal(r.attemptsUsed, 2);
});

test("extractJson strips ```json fences and surrounding prose", () => {
  assert.deepEqual(extractJson('```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(extractJson('Here you go:\n{"a":1}\nHope that helps'), { a: 1 });
  assert.deepEqual(extractJson("[1,2,3]"), [1, 2, 3]);
  assert.equal(extractJson("no json here"), null);
});
