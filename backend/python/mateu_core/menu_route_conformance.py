"""Conformance check for menu routes: every route a menu leaf points at must resolve to a known
route.

A leaf is a route or a rule — a route leaf that points nowhere is the failure this catches,
recovering the safety a typed-class menu reference used to give (the class had to exist) now that a
leaf can carry a plain route string.

Pure over the built menu and the known route table so it mirrors 1:1 across the backends and can be
asserted in a test / CI check. Only leaves that actually navigate LOCALLY are checked: a rule leaf
(runs client-side), a separator, a remote leaf (a federated app, not resolvable here), an external
URL and an empty placeholder are all skipped. (Mirrors Java's
``io.mateu.core.application.MenuRouteConformance`` and .NET's ``MenuRouteConformance``.)
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Iterable

if TYPE_CHECKING:
    from mateu_core.route_registry import RouteTable
    from mateu_dtos import MenuItem


def dangling_routes(menu: Iterable["MenuItem"] | None, known_routes: "RouteTable") -> list[str]:
    """The absolute routes of leaves that resolve to no entry in ``known_routes``, in menu order."""
    out: list[str] = []
    _collect(menu, known_routes, out)
    return out


def _collect(menu, known_routes, out: list[str]) -> None:
    if menu is None:
        return
    for option in menu:
        if option is None:
            continue
        submenus = getattr(option, "submenus", None)
        if submenus:
            _collect(submenus, known_routes, out)  # a group, not a leaf — recurse
            continue
        if getattr(option, "separator", False):
            continue
        if getattr(option, "rules", None):
            continue  # a rule leaf: runs client-side, does not navigate
        if getattr(option, "remote", False):
            continue  # a federated app: resolved by the remote, not against this table
        route = getattr(option, "route", None)
        if not route or not route.strip() or _is_external(route):
            continue  # a placeholder, or an external URL — not a Mateu route
        if known_routes.match(route) is None:
            out.append(route)


def _is_external(route: str) -> bool:
    return route.startswith("http:") or route.startswith("https:") or route.startswith("//")
