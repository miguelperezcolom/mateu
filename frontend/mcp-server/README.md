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

Operating tools (run the app):

| Tool | What it does |
|---|---|
| `mateu_list_routes` | Navigable routes from the app menu → `[{route, caption}]` |
| `mateu_describe_screen` | Load a route → flat screen: title, fields (id/label/dataType/required/value/options), actions, listing, state |
| `mateu_run_action` | Run an action id (optionally seeding `componentState`) → resulting screen |
| `mateu_search` | Search a listing screen by free text (+ optional filters) |

Authoring tools (write YAML definitions) — the same surface the Java, .NET and Python backends serve,
pinned by `conformance/mcp/authoring.json`:

| Tool | What it does |
|---|---|
| `mateu_list_components` | Component types (`query?` filters by type or description) → `{components: [{type, description, attributes}], count}` — computed locally from the packaged catalogue |
| `mateu_get_component_schema` | The JSON Schema of one type plus every definition it references → `{type, schema, definitions}` — computed locally |
| `mateu_validate_uidl` | Validate a YAML definition → `{valid, kind, errors, warnings}`. Delegated to the backend's reserved sync action `__validate__`, so it validates against the backend's own catalogues (sources, partials, actions…) |
| `mateu_preview_uidl` | Render a YAML page (layout only, nothing saved) at `route?` → `{rendered, screen, validation}` via the reserved `__preview__` action |
| `mateu_save_spec` | **Development mode only** (`MATEU_DEV`): validate and, with no errors, write `path` under the specs directory; a backend running in dev mode picks it up with its live reload. Paths outside the specs directory (absolute, `..`, symbolic links out) are refused |

## Resources

| URI | File |
|---|---|
| `mateu://guide` | `authoring-guide.md` — the workflow, a sample page, the rules (read it first) |
| `mateu://catalog` | `uidl-catalog.json` — every component with a description and its main attributes |
| `mateu://schema/specs` | `specs-schema.json` — every file kind under `specs/ui` |
| `mateu://schema/uidl` | `uidl-schema.json` — the component catalogue |

The files in `resources/` are copies of `backend/shared/uidl/*` (their single source). A test fails when
they drift; `npm run sync-resources` re-copies them.

## Configuration

| Env var | Meaning |
|---|---|
| `MATEU_BASE_URL` | **required** — e.g. `http://localhost:8080` |
| `MATEU_TOKEN` | optional Bearer token, relayed to the backend. **RBAC is enforced by the backend** (`@EyesOnly`/`@ReadOnlyUnless`); this sidecar only relays the token — it never widens access. A request the backend refuses (403) is the tool error `Error: Forbidden`. |
| `MATEU_DEV` | `true`/`1` → development mode: `mateu_save_spec` is listed and callable |
| `MATEU_SPECS_DIR` | where `mateu_save_spec` writes; default `src/main/resources/specs/ui` under the working directory (it must exist) |
| `MATEU_ERRORS_DETAILED` | `true` → an unexpected failure shows its raw message (and the backend's response body); otherwise the agent sees `An unexpected error occurred. Reference: <id>` and the details go to stderr under that id |

## Use it from an agent

Register it as an MCP server (stdio). With Claude Code, from the repository root:

```bash
claude mcp add mateu --env MATEU_BASE_URL=http://localhost:8080 --env MATEU_DEV=true -- node frontend/mcp-server/index.mjs
```

Or in any MCP client's configuration:

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
npm test        # projection vs conformance/cases, the MCP protocol layer, and the authoring corpus (conformance/mcp)
npm run sync-resources   # re-copy the authoring resources from backend/shared/uidl
# end-to-end against a running backend:
MATEU_BASE_URL=http://localhost:8080 node ../../e2e/mcp-probe.mjs
```

## How it works

`wire.mjs` posts `POST {baseUrl}/mateu/v3/sync/{route}` (root = `/_no_route`); the screen *load* uses
`actionId: ""` (what the frontend's `mateu-ux` fires). `projection.mjs` (pure, unit-tested) deep-walks
the returned `UIIncrementDto` and picks out what an agent needs. The derivation rules are specified in
`doc/src/content/docs/reference/wire-specification.md` (§ Agent operability / MCP projection) so the
native Java endpoint reproduces the same projection.
