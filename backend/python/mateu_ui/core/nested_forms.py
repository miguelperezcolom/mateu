"""Nested data objects in a form — the Python port of Java's nested forms (``@Inline`` /
``NestedFormFieldBuilder``, ``FormViewSerializer``, ``ReflectionInstanceFactory.unflatten``,
``RunMethodActionRunner``'s ``nested-form-action-`` scheme).

A field whose type is a plain data class (not a basic value, an enum, a collection, a component,
a routed view or one of Mateu's own types) is a NESTED FORM:

* its fields render with the prefix ``<field>-`` (``supplier-name``), recursively;
* ``Inline()`` on the field expands them straight into the section (a full-row CustomField
  holding a form layout); without it they render as a sub-form — an outlined Card holding a
  level+1 Page titled after the field;
* the nested class's ``@toolbar`` / ``@button`` / ``@action`` methods dispatch as
  ``nested-form-action-<field>-<method>`` and run ON the nested object;
* the state carries the object as a nested map AND flattened under the prefixed ids (what the
  fields bind to); a request is read back from both, the flattened keys winning.

``Inline()`` on a field holding a ROUTED view keeps meaning an embedded island
(:mod:`mateu_ui.core.islands`) — the field's type decides.
"""

from __future__ import annotations

import re
from contextvars import ContextVar
from datetime import date, datetime, time
from decimal import Decimal
from enum import Enum
from typing import Any, get_origin

#: The action-id prefix of a nested form's methods (Java's RunMethodActionRunner).
NESTED_ACTION_PREFIX = "nested-form-action-"

_BASIC = (str, int, float, bool, bytes, Decimal, date, datetime, time, complex)

#: The field-id prefix of the nested form being mapped (``""`` at the top level).
_prefix: ContextVar[str] = ContextVar("mateu_nested_prefix", default="")
#: The page level of the nested form being mapped (0 at the top level).
_level: ContextVar[int] = ContextVar("mateu_nested_level", default=0)
#: The nested classes being mapped, outermost first: a class nested in itself is not expanded
#: again (a self-referencing type would otherwise recurse forever).
_owners: ContextVar[tuple] = ContextVar("mateu_nested_owners", default=())


def field_prefix() -> str:
    """The prefix the fields being mapped carry (``"supplier-"`` inside an inline supplier)."""
    return _prefix.get()


def nesting_level() -> int:
    return _level.get()


def is_being_mapped(cls) -> bool:
    """Whether ``cls`` is one of the nested classes whose form is being mapped right now."""
    return cls in _owners.get()


class nested:
    """Context manager: map the fields of ``owner`` under ``prefix`` at page ``level``."""

    def __init__(self, prefix: str, level: int | None = None, owner: type | None = None):
        self._p, self._l, self._o = prefix, level, owner
        self._tokens: tuple = ()

    def __enter__(self):
        tp = _prefix.set(self._p)
        tl = _level.set(self._l if self._l is not None else _level.get())
        to = _owners.set(_owners.get() + ((self._o,) if self._o is not None else ()))
        self._tokens = (tp, tl, to)
        return self

    def __exit__(self, *exc):
        tp, tl, to = self._tokens
        _owners.reset(to)
        _level.reset(tl)
        _prefix.reset(tp)
        return False


def is_nested_form_type(t: Any) -> bool:
    """Whether a field type is a plain data class rendered as a nested form."""
    if not isinstance(t, type) or get_origin(t) is not None:
        return False
    if issubclass(t, _BASIC) or issubclass(t, Enum):
        return False
    if issubclass(t, (list, tuple, set, frozenset, dict)):
        return False
    module = getattr(t, "__module__", "") or ""
    if module == "builtins" or module.startswith(("mateu_ui", "typing", "collections")):
        return False
    if getattr(t, "__mateu_ui__", None) is not None:
        return False  # a routed view: an embedded island, never a nested form
    from .subresources import is_orchestrator

    if is_orchestrator(t):
        return False  # a listing / crud: an embedded island (or a Subresource), never a nested form
    from mateu_ui.uidl import ComponentTreeSupplier

    if issubclass(t, ComponentTreeSupplier):
        return False
    from .reflection import view_fields

    try:
        return bool(view_fields(t))
    except Exception:  # noqa: BLE001 - a class whose hints do not resolve is no form
        return False


def is_nested_form_field(f) -> bool:
    # a _private attribute is the view's own plumbing (a service, a client), never a form: drawn
    # as one it sent the object's values and took the client's (GA review 2, Y6)
    return not f.name.startswith("_") and is_nested_form_type(f.type)


def nested_value(instance, f, create: bool = True):
    """The nested object a field holds — a new instance (field initializers kept) when empty."""
    value = getattr(instance, f.name, None)
    if value is None and create:
        try:
            value = f.type()
        except Exception:  # noqa: BLE001 - a class that cannot be built without args
            return None
        try:
            setattr(instance, f.name, value)
        except Exception:  # noqa: BLE001 - a read-only attribute keeps the fresh value unset
            pass
    return value


def flatten_state(state: dict) -> dict:
    """The fragment state of a form: every nested map (a nested form's values) is kept, nulls
    dropped, AND repeated under ``<field>-<key>`` — recursively (Java's FormViewSerializer)."""
    out: dict = {}
    for key, value in state.items():
        if isinstance(value, dict) and all(isinstance(k, str) for k in value):
            cleaned = {k: v for k, v in flatten_state(value).items() if v is not None}
            out[key] = cleaned
            for k, v in cleaned.items():
                out[f"{key}-{k}"] = v
        else:
            out[key] = value
    return out


def nested_state_of(state: dict, key: str) -> dict | None:
    """The incoming state of the nested form under ``key``: its nested map overlaid with the
    flattened ``<key>-*`` entries (the ones the inline fields edit win); None when absent."""
    base = state.get(key)
    merged: dict = dict(base) if isinstance(base, dict) else {}
    prefix = key + "-"
    found = isinstance(base, dict)
    for k, v in state.items():
        if isinstance(k, str) and k.startswith(prefix) and len(k) > len(prefix):
            merged[k[len(prefix):]] = v
            found = True
    return merged if found else None


_IDENTIFIER = re.compile(r"[A-Za-z_$][A-Za-z0-9_$]*")


def state_expression(key: str) -> str:
    """The ``${…}`` reading a state key: bracket access for a prefixed key (``address-street``
    would evaluate as a subtraction — Java's ReflectionFormFieldMapper.stateExpression)."""
    if _IDENTIFIER.fullmatch(key):
        return "${state." + key + "}"
    return "${state['" + key.replace("\\", "\\\\").replace("'", "\\'") + "']}"


def split_action(action_id: str) -> tuple[str, str] | None:
    """``nested-form-action-<field>-<method>`` → ``(field, method)``; None when malformed."""
    rest = action_id[len(NESTED_ACTION_PREFIX):]
    dash = rest.find("-")
    if dash <= 0 or rest.endswith("-"):
        return None
    return rest[:dash], rest[dash + 1:]


__all__ = [
    "NESTED_ACTION_PREFIX",
    "field_prefix",
    "flatten_state",
    "is_nested_form_field",
    "is_nested_form_type",
    "nested",
    "nested_state_of",
    "nested_value",
    "nesting_level",
    "split_action",
    "state_expression",
]
