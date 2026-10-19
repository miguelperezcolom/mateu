# MCP authoring corpus

The Model Context Protocol surface of Mateu is served by FOUR implementations — the Java core
(`McpJsonRpc`), .NET (`Mateu.Core/Mcp`), Python (`mateu_ui/core/mcp.py`) and the stdio sidecar
(`frontend/mcp-server`). An agent must see the same tools, the same resources and the same answers
whichever it talks to. `authoring.json` pins that; each implementation has a test reading it.

`expected` values are generated from the Java reference
(`mvn -pl shared/core test -Dtest=McpAuthoringCorpusTest -Dmcp.corpus.write=true`) and then
**frozen**: a port that disagrees is fixed, the corpus is not regenerated to match it.

## What is pinned

| Part | Compared |
|---|---|
| `tools` | `tools/list` outside development mode, byte for byte (names, descriptions, input schemas, order) |
| `devTools` | the tools appended in development mode (`mateu_save_spec`) |
| `resources` | `resources/list`, byte for byte |
| `validate[]` | the validator's report for `yaml` with `context` (null = nothing known), exactly — except a `yaml_syntax` issue, whose `message`/`line`/`column` are the YAML parser's and are dropped before comparing |
| `preview[]` | `mateu_preview_uidl` on `yaml`: `rendered`, `screen.fields`, `screen.actions` and `validation` |

The four resource files (`uidl-schema.json`, `specs-schema.json`, `uidl-catalog.json`,
`authoring-guide.md`) live in `backend/shared/uidl/` and every implementation serves them
verbatim (Java from the `mateu-uidl` jar, .NET as embedded resources linked to those files, Python
and the sidecar as copies pinned equal by a test).

## The protocol (all four)

- `initialize` → `protocolVersion: "2024-11-05"`, `capabilities: {tools: {}, resources: {}}`,
  `serverInfo: {name: "mateu-mcp", version: "0.1.0"}`. The 2025 revisions are not advertised:
  they add Streamable-HTTP session semantics this stateless POST endpoint does not implement.
- A body that is not JSON → `{"jsonrpc":"2.0","id":null,"error":{"code":-32700,"message":"Parse error"}}`;
  a JSON value that is not an object → `-32600 "Invalid Request"` (id null).
- `resources/read {uri}` → `{contents: [{uri, mimeType, text}]}`; no `uri` → `-32602
  "Invalid params: uri is required"`; an unknown one → `-32002 "Resource not found: <uri>"`.
- A failing `tools/call` is a RESULT `{isError: true, content: [{type: "text", text: "Error: <text>"}]}`:
  a caller mistake (unknown tool, missing argument, refused path, unknown schema type) shows its
  message as written (`Error: Unknown tool: x`, `Error: Missing argument "yaml".`); anything else
  is `Error: An unexpected error occurred. Reference: <id>`, logged at ERROR under that id (the raw
  message only with `MATEU_ERRORS_DETAILED`). A request the server refuses (403) is the tool error
  `Error: Forbidden`. An action that FAILS (not refused) is not a tool error: its screen carries the
  sync endpoint's error message (the generic text + reference).
- Tool results are the JSON value pretty-printed in one text content.

## Tools (beyond the four operating tools)

