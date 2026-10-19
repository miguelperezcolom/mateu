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

The same server also lets an agent **author** screens: it serves the authoring contract (the schemas,
a component catalogue, a guide) and tools to validate, preview and — in development mode — save a
YAML definition. See [Authoring tools](#authoring-tools) and
[Let an AI author screens via MCP](#let-an-ai-author-screens-via-mcp). For prompt-to-app without an
MCP client, see [Prompt-to-app (AI authoring)](/reference/prompt-to-app/).

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

## Authoring tools

Nothing here changes the running app — except `mateu_save_spec`, which exists only in development
mode.

| Tool | What it does |
|---|---|
| `mateu_list_components` | The component types a YAML definition can use, each with a one-line description and its main attribute names (`query` filters). |
| `mateu_get_component_schema` | One type's JSON Schema plus every definition it references (enums, nested records) — what keys it takes and what values they accept. |
| `mateu_validate_uidl` | Validate a definition (a page, an app shell or any `specs/ui` file kind) → `{valid, kind, errors, warnings}`. Each issue has a `code`, a `message`, a JSONPath and its `line`/`column`. |
| `mateu_preview_uidl` | Validate, then render the page as the app would (layout only — no view model is bound) → `{rendered, screen, validation}`, `screen` being the same projection as `mateu_describe_screen`. |
| `mateu_save_spec` | **Development mode only** (`mateu.dev=true` / `MATEU_DEV=true`; listed only then): validate and, with no errors, write the file into the specs directory; live reload shows it in the open browsers. |

What validation reports:

- **errors** — anything that makes the definition fail to load: YAML syntax, an unknown `type`
  (with a "did you mean"), a missing `type:` or required key, a value of the wrong type, a value
  outside its enum (e.g. `dataType: decimal`, which does not exist — use `number` or `money`), and
  finally whatever the app's real loader still refuses (`load_failed`), so "valid" never means
  "and then the page answers Not found";
- **warnings** — unknown keys (the loader ignores them, so it is usually a typo; the closest known
  key is suggested), button/trigger action ids that nothing declares on a page with no view model,
  and references that do not resolve in this app: `ref:` of a REST source, a `Partial`, a
  `ComponentRef`, a `fieldType`.

Resources (`resources/list`, `resources/read`):

| URI | Content |
|---|---|
| `mateu://guide` | A short authoring guide for agents: the workflow, a sample page, the rules. |
| `mateu://catalog` | The component catalogue — generated from the schema, each component described by its own Javadoc. |
| `mateu://schema/specs` | `specs-schema.json`: every file kind under `specs/ui`. |
| `mateu://schema/uidl` | `uidl-schema.json`: the component catalogue as JSON Schema. |

They ship inside the app (the `mateu-uidl` jar, the .NET assembly, the Python package, the sidecar),
so an agent gets the contract of the version it talks to, without network access.

## Two hosts, one projection

- **Sidecar** — `frontend/mcp-server/`, a zero-dependency Node MCP server. It speaks only the public
  wire, so it operates a **Java, .NET or Python** backend with **no backend change**. Point it at a URL
  and go. This is the quickest way to try it, and it covers **every** backend today.
- **Native endpoint** — the backend serves the same MCP projection directly, so an app can *also be an
  MCP* with no sidecar to deploy, enforcing permissions natively. Available on **Java** (every adapter:
  Spring MVC, Spring WebFlux, Micronaut, Quarkus, Helidon MP), **Python** (FastAPI) and **.NET** (ASP.NET
  Core) — all at `POST /mateu/mcp`, all sharing one projection. It is **off by default** everywhere:
  enable it with `mateu.mcp.enabled=true` (Java), `MateuOptions.Mcp = true` (.NET),
  `add_mateu(..., mcp=True)` (Python) or `MATEU_MCP_ENABLED=true` (.NET and Python). It gives any
  caller holding a valid token a programmatic way to drive every screen, which the application has
  to decide to expose.

## Permissions (RBAC)

Authorization is enforced by the **backend**, not by the MCP layer: `@EyesOnly`, `@ReadOnlyUnless` and
`@DisabledUnless` are applied server-side over the caller's JWT. The MCP **inherits** that — it never
opens a wider path. An action a token may not run **never reaches the wire**, so it never appears as a
tool result. The sidecar simply relays a `MATEU_TOKEN` bearer to the backend.

The authoring tools go through the same path: validation and preview run as reserved actions of the
app (`__validate__`, `__preview__`), so the caller's identity and the route's `access:` rules apply,
and a preview renders only the text it is given — no view model, no data. A refused call is the
tool error `Error: Forbidden`; an unexpected failure is `Error: An unexpected error occurred.
Reference: <id>` (logged under that id; the raw message only with `MATEU_ERRORS_DETAILED=true`).
Definitions are capped at 256 KiB. `mateu_save_spec` refuses any path that is not a relative
`.yaml`/`.yml` inside the specs directory (no `..`, no absolute path, no symbolic link out).

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

## Let an AI author screens via MCP

Run the app in development mode with the endpoint on, and register it with your agent. With Claude
Code, against the native endpoint:

```bash
# the app: mateu.mcp.enabled=true + mateu.dev=true (or MATEU_MCP_ENABLED=true MATEU_DEV=true)
claude mcp add --transport http mateu http://localhost:8080/mateu/mcp
```

Or through the stdio sidecar, which works against any backend with the endpoint off; it saves into a
local specs directory when `MATEU_DEV=true` (`MATEU_SPECS_DIR`, default
`src/main/resources/specs/ui`):

```bash
claude mcp add mateu --env MATEU_BASE_URL=http://localhost:8080 --env MATEU_DEV=true \
  -- node frontend/mcp-server/index.mjs
```

Then ask for a screen ("a customer form with name, email and a Save button"). A good agent reads
`mateu://guide`, looks types up with `mateu_list_components` / `mateu_get_component_schema`,
iterates with `mateu_validate_uidl` until there are no errors, checks the result with
`mateu_preview_uidl` and saves it with `mateu_save_spec` — and the open browser reloads with it.

The protocol version advertised is `2024-11-05` (clients negotiate down to it); the endpoint is a
stateless JSON POST.

## The in-app assistant uses the same projection

The built-in AI chat (`@AI(sse=…)`) is the *other* face of the same idea. With every message it now
sends a **self-describing projection of the screen the user is looking at** — the same shape the MCP
produces: the current fields (id, label, dataType, value) and the actions available. So the assistant
fills forms and runs actions precisely instead of guessing from raw state, and it drives the UI by
returning the wire events every renderer applies (`navigation-requested`, `render-screen` — a screen it
authored, rendered by the page that subscribes to it or else by the shell —, dispatched events…; see
the [event catalogue](/ai/#the-event-catalogue)).
One projection, two consumers: external agents (MCP) and the in-app assistant.

## Verify

```bash
cd frontend/mcp-server && npm test            # projection (against the conformance corpus) + protocol
MATEU_BASE_URL=http://localhost:8080 node e2e/mcp-probe.mjs   # end-to-end against a live backend
MATEU_BASE_URL=http://localhost:8080 node e2e/mcp-probe.mjs --native   # the app's own /mateu/mcp
```

See `frontend/mcp-server/README.md` for the full tool surface and configuration.
