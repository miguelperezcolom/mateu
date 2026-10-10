"""The security gate of the action pipeline (mirrors Java's action authorization).

An ``actionId`` arrives from the wire, so it must only ever reach a method DECLARED as an action.
:func:`resolve_action` accepts the member whose camelCase name is the action id only when:

- its name does not start with ``_`` (no private, name-mangled or dunder members);
- it is a plain function defined in a class body (``inspect.isfunction``) — never a nested
  class, a ``staticmethod``/``classmethod`` object, a callable class attribute or a builtin;
- it is marked as an action — ``@action``, ``@button`` or ``@fab`` — or its id is ADVERTISED by
  the view: an ``OnRowSelected`` value, a ``@subscribe_to`` action, the view's refresh action,
  any ``*action_id`` of its component tree (fluent archetype tree, ``@auto_page``-inferred tree
  or the YAML layout bound to it), of its ``RuleSupplier`` rules or of its
  ``AppActionsSupplier`` header actions;
- framework base classes (``mateu_uidl``/``mateu_core``/…, ``object``, ``typing``) only
  contribute MARKED methods — the advertised path never reaches them.

Bulk row actions (``action-on-row-*``) only reach ``@list_toolbar_button`` methods
(:func:`resolve_row_action`). Once resolved, :func:`ensure_may_invoke` enforces the access
decorators at invocation (``disabled_unless``, ``audience``); a denied invocation raises
:class:`MateuForbiddenException` (HTTP 403 at the FastAPI edge) and the method never runs. (The
port has no method- or class-level ``EyesOnly``: ``EyesOnly`` is a field marker, enforced on
render and — see :func:`may_write` — on binding.)
"""

from __future__ import annotations

import dataclasses
import inspect
import logging
from typing import Any, Callable

from mateu_uidl import (
    AppActionsSupplier,
    EyesOnly,
    OnRowSelected,
    ReadOnlyUnless,
    RuleSupplier,
)
from mateu_uidl import components as fluent

from .naming import camel_case
from .reflection import view_fields

log = logging.getLogger("mateu.security")

#: Decorator markers that make a method invocable as a view action.
ACTION_MARKERS = ("__mateu_action__", "__mateu_button__", "__mateu_fab__")
ROW_ACTION_MARKER = "__mateu_list_toolbar_button__"

_FRAMEWORK_PACKAGES = {"mateu_uidl", "mateu_core", "mateu_dtos", "mateu_fastapi"}
_PLATFORM_MODULES = {"builtins", "typing", "abc", "collections.abc", "enum"}


class MateuForbiddenException(Exception):
    """A request the caller may not perform: an action gated by ``disabled_unless``/``audience``
    the caller does not satisfy. The FastAPI adapter answers it with HTTP 403
    and a generic body; the reason is only logged server-side."""


def _is_framework_class(klass) -> bool:
    module = getattr(klass, "__module__", "") or ""
    return (
        klass is object
        or module in _PLATFORM_MODULES
        or module.split(".")[0] in _FRAMEWORK_PACKAGES
    )


def _members(type_):
    """``(name, value, declaring class)`` for every member the instance's attribute lookup would
    resolve (the first definition along the MRO wins), skipping ``_``-prefixed names."""
    seen: set[str] = set()
    for klass in type_.__mro__:
        for name, val in vars(klass).items():
            if name in seen:
                continue
            seen.add(name)
            if name.startswith("_"):
                continue
            yield name, val, klass


def _has_marker(fn, markers) -> bool:
    return any(hasattr(fn, m) for m in markers)


def resolve_action(type_, action_id: str | None, advertised: Callable[[], set[str]]):
    """The function ``action_id`` may invoke on a view of ``type_``, or ``None`` when no
    declared action has that id (see the module docstring for the recognition rule)."""
    if not action_id or action_id.startswith("_"):
        return None
    ids: set[str] | None = None
    for name, val, klass in _members(type_):
        if camel_case(name) != action_id or not inspect.isfunction(val):
            continue
        if _has_marker(val, ACTION_MARKERS):
            return val
        if _is_framework_class(klass):
            continue
        if ids is None:
            ids = advertised()
        if action_id in ids:
            return val
    return None


def resolve_row_action(type_, name: str | None):
    """The ``@list_toolbar_button`` function a bulk ``action-on-row-{name}`` may invoke, or None."""
    if not name or name.startswith("_"):
        return None
    for member, val, _klass in _members(type_):
        if camel_case(member) == name and inspect.isfunction(val) and hasattr(val, ROW_ACTION_MARKER):
            return val
    return None


