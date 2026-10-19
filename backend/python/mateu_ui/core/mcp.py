"""Agent-operability plane (Python) — Model Context Protocol projection + JSON-RPC dispatch.

The Python twin of the sidecar's ``projection.mjs`` and the Java ``McpProjection``: all three walk
the SAME serialized wire, so they produce the SAME flat, agent-friendly screen — parity by
construction. The derivation rules are normative (``doc/.../reference/wire-specification.md`` §
Agent operability). See ``design/riu-agent-operability-plan.md`` (P4).

Pure ``dict -> dict`` (stdlib-only at import time, no pydantic), so the projection + protocol are
unit-testable without the framework; the FastAPI layer supplies the ``sync_fn`` that runs the
SyncHandler. The authoring tools (phase B: validate, preview, schemas, resources, save_spec) and the
error boundary import ``mateu_ui.core.authoring`` / ``error_boundary`` lazily, when called. The tool
and resource lists are pinned byte for byte by ``conformance/mcp/authoring.json``.
"""

import json
import logging

PROTOCOL_VERSION = "2024-11-05"
SERVER_NAME = "mateu-mcp"
SERVER_VERSION = "0.1.0"


def normalize_route(route):
    """The server encodes the root/empty route as ``_empty``; treat it as ``''``."""
    r = (route or "").lstrip("/")
    return "" if r == "_empty" else r


def _deep_visit(node, fn):
    if isinstance(node, dict):
        fn(node)
        for v in node.values():
            _deep_visit(v, fn)
    elif isinstance(node, list):
        for v in node:
            _deep_visit(v, fn)


def _md_type(node):
    md = node.get("metadata")
    if isinstance(md, dict) and isinstance(md.get("type"), str):
        return md["type"]
    return None


