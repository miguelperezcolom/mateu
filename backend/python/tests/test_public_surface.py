"""The 3.x API freeze, Python side (reference/stability-and-versioning.md): the authoring API of
``mateu_ui.uidl`` and ``mateu_ui.uidl.components`` is pinned by NAME (``tests/api/public-exports.json``,
see ``test_api_freeze.py``) and by SIGNATURE (``tests/api/public-signatures.json``, here): the
parameters of every exported decorator, function and class constructor, the public methods of the
exported classes and the members of the exported enums.

A change a caller would notice — a removed name, method, parameter or enum member, a parameter
renamed, reordered, made keyword-only or losing its default, a new REQUIRED parameter — fails as a
break of the frozen API: within 3.x add the new spelling and keep the old one working with a
``DeprecationWarning`` naming the replacement. A compatible change (a new optional parameter, a new
method) still fails until re-pinned, so every change to the surface is reviewed: rerun with
``MATEU_API_WRITE=true`` and commit the rewritten file.

Only names, parameter kinds and whether a default exists are pinned — not annotations or default
values — so the pin is the same on every supported Python (3.11+)."""

from __future__ import annotations

import enum
import importlib
import inspect
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

PINNED_MODULES = ("mateu_ui.uidl", "mateu_ui.uidl.components")
PIN = Path(__file__).parent / "api" / "public-signatures.json"
VARIADIC = (inspect.Parameter.VAR_POSITIONAL, inspect.Parameter.VAR_KEYWORD)


def _params(fn) -> list | None:
    try:
        sig = inspect.signature(fn)
    except (TypeError, ValueError):
        return None
    return [[p.name, p.kind.name, p.default is not inspect.Parameter.empty]
            for p in sig.parameters.values() if p.name not in ("self", "cls")]


def _own_mateu_members(cls):
    """Public callables of ``cls`` and of its Mateu bases (not pydantic's/object's)."""
    seen = {}
    for base in reversed(cls.__mro__):
        if not getattr(base, "__module__", "").startswith("mateu_ui"):
            continue
        for name, raw in vars(base).items():
            if name.startswith("_"):
                continue
            if isinstance(raw, (staticmethod, classmethod)):
                seen[name] = raw.__func__
            elif isinstance(raw, property):
                seen[name] = "property"
            elif inspect.isfunction(raw):
                seen[name] = raw
    return seen


def surface() -> dict:
    out: dict = {}
    for module_name in PINNED_MODULES:
        module = importlib.import_module(module_name)
        entries: dict = {}
        for name in sorted(module.__all__):
            value = getattr(module, name)
            if inspect.isclass(value) and issubclass(value, enum.Enum):
                entries[name] = {"enum": sorted(value.__members__)}
            elif inspect.isclass(value):
                entry: dict = {"class": _params(value)}
                for member, fn in sorted(_own_mateu_members(value).items()):
                    entry.setdefault("members", {})[member] = (
                        "property" if fn == "property" else _params(fn))
                entries[name] = entry
            elif callable(value):
                entries[name] = {"function": _params(value)}
            else:
                entries[name] = {"value": type(value).__name__}
        out[module_name] = entries
    return out


def _call_breaks(where: str, old: list | None, new: list | None) -> list[str]:
    """What a caller written against ``old`` would trip over in ``new``."""
    if old is None:
        return []
    if new is None:
        return [f"{where}: signature no longer introspectable"]
    breaks = []
    new_by_name = {p[0]: p for p in new}
    old_positional = [p[0] for p in old if p[1] in ("POSITIONAL_ONLY", "POSITIONAL_OR_KEYWORD")]
    new_positional = [p[0] for p in new if p[1] in ("POSITIONAL_ONLY", "POSITIONAL_OR_KEYWORD")]
    for name, kind, has_default in old:
        if kind in ("VAR_POSITIONAL", "VAR_KEYWORD"):
            if not any(p[1] == kind for p in new):
                breaks.append(f"{where}: no longer accepts {'*args' if kind == 'VAR_POSITIONAL' else '**kwargs'}")
            continue
        if name not in new_by_name:
            breaks.append(f"{where}: parameter '{name}' removed or renamed")
            continue
        _, new_kind, new_default = new_by_name[name]
        if new_kind != kind:
            breaks.append(f"{where}: parameter '{name}' changed from {kind} to {new_kind}")
        if has_default and not new_default:
            breaks.append(f"{where}: parameter '{name}' lost its default (now required)")
    if new_positional[: len(old_positional)] != old_positional:
        breaks.append(f"{where}: positional parameters reordered ({old_positional} -> {new_positional})")
    old_names = {p[0] for p in old}
    for name, kind, has_default in new:
        if name not in old_names and kind not in ("VAR_POSITIONAL", "VAR_KEYWORD") and not has_default:
            breaks.append(f"{where}: new REQUIRED parameter '{name}'")
    return breaks