| Tool | Arguments | Result |
|---|---|---|
| `mateu_list_components` | `query?` | `{components: [{type, description, attributes: [name…]}], count}` — the catalogue's components whose type or description contains `query` (case-insensitive), in catalogue order |
| `mateu_get_component_schema` | `type` | `{type, schema, definitions}` — the `$def` of `type` in `specs-schema.json`; `definitions` = every def it references transitively, sorted by name (ordinal), the def itself excluded; a def with `oneOf` (a polymorphic family) is included but not walked into; nothing is walked from `type` when it is itself a family. Unknown → caller error `Unknown type "X". Did you mean "Y"? See mateu_list_components.` (the suggestion clause only when there is one) |
| `mateu_validate_uidl` | `yaml` | the validation report (below), produced by the backend's reserved sync action `__validate__` (`parameters._yaml`, answer on `appData._validation`) — the sidecar calls it, so it validates against the backend's catalogues too |
| `mateu_preview_uidl` | `yaml`, `route?` | `{rendered: false, reason, validation}` when the report has errors (`"The definition has errors; fix them first."`) or the kind is not `component`/`envelope` (`"Only a page (a component, or a layout: envelope) can be previewed."`); else `{rendered: true, screen, validation}` with `screen` = the MCP projection of the reserved `__preview__` sync action's answer for `yaml` at `route` (default `""`) |
| `mateu_save_spec` | `path`, `yaml` | development mode only (listed and callable only then). Path refused → caller error (below). Report with errors → `{saved: false, reason: "The definition has errors; nothing was written.", validation}`; else writes the file under the (first) specs directory, creating folders, and answers `{saved: true, path, bytes, validation}` (`bytes` = UTF-8 length). No specs directory → caller error `No specs directory found (set <the port's specs-dir setting>).` |

**The path rule** — accepted only when: non-blank, ≤ 255 characters, no NUL, no `\`, does not
start with `/`, no drive prefix (`^[A-Za-z]:`), ends with `.yaml` or `.yml`, and no segment (split
on `/`) is empty, `.` or `..`; and the resolved target, after following symbolic links of its
nearest existing ancestor (and of the target itself), stays inside the specs directory. Refusal
message: `Invalid path "<path>": give a relative .yaml or .yml path inside the specs directory (no "..", no absolute path).`

## The validation report

```json
{"valid": true, "kind": "component", "errors": [], "warnings": [
  {"code": "undeclared_action", "message": "…", "path": "$.content[2].actionId", "line": 23, "column": 19}]}
```

`valid` = no errors. `kind` = `component` (a typed component at the root — a page or an app
shell), `envelope`, `partial`, `components`, `mount`, `routes`, `sources`, `actions`,
`translations`, `environment`, `types`, `project`, or null. Each issue: `code`, `message`, `path`
(JSONPath: `$`, `.key` for keys matching `^[A-Za-z_][A-Za-z0-9_]*$`, else `['key']` with `\` and
`'` backslash-escaped; `[i]` for list items), and `line`/`column` (1-based) when known. Errors
and warnings are each in document (walk) order.

### Before the walk
1. blank text → error `empty` `The YAML is empty.` (no position). Same when the document is null.
2. more than 262144 UTF-8 bytes → error `too_large` `The YAML is larger than the 262144-byte limit.`
3. the text is COMPOSED (node tree with positions; no construction). A parse error → error
   `yaml_syntax` with the parser's message and position.
4. more than 100000 nodes visited → error `too_complex`
   `The YAML is too complex to validate (more than 100000 nodes).` and the walk stops.

### Scalars (typed by raw text, never by a YAML resolver)
A quoted (non-plain) scalar is a string. A plain scalar is NULL when it is empty, `~` or `null`
(any case). Expected `string` → any scalar; `boolean` → text equal ignoring case to `true`/`false`;
`integer` → stripped text matches `[-+]?[0-9]+`; `number` → that or
`[-+]?(\.[0-9]+|[0-9]+(\.[0-9]*)?)([eE][-+]?[0-9]+)?`; `object` → a mapping; `array` → a sequence.
A NULL node fits ANY schema (nothing is checked under it).

### Classification of the root (against `specs-schema.json`'s root `oneOf`)
- a sequence → `routes`, validated against the array branch;
- not a mapping → error `unknown_kind` (message below, position of the root);
- `type` is one of UI, Routes, Sources, Actions, Translations, Environment, Types, Project → that
  kind (`mount` for UI, lower case otherwise), validated as an object against the branch whose
  `properties.type.const` is it;
- any other `type` key (even null or non-scalar) → `component`: validated as a discriminated
  member of `Component`, with the page-level keys of the `allOf` branch (`viewModel`, `modelView`,
  `actions`, `triggers`, `pageType`) accepted beside the member's own;
