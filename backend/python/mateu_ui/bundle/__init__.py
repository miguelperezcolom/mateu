"""Build-time exporter of a Mateu app into a STATIC BUNDLE — the Python twin of Java's
``MateuBundleExporter`` + ``BundleManifest`` (``io.mateu.core.application.export``) and of the
``mateu-bundle:bundle`` Maven goal.

For each declared route it renders the initial load (the same ``actionId=""`` increment the server
returns) through the port's OWN :class:`~mateu_ui.core.SyncHandler`, in process — no HTTP server —
and serializes it to wire JSON in ``manifest.json``. A static host serves the bundle and the
renderer's bundle mode answers route loads from it with no backend.

Two loads per route under an app shell (#557): the FRESH load (a deep link, a reload — consumed
route ``_empty``) answers the SHELL, and the shell then asks for its content slot with its own
consumed route — the route's own screen. Both are exported (``json`` / ``contentJson``).

The manifest is the same document Java writes (same members, same order): the entries, the
AUTHORED route table, the REST source catalogue (shipped once), the action catalogue, the
translations (``${i18n.…}`` stays as written in the entries and is resolved in the browser), the
raw definitions a specs-mode bundle expands in the browser, the environment and the mock flag.

Usage: ``python -m mateu_ui.bundle my_app.views --out dist --ui mateu-vaadin.jar`` (see
:mod:`mateu_ui.bundle.__main__`), or :func:`export_all` + :func:`mateu_ui.bundle.writer.write`.
"""

from __future__ import annotations

import datetime as _dt
import hashlib
import json
import logging
import os
import re
from contextlib import contextmanager
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterator

import yaml

log = logging.getLogger("mateu.bundle")

#: A ``:name`` route segment (the param marker).
PARAM_SEGMENT = re.compile(r":([^/]+)")

#: Placeholder substituted for each param when rendering a template's param-independent structure.
PARAM_PLACEHOLDER = "__mateu_param__"

#: The top-level definition types the browser's expander (``libs/mateu/.../expander``) turns into
#: the wire — Java's ``MateuBundleExporter.CLIENT_EXPANDABLE_TYPES``, a deliberate mirror.
CLIENT_EXPANDABLE_TYPES = frozenset(
    {
        "AppShell",
        "Listing",
        "Crudl",
        "Crud",
        "Form",
        "VerticalLayout",
        "HorizontalLayout",
        "Div",
        "Card",
        "CustomComponent",
    }
)


@dataclass
class BundleEntry:
    """One route's export result (Java's ``BundleEntry``). ``json`` is None when skipped."""

    route: str
    sync_path: str
    json: str | None
    ok: bool
    skip_reason: str | None = None
    route_pattern: str | None = None
    param_names: list[str] | None = None
    content_json: str | None = None

    def to_wire(self) -> dict[str, Any]:
        return {
            "route": self.route,
            "syncPath": self.sync_path,
            "json": self.json,
            "ok": self.ok,
            "skipReason": self.skip_reason,
            "routePattern": self.route_pattern,
            "paramNames": self.param_names,
            "contentJson": self.content_json,
        }


@dataclass
class BundleManifest:
    """The whole bundle (Java's ``BundleManifest``)."""

    base_url: str
    generated_at: str
    static_only: bool
    entries: list[BundleEntry]
    routes: list[dict[str, Any]] = field(default_factory=list)
    sources: list[dict[str, Any]] = field(default_factory=list)
    required_capabilities: list[str] = field(default_factory=list)
    definitions: dict[str, Any] = field(default_factory=dict)
    actions: list[dict[str, Any]] = field(default_factory=list)
    translations: dict[str, dict[str, str]] = field(default_factory=dict)
    environment: str | None = None
    mock_sources: bool | None = None

    def to_wire(self) -> dict[str, Any]:
        """The manifest as Java's Jackson writes it (members in record order)."""
        return {
            "baseUrl": self.base_url,
            "generatedAt": self.generated_at,
            "staticOnly": self.static_only,
            "entries": [e.to_wire() for e in self.entries],
            "routes": {"routes": self.routes},
            "sources": {"sources": self.sources},
            "requiredCapabilities": self.required_capabilities,
            "definitions": self.definitions,
            "actions": self.actions,
            "translations": self.translations,
            "environment": self.environment,
            "mockSources": self.mock_sources,
        }

    def to_json(self) -> str:
        return json.dumps(self.to_wire(), indent=2, ensure_ascii=False)

    def structure_hash(self) -> str:
        """A stable identity for what the bundle CONTAINS (Java's ``structureHash``): the entries'
        wire without the per-environment source catalogue, independent of the build time."""
        parts = []
        for e in sorted(self.entries, key=lambda x: str(x.route)):
            text = f"{e.route}\x00{'true' if e.ok else 'false'}\x00{without_catalogue(e.json)}"
            if e.content_json is not None:
                text += "\x00" + without_catalogue(e.content_json)
            parts.append(text)
        return hashlib.sha256("\x01".join(parts).encode("utf-8")).hexdigest()


