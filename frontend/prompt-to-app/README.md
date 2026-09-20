# mateu-prompt-to-app — a spike

> **Status: spike / direction, NOT GA.** It proves the *mechanism* — turn a prompt into a Mateu UI
> **definition** and check it **mechanically against the published JSON Schema**, repairing on failure.
> It is deliberately small; see *Limits* below.

## Why this is different from "AI generates React"

On Mateu the UI is **data**, and Mateu **publishes** JSON Schemas for that data (`backend/shared/uidl/*-schema.json`).
So an LLM's output is a **small definition that is verifiable against a contract** — a wrong shape is
caught and fed back, instead of shipping thousands of lines of unreviewable imperative code. That is
the ADR's §2.14 thesis, made runnable.

## The loop

```
prompt ──▶ LLM ──▶ extract JSON ──▶ validate against published schema
                                        │valid──▶ done ✅
                                        │invalid─▶ send the errors back ──▶ (repeat, bounded)
```

- `schemas.mjs` — loads a published schema (`specs` | `uidl` | `routes` | `sources` | `mount`) straight from `backend/shared/uidl`.
- `validate.mjs` — ajv over that draft-07 schema → `{ valid, errors[] }`.
- `generate.mjs` — `generateDefinition(prompt, { llm, schemaName, maxAttempts })`: the repair loop. The `llm` is **injected**.
- `llm.mjs` — `anthropicLlm()` (real, pluggable edge) + `scriptedLlm()` (tests).

## Use it

```bash
npm install
# generate (needs a key for the real LLM):
ANTHROPIC_API_KEY=… node index.mjs --schema routes "an app with a bookings list and a customers list"
# verify the harness (no key needed — scripted LLM + the REAL published schemas):
npm test
```

## Limits (honest)

- **The LLM call is the only unverified part** — the tests exercise the loop with a scripted LLM and the
  real schemas; they never call an API.
- **Schema-shape only.** Mateu's schemas are an OPEN lower bound (no `additionalProperties: false`), so
  this catches wrong types / missing required fields, **not** "unknown component" or semantic errors.
  A stronger check would round-trip the definition through the real loader (renders → valid); that is
  the natural next step, not done here.
- **The full schema is inlined in the system prompt** (fine for `routes`/`sources`; the `uidl`/`specs`
  schemas are ~130 KB — a real tool would trim or retrieve).
- Emits **JSON**; a `type: UI`/`routes.yaml` author would convert to YAML (1:1).