def project_increment(increment):
    """Project a serialized UIIncrementDto (a dict) into a flat screen an agent can act on."""
    inc = increment or {}
    commands = inc.get("commands") or []
    messages = inc.get("messages") or []
    fragments = inc.get("fragments") or []

    ctx = {"serverSide": None, "page": None, "crudl": None, "state": None}
    field_nodes = []
    buttons_by_action = {}

    def visit(node):
        if node.get("type") == "ServerSide" and ctx["serverSide"] is None:
            ctx["serverSide"] = node
        t = _md_type(node)
        md = node.get("metadata") or {}
        if t == "FormField" and md.get("fieldId"):
            field_nodes.append(md)
        elif t == "Page" and ctx["page"] is None:
            ctx["page"] = md
        elif t in ("Crud", "Crudl") and ctx["crudl"] is None:  # the listing is "Crud" on the wire
            ctx["crudl"] = md
        elif t == "Button" and md.get("actionId"):
            buttons_by_action.setdefault(md["actionId"], md.get("label"))
        elif node.get("type") == "Button" and node.get("actionId"):
            # a page toolbar / buttons entry is a bare button, not a component node
            buttons_by_action.setdefault(node["actionId"], node.get("label"))

    for fragment in fragments:
        if ctx["state"] is None and isinstance(fragment.get("state"), dict):
            ctx["state"] = fragment["state"]
        root = fragment.get("component", fragment)
        _deep_visit(root, visit)

    server_side = ctx["serverSide"]
    page = ctx["page"]
    crudl = ctx["crudl"]
    values = ctx["state"]
    if values is None:
        values = server_side.get("initialData") if server_side and isinstance(server_side.get("initialData"), dict) else {}

    # Fields (deduped by id, declaration order).
    fields = []
    seen_field = set()
    for md in field_nodes:
        fid = md["fieldId"]
        if fid in seen_field:
            continue
        seen_field.add(fid)
        f = {
            "id": fid,
            "label": md.get("label") or fid,
            "dataType": md.get("dataType") or "string",
            "stereotype": md.get("stereotype") or "regular",
            "required": bool(md.get("required")),
            "readOnly": bool(md.get("readOnly")),
        }
        if fid in values:
            f["value"] = values[fid]
        opts = md.get("options")
        if isinstance(opts, list) and opts:
            f["options"] = [
                {"value": o.get("value"), "label": o.get("label", str(o.get("value", "")))}
                for o in opts
            ]
        fields.append(f)

    # Actions (RBAC already applied server-side), labels enriched from buttons.
    actions = []
    seen_action = set()
    for a in (server_side.get("actions") if server_side else None) or []:
        aid = a.get("id")
        if not aid or aid in seen_action:
            continue
        seen_action.add(aid)
        action = {"id": aid, "label": buttons_by_action.get(aid) or aid}
        if a.get("shortcut"):
            action["shortcut"] = a["shortcut"]
        if a.get("confirmationRequired"):
            action["confirmationRequired"] = True
        if a.get("href"):
            action["href"] = a["href"]
        actions.append(action)
    for aid, label in buttons_by_action.items():
        if aid not in seen_action:
            seen_action.add(aid)
            actions.append({"id": aid, "label": label or aid})

    title = _command_data(commands, "SetWindowTitle")
    if title is None and page:
        title = page.get("pageTitle") or page.get("title")
    if title is None and crudl:
        title = crudl.get("title")

    screen = {
        "route": normalize_route(server_side.get("route")) if server_side else None,
        "serverSideType": server_side.get("serverSideType") if server_side else None,
        "pageType": (server_side.get("pageType") if server_side else None) or (page.get("pageType") if page else None),
        "wireVersion": inc.get("wireVersion"),
        "title": title,
        "subtitle": (page.get("subtitle") if page else None) or (crudl.get("subtitle") if crudl else None),
        "fields": fields,
        "actions": actions,
        "state": values,
    }

    if crudl:
        columns = []
        for c in crudl.get("columns") or []:
            md = c.get("metadata", c) if isinstance(c, dict) else {}
            cid = md.get("id") or md.get("fieldId")
            label = md.get("caption") or md.get("label")
            if cid or label:
                columns.append({"id": cid, "label": label})
        screen["listing"] = {
            "title": crudl.get("title"),
            "searchable": bool(crudl.get("searchable")),
            "columns": columns,
            "filters": [
                {"id": f.get("fieldId"), "label": f.get("label", f.get("fieldId")), "dataType": f.get("dataType", "string")}
                for f in (crudl.get("filters") or [])
            ],
        }

    # the rows of a search: a search answer is a data-only fragment ({<listing id>: {page:
    # {content, totalElements, pageNumber, pageSize}}}) — the agent asked for them
    rows_page = _rows_page_of(fragments)
    if rows_page is not None:
        listing = screen.setdefault("listing", {})
        listing["rows"] = [
            {k: v for k, v in row.items() if k != "_rowNumber"} if isinstance(row, dict) else row
            for row in rows_page["content"]
        ]
        for key in ("totalElements", "pageNumber", "pageSize"):
            if key in rows_page:
                listing[key] = rows_page[key]

    if messages:
        # the wire's message names its severity "variant" (error/warning/success/info): reading only
        # "type" told an agent every failure was "info"
        screen["messages"] = [
            {
                "text": m.get("text", m.get("message", "")),
                "type": m.get("variant") or m.get("type") or "info",
                **({"title": m["title"]} if m.get("title") else {}),
            }
            for m in messages
        ]
    notable = [{"type": c.get("type"), "data": c.get("data")} for c in commands if c.get("type") and c.get("type") != "SetWindowTitle"]
    if notable:
        screen["commands"] = notable
    return screen


def _rows_page_of(fragments):
    """The first ``{page: {content: [...]}}`` entry of any fragment's data, or None."""
    for fragment in fragments:
        data = fragment.get("data") if isinstance(fragment, dict) else None
        if not isinstance(data, dict):
            continue
        for entry in data.values():
            page = entry.get("page") if isinstance(entry, dict) else None
            if isinstance(page, dict) and isinstance(page.get("content"), list):
                return page
    return None