def without_catalogue(text: str | None) -> str:
    """Entry JSON without the REST source catalogue an app shell carries (``restSources``)."""
    if text is None:
        return ""
    if '"restSources"' not in text:
        return text
    try:
        tree = json.loads(text)
    except ValueError:
        return text

    def drop(node: Any) -> None:
        if isinstance(node, dict):
            node.pop("restSources", None)
            for v in node.values():
                drop(v)
        elif isinstance(node, list):
            for v in node:
                drop(v)

    drop(tree)
    return json.dumps(tree, separators=(",", ":"), ensure_ascii=False)


def to_sync_path(route: str | None) -> str:
    """The ``/mateu/v3/sync/<seg>`` segment of a route — mirrors the browser: ``"/foo" -> "foo"``,
    blank/root ``-> "_no_route"``."""
    r = route or ""
    r = r[1:] if r.startswith("/") else r
    return r or "_no_route"


def is_static(route: str) -> bool:
    return ":" not in (route or "")


def normalized_route(route: str | None) -> str:
    return (route or "").strip("/")


def is_client_expandable(definition: Any) -> bool:
    if not isinstance(definition, dict):
        return False
    root = definition.get("layout") if "layout" in definition else definition
    return isinstance(root, dict) and root.get("type") in CLIENT_EXPANDABLE_TYPES


class _SkipError(Exception):
    """A load that rendered nothing usable: the route stays backend-served, for this reason."""


@contextmanager
def _env(name: str, value: str | None) -> Iterator[None]:
    previous = os.environ.get(name)
    if value is not None:
        os.environ[name] = value
    try:
        yield
    finally:
        if value is not None:
            if previous is None:
                os.environ.pop(name, None)
            else:
                os.environ[name] = previous