- otherwise by key, first match: `layout` or `layoutDelta` → `envelope`; `content` → `partial`;
  `components` → `components`; `routes` → `routes`; `actions` → `actions`; `types` → `types`;
  `messages` → `translations`; `sources` that is a sequence → `sources`, a mapping → `environment`;
- else error `unknown_kind`: ``Cannot tell what kind of definition this is: give it a `type:` (a component such as VerticalLayout, or a file kind such as UI, Routes or Sources), or a `layout:`, `content:` or `components:` key.``

### The walk (node, schema)
- `$ref` → the named `$def` (remember its name: the *def name*); a NULL node → done.
- schema with `oneOf` (a family; its name = the def name, e.g. `Component`, `Trigger`): not a
  mapping → `wrong_type` expected `a mapping`; no `type` or null → error `missing_type`
  `Missing "type": a <Family> must say which one it is.` at the mapping; non-scalar type →
  `wrong_type` (expected `a string`) at `<path>.type`; no member whose `properties.type.const`
  equals it → error `unknown_type` `Unknown <Family> type "<t>".` + ` Did you mean "<s>"?` when
  there is a suggestion, at `<path>.type`; else validate the mapping as an object against the member.
- schema with `enum`: non-scalar → `wrong_type` expected `a string`; text not in it → error
  `invalid_value` `"<v>" is not a valid <key> — use one of: <a, b, c>.` where `<key>` is the
  property name the value sits under (for a list item, the list's) or `value`.
- schema with `type`: the node does not fit any listed type → error `wrong_type`
  `Expected <expected>, found <found>.` — expected words: `a string`, `a boolean`, `an integer`,
  `a number`, `a mapping`, `a list`, joined `x, y or z`; found: `a mapping`, `a list`, or the
  scalar's raw text quoted.
- then a mapping whose schema has `properties` or `additionalProperties` → object; a sequence
  whose schema has `items` → each item, path `[i]`, same key.

### Objects
1. each `required` key missing → error `missing_required` `Missing required key "<k>".` at the mapping;
2. each key in document order (non-scalar keys skipped): in `properties` (or the page-level keys)
   → semantic check, then walk the value; else `additionalProperties` is an object → walk the
   value against it; else, when the schema has `properties` → WARNING `unknown_property`
   `Unknown key "<k>" (ignored).` + ` Did you mean "<s>"?` or ` Known keys here: <all properties in schema order, then the page-level keys>.`,
   at the key.

### Semantic checks (warnings; the value is a non-blank scalar)
| Where | Code | Message |
|---|---|---|
| `ref` of a `RestDataSource` | `unresolved_source` | `Source "<r>" is not in the source catalogue (sources.yaml).` |
| `ref` of a `Partial` | `unresolved_partial` | `Partial "<r>" does not exist (specs/ui/partials/).` |
| `ref` of a `ComponentRef` | `unresolved_component` | `Component "<r>" is not in the business component catalogue (components.yaml).` |
| any `fieldType` | `unresolved_field_type` | `Field type "<r>" is not in the field type catalogue (types.yaml).` |
| any `actionId` / `*ActionId` | `undeclared_action` | `Action "<a>" is not declared in this page's actions: (or the action catalogue); it only runs if the view model bound to the page has an action of that name.` |

The first four run only when the context knows that catalogue. The action check runs only for
kinds `component` (not when the root is an `AppShell`) and `envelope`, and only when the root
names no `viewModel`/`modelView`; declared = the root `actions[].id` plus the app's action
catalogue.

### Suggestions
Among the candidates (schema order): the first equal ignoring case; else the one with the smallest
Levenshtein distance on lower-cased text (earliest on ties), if that distance is ≤ 2 and smaller
than the value's length; else none. Values in messages are double-quoted with `\` and `"` escaped.

### After the walk (backends only, not in the corpus)
A report with no errors for kind `component`/`envelope` is handed to the real YAML loader; when it
cannot build the page, error `load_failed` `The definition could not be loaded: <reason>` (path
`$`) — so "valid" never means "and then the page answers Not found".

## Live UI push (phase C)

`push.json` pins the tools an MCP caller uses to send UI to a UI that is **open** in a browser tab or
an app window, and a scripted scenario every backend runs. The sidecar does not hold sessions: its
push tools forward to the backend's own `/mateu/mcp` (see below).

### Switches

OFF by default. Push needs BOTH the MCP endpoint and its own switch: Java `mateu.mcp.enabled=true`
+ `mateu.mcp.push.enabled=true` (any of system property, framework configuration, or
`MATEU_MCP_PUSH_ENABLED`, read through `MateuSettings`); .NET `MateuOptions.Mcp` + `MateuOptions.McpPush`
(or `MATEU_MCP_ENABLED` / `MATEU_MCP_PUSH_ENABLED`); Python `add_mateu(..., mcp=True, mcp_push=True)`
(or the same env vars). Limits (same names everywhere, `mateu.mcp.push.*` / `MATEU_MCP_PUSH_*`):
`rate-per-minute` (30 messages per session per rolling minute), `max-sessions` (1000).
Fixed: a pairing code lives 300 s; a disconnected session is forgotten (pairings included) 120 s after
its stream ended; at most 10 failed `mateu_pair_session` per caller per minute.

### The UI session and its channel

Each UI (a browser TAB, an app window, an IDE project) has a **UI session id** — the web uses its
per-tab `X-Session-Id` (`sessionStorage`), which the chat sends as its `sessionId` too — and a
**channel secret** (random, kept with it, sent only on the actions below). The app tells the UI that
push is on with `AppDto.agentPush: true`; only then does the UI open its channel and show "Connect AI".

Three app-level actions (dispatched like `_live-updates`: the app's `serverSideType`, route = the
app's root route, exempt from menu resolution), all with `parameters: {sessionId, secret}`:

| Action | Where | Answer |
|---|---|---|
| `_agent-channel` (+ `route`, `renderer`) | the SSE endpoint (`/mateu/v3/sse/…`) | an open-ended stream: a first increment with the session's status, then one increment per message, an empty increment every 20 s, and the end after 5 minutes (the UI reconnects at once) |
| `_agent-pair` | the sync endpoint | `Data{_agentPairing: {code, expiresInSeconds}}` — a new one-time code (the previous unused one dies) |
| `_agent-unpair` | the sync endpoint | `Data{_agentPairing: null}` — every pairing of the session removed; the channel is told |

Registration: the first `_agent-channel` for a sessionId registers it with the caller's principal
name (null when anonymous), the secret's SHA-256, the route and the renderer (`vaadin`, `redwood`,
`react-native`, `intellij`, or what the UI says, ≤ 32 chars). Every later call for that sessionId must
come with the same secret AND the same principal, else the error `This UI session belongs to another
channel.` A new channel for a connected session replaces the old stream (the old one ends). With
push off every one of them is the error `Live UI push is not enabled.`; with `max-sessions` reached and
nothing disconnected to evict, `Too many live UI sessions; try again later.` `_agent-pair` needs a
registered session.

Each message is an increment carrying ONE command `{type: "AgentPush", data: {kind, event, detail}}`:

| kind | event | detail | The UI does |
|---|---|---|---|
| `status` | `mateu-agent-status` | `{paired, agents: [label…]}` (label = the paired caller's principal name, else `an agent`), in pairing order | update its "Connect AI" control (connected indicator + Disconnect) — not dispatched |
| `render` | `render-screen` | `{yaml, target, title?}` | exactly what it does with the chat's `render-screen`: a subscriber first, else the built-in render target (`__preview__` → content / drawer / dialog) |
| `navigate` | `navigation-requested` | `{route, consumedRoute, actionId?, baseUrl?, serverSideType?, uriPrefix?}` | like the chat's `navigation-requested` (a menu click with those fields) |
| `event` | the name | the detail (`{}` when none) | like any other chat event: a DOM `CustomEvent` / the session event bus |

### Who may reach a session

The caller of an MCP tool is identified by, in order: its authenticated principal name (`user:<name>`),
else the header `X-Mateu-Agent-Key` when ≥ 16 characters (`key:<sha256 of it>` — what the sidecar
sends), else nobody (anonymous). A session is **visible** to a caller when the caller is signed in
with the session's principal, or when the session was paired to that caller. A session paired by an
**anonymous** caller is reachable by an anonymous caller knowing its handle (the handle is the
capability; it is returned only to whoever paired). Everything else answers `Unknown session "<s>".`
— a session another user owns and one that does not exist are indistinguishable.

The `session` handle is opaque (≥ 128 random bits, URL-safe), distinct from the UI session id, stable
while the session is registered. `mateu_list_sessions` lists the visible sessions, most recently
REGISTERED first: `{session, user, route, renderer, connectedAt (ISO-8601 UTC, seconds), connected,
paired}`.

### Tools (only when push is on; listed after the base tools, before `mateu_save_spec`)

- `mateu_pair_session {code}` — case-insensitive, the dash optional; a code works once, for 300 s.
  Wrong/expired/used → `Invalid or expired pairing code.`; more than 10 failures by the caller in a
  minute → `Too many pairing attempts; try again in a minute.` Pairing binds the session to the caller
  (an anonymous caller → the capability rule above), sends a `status` message and answers the session
  entry (`paired: true`).
- `mateu_push_ui {session, yaml, target?, title?}` — target not in content|drawer|dialog → `Invalid
  target "<t>": use content, drawer or dialog.`; then visibility, connection (`Session "<s>" is not
  connected.`), validation through the app's `__validate__` AS THE CALLER (the 256 KiB limit included):
  errors → `{delivered: false, reason: "The definition has errors; nothing was sent.", validation}`,
  a kind other than component/envelope → `{delivered: false, reason: "Only a page (a component, or a
  layout: envelope) can be pushed.", validation}`; then the rate limit; then `{delivered: true, session,
  target, validation}`. The UI renders it through `__preview__` with its own identity: the route
  guard and the wire-type policy apply there again.
- `mateu_navigate {session, route, consumedRoute?, actionId?, baseUrl?, serverSideType?, uriPrefix?}`
  → `{delivered: true, session}` (`consumedRoute` defaults to `""`; absent optional fields are not sent).
- `mateu_dispatch_event {session, event, detail?}` — `event` must match
  `^[A-Za-z][A-Za-z0-9_.:-]{0,63}$` (else `Invalid event name "<e>".`) and not be `render-screen`,
  `navigation-requested`, `close-requested` or `mateu-agent-status` (`Event "<e>" is reserved: use
  mateu_push_ui or mateu_navigate.`); the detail serialised ≤ 65536 UTF-8 bytes (`The detail is
  larger than the 65536-byte limit.`) → `{delivered: true, session}`.

Order of the checks for the three senders: arguments (missing → `Missing argument "x".`, target, event
name/size), visibility, connection, validation (push only), rate limit (`Too many messages to this
session; try again in a minute.`). Every delivery is logged at INFO: `Mateu agent push: caller=<label>
session=<handle> kind=<kind> <target=…|event=…|route=…> bytes=<n>`. With push off the push tools are
neither listed nor callable (`Unknown tool: <name>`).

### The sidecar

`MATEU_PUSH=true` lists the five tools; each call is forwarded as `tools/call` to the backend's
`MATEU_MCP_URL` (default `<MATEU_BASE_URL>/mateu/mcp`) with the `MATEU_TOKEN` bearer and an
`X-Mateu-Agent-Key` (`MATEU_AGENT_KEY`, else a random key generated per sidecar process), and the
backend's result is returned as is.
