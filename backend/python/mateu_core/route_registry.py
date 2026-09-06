"""A mount's route registry — the Python mirror of Java's RouteEntry/RouteTable/RouteRegistry.

A *mount* is a UI application served at a base path (what ``@ui`` declares, whose decorated class is
the mount's root view). Everything inside it can be resolved through this registry, declared in a
``routes.yaml`` sitting next to the definitions it routes to.

Why a registry and not just decorators: a decorator says "this class lives at this path", the
one-to-one case. An entry binds a *definition*, a *view model* and *parameters* independently, so the
same screen can answer several routes with different parameters pinned, and a route can exist with no
server class behind it at all — which is what a statically deployed screen is.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml


def _normalize(route: str | None) -> str:
    """Routes are relative to the mount, so a leading or trailing slash carries no meaning."""
    r = (route or "").strip("/")
    return "" if r in ("_empty", "_no_route", "_no_home_route") else r


def _prefix(base_path: str, route: str) -> str:
    """Prefix a relative route with the mount base path: ``(shop, orders) → shop/orders``."""
    if not base_path:
        return route
    return base_path if not route else base_path + "/" + route


def _params_of(node: dict, *keys: str) -> dict[str, Any]:
    """A literal params/state map under any of the accepted keys (camelCase or snake_case)."""
    for key in keys:
        value = node.get(key)
        if isinstance(value, dict):
            return dict(value)
    return {}


def _data_source_of(node: dict, *keys: str) -> "RestSourceRef | None":
    """Parse a ``data``/``appData`` node into a :class:`RestSourceRef`. A bare string is the
    ``data: countries`` shorthand (a reference by name); an object may carry inline endpoint
    fields — mirrors Java's RouteRegistry.dataSourceOf."""
    for key in keys:
        if key not in node or node.get(key) is None:
            continue
        n = node[key]
        if isinstance(n, str):
            return RestSourceRef(ref=n)
        if isinstance(n, dict):
            return RestSourceRef(
                ref=n.get("ref"),
                url=n.get("url"),
                method=n.get("method"),
                body=n.get("body"),
                items_path=n.get("itemsPath") or n.get("items_path"),
                value_path=n.get("valuePath") or n.get("value_path"),
                label_path=n.get("labelPath") or n.get("label_path"),
                proxy=bool(n.get("proxy", False)),
            )
    return None


def _flatten_node(
    node: dict, parent_route: str | None, prefix: str, out: list["RouteEntry"]
) -> None:
    """Flatten one authored node and its nested ``children`` into flat entries. A child's route is
    composed RELATIVE to its parent (``orders`` under ``use-cases/rra`` → ``use-cases/rra/orders``)
    and carries the parent's route as :attr:`RouteEntry.parent`, so the sub-route renders into the
    parent screen's slot instead of replacing the page. Routes are still relative to the mount here;
    the base path is applied afterwards (mirrors Java's RouteRegistry.flattenNode)."""
    relative = _normalize(node.get("route"))
    full = relative if not prefix else (prefix if not relative else prefix + "/" + relative)
    out.append(
        RouteEntry(
            route=full,
            definition=node.get("definition"),
            view_model=node.get("viewModel") or node.get("view_model"),
            fixed_params=_params_of(node, "fixedParams", "fixed_params"),
            default_params=_params_of(node, "defaultParams", "default_params"),
            parent=parent_route,
            state=_params_of(node, "state"),
            app_state=_params_of(node, "appState", "app_state"),
            data=_data_source_of(node, "data"),
            app_data=_data_source_of(node, "appData", "app_data"),
        )
    )
    children = node.get("children")
    if isinstance(children, list):
        for child in children:
            if isinstance(child, dict):
                _flatten_node(child, parent_route=full, prefix=full, out=out)


def _with_base_path(entry: "RouteEntry", base_path: str) -> "RouteEntry":
    """Return the entry with its (and its parent's) route prefixed by the file's base path."""
    if not base_path:
        return entry
    from dataclasses import replace

    return replace(
        entry,
        route=_prefix(base_path, entry.route),
        parent=_prefix(base_path, entry.parent) if entry.has_parent() else entry.parent,
    )


@dataclass(frozen=True)
class RestSourceRef:
    """A route's ``data``/``appData`` source — a reference to a named entry of ``sources.yaml`` (the
    ``data: countries`` shorthand), or an inline endpoint. The Python mirror of Java's
    ``RestDataSource`` in this file (kept tiny: the registry only needs to carry the ref through)."""

    ref: str | None = None
    url: str | None = None
    method: str | None = None
    body: str | None = None
    items_path: str | None = None
    value_path: str | None = None
    label_path: str | None = None
    proxy: bool = False


