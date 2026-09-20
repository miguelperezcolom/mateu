---
title: Agent operability (MCP)
description: Operate any Mateu app from an AI agent through an MCP server — the wire is self-describing, so every screen becomes a set of tools an agent can discover and run.
---

Because a Mateu screen travels as a **self-describing wire model** (fields with types and validation,
the actions available, navigation commands), it is not only something a renderer turns into pixels — it
is something an **agent can operate**. A Mateu app is therefore a **second plane** on the same contract:
the rendering plane (the web/native renderers) and the **agent-operability plane** — an
[MCP](https://modelcontextprotocol.io) server that exposes each screen as tools any agent (Claude,
Antigravity, an internal copilot) can discover and run.

Think of it as **"a renderer of agents"**: same self-describing model, tools instead of pixels.

## The tools

| Tool | What it does |
|---|---|
| `mateu_list_routes` | The navigable routes of the app (from its menu) → `[{route, caption}]`. |
| `mateu_describe_screen` | Load a route → a flat screen: `title`, `fields` (id, label, dataType, required, value, options), `actions` (id, label), `listing` (if any), `state`. |
| `mateu_run_action` | Run an action id (optionally seeding field values) → the resulting screen. |
| `mateu_search` | Search a listing screen by free text (and optional filters). |

The projection rules (how a `UIIncrementDto` becomes this flat screen) are **normative** and specified in
[Wire specification → Agent operability](/reference/wire-specification/#agent-operability--the-mcp-projection),
so every host produces the same result.

## Two hosts, one projection

- **Sidecar** — `frontend/mcp-server/`, a zero-dependency Node MCP server. It speaks only the public
  wire, so it operates a **Java, .NET or Python** backend with **no backend change**. Point it at a URL
  and go. This is the quickest way to try it, and it covers **every** backend today.
- **Native endpoint** — the backend serves the same MCP projection directly, so *every app is also an
  MCP* with no sidecar to deploy, enforcing permissions natively. Available today on **Java**
  (Spring MVC, `POST /mateu/mcp`) and **Python** (FastAPI, `POST /mateu/mcp`); the **.NET** native
  endpoint is a follow-up (the sidecar covers .NET in the meantime). All hosts share one projection.

## Permissions (RBAC)

Authorization is enforced by the **backend**, not by the MCP layer: `@EyesOnly`, `@ReadOnlyUnless` and
`@DisabledUnless` are applied server-side over the caller's JWT. The MCP **inherits** that — it never
opens a wider path. An action a token may not run **never reaches the wire**, so it never appears as a
tool result. The sidecar simply relays a `MATEU_TOKEN` bearer to the backend.

## Use it from an agent

Register the sidecar as an MCP server (stdio):

```jsonc
{
  "mcpServers": {
    "mateu": {
      "command": "node",
      "args": ["frontend/mcp-server/index.mjs"],
      "env": {
        "MATEU_BASE_URL": "http://localhost:8080",
        "MATEU_TOKEN": "<optional bearer>"
      }
    }
  }
}
```

Then an agent can, for example: `mateu_list_routes` → `mateu_describe_screen("bookings")` → read the
fields and filters → `mateu_search("bookings", "smith")` → `mateu_run_action("bookings", "export")`.

## Verify

```bash
cd frontend/mcp-server && npm test            # projection (against the conformance corpus) + protocol
MATEU_BASE_URL=http://localhost:8080 node e2e/mcp-probe.mjs   # end-to-end against a live backend
```

See `frontend/mcp-server/README.md` for the full tool surface and configuration.
