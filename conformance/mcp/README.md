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
