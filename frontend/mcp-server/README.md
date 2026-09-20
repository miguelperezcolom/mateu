# mateu-mcp — the Mateu MCP sidecar

Exposes **any live Mateu backend** as [Model Context Protocol](https://modelcontextprotocol.io) tools,
so any agent (Claude, Antigravity, an internal copilot) can **discover and operate** a Mateu app.

It is the **"agent renderer"**: the same self-describing wire model the web renderers turn into pixels,
turned here into *tools*. It speaks only the public sync contract, so it works against a **Java, .NET or
Python** backend with **no backend change**. Part of the Riu *agent-operability plane*
(`design/riu-agent-operability-plan.md`).

**Zero external dependencies** — like `frontend/reference-renderer/`. The MCP protocol is JSON-RPC 2.0
over newline-delimited JSON on stdio, implemented by hand. Needs Node ≥ 18 (for global `fetch`).

## Tools

| Tool | What it does |
|---|---|
| `mateu_list_routes` | Navigable routes from the app menu → `[{route, caption}]` |
| `mateu_describe_screen` | Load a route → flat screen: title, fields (id/label/dataType/required/value/options), actions, listing, state |
| `mateu_run_action` | Run an action id (optionally seeding `componentState`) → resulting screen |
| `mateu_search` | Search a listing screen by free text (+ optional filters) |

## Configuration

| Env var | Meaning |
|---|---|
| `MATEU_BASE_URL` | **required** — e.g. `http://localhost:8080` |
| `MATEU_TOKEN` | optional Bearer token, relayed to the backend. **RBAC is enforced by the backend** (`@EyesOnly`/`@ReadOnlyUnless` over the JWT); this sidecar only relays the token — it never widens access. An action a token may not run never reaches the wire, so it never appears as a tool result. |

## Use it from an agent

Register it as an MCP server (stdio). Example for Claude Code (`claude mcp add`) or any MCP client:

```jsonc
{
  "mcpServers": {
    "mateu": {
      "command": "node",
      "args": ["frontend/mcp-server/index.mjs"],
      "env": { "MATEU_BASE_URL": "http://localhost:8080" }
    }
  }
}
```

## Develop / verify

```bash
npm run check   # node --check on all modules
npm test        # unit tests: projection against the real conformance corpus + the MCP protocol layer
# end-to-end against a running backend:
MATEU_BASE_URL=http://localhost:8080 node ../../e2e/mcp-probe.mjs
```

## How it works

`wire.mjs` posts `POST {baseUrl}/mateu/v3/sync/{route}` (root = `/_no_route`); the screen *load* uses
`actionId: ""` (what the frontend's `mateu-ux` fires). `projection.mjs` (pure, unit-tested) deep-walks
the returned `UIIncrementDto` and picks out what an agent needs. The derivation rules are specified in
`doc/src/content/docs/reference/wire-specification.md` (§ Agent operability / MCP projection) so the
native Java endpoint reproduces the same projection.