def _command_data(commands, type_):
    for c in commands:
        if c.get("type") == type_:
            return c.get("data")
    return None


def list_routes_from(increment):
    """Navigable routes from the app menu on the root response → [{route, caption}]."""
    routes = {}

    def collect(node):
        if isinstance(node, dict):
            md = node.get("metadata")
            if isinstance(md, dict) and md.get("type") == "App":
                _walk_menu(md.get("menu"), routes)
            route = node.get("route")
            if isinstance(route, str) and route and not _is_folder(node):
                r = normalize_route(route)
                routes.setdefault(r, node.get("caption") or node.get("label") or (r or "Home"))
            for v in node.values():
                collect(v)
        elif isinstance(node, list):
            for v in node:
                collect(v)

    for fragment in (increment or {}).get("fragments") or []:
        collect(fragment.get("component", fragment))
    routes.setdefault("", "Home")
    return [{"route": r, "caption": c} for r, c in routes.items()]


def _is_folder(item: dict) -> bool:
    submenus = item.get("submenus")
    return isinstance(submenus, list) and len(submenus) > 0


def _walk_menu(menu, out):
    if not isinstance(menu, list):
        return
    for item in menu:
        if not isinstance(item, dict):
            continue
        raw = item.get("route", item.get("path"))
        # a folder (an entry holding submenus) is not a place to go: its "/" path would otherwise
        # be reported as the home, under the folder's caption
        if isinstance(raw, str) and raw and not _is_folder(item):
            r = normalize_route(raw)
            out.setdefault(r, item.get("caption") or item.get("label") or (r or "Home"))
        _walk_menu(item.get("submenus"), out)
        _walk_menu(item.get("menu"), out)


class McpCallerError(ValueError):
    """A mistake of the CALLER (an unknown tool, a missing argument): shown to the agent as written."""


def _obj_schema(props=None, required=None):
    schema = {"type": "object", "properties": props or {}, "additionalProperties": False}
    if required:
        schema["required"] = list(required)
    return schema


def _str(description=None):
    prop = {"type": "string"}
    if description is not None:
        prop["description"] = description
    return prop


def _obj(description=None):
    prop = {"type": "object"}
    if description is not None:
        prop["description"] = description
    return prop


#: The tool list — identical (names, descriptions, schemas, order) in the Java, .NET and Python
#: backends and the sidecar; pinned by ``conformance/mcp/authoring.json``.
TOOLS = [
    {
        "name": "mateu_list_routes",
        "description": "List the navigable routes of the Mateu app (derived from its menu). Returns [{route,"
        " caption}].",
        "inputSchema": _obj_schema(),
    },
    {
        "name": "mateu_describe_screen",
        "description": "Load a screen by route and return a flat description an agent can act on: title,"
        " fields (id, label, dataType, required, value, options), actions (id, label),"
        ' listing (if any), and the current state. Use route "" for the home screen.',
        "inputSchema": _obj_schema({"route": _str('route relative to the mount, "" = home')}, ["route"]),
    },
    {
        "name": "mateu_run_action",
        "description": "Run an action on a screen (an action id from mateu_describe_screen), optionally"
        " seeding field values via componentState. Returns the resulting screen"
        " projection (messages, navigation, new state).",
        "inputSchema": _obj_schema(
            {
                "route": _str(),
                "actionId": _str(),
                "componentState": _obj("field id -> value; seeds/overrides form state"),
            },
            ["route", "actionId"],
        ),
    },
    {
        "name": "mateu_search",
        "description": "Search a listing screen with free text (and optional filter values). Returns the"
        " listing.",
        "inputSchema": _obj_schema({"route": _str(), "searchText": _str(), "filters": _obj()}, ["route"]),
    },
    {
        "name": "mateu_list_components",
        "description": "List the component types a YAML definition can use, each with a one-line description"
        " and the names of its main attributes. Read mateu://guide first if you have not"
        " authored Mateu YAML before.",
        "inputSchema": _obj_schema(
            {"query": _str("optional: only the types whose name or description contains it")}
        ),
    },
    {
        "name": "mateu_get_component_schema",
        "description": "Return the JSON Schema of one component type: every key it accepts with its value"
        " type, plus every definition it references (enums, nested records). A"
        " #/$defs/Component reference means any component.",
        "inputSchema": _obj_schema(
            {"type": _str("a component type (e.g. FormField) or any other schema definition")}, ["type"]
        ),
    },
    {
        "name": "mateu_validate_uidl",
        "description": "Validate a YAML definition (a page, an app shell or any specs/ui file kind) without"
        " rendering it. Returns {valid, kind, errors, warnings}; each issue has a code, a"
        " message, a JSONPath and its line/column. Errors make the definition fail to"
        " load; warnings are ignored keys, undeclared actions and references that do not"
        " resolve.",
        "inputSchema": _obj_schema({"yaml": _str("the definition's YAML text")}, ["yaml"]),
    },
    {
        "name": "mateu_preview_uidl",
        "description": "Render a YAML page as the app would — layout only: no view model is bound and nothing"
        " is saved — and return {rendered, screen, validation}: the screen projection"
        " (title, fields, actions…) plus the validation report.",
        "inputSchema": _obj_schema(
            {
                "yaml": _str("the page's YAML text"),
                "route": _str("optional: the route to render it under (its access rules apply)"),
            },
            ["yaml"],
        ),
    },
]