class BundleExporter:
    """Renders an app's routes through ``handler`` (a :class:`~mateu_ui.core.SyncHandler`)."""

    def __init__(self, handler, specs_dir: str | Path | None = None) -> None:
        self.handler = handler
        self.specs_dir = Path(specs_dir or os.environ.get("MATEU_SPECS_DIR") or Path("specs") / "ui")

    # ------------------------------------------------------------------ discovery

    def declared_routes(self) -> list[str]:
        """The routes the registered classes declare (``@ui`` / ``@app(route=…)``), as written."""
        out: list[str] = []
        app_type = self.handler.registry.app_type
        if app_type is not None and not (
            app_type.__dict__.get("__mateu_app_route__") or app_type.__dict__.get("__mateu_ui__")
        ):
            # a route-less @app is the root: it answers "" (Java's @UI(""))
            out.append("")
        for cls in self.handler.registry.registered_types:
            route = cls.__dict__.get("__mateu_app_route__") or cls.__dict__.get("__mateu_ui__")
            if route is None:
                continue
            if route not in out:
                out.append(route)
        return out

    def classes_by_route(self) -> dict[str, type]:
        """Which class answers each route: the registered views, then the authored view models
        (authored wins)."""
        out: dict[str, type] = {}
        if "" in self.declared_routes() and self.handler.registry.app_type is not None:
            out[""] = self.handler.registry.app_type
        for cls in self.handler.registry.registered_types:
            route = cls.__dict__.get("__mateu_app_route__") or cls.__dict__.get("__mateu_ui__")
            if route is not None:
                out.setdefault(normalized_route(route), cls)
        for entry in self.handler.routes.authored().routes:
            if entry.view_model:
                t = self.handler.registry.authored_type(entry.view_model)
                if t is not None:
                    out[normalized_route(entry.route)] = t
        return out

    # ------------------------------------------------------------------ export

    def export_all(
        self,
        base_url: str = "",
        static_only: bool = True,
        include_param_routes: bool = False,
        specs_only: bool = False,
        mock: bool = False,
        environment: str | None = None,
    ) -> BundleManifest:
        """Render every declared route (Java's ``exportAll``): the registered classes' routes and
        every ``routes.yaml`` entry (with or without a view model). ``:param`` routes are skipped
        unless ``include_param_routes`` bundles them as TEMPLATES. ``specs_only`` ships each
        browser-expandable definition-only route RAW instead of pre-rendering it."""
        only_static = static_only and not include_param_routes
        routes: list[str] = []

        def add(route: str) -> None:
            if route is not None and (not only_static or is_static(route)) and route not in routes:
                routes.append(route)

        for r in self.declared_routes():
            add(r)
        authored = self.handler.routes.authored()
        for entry in authored.routes:
            add("/" + entry.route)
        classes = self.classes_by_route()
        definitions = self.collect_definitions(authored)
        self.stamp_mount_homes(authored, definitions)
        expanded_in_browser: set[str] = set()
        if specs_only:
            for entry in authored.routes:
                d = entry.definition
                if (
                    d
                    and not entry.view_model
                    and is_client_expandable(definitions.get(d))
                    and self.yaml_access_restriction("/" + entry.route, authored, definitions) is None
                ):
                    expanded_in_browser.add(normalized_route(entry.route))

        entries: list[BundleEntry] = []
        with _env("MATEU_SOURCES_MOCK", "true" if mock else None):
            for route in routes:
                if normalized_route(route) in expanded_in_browser:
                    log.info("bundle: %s ships as its raw definition (expanded in the browser)", route)
                    continue
                restriction = identity_restriction(classes.get(normalized_route(route)))
                if restriction is None:
                    restriction = self.yaml_access_restriction(route, authored, definitions)
                if restriction is not None:
                    entries.append(BundleEntry(route, to_sync_path(route), None, False, restriction))
                    continue
                entries.append(
                    self.export_route(base_url, route)
                    if is_static(route)
                    else self.export_template(base_url, route)
                )
            sources = self.source_catalogue(with_samples=mock)
        from mateu_ui.core import environments

        return BundleManifest(
            base_url=base_url,
            generated_at=_dt.datetime.now(_dt.timezone.utc).isoformat().replace("+00:00", "Z"),
            static_only=only_static,
            entries=entries,
            routes=[route_entry_wire(e) for e in authored.routes],
            sources=sources,
            required_capabilities=aggregate_capabilities(entries),
            definitions=without_guarded_definitions(definitions, authored),
            actions=self.action_catalogue(),
            translations=self.handler.translations.catalogue(),
            environment=environments.active_name(environment),
            mock_sources=True if mock else None,
        )

    def export(self, base_url: str, routes: list[str]) -> BundleManifest:
        """Render exactly ``routes`` (Java's ``export``, the goal's explicit allow-list)."""
        entries = [self.export_route(base_url, r) for r in routes]
        return BundleManifest(
            base_url=base_url,
            generated_at=_dt.datetime.now(_dt.timezone.utc).isoformat().replace("+00:00", "Z"),
            static_only=True,
            entries=entries,
            required_capabilities=aggregate_capabilities(entries),
        )

    def export_route(self, base_url: str, route: str) -> BundleEntry:
        """A single route's loads; a skip (exception / no fragments) yields ``ok=False``."""
        sync_path = to_sync_path(route)
        try:
            text = self.render(base_url, route, "_empty")
        except _SkipError as skip:
            return BundleEntry(route, sync_path, None, False, str(skip))
        except Exception as e:  # noqa: BLE001 - a route that cannot render stays backend-served
            log.warning("skipping route %s (export failed): %r", route, e)
            return BundleEntry(route, sync_path, None, False, f"{type(e).__name__}: {e}")
        content = None
        consumed = app_shell_consumed_route(text)
        if consumed is not None and normalized_route(route):
            try:
                content = self.render(base_url, route, consumed)
            except Exception as e:  # noqa: BLE001 - the shell still bundles
                log.warning("route %s: its content load could not be exported: %r", route, e)
        return BundleEntry(route, sync_path, text, True, None, None, None, content)

    def export_template(self, base_url: str, template_route: str) -> BundleEntry:
        """A ``:param`` route as a TEMPLATE: rendered once with a placeholder per param; the entry
        carries the regex + param names the browser matches a concrete path with."""
        names = PARAM_SEGMENT.findall(template_route)
        rendered = self.export_route(base_url, PARAM_SEGMENT.sub(PARAM_PLACEHOLDER, template_route))
        sync_path = to_sync_path(template_route)
        pattern = "^" + PARAM_SEGMENT.sub("([^/]+)", sync_path) + "$"
        return BundleEntry(
            template_route, sync_path, rendered.json, rendered.ok, rendered.skip_reason,
            pattern, names, rendered.content_json,
        )

    def render(self, base_url: str, route: str, consumed_route: str) -> str:
        """One ``actionId=""`` load of ``route`` as wire JSON."""
        from mateu_ui.core import RunActionRq
        from mateu_ui.core.translations import raw_expressions

        rq = RunActionRq(route=route, consumed_route=consumed_route, action_id="")
        # ${i18n.…} stays as written: the bundle serves every visitor, the browser resolves it
        with raw_expressions():
            increment = self.handler.handle(rq, base_url)
        if increment is None:
            raise _SkipError("empty increment")
        if not increment.fragments:
            messages = increment.messages or []
            raise _SkipError(messages[0].text if messages and messages[0].text else "no fragments")
        wire = increment.model_dump(by_alias=True, mode="json")
        # A load renders for no initiator: the port aims what it answers at its "ux_main"
        # placeholder, which no browser component carries — the bundle leaves it untargeted (as
        # Java's export does) and the browser re-targets it at whoever asked.
        for key in ("fragments", "commands"):
            for item in wire.get(key) or []:
                if isinstance(item, dict) and item.get("targetComponentId") == "ux_main":
                    item["targetComponentId"] = None
        return json.dumps(wire, separators=(",", ":"), ensure_ascii=False)

    def static_safety(self, manifest: BundleManifest) -> list:
        """Every way the bundled routes still need a server (see :mod:`.static_safety`); empty
        means the bundle runs with no backend at all."""
        from .static_safety import check

        return check(manifest, self.classes_by_route())

    # ------------------------------------------------------------------ catalogues

    def source_catalogue(self, with_samples: bool = False) -> list[dict[str, Any]]:
        """The REST source catalogue as Java's ``RestSourceCatalog`` ships it: the authored
        provenance (not the inferred one), samples only with the mock flag, a proxied source's
        headers/body never (``forTheClient``)."""
        from mateu_ui.core.rest_source_registry import entry_record

        out = []
        for entry in self.handler.rest_sources.catalog():
            record = entry_record(entry, with_samples).model_dump(by_alias=True, mode="json")
            record["provenance"] = getattr(entry.provenance, "value", entry.provenance)
            out.append(record)
        return out

    def action_catalogue(self) -> list[dict[str, Any]]:
        from mateu_ui.core.action_registry import to_dto

        return [
            to_dto(a).model_dump(by_alias=True, mode="json") for a in self.handler.action_catalog.catalog()
        ]

    # ------------------------------------------------------------------ definitions

    def collect_definitions(self, authored) -> dict[str, Any]:
        """The raw definitions of the definition-only routes, partials and business components
        inlined and field types resolved (the browser has none of those catalogues)."""
        from .inliner import DefinitionInliner

        inliner = DefinitionInliner(self.specs_dir)
        out: dict[str, Any] = {}
        for entry in authored.routes:
            d = entry.definition
            if not d or entry.view_model or d in out:
                continue
            path = self.specs_dir / d.lstrip("/")
            if not path.is_file():
                log.warning("bundle: definition %s not found at %s — omitted", d, path)
                continue
            try:
                tree = yaml.safe_load(path.read_text())
            except Exception as e:  # noqa: BLE001
                log.warning("bundle: could not read definition %s: %s", d, e)
                continue
            out[d] = self.handler.field_types.resolve(inliner.inline(tree))
        return out

    def stamp_mount_homes(self, authored, definitions: dict[str, Any]) -> None:
        """A mount's ``home:`` travels INTO its shell: an AppShell bound to the mount root that
        declares no ``homeRoute:`` ships with the mount's home (Java's ``stampMountHomes``)."""
        from mateu_ui.core import yaml_app_shell

        for entry in authored.routes:
            mount, home = yaml_app_shell.mount_of(self.handler.routes, entry.route)
            if not home or normalized_route(entry.route) != mount:
                continue
            node = definitions.get(entry.definition) if entry.definition else None
            if isinstance(node, dict) and node.get("type") == "AppShell" and node.get("homeRoute") is None:
                node["homeRoute"] = home

    def yaml_access_restriction(self, route: str, authored, definitions: dict[str, Any]) -> str | None:
        from mateu_ui.core import yaml_access

        match = authored.match(normalized_route(route))
        if match is None:
            return None
        entry = match.entry
        if entry.restricts_access():
            return "identity-dependent: the route declares access: — kept backend-served"
        definition = definitions.get(entry.definition) if entry.definition else None
        if yaml_access.declares_access(definition):
            return (
                f"identity-dependent: definition '{entry.definition}' declares access keys — kept"
                " backend-served"
            )
        return None


