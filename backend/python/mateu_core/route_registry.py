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
    """

    route: str = ""
    definition: str | None = None
    view_model: str | None = None
    fixed_params: dict[str, Any] = field(default_factory=dict)
    default_params: dict[str, Any] = field(default_factory=dict)

    def path_params(self) -> list[str]:
        return [s[1:] for s in self.route.split("/") if s.startswith(":") and len(s) > 1]

    def resolve_params(self, from_request: dict[str, Any] | None) -> dict[str, Any]:
        """Defaults first, then whatever the request brought, then the fixed ones — which win over
        everything, which is the whole point of declaring them fixed."""
        resolved = dict(self.default_params)
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
        # Both shapes are accepted: a bare list of entries, or a `routes:` envelope.
        nodes = root.get("routes") if isinstance(root, dict) else root
        if not isinstance(nodes, list):
            return RouteTable()
        entries = []
        for node in nodes:
            if not isinstance(node, dict):
                continue
            entries.append(
                RouteEntry(
                    route=_normalize(node.get("route")),
                    definition=node.get("definition"),
                    view_model=node.get("viewModel") or node.get("view_model"),
                    fixed_params=dict(node.get("fixedParams") or node.get("fixed_params") or {}),
                    default_params=dict(
                        node.get("defaultParams") or node.get("default_params") or {}
                    ),
                )
            )
        return RouteTable(tuple(entries))