def _session_arg():
    return _str("a session from mateu_list_sessions or mateu_pair_session")


#: The live UI push tools (phase C) — listed after :data:`TOOLS` and before :data:`DEV_TOOLS`,
#: only when push is on; pinned by ``conformance/mcp/push.json``.
PUSH_TOOLS = [
    {
        "name": "mateu_list_sessions",
        "description": "List the live UI sessions (browser tabs, app windows) this caller may send UI to:"
        " its own (same signed-in user) and the ones paired to it with mateu_pair_session."
        " Returns {sessions: [{session, user, route, renderer, connectedAt, connected, paired}]}.",
        "inputSchema": _obj_schema(),
    },
    {
        "name": "mateu_pair_session",
        "description": "Pair a live UI session with this caller, using the one-time code the user sees after"
        ' clicking "Connect AI" in the app. Returns the session; it can then be addressed by'
        " mateu_push_ui, mateu_navigate and mateu_dispatch_event. The code expires in minutes"
        " and works once.",
        "inputSchema": _obj_schema(
            {"code": _str("the pairing code shown in the app, e.g. K7QF-4MZP")}, ["code"]
        ),
    },
    {
        "name": "mateu_push_ui",
        "description": "Show a screen in a live UI session: validate the YAML page first (nothing is sent"
        " when it has errors), then render it in that tab, in the content area (default), a"
        " drawer or a dialog. Layout only: no view model is bound. Returns {delivered,"
        " session, target, validation} or {delivered: false, reason, validation}.",
        "inputSchema": _obj_schema(
            {
                "session": _session_arg(),
                "yaml": _str("the page's YAML text"),
                "target": {
                    "type": "string",
                    "enum": ["content", "drawer", "dialog"],
                    "description": "where to show it (default content)",
                },
                "title": _str("optional: the drawer's or dialog's header"),
            },
            ["session", "yaml"],
        ),
    },
    {
        "name": "mateu_navigate",
        "description": "Navigate a live UI session to a route of the app, like a click on the menu entry"
        " carrying these fields. Returns {delivered, session}.",
        "inputSchema": _obj_schema(
            {
                "session": _session_arg(),
                "route": _str("the target route, e.g. /orders/42"),
                "consumedRoute": _str('optional: the route consumed by the app shell (usually "")'),
                "actionId": _str("optional: an action to run on arrival"),
                "baseUrl": _str("optional: the base URL of the target micro-frontend"),
                "serverSideType": _str("optional: the server-side type of the target UI"),
                "uriPrefix": _str('optional: the URI prefix (usually "")'),
            },
            ["session", "route"],
        ),
    },
    {
        "name": "mateu_dispatch_event",
        "description": "Dispatch a named UI event in a live UI session, for the components that subscribe"
        " to it (@SubscribeTo). The built-in events are reserved: use mateu_push_ui and"
        " mateu_navigate for them. Returns {delivered, session}.",
        "inputSchema": _obj_schema(
            {
                "session": _session_arg(),
                "event": _str("the event name, e.g. highlight-row"),
                "detail": _obj("optional: the event's detail"),
            },
            ["session", "event"],
        ),
    },
]

