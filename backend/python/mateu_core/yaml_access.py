"""The access keys of a YAML definition, applied for ONE request — the Python mirror of Java's
``io.mateu.core.application.security.YamlAccess``.

The keys are an overlay every component accepts (like ``note:``): this pass reads them off the
parsed tree BEFORE it is built into components, rewrites the tree for the caller's identity and
strips them. What reaches the wire is what the caller may see — decided on the server, never
shipped for the browser to honour:

- ``eyesOnly:`` (or ``access:``) on a component — removed;
- ``readOnlyUnless:`` — ``readOnly: true`` on it and on every FormField under it;
- ``disabledUnless:`` — ``disabled: true`` (a FormField, which has no disabled state, becomes
  read-only);
- ``access:`` on an ``actions:`` entry — removed, its id reported in ``refused_actions`` (the server
  refuses it if called anyway) and every Button naming it disabled;
- ``access:`` on a menu item — removed; a ``RouteLink`` with none of its own inherits its route's
  (via ``route_reachable``), and a ``Menu`` group left empty goes too.

Fields that end up hidden or read-only are reported in ``locked_fields``: their client-sent values
are dropped (as ``action_guard.may_write`` does for the markers).

The matching is NOT re-implemented here: ``authorized`` is the mapper's ``authorized`` — the one
rule behind ``EyesOnly``/``ReadOnlyUnless``/``DisabledUnless``.
"""

from __future__ import annotations

import copy
from dataclasses import dataclass, field
from typing import Any, Callable

from mateu_uidl import Access

ACCESS = "access"
EYES_ONLY = "eyesOnly"
READ_ONLY_UNLESS = "readOnlyUnless"
DISABLED_UNLESS = "disabledUnless"
KEYS = (ACCESS, EYES_ONLY, READ_ONLY_UNLESS, DISABLED_UNLESS)


@dataclass(frozen=True)
class Applied:
    tree: Any
    refused_actions: frozenset[str] = field(default_factory=frozenset)
    locked_fields: frozenset[str] = field(default_factory=frozenset)


def _strings(node: Any) -> tuple[str, ...]:
    if node is None:
        return ()
    if isinstance(node, (list, tuple)):
        return tuple(str(n) for n in node if n is not None)
    return tuple(p.strip() for p in str(node).split(",") if p.strip())


def access_of(node: Any) -> Access | None:
    """An ``access:``-shaped node as a restriction, or None when absent/empty. A string or a list
    is the roles shorthand."""
    if node is None:
        return None
    if isinstance(node, (str, list, tuple)):
        access = Access(roles=_strings(node))
    elif isinstance(node, dict):
        access = Access(
            roles=_strings(node.get("roles")),
            groups=_strings(node.get("groups")),
            scopes=_strings(node.get("scopes")),
            permissions=_strings(node.get("permissions")),
        )
    else:
        return None
    return access if access.restricts() else None


def declares_access(node: Any) -> bool:
    """Whether the tree declares any access key anywhere (a tree that does not can be cached)."""
    if isinstance(node, dict):
        if any(k in node for k in KEYS):
            return True
        return any(declares_access(v) for v in node.values())
    if isinstance(node, list):
        return any(declares_access(v) for v in node)
    return False


def apply(
    root: Any,
    authorized: Callable[[Any], bool],
    route_reachable: Callable[[str], bool] | None = None,
    also_refused: set[str] | frozenset[str] | None = None,
) -> Applied:
    """Applies the access keys of ``root`` for the caller ``authorized`` answers for, on a COPY.

    ``also_refused``: ids of actions refused elsewhere — the action CATALOGUE's restricted entries
    the tree names — enforced like the tree's own: buttons naming them disabled, and reported in
    ``refused_actions`` so a call that reaches the server is refused (Java's
    ``YamlAccess.apply(..., alsoRefused)``)."""
    if root is None:
        return Applied(None)
    tree = copy.deepcopy(root)
    walker = _Walker(authorized, route_reachable)
    walker.refused.update(also_refused or ())
    if walker.removes(tree, None):
        return Applied(None, frozenset(walker.refused), frozenset(walker.locked))
    walker.walk(tree, None, False)
    if walker.refused:
        _disable_buttons_for(tree, walker.refused)
    return Applied(tree, frozenset(walker.refused), frozenset(walker.locked))


class _Walker:
    def __init__(self, authorized, route_reachable):
        self.authorized = authorized
        self.route_reachable = route_reachable
        self.refused: set[str] = set()
        self.locked: set[str] = set()

    def granted(self, access: Access | None) -> bool:
        return access is None or bool(self.authorized(access))

    def removes(self, node: Any, container_key: str | None) -> bool:
        if not isinstance(node, dict):
            return False
        access = access_of(node.get(ACCESS))
        link_refused = (
            access is None
            and self.route_reachable is not None
            and node.get("type") == "RouteLink"
            and node.get("route") is not None
            and not self.route_reachable(str(node.get("route")))
        )
        eyes_only = access_of(node.get(EYES_ONLY))
        if not link_refused and self.granted(access) and self.granted(eyes_only):
            return False
        if container_key == "actions" and node.get("id") is not None:
            self.refused.add(str(node["id"]))
        self._lock_fields_under(node)
        return True

    def walk(self, node: Any, container_key: str | None, read_only: bool) -> None:
        if isinstance(node, dict):
            is_field = node.get("type") == "FormField"
            if not self.granted(access_of(node.get(READ_ONLY_UNLESS))):
                read_only = True
            if not self.granted(access_of(node.get(DISABLED_UNLESS))):
                if is_field:
                    node["readOnly"] = True
                    self._lock(node)
                else:
                    node["disabled"] = True
            if read_only and is_field:
                node["readOnly"] = True
                self._lock(node)
            elif read_only and "readOnly" in node:
                node["readOnly"] = True
            for key in KEYS:
                node.pop(key, None)
            for name in list(node.keys()):
                child = node[name]
                if isinstance(child, dict) and self.removes(child, name):
                    del node[name]
                elif isinstance(child, (dict, list)):
                    was_non_empty = isinstance(child, list) and bool(child)
                    self.walk(child, name, read_only)
                    # A menu group whose every entry was taken away is no group at all.
                    if (
                        was_non_empty
                        and not child
                        and name == "submenu"
                        and node.get("type") == "Menu"
                    ):
                        node["__emptied"] = True
        elif isinstance(node, list):
            kept = []
            for child in node:
                if self.removes(child, container_key):
                    continue
                self.walk(child, container_key, read_only)
                if isinstance(child, dict) and child.get("__emptied"):
                    continue
                kept.append(child)
            node[:] = kept

    def _lock(self, f: dict) -> None:
        if f.get("id") is not None:
            self.locked.add(str(f["id"]))

    def _lock_fields_under(self, node: Any) -> None:
        if isinstance(node, dict):
            if node.get("type") == "FormField":
                self._lock(node)
            for v in node.values():
                self._lock_fields_under(v)
        elif isinstance(node, list):
            for v in node:
                self._lock_fields_under(v)


def _disable_buttons_for(node: Any, refused: set[str]) -> None:
    """Disables every Button that names an action the caller may not run."""
    if isinstance(node, dict):
        if node.get("type") == "Button" and str(node.get("actionId")) in refused:
            node["disabled"] = True
        for v in node.values():
            _disable_buttons_for(v, refused)
    elif isinstance(node, list):
        for v in node:
            _disable_buttons_for(v, refused)


__all__ = ["Applied", "access_of", "apply", "declares_access", "KEYS"]