def ensure_may_invoke(mapper, type_, fn, action_id: str) -> None:
    """Enforces the access decorators of a resolved action at invocation: the render path only
    disables/hides the button, the wire can still name the action."""
    from .mapper import for_current_audience

    reason = None
    if not mapper.authorized(getattr(fn, "__mateu_disabled_unless__", None)):
        reason = "disabled_unless"
    elif not for_current_audience(getattr(fn, "__mateu_audience__", None)):
        reason = "audience"
    if reason is not None:
        deny(f"action '{action_id}' on {type_.__module__}.{type_.__qualname__} denied by {reason}")


def deny(what: str) -> None:
    log.warning("Mateu request denied: %s — rejected with 403, the action did not run", what)
    raise MateuForbiddenException(f"Forbidden: {what}")


def may_write(mapper, f) -> bool:
    """Whether the wire may WRITE field ``f``: an ``EyesOnly`` field the caller cannot see or a
    ``ReadOnlyUnless`` field the caller cannot edit is dropped, keeping the server-side value
    (mirrors Java's Hydrater)."""
    return mapper.authorized(f.marker(EyesOnly)) and mapper.authorized(f.marker(ReadOnlyUnless))


def advertised_ids(mapper, type_, instance, layout_override=None) -> set[str]:
    """Every action id the view advertises besides its marked methods — the ids the mapper puts
    on the wire (or the client sends back from the rendered tree) that route to a view method."""
    ids: set[str] = set()
    try:
        fields = view_fields(type_)
    except Exception as e:  # noqa: BLE001 - logged, not fatal
        log.warning("advertised_ids failed, falling back (%s)", e)
        fields = []
    for f in fields:
        on_row = f.marker(OnRowSelected)
        if on_row is not None and on_row.value:
            ids.add(camel_case(on_row.value))
    for _event, act in getattr(type_, "__mateu_subscriptions__", ()) or ():
        if act:
            ids.add(act)
    refresh = getattr(type_, "__mateu_refresh_action__", None)
    if isinstance(refresh, str) and refresh:
        ids.add(refresh)

    seen: set[int] = set()

    def collect(source: Callable[[], Any]) -> None:
        try:
            root = source()
        except Exception as e:  # noqa: BLE001 - logged, not fatal
            log.warning("collect failed, falling back (%s)", e)
            return
        _walk(root, ids, seen, 0)

    collect(lambda: layout_override if layout_override is not None else mapper.component_tree(instance))
    collect(lambda: instance.rules() if isinstance(instance, RuleSupplier) else None)
    collect(lambda: instance.app_actions() if isinstance(instance, AppActionsSupplier) else None)
    return ids


def _is_walkable(node) -> bool:
    if isinstance(node, fluent.Component):
        return True
    module = getattr(type(node), "__module__", "") or ""
    return module.split(".")[0] in _FRAMEWORK_PACKAGES


def _walk(node, ids: set[str], seen: set[int], depth: int) -> None:
    """Collects every string value held under a name ending in ``action_id`` (snake) or
    ``ActionId`` (wire dict keys) anywhere in a fluent tree / mapped component graph."""
    if node is None or depth > 64 or isinstance(node, (str, bytes, int, float, bool)):
        return
    if id(node) in seen:
        return
    seen.add(id(node))
    if isinstance(node, dict):
        for k, v in node.items():
            if isinstance(v, str):
                if isinstance(k, str) and v and (k.endswith("action_id") or k.endswith("ActionId")):
                    ids.add(v)
            else:
                _walk(v, ids, seen, depth + 1)
        return
    if isinstance(node, (list, tuple, set, frozenset)):
        for item in node:
            _walk(item, ids, seen, depth + 1)
        return
    if not _is_walkable(node):
        return
    if dataclasses.is_dataclass(node):
        items = ((f.name, getattr(node, f.name, None)) for f in dataclasses.fields(node))
    elif hasattr(type(node), "model_fields"):
        items = ((name, getattr(node, name, None)) for name in type(node).model_fields)
    else:
        items = list(getattr(node, "__dict__", {}).items())
    for name, value in items:
        if isinstance(value, str):
            if value and name.endswith("action_id"):
                ids.add(value)
        else:
            _walk(value, ids, seen, depth + 1)