_PUSH_TOOL_NAMES = frozenset(t["name"] for t in PUSH_TOOLS)

#: Appended to :data:`TOOLS` in development mode only.
DEV_TOOLS = [
    {
        "name": "mateu_save_spec",
        "description": "Development mode only: validate a YAML definition and, when it has no errors, write"
        " it into the app's specs directory (path relative to it, e.g. customers.yaml"
        " or partials/address.yaml); live reload shows it in the open browsers. Paths"
        " outside the specs directory are refused.",
        "inputSchema": _obj_schema(
            {
                "path": _str("relative to the specs directory, e.g. customers.yaml"),
                "yaml": _str("the definition's YAML text"),
            },
            ["path", "yaml"],
        ),
    },
]

#: The reserved sync actions the authoring tools are built on (Java's RunActionUseCase).
VALIDATE_ACTION = "__validate__"
PREVIEW_ACTION = "__preview__"
YAML_KEY = "_yaml"
VALIDATION_KEY = "_validation"


def _dev_mode() -> bool:
    from mateu_ui.core import dev_specs

    return dev_specs.enabled()


def tools(dev_mode: bool | None = None, push: bool = False) -> list:
    """``tools/list``: :data:`TOOLS`, then :data:`PUSH_TOOLS` when live UI push is on, then
    :data:`DEV_TOOLS` in development mode."""
    listed = TOOLS + (PUSH_TOOLS if push else [])
    return listed + DEV_TOOLS if (_dev_mode() if dev_mode is None else dev_mode) else list(listed)


def _argument(args, name):
    """A required string argument, or the caller's mistake."""
    value = args.get(name)
    if not isinstance(value, str):
        raise McpCallerError(f'Missing argument "{name}".')
    return value


def _text_arg(args, name):
    value = args.get(name)
    if value is None or isinstance(value, (dict, list)):
        return ""
    return value if isinstance(value, str) else json.dumps(value)


def _validation(route, yaml_text, sync_fn):
    """The app's ``__validate__`` answer for ``yaml_text`` (through ``sync_fn``: the caller's
    identity and the route's access rules apply)."""
    increment = sync_fn(route, VALIDATE_ACTION, None, {YAML_KEY: yaml_text or ""}) or {}
    report = (increment.get("appData") or {}).get(VALIDATION_KEY)
    if not isinstance(report, dict):
        # refused, or failed: the increment's message says why
        messages = increment.get("messages") or [{}]
        raise McpCallerError((messages[0] or {}).get("text") or "validation failed")
    return report


def _preview(yaml_text, route, sync_fn):
    validation = _validation(route, yaml_text, sync_fn)
    out = {}
    if not validation.get("valid"):
        out["rendered"] = False
        out["reason"] = "The definition has errors; fix them first."
    elif validation.get("kind") not in ("component", "envelope"):
        out["rendered"] = False
        out["reason"] = "Only a page (a component, or a layout: envelope) can be previewed."
    else:
        out["rendered"] = True
        out["screen"] = project_increment(sync_fn(route, PREVIEW_ACTION, None, {YAML_KEY: yaml_text}))
    out["validation"] = validation
    return out


