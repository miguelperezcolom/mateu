---
title: Prompt-to-app (AI authoring)
description: An LLM writes a Mateu UI as DATA and the output is checked mechanically against Mateu's published JSON Schemas, with a repair loop — the authoring half of AI-native, distinct from operating an app over MCP.
---

:::caution[Spike / direction — not GA]
This is a **proof of concept**, deliberately small. It proves the *mechanism*; it is not a productized
prompt-to-app builder. See [Limits](#limits-honest) below. For the production-ready half — an agent
**operating** an existing app — see [Agent operability (MCP)](/reference/agent-operability/).
:::

There are two ways an LLM meets a Mateu app, and they are **different things**:

| | Who defines the UI | What the LLM does |
|---|---|---|
| **[Operate](/reference/agent-operability/)** (MCP) | a developer (the Mateu definition) | reads/writes data + runs actions + navigates, over MCP |
| **Author** (this page) | **the LLM** | **writes the UI definition (UIDL)** as data |

This page is the second one: **the LLM writes the UIDL.**

## Why this is different from "AI generates React"

On Mateu the UI is **data**, and Mateu **publishes JSON Schemas** for that data
(`backend/shared/uidl/*-schema.json`, the same files editors point IntelliSense at). So an LLM's output
is a **small definition that is verifiable against a contract** — a wrong shape is caught and repaired,
not shipped as thousands of lines of unreviewable imperative code. That is the whole thesis: the AI
produces *reviewable, schema-valid data*, and the framework (tested once) supplies the behaviour, a11y,
i18n and security. The volume that makes AI-generated frontends a liability never exists.

## How it works

```
prompt ──▶ LLM ──▶ extract JSON ──▶ validate against the PUBLISHED schema (ajv)
                                        │ valid ──▶ done ✅
                                        │ invalid ─▶ send the errors back ──▶ (repeat, bounded)
```

The harness lives in `frontend/prompt-to-app/`:

| Module | Role |
|---|---|
| `schemas.mjs` | Loads a published schema by name (`specs` \| `uidl` \| `routes` \| `sources` \| `mount`) straight from `backend/shared/uidl` — so it validates against exactly what Mateu ships. |
| `validate.mjs` | `ajv` over that draft-07 schema → `{ valid, errors[] }`. |
| `generate.mjs` | `generateDefinition(prompt, { llm, schemaName, maxAttempts })` — the repair loop. The **LLM is injected**. |
| `llm.mjs` | `anthropicLlm()` (the real, pluggable edge) + `scriptedLlm()` (tests). |

The **LLM is a parameter**, not baked in: the loop takes an `llm(messages, { system }) => Promise<string>`
function. That is what makes the mechanism testable without a key — and what lets you point it at *any*
model, including an existing Mateu AI agent (see below).

## Run it

```bash
cd frontend/prompt-to-app
npm install

# generate against a real model (Anthropic):
ANTHROPIC_API_KEY=… node index.mjs --schema routes \
  "an app with a bookings list and a customers list"

# verify the harness with no key — scripted LLM + the REAL published schemas:
npm test
```

Example — the model authors a `routes.yaml` (as JSON) and it passes the published `routes-schema.json`:

```json
{
  "type": "Routes",
  "routes": [
    { "route": "bookings",  "layout": "bookings"  },
    { "route": "customers", "layout": "customers" }
  ]
}
```

## Verified live with a real LLM

The harness is not tied to a specific provider — its `llm` is injected. Pointed at a **real Mateu AI
agent** (an SSE endpoint) as the backend, the prompt *"create a routes file with two screens"* returned
exactly the definition above, **valid against the published `routes-schema.json` on the first attempt** —
the LLM *authoring* UIDL, not operating an app. `live-ecdemo-probe.mjs` in the same folder is the probe
used (it folds the system prompt + schema into the agent's single message and keeps the plain-text reply).

## Limits (honest) {#limits-honest}

- **The LLM call is the only unverified part** in the tests — the loop is exercised with a scripted LLM
  and the **real** published schemas; `npm test` never calls an API.
- **Schema-shape only.** Mateu's schemas are an OPEN lower bound (no `additionalProperties: false`), so
  this catches wrong types / missing required fields, **not** "unknown component" or semantic errors. A
  stronger check would round-trip the definition through the real loader (renders → valid); that is the
  natural next step, not done here.
- **The full schema is inlined in the prompt** — fine for `routes`/`sources`; the `uidl`/`specs` schemas
  are ~130 KB, so a real tool would trim or retrieve.
- Emits **JSON**; a `routes.yaml`/`type: UI` author would convert to YAML (1:1).

See `frontend/prompt-to-app/README.md` for the full module reference.