def breaks(old: dict, new: dict) -> list[str]:
    found = []
    for module_name, entries in old.items():
        current = new.get(module_name, {})
        for name, entry in entries.items():
            where = f"{module_name}.{name}"
            if name not in current:
                found.append(f"{where}: removed")
                continue
            now = current[name]
            if set(entry) - {"members"} != set(now) - {"members"}:
                found.append(f"{where}: changed from {sorted(entry)} to {sorted(now)}")
                continue
            if "enum" in entry:
                found += [f"{where}.{m}: enum member removed" for m in entry["enum"] if m not in now["enum"]]
            for key in ("class", "function"):
                if key in entry:
                    found += _call_breaks(where, entry[key], now[key])
            for member, sig in entry.get("members", {}).items():
                now_sig = now.get("members", {}).get(member, KeyError)
                if now_sig is KeyError:
                    found.append(f"{where}.{member}: removed")
                elif sig == "property" or now_sig == "property":
                    if sig != now_sig:
                        found.append(f"{where}.{member}: changed between property and method")
                else:
                    found += _call_breaks(f"{where}.{member}", sig, now_sig)
    return found


def test_the_authoring_api_keeps_its_pinned_signatures():
    actual = surface()
    if os.environ.get("MATEU_API_WRITE", "").lower() == "true":
        PIN.write_text(json.dumps(actual, indent=1, sort_keys=True) + "\n")
    pinned = json.loads(PIN.read_text())
    found = breaks(pinned, actual)
    assert not found, (
        "Incompatible change to the FROZEN 3.x Python authoring API:\n  " + "\n  ".join(found)
        + "\nWithin 3.x never remove or change a stable name in place: add the new spelling, keep the "
        "old one working with a DeprecationWarning naming the replacement "
        "(reference/stability-and-versioning.md), then rerun with MATEU_API_WRITE=true and commit "
        "tests/api/public-signatures.json.")
    assert actual == pinned, (
        "The authoring API changed compatibly (a new name, optional parameter or method): rerun with "
        "MATEU_API_WRITE=true and commit tests/api/public-signatures.json, so the change is reviewed.")


def test_the_checker_catches_what_a_caller_would_trip_over():
    """The rules themselves, on a synthetic pin (so they are not only exercised by a real break)."""
    old = {"m": {
        "deco": {"function": [["value", "POSITIONAL_OR_KEYWORD", False], ["flag", "KEYWORD_ONLY", True]]},
        "Kind": {"enum": ["A", "B"]},
        "View": {"class": [], "members": {"go": [], "name": "property"}},
        "gone": {"function": []},
    }}
    compatible = {"m": {
        "deco": {"function": [["value", "POSITIONAL_OR_KEYWORD", False], ["flag", "KEYWORD_ONLY", True],
                              ["extra", "KEYWORD_ONLY", True]]},
        "Kind": {"enum": ["A", "B", "C"]},
        "View": {"class": [], "members": {"go": [], "name": "property", "more": []}},
        "gone": {"function": []},
        "added": {"function": []},
    }}
    assert breaks(old, compatible) == []
    broken = {"m": {
        "deco": {"function": [["val", "POSITIONAL_OR_KEYWORD", False], ["flag", "KEYWORD_ONLY", False],
                              ["needed", "KEYWORD_ONLY", False]]},
        "Kind": {"enum": ["A"]},
        "View": {"class": [], "members": {"name": []}},
    }}
    found = breaks(old, broken)
    assert "m.gone: removed" in found
    assert "m.Kind.B: enum member removed" in found
    assert "m.View.go: removed" in found
    assert "m.View.name: changed between property and method" in found
    assert "m.deco: parameter 'value' removed or renamed" in found
    assert "m.deco: parameter 'flag' lost its default (now required)" in found
    assert "m.deco: new REQUIRED parameter 'needed'" in found