def app_shell_consumed_route(text: str) -> str | None:
    """The consumed route an app shell sends when it loads its content slot, or None when the
    increment is not an app shell."""
    try:
        component = json.loads(text)["fragments"][0]["component"]
    except (ValueError, KeyError, IndexError, TypeError):
        return None
    metadata = component.get("metadata") or {}
    if metadata.get("type") != "App":
        return None
    consumed = metadata.get("homeConsumedRoute")
    return consumed if isinstance(consumed, str) else ""


def identity_restriction(cls: type | None) -> str | None:
    """Why a class's route must NOT be pre-rendered (a screen depending on WHO asks), or None —
    Java's ``identityRestriction``: ``@eyes_only`` on the class, a field or a method."""
    if not isinstance(cls, type):
        return None
    if cls.__dict__.get("__mateu_eyes_only__") is not None:
        return "identity-dependent: the class declares @eyes_only — kept backend-served"
    from mateu_ui.uidl.security import EyesOnly

    for name, hint in getattr(cls, "__annotations__", {}).items():
        if any(isinstance(m, EyesOnly) for m in getattr(hint, "__metadata__", ())):
            return f"identity-dependent: field '{name}' declares @eyes_only — kept backend-served"
    for name, member in cls.__dict__.items():
        if callable(member) and getattr(member, "__mateu_eyes_only__", None) is not None:
            return f"identity-dependent: method '{name}' declares @eyes_only — kept backend-served"
    return None