def _save_spec(args, sync_fn):
    from mateu_ui.core import dev_specs
    from mateu_ui.core.authoring import spec_writer

    if not _dev_mode():
        raise McpCallerError("Unknown tool: mateu_save_spec")
    directory = dev_specs.specs_dir()
    if not directory.is_dir():
        raise McpCallerError("No specs directory found (set MATEU_DEV_SPECS_DIR).")
    path = _argument(args, "path")
    yaml_text = _argument(args, "yaml")
    if not spec_writer.is_acceptable(path):
        raise McpCallerError(spec_writer.refusal(path))
    if spec_writer.is_catalogue_file(path):
        raise McpCallerError(spec_writer.catalogue_refusal(path))
    validation = _validation("", yaml_text, sync_fn)
    out = {}
    kind = validation.get("kind")
    refused = spec_writer.agent_refusal(kind if isinstance(kind, str) else None, yaml_text)
    if refused is not None:
        # never written, and said loudly: an agent tried to author what decides a request
        logging.getLogger("mateu.mcp").warning(
            "mateu_save_spec refused %r: %s", (path or "")[:256], refused
        )
        out["saved"] = False
        out["reason"] = refused
    elif not validation.get("valid"):
        out["saved"] = False
        out["reason"] = "The definition has errors; nothing was written."
    else:
        written = spec_writer.write(directory, path, yaml_text)
        out["saved"] = True
        out["path"] = path
        out["bytes"] = written
    out["validation"] = validation
    return out


def dispatch_tool(name, args, sync_fn, push=None):
    """Run a tool. ``sync_fn(route, action_id, component_state, parameters) -> increment dict``;
    ``push`` (an ``agent_push.PushContext``, None = push off) serves the live UI push tools. The
    runs inside are marked as an MCP tool call (``__validate__`` answers only those, or an app with
    its authoring plane open — :mod:`mateu_ui.core.authoring_gate`)."""
    from mateu_ui.core.authoring_gate import mcp_call

    with mcp_call():
        return _dispatch_tool(name, args, sync_fn, push)


def _dispatch_tool(name, args, sync_fn, push=None):
    args = args if isinstance(args, dict) else {}
    if name in _PUSH_TOOL_NAMES and push is not None:
        from mateu_ui.core import agent_push

        return agent_push.call_tool(
            push.sessions, push.caller, name, args, lambda yaml_text: _validation("", yaml_text, sync_fn)
        )
    if name == "mateu_list_routes":
        return list_routes_from(sync_fn("", "", None, None))
    if name == "mateu_describe_screen":
        return project_increment(sync_fn(normalize_route(_text_arg(args, "route")), "", None, None))
    if name == "mateu_run_action":
        return project_increment(
            sync_fn(
                normalize_route(_text_arg(args, "route")),
                _text_arg(args, "actionId"),
                args.get("componentState") if isinstance(args.get("componentState"), dict) else None,
                None,
            )
        )
    if name == "mateu_search":
        text = _text_arg(args, "searchText")
        params = {"searchText": text} if text else {}
        # A listing reads its search text from the component state (where its search box binds
        # it), like the filters; the parameter copy is what a lookup's search reads.
        filters = args.get("filters")
        state = dict(filters) if isinstance(filters, dict) else {}
        if text:
            state["searchText"] = text
        return project_increment(
            sync_fn(normalize_route(_text_arg(args, "route")), "search", state or None, params)
        )
    if name == "mateu_list_components":
        from mateu_ui.core.authoring import list_components

        return list_components(_text_arg(args, "query"))
    if name == "mateu_get_component_schema":
        from mateu_ui.core.authoring import schema_of

        return schema_of(_argument(args, "type"))
    if name == "mateu_validate_uidl":
        return _validation("", _argument(args, "yaml"), sync_fn)
    if name == "mateu_preview_uidl":
        yaml_text = _argument(args, "yaml")
        return _preview(yaml_text, normalize_route(_text_arg(args, "route")), sync_fn)
    if name == "mateu_save_spec":
        return _save_spec(args, sync_fn)
    raise McpCallerError(f"Unknown tool: {name}")


