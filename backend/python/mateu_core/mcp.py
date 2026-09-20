"""Agent-operability plane (Python) — Model Context Protocol projection + JSON-RPC dispatch.

The Python twin of the sidecar's ``projection.mjs`` and the Java ``McpProjection``: all three walk
the SAME serialized wire, so they produce the SAME flat, agent-friendly screen — parity by
construction. The derivation rules are normative (``doc/.../reference/wire-specification.md`` §
Agent operability). See ``design/riu-agent-operability-plan.md`` (P4).

Pure ``dict -> dict`` (stdlib only, no pydantic), so the projection + protocol are unit-testable
without the framework; the FastAPI layer supplies the ``sync_fn`` that runs the SyncHandler.
"""

import json

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
        elif t == "Crudl" and ctx["crudl"] is None:
            ctx["crudl"] = md
        elif t == "Button" and md.get("actionId"):
            buttons_by_action.setdefault(md["actionId"], md.get("label"))

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

    if messages:
        screen["messages"] = [
            {"text": m.get("text", m.get("message", "")), "type": m.get("type", "info")} for m in messages
        ]
    notable = [{"type": c.get("type"), "data": c.get("data")} for c in commands if c.get("type") and c.get("type") != "SetWindowTitle"]
    if notable:
        screen["commands"] = notable
    return screen


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
            if isinstance(route, str) and route:
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


def _walk_menu(menu, out):
    if not isinstance(menu, list):
        return
    for item in menu:
        if not isinstance(item, dict):
            continue
        raw = item.get("route", item.get("path"))
        if isinstance(raw, str) and raw:
            r = normalize_route(raw)
            out.setdefault(r, item.get("caption") or item.get("label") or (r or "Home"))
        _walk_menu(item.get("submenus"), out)
        _walk_menu(item.get("menu"), out)


def _obj_schema(props=None, required=None):
    schema = {"type": "object", "properties": props or {}}
    if required:
        schema["required"] = required
    return schema


TOOLS = [
    {
        "name": "mateu_list_routes",
        "description": "List the navigable routes of the Mateu app (from its menu). Returns [{route, caption}].",
        "inputSchema": _obj_schema(),
    },
    {
        "name": "mateu_describe_screen",
        "description": "Load a screen by route and return a flat description: title, fields (id, label, "
        "dataType, required, value, options), actions (id, label), listing (if any), and current state.",
        "inputSchema": _obj_schema({"route": {"type": "string", "description": 'route relative to the mount, "" = home'}}, ["route"]),
    },
    {
        "name": "mateu_run_action",
        "description": "Run an action id (optionally seeding field values via componentState). Returns the resulting screen.",
        "inputSchema": _obj_schema(
            {"route": {"type": "string"}, "actionId": {"type": "string"}, "componentState": {"type": "object"}},
            ["route", "actionId"],
        ),
    },
    {
        "name": "mateu_search",
        "description": "Search a listing screen by free text (and optional filters). Returns the listing.",
        "inputSchema": _obj_schema({"route": {"type": "string"}, "searchText": {"type": "string"}, "filters": {"type": "object"}}, ["route"]),
    },
]


def dispatch_tool(name, args, sync_fn):
    """Run a tool. ``sync_fn(route, action_id, component_state, parameters) -> increment dict``."""
    if name == "mateu_list_routes":
        return list_routes_from(sync_fn("", "", None, None))
    if name == "mateu_describe_screen":
        return project_increment(sync_fn(normalize_route(args.get("route", "")), "", None, None))
    if name == "mateu_run_action":
        return project_increment(
            sync_fn(normalize_route(args.get("route", "")), args.get("actionId", ""), args.get("componentState"), None)
        )
    if name == "mateu_search":
        text = args.get("searchText", "")
        params = {"searchText": text} if text else {}
        return project_increment(sync_fn(normalize_route(args.get("route", "")), "search", args.get("filters"), params))
    raise ValueError(f"Unknown tool: {name}")


def handle_jsonrpc(message, sync_fn):
    """Handle one JSON-RPC 2.0 message. Returns the response dict, or None for a notification."""
    mid = message.get("id")
    is_notification = mid is None
    method = message.get("method", "")
    try:
        if method == "initialize":
            return _ok(mid, {
                "protocolVersion": PROTOCOL_VERSION,
                "capabilities": {"tools": {}},
                "serverInfo": {"name": SERVER_NAME, "version": SERVER_VERSION},
            })
        if method in ("notifications/initialized", "initialized"):
            return None
        if method == "ping":
            return _ok(mid, {})
        if method == "tools/list":
            return _ok(mid, {"tools": TOOLS})
        if method == "tools/call":
            params = message.get("params") or {}
            data = dispatch_tool(params.get("name", ""), params.get("arguments") or {}, sync_fn)
            return _ok(mid, {"content": [{"type": "text", "text": json.dumps(data, indent=2, default=str)}]})
        if is_notification:
            return None
        return _err(mid, -32601, f"Method not found: {method}")
    except Exception as e:  # noqa: BLE001
        if is_notification:
            return None
        if method == "tools/call":
            return _ok(mid, {"content": [{"type": "text", "text": f"Error: {e}"}], "isError": True})
        return _err(mid, -32603, str(e))


def _ok(mid, result):
    if mid is None:
        return None
    return {"jsonrpc": "2.0", "id": mid, "result": result}


def _err(mid, code, message):
    return {"jsonrpc": "2.0", "id": mid, "error": {"code": code, "message": message}}
