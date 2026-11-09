"""The STATIC-SAFETY report of a bundle: every way a route still needs a server — the Python twin of
Java's ``StaticSafetyCheck`` (``io.mateu.core.application.export``), same rules, same messages
(with the port's decorator names).

A pre-rendered increment is a SNAPSHOT: what a screen does after it is painted has to be declared
on the wire (a ``restAction``, a ``rowsSource``, a rule), because a method body cannot travel to a
CDN. With ``--static`` the exporter fails on a non-empty report, so a bundle declared static either
runs with no backend or does not build.

The rules, each a thing only a server can do:

- a route that could not be bundled at all (it would be backend-served, and there is none);
- ``@eyes_only`` — a screen that depends on WHO asks cannot be one file for everyone; the same for
  the YAML access keys (``access:`` on a route, ``eyesOnly:`` / ``readOnlyUnless:`` /
  ``disabledUnless:`` / ``access:`` in a definition);
- Python action methods (``@button``, ``@toolbar``, ``@list_toolbar_button``, …) without
  ``@rest_action``;
- rows from ``Listing.search`` (a ``Listing`` with no ``@rest_listing``) or from a ``Crud``;
- a source fetched through the server proxy (``proxy: true``), and a DIRECT source that carries
  ``${secret.…}``;
- in a definition, a button with neither a route nor a declared ``restAction`` (or any component
  naming an action), and a shell header action that is neither a route nor a client action.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Callable

from . import BundleManifest, normalized_route

#: Method markers that make a method an action the client dispatches to the server.
ACTION_MARKERS = (
    "__mateu_button__",
    "__mateu_toolbar__",
    "__mateu_list_toolbar_button__",
    "__mateu_view_toolbar_button__",
    "__mateu_fab__",
    "__mateu_group_action__",
    "__mateu_wizard_completion__",
)


@dataclass(frozen=True)
class Violation:
    """One way ``route`` needs a server."""

    route: str
    reason: str

    def __str__(self) -> str:
        return f"/{normalized_route(self.route)} — {self.reason}"


def check(manifest: BundleManifest, classes_by_route: dict[str, type]) -> list[Violation]:
    out: list[Violation] = []
    catalog = manifest.sources or []
    for entry in manifest.entries:
        route = entry.route
        if not entry.ok:
            out.append(
                Violation(route, f"could not be bundled, so it would be served by a backend: {entry.skip_reason}")
            )
        out.extend(check_class(route, classes_by_route.get(normalized_route(route))))
        for text in (entry.json, entry.content_json):
            if text is not None:
                try:
                    out.extend(check_wire(route, json.loads(text), catalog))
                except ValueError as e:
                    out.append(Violation(route, f"its exported JSON could not be read: {e}"))
    from mateu_ui.core import yaml_access

    catalogue_ids = {a.get("id") for a in manifest.actions or [] if isinstance(a, dict) and a.get("id")}
    for authored in manifest.routes or []:
        definition_name = authored.get("definition")
        definition = manifest.definitions.get(definition_name) if definition_name else None
        route = "/" + (authored.get("route") or "")
        access = authored.get("access")
        if isinstance(access, dict) and any(access.get(k) for k in ("roles", "groups", "scopes", "permissions")):
            out.append(
                Violation(route, "declares access: — it depends on who asks, and a static bundle has no identity")
            )
        if yaml_access.declares_access(definition):
            out.append(
                Violation(
                    route,
                    f"its definition '{definition_name}' declares access keys"
                    " (eyesOnly/readOnlyUnless/disabledUnless/access) — they depend on who asks, and a"
                    " static bundle has no identity",
                )
            )
        if definition is None:
            continue
        out.extend(check_definition(route, definition, catalog, catalogue_ids))
        out.extend(check_shell_header_actions(route, definition, catalogue_ids))
        for data in (authored.get("data"), authored.get("appData")):
            if data:
                out.extend(check_source(route, data, catalog, "the route's data"))
    return list(dict.fromkeys(out))


# ── classes ─────────────────────────────────────────────────────────────────────────────────────


def check_class(route: str, cls: type | None) -> list[Violation]:
    out: list[Violation] = []
    if not isinstance(cls, type):
        return out
    simple = cls.__name__
    if cls.__dict__.get("__mateu_eyes_only__") is not None:
        out.append(Violation(route, f"{simple} declares @eyes_only: it depends on who asks"))
    from mateu_ui.uidl.listing import Crud, Listing

    if issubclass(cls, Listing) and getattr(cls, "__mateu_rest_listing__", None) is None:
        out.append(
            Violation(
                route,
                f"{simple} is a Listing with no @rest_listing: its rows come from search(), a Python method",
            )
        )
    if issubclass(cls, Crud):
        out.append(Violation(route, f"{simple} reads and writes through a Crud's Python methods"))
    for name in dir(cls):
        if name.startswith("__"):
            continue
        member = getattr(cls, name, None)
        if not callable(member):
            continue
        if any(getattr(member, m, None) for m in ACTION_MARKERS) and getattr(
            member, "__mateu_rest_action__", None
        ) is None:
            out.append(
                Violation(
                    route,
                    f"{simple}.{name}() is a Python action method (add @rest_action to run it in the browser)",
                )
            )
    return out


# ── wire and definitions ────────────────────────────────────────────────────────────────────────


def _walk(node: Any, visit: Callable[[str | None, dict], bool], key: str | None = None) -> None:
    if isinstance(node, dict):
        if not visit(key, node):
            return
        for k, v in node.items():
            _walk(v, visit, k)
    elif isinstance(node, list):
        for child in node:
            _walk(child, visit, key)


def _looks_like_source(node: Any) -> bool:
    return isinstance(node, dict) and ("url" in node or "ref" in node or "proxy" in node)


def is_client_flow(action: Any) -> bool:
    steps = action.get("steps") if isinstance(action, dict) else None
    if not isinstance(steps, list) or not steps:
        return False
    return not any(isinstance(s, dict) and s.get("type") == "RunAction" for s in steps)


def check_wire(route: str, wire: Any, catalog: list[dict]) -> list[Violation]:
    out: list[Violation] = []

    def visit(key: str | None, node: dict) -> bool:
        if key == "restSources":
            return False
        if _looks_like_source(node):
            out.extend(check_source(route, node, catalog, "a source"))
        out.extend(_check_triggers(route, node))
        return True

    _walk(wire, visit)
    return out


def _check_triggers(route: str, component: dict) -> list[Violation]:
    triggers = component.get("triggers")
    if not isinstance(triggers, list) or not triggers:
        return []
    client = {
        a.get("id")
        for a in component.get("actions") or []
        if isinstance(a, dict) and (a.get("restAction") is not None or is_client_flow(a))
    }
    out = []
    for trigger in triggers:
        if not isinstance(trigger, dict):
            continue
        action_id = trigger.get("actionId") or ""
        if action_id.strip() and action_id not in client:
            out.append(
                Violation(
                    route,
                    f"its {trigger.get('type') or 'trigger'} trigger runs action '{action_id}' on the server",
                )
            )
    return out


def check_definition(route: str, definition: Any, catalog: list[dict], catalogue_actions=()) -> list[Violation]:
    out: list[Violation] = []
    client = set(catalogue_actions)
    for action in (definition.get("actions") if isinstance(definition, dict) else None) or []:
        if isinstance(action, dict) and ("restAction" in action or is_client_flow(action)):
            client.add(action.get("id"))

    def visit(key: str | None, node: dict) -> bool:
        if _looks_like_source(node):
            out.extend(check_source(route, node, catalog, "a source"))
        kind = node.get("type") or ""
        if (
            kind == "Button"
            and node.get("actionId") is not None
            and "actionable" not in node
            and node.get("route") is None
            and node.get("actionId") not in client
        ):
            out.append(
                Violation(
                    route,
                    f"button '{node.get('actionId')}' has neither a route nor a restAction in `actions:`, so it"
                    " would be dispatched to a server",
                )
            )
        if isinstance(kind, str) and kind.strip() and kind != "Button" and key != "triggers":
            for name, value in node.items():
                if (
                    (name == "actionId" or name.endswith("ActionId"))
                    and isinstance(value, str)
                    and value.strip()
                    and value not in client
                ):
                    out.append(
                        Violation(
                            route,
                            f"{kind} runs action '{value}' ({name}) with no restAction in `actions:`, so it"
                            " would be dispatched to a server",
                        )
                    )
        return True

    _walk(definition, visit)
    return out


def check_shell_header_actions(route: str, definition: Any, catalogue_actions=()) -> list[Violation]:
    if not isinstance(definition, dict) or definition.get("type") != "AppShell":
        return []
    shell = set(catalogue_actions)
    for action in definition.get("actions") or []:
        if isinstance(action, dict):
            shell.add(action.get("id"))
    out = []
    pending = list(definition.get("headerActions") or [])
    while pending:
        action = pending.pop()
        if not isinstance(action, dict):
            continue
        pending.extend(action.get("children") or [])
        action_id = action.get("actionId") or ""
        if action_id.strip() and not (action.get("route") or "").strip() and action_id not in shell:
            out.append(
                Violation(
                    route,
                    f"header action '{action_id}' is neither a route nor an action of the shell or the"
                    " action catalogue, so it would be dispatched to a server",
                )
            )
    return out


def check_source(route: str, source: dict, catalog: list[dict], what: str) -> list[Violation]:
    out: list[Violation] = []
    ref = source.get("ref") or ""
    if isinstance(ref, str) and ref.strip():
        entry = next((e for e in catalog if e.get("name") == ref), None)
        if entry is not None and entry.get("source"):
            resolved = entry["source"]
            proxy = bool(resolved.get("proxy")) or bool(source.get("proxy"))
            out.extend(
                _verdict(route, f"source '{ref}'", proxy, resolved.get("url"), resolved.get("headers"), resolved.get("body"))
            )
    url = source.get("url")
    if isinstance(url, str) and url.strip():
        out.extend(
            _verdict(
                route, f"{what} ({url})", bool(source.get("proxy")), url, source.get("headers"), source.get("body") or ""
            )
        )
    elif not (isinstance(ref, str) and ref.strip()) and source.get("proxy"):
        out.append(Violation(route, f"{what} is fetched through the server proxy (proxy: true)"))
    return out


def _verdict(route: str, what: str, proxy: bool, url, headers, body) -> list[Violation]:
    if proxy:
        return [Violation(route, f"{what} is fetched through the server proxy (proxy: true) — there is none")]
    text = f"{url or ''} {headers or ''} {body or ''}"
    if "${secret." in text:
        return [
            Violation(
                route,
                f"{what} is DIRECT but uses ${{secret.…}}: the browser has no secret scope, and a secret"
                " in a static file is not a secret",
            )
        ]
    return []


__all__ = ["Violation", "check", "check_class", "check_definition", "check_wire", "check_source"]