def error_text(error, tool="", detailed=None):
    """What a failed call tells the agent — the request path's error boundary: a mistake of the
    caller (:class:`McpCallerError`, a ``UserFacingException``: an unknown tool, a missing argument,
    a refused path, "Forbidden") is shown as written; anything else is the generic text with a
    reference, logged at ERROR under it (the raw message only with ``MATEU_ERRORS_DETAILED``)."""
    if isinstance(error, McpCallerError):
        return str(error)
    from mateu_ui.core import error_boundary
    from mateu_ui.uidl import UserFacingException

    if isinstance(error, UserFacingException):
        return error.message
    return error_boundary.describe(error, f"mcp:{tool}", detailed=detailed)["text"]


def _resources_list():
    from mateu_ui.core.authoring import RESOURCES

    return [{"uri": r.uri, "name": r.name, "description": r.description, "mimeType": r.mime_type} for r in RESOURCES]


def handle_jsonrpc(message, sync_fn, detailed=None, push=None):
    """Handle one JSON-RPC 2.0 message. Returns the response dict, or None for a notification.
    ``detailed`` shows the raw exception of a failed tool call (default: ``MATEU_ERRORS_DETAILED``);
    ``push`` (an ``agent_push.PushContext``) lists and serves the live UI push tools."""
    if not isinstance(message, dict):
        return _err(None, -32600, "Invalid Request")
    mid = message.get("id")
    is_notification = mid is None
    method = message.get("method", "")
    params = message.get("params") if isinstance(message.get("params"), dict) else {}
    try:
        if method == "initialize":
            return _ok(mid, {
                "protocolVersion": PROTOCOL_VERSION,
                "capabilities": {"tools": {}, "resources": {}},
                "serverInfo": {"name": SERVER_NAME, "version": SERVER_VERSION},
            })
        if method in ("notifications/initialized", "initialized"):
            return None
        if method == "ping":
            return _ok(mid, {})
        if method == "tools/list":
            return _ok(mid, {"tools": tools(push=push is not None)})
        if method == "resources/list":
            return _ok(mid, {"resources": _resources_list()})
        if method == "resources/read":
            from mateu_ui.core.authoring import resources

            uri = params.get("uri")
            if uri is None:
                return _err(mid, -32602, "Invalid params: uri is required")
            uri = uri if isinstance(uri, str) else json.dumps(uri)
            resource = resources.by_uri(uri)
            if resource is None:
                return _err(mid, -32002, f"Resource not found: {uri}")
            return _ok(mid, {"contents": [
                {"uri": resource.uri, "mimeType": resource.mime_type, "text": resources.text(resource.file)}
            ]})
        if method == "tools/call":
            name = params.get("name")
            data = dispatch_tool(
                name if isinstance(name, str) else "", params.get("arguments") or {}, sync_fn, push
            )
            return _ok(mid, {"content": [{"type": "text", "text": json.dumps(data, indent=2, default=str)}]})
        if is_notification:
            return None
        return _err(mid, -32601, f"Method not found: {method}")
    except Exception as e:  # noqa: BLE001
        if is_notification:
            return None
        tool = params.get("name") if method == "tools/call" else ""
        text = error_text(e, tool if isinstance(tool, str) else "", detailed)
        if method == "tools/call":
            # MCP convention: a tool error is a result with isError, not a protocol error.
            return _ok(mid, {"isError": True, "content": [{"type": "text", "text": f"Error: {text}"}]})
        return _err(mid, -32603, text)


def _ok(mid, result):
    if mid is None:
        return None
    return {"jsonrpc": "2.0", "id": mid, "result": result}


def _err(mid, code, message):
    return {"jsonrpc": "2.0", "id": mid, "error": {"code": code, "message": message}}