@dataclass(frozen=True)
class RouteEntry:
    """What a URL resolves to.

    :param route: path relative to the mount, with ``:name`` segments for path parameters. ``""`` is
        the mount's root view.
    :param definition: the layout file. ``None`` when the view model supplies its own tree.
    :param view_model: the server class. **Optional on purpose**: a statically deployed route has no
        server behind it, so a definition with no view model is a valid, complete route.
    :param fixed_params: pinned — **not overridable by the request**. Re-applied on the server rather
        than trusted from the client, or "fixed" would be a suggestion and flipping one via the query
        string would be a capability escalation.
    :param default_params: seeded — the request may override them.
    :param parent: the ABSOLUTE route of the screen whose slot this route fills, or ``None`` for a
        top-level route. Set when the authored ``children`` tree is flattened.
    :param state: literal values seeding the route's component/route state on entry (at the defaults
        precedence level, so a pinned parameter still wins).
    :param app_state: literal values seeding the app-scope state on entry (merged UNDER the client's).
    :param data: the route's component/route data, a reference to a named source in ``sources.yaml``
        (there is no literal data channel; data is always sourced). Fetched when the route loads.
    :param app_data: the route's app-scope data, a reference to a named source resolved once at app
        scope (shared across routes).
    """

    route: str = ""
    definition: str | None = None
    view_model: str | None = None
    fixed_params: dict[str, Any] = field(default_factory=dict)
    default_params: dict[str, Any] = field(default_factory=dict)
    parent: str | None = None
    state: dict[str, Any] = field(default_factory=dict)
    app_state: dict[str, Any] = field(default_factory=dict)
    data: RestSourceRef | None = None
    app_data: RestSourceRef | None = None

    def has_parent(self) -> bool:
        """Whether this route fills the slot of a parent screen rather than replacing the page."""
        return bool(self.parent and self.parent.strip())

    def path_params(self) -> list[str]:
        return [s[1:] for s in self.route.split("/") if s.startswith(":") and len(s) > 1]

    def resolve_params(self, from_request: dict[str, Any] | None) -> dict[str, Any]:
        """Defaults first, then ``state`` at the same defaults level, then whatever the request
        brought, then the fixed ones — which win over everything, which is the whole point of
        declaring them fixed."""
        resolved = dict(self.default_params)
        for k, v in self.state.items():
            resolved.setdefault(k, v)
        resolved.update(from_request or {})
        resolved.update(self.fixed_params)
        return resolved


@dataclass(frozen=True)
class Match:
    entry: RouteEntry
    path_params: dict[str, Any]

    def params(self, incoming: dict[str, Any] | None) -> dict[str, Any]:
        from_request = dict(incoming or {})
        from_request.update(self.path_params)
        return self.entry.resolve_params(from_request)


@dataclass(frozen=True)
class RouteTable:
    routes: tuple[RouteEntry, ...] = ()

    @staticmethod
    def of(entries) -> "RouteTable":
        return RouteTable(tuple(entries or ()))

    def merged_over(self, derived: "RouteTable") -> "RouteTable":
        """Authored entries replace derived ones outright rather than being combined field by field:
        a half-overridden route would be far harder to reason about than a replaced one."""
        by_route: dict[str, RouteEntry] = {e.route: e for e in derived.routes}
        for entry in self.routes:
            by_route[entry.route] = entry
        return RouteTable(tuple(by_route.values()))

    def match(self, path: str | None) -> Match | None:
        """Static routes are tried before parameterised ones, so ``orders/new`` is never swallowed by
        ``orders/:id``; among parameterised matches the most specific wins, so matching does not
        depend on declaration order."""
        target = _normalize(path)
        target_segments = target.split("/") if target else []
        best: Match | None = None
        for entry in self.routes:
            pattern = _normalize(entry.route)
            pattern_segments = pattern.split("/") if pattern else []
            if len(pattern_segments) != len(target_segments):
                continue
            path_params: dict[str, Any] = {}
            matched = True
            for pattern_segment, target_segment in zip(pattern_segments, target_segments):
                if pattern_segment.startswith(":") and len(pattern_segment) > 1:
                    path_params[pattern_segment[1:]] = target_segment
                elif pattern_segment != target_segment:
                    matched = False
                    break
            if not matched:
                continue
            if best is None or len(entry.path_params()) < len(best.entry.path_params()):
                best = Match(entry, path_params)
        return best


@dataclass(frozen=True)
class AppRef:
    """An app a deployment contributes: a mount root, with the class that backs it (``None`` for a
    purely-DSL app) and the definition it renders (``None`` for a class-based app). The Python mirror
    of Java's ``RouteRegistry.AppRef`` and .NET's ``RouteRegistry.AppRef``."""

    route: str
    class_name: str | None = None
    definition: str | None = None

    def is_dsl(self) -> bool:
        """No server class backs it — it is announced purely from its ``type: UI`` mount."""
        return not (self.class_name and self.class_name.strip())