def without_guarded_definitions(definitions: dict[str, Any], authored) -> dict[str, Any]:
    """No definition that depends on WHO asks: one declaring access keys, or one only
    ``access:``-restricted routes use (Java's ``withoutGuardedDefinitions``)."""
    from mateu_ui.core import yaml_access

    public = {e.definition for e in authored.routes if e.definition and not e.restricts_access()}
    out: dict[str, Any] = {}
    for name, node in definitions.items():
        if yaml_access.declares_access(node):
            log.info("bundle: definition %s declares access keys — not shipped raw", name)
        elif name not in public:
            log.info("bundle: definition %s serves only access-restricted routes — not shipped", name)
        else:
            out[name] = node
    return out


def aggregate_capabilities(entries: list[BundleEntry]) -> list[str]:
    """The union of every entry's ``requiredCapabilities``, walked for the KEY (Java's
    ``aggregateCapabilities``)."""
    caps: set[str] = set()

    def walk(node: Any) -> None:
        if isinstance(node, dict):
            rc = node.get("requiredCapabilities")
            if isinstance(rc, list):
                caps.update(c for c in rc if isinstance(c, str) and c.strip())
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)

    for e in entries:
        if e.ok and e.json:
            try:
                walk(json.loads(e.json))
            except ValueError:
                pass
    return sorted(caps)


def _source_ref_wire(ref) -> dict[str, Any] | None:
    if ref is None:
        return None
    return {
        "ref": ref.ref or "",
        "url": ref.url or "",
        "method": ref.method or "GET",
        "headers": {},
        "body": ref.body or "",
        "itemsPath": ref.items_path or "",
        "valuePath": ref.value_path or "value",
        "labelPath": ref.label_path or "label",
        "proxy": bool(ref.proxy),
        "sample": None,
    }


def _access_wire(access) -> dict[str, Any] | None:
    if access is None:
        return None
    return {
        k: list(getattr(access, k, ()) or ())
        for k in ("roles", "groups", "scopes", "permissions")
    }


def route_entry_wire(entry) -> dict[str, Any]:
    """An authored route as Java's ``RouteEntry`` record serializes (the manifest's ``routes``)."""
    return {
        "route": entry.route,
        "definition": entry.definition,
        "viewModel": entry.view_model,
        "fixedParams": dict(entry.fixed_params),
        "defaultParams": dict(entry.default_params),
        "parent": entry.parent,
        "children": [],
        "state": dict(entry.state),
        "appState": dict(entry.app_state),
        "data": _source_ref_wire(entry.data),
        "appData": _source_ref_wire(entry.app_data),
        "defaultChild": None,
        "show": None,
        "access": _access_wire(entry.access),
    }


__all__ = [
    "BundleEntry",
    "BundleExporter",
    "BundleManifest",
    "CLIENT_EXPANDABLE_TYPES",
    "PARAM_PLACEHOLDER",
    "aggregate_capabilities",
    "app_shell_consumed_route",
    "is_client_expandable",
    "to_sync_path",
    "without_catalogue",
]