class RouteRegistry:
    """Reads ``routes.yaml`` from the specs directory, next to the definitions it routes to."""

    FILE = "routes.yaml"

    def __init__(self, directory: str | None = None) -> None:
        self._dir = Path(directory or os.environ.get("MATEU_SPECS_DIR") or Path("specs") / "ui")
        self._authored: RouteTable | None = None

    def authored(self) -> RouteTable:
        if self._authored is None:
            self._authored = self._load()
        return self._authored

    def match(self, path: str | None) -> Match | None:
        return self.authored().match(path)

    def apps(self, derived: "list[AppRef] | None" = None) -> list[AppRef]:
        """Every app of the deployment, from TWO producers merged into ONE table — the same
        "authored wins" rule the routes and sources use:

        * **derived**: the reflection-discovered ``@ui`` classes (each an app at its path), supplied
          by the caller (there is no compile-time index here as in Java);
        * **authored**: the ``type: UI`` mounts discovered in the specs directory — which need NO
          class, so a deployment can ship a purely-DSL app and announce it here like any other.

        A mount at the same base path as a class replaces it (authored wins). This is the enumeration
        a federated shell (or a bundle/tool) reads to announce apps uniformly, with or without a
        class behind them.
        """
        by_route: dict[str, AppRef] = {}
        for ref in derived or []:
            route = _normalize(ref.route)
            by_route[route] = AppRef(route, ref.class_name, ref.definition)
        for base_path, route_files in self._scan_mounts():
            by_route[base_path] = AppRef(
                base_path, None, self._definition_of(base_path, route_files)
            )
        return list(by_route.values())

    def _scan_mounts(self) -> list[tuple[str, list[str]]]:
        """Scan the specs directory for ``type: UI`` files (by content, not by filename), so several
        DSL apps can coexist. Returns each mount's base path + its listed route files. (Mirrors
        Java's MountRegistry.mounts.)"""
        mounts: list[tuple[str, list[str]]] = []
        if not self._dir.is_dir():
            return mounts
        for file in sorted(self._dir.rglob("*")):
            if file.suffix not in (".yaml", ".yml"):
                continue
            try:
                root = yaml.safe_load(file.read_text())
            except Exception:
                continue  # a broken descriptor must not take app enumeration down
            if not isinstance(root, dict) or root.get("type") != "UI":
                continue
            base_path = _normalize(root.get("basePath") or root.get("base_path"))
            routes = root.get("routes")
            if isinstance(routes, str):
                route_files = [routes]
            elif isinstance(routes, list):
                route_files = [r for r in routes if isinstance(r, str)]
            else:
                route_files = []
            mounts.append((base_path, route_files))
        return mounts

    def _definition_of(self, base_path: str, route_files: list[str]) -> str | None:
        """The definition bound to a DSL mount's ROOT route: load its route files (relative entries
        prefixed with the base path), match the base path, read the definition. That root entry is
        where a DSL app's shell lives — a route with a definition and no class."""
        for route_file in route_files:
            path = self._dir / route_file
            if not path.is_file():
                continue
            try:
                root = yaml.safe_load(path.read_text())
            except Exception:
                continue
            nodes = root.get("routes") if isinstance(root, dict) else root
            if not isinstance(nodes, list):
                continue
            relative: list[RouteEntry] = []
            for node in nodes:
                if isinstance(node, dict):
                    _flatten_node(node, parent_route=None, prefix="", out=relative)
            entries = [_with_base_path(e, base_path) for e in relative]
            match = RouteTable(tuple(entries)).match(base_path)
            if match is not None and match.entry.definition:
                return match.entry.definition
        return None

    def _load(self) -> RouteTable:
        path = self._dir / self.FILE
        if not path.is_file():
            return RouteTable()
        try:
            root = yaml.safe_load(path.read_text())
        except Exception:
            # A broken routes.yaml must not take the app down: the decorator-declared routes still
            # work, and the failure is loud in the log rather than fatal at boot.
            return RouteTable()
        if root is None:
            return RouteTable()
        # Both shapes are accepted: a bare list of entries, or a `routes:` envelope. A standalone
        # `type: Routes` envelope may tag itself with a `basePath` so a class-declared @ui("/shop")
        # mount authors its inner routes relatively and they resolve absolutely (last-wins on a
        # route collision is not needed for a single file — one file is one bucket).
        base_path = ""
        nodes = root
        if isinstance(root, dict):
            base_path = _normalize(root.get("basePath") or root.get("base_path"))
            nodes = root.get("routes")
        if not isinstance(nodes, list):
            return RouteTable()
        # Flatten each authored node (composing nested `children` relative to their parent and
        # setting `parent`), then prefix everything with the file's base path into absolute routes.
        relative: list[RouteEntry] = []
        for node in nodes:
            if isinstance(node, dict):
                _flatten_node(node, parent_route=None, prefix="", out=relative)
        entries = [_with_base_path(e, base_path) for e in relative]
        return RouteTable(tuple(entries))
