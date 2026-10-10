"""The app's FIELD TYPE catalogue and the ``fieldType:`` resolver (the Python port of Java's
``FieldTypeRegistry`` + ``FieldTypeResolver`` and the browser's ``fieldTypes.ts``).

Two producers, one table: :class:`~mateu_uidl.field_types.FieldTypeCatalogSupplier` subclasses (code,
the *derived* half) and ``specs/ui/types.yaml`` (``MATEU_SPECS_DIR``; a ``types:`` envelope, optionally
``type: Types``, or a bare list — the *authored* half), merged by id with **authored winning** (the
whole entry is replaced).

The resolution rule — identical in Java, .NET, the browser and here, because a definition must render
the same wherever it is expanded — runs on the AUTHORED tree, before it becomes components:

1. any object carrying a string ``fieldType`` is a reference;
2. every attribute the type declares (non-empty) is copied onto it UNLESS the object already has that
   key non-null — the type supplies defaults, the field's own attributes win. A ``GridColumn`` only
   takes the column attributes, a ``FormField`` only the field ones;
3. ``fieldType`` is removed (the wire never carries it);
4. an unknown type is WARNed about (once per tree) and the object rendered as declared.

Never fails: a broken file, entry or supplier logs and yields fewer types.
"""

from __future__ import annotations

import copy
import logging
import os
import threading
from pathlib import Path
from typing import Any

import yaml

from mateu_uidl.field_types import ATTRIBUTE_KEYS, FieldTypeCatalogSupplier, FieldTypeEntry

log = logging.getLogger("mateu.field_types")

FILE = "types.yaml"

#: The authored key a field or a column references a type by.
KEY = "fieldType"

#: Every attribute a type may supply, as authored keys.
ALL_ATTRIBUTES: tuple[str, ...] = tuple(ATTRIBUTE_KEYS.values())

#: What each target can carry (a GridColumn has no options, a FormField no tones).
ONLY_FOR: dict[str, tuple[str, ...]] = {
    "GridColumn": (
        "label", "dataType", "stereotype", "style", "cssClasses", "align", "width", "autoWidth",
        "tones",
    ),
    "FormField": (
        "label", "dataType", "stereotype", "placeholder", "description", "required", "readOnly",
        "options", "optionsSource", "min", "max", "step", "colspan", "style", "cssClasses",
    ),
}


class FieldTypeRegistry:
    def __init__(
        self,
        directory: str | None = None,
        suppliers: list[type] | None = None,
        file: str | Path | None = None,
    ) -> None:
        self._dir = Path(directory or os.environ.get("MATEU_SPECS_DIR") or Path("specs") / "ui")
        self._file = Path(file) if file is not None else None
        self._suppliers = list(suppliers or [])
        self._catalog: list[FieldTypeEntry] | None = None
        self._lock = threading.Lock()

    # ── the catalogue ─────────────────────────────────────────────────────────
    def catalog(self) -> list[FieldTypeEntry]:
        """The merged catalogue (authored over code), loaded once."""
        if self._catalog is None:
            with self._lock:
                if self._catalog is None:
                    derived = self.derived()
                    authored = self.authored()
                    self._catalog = merged_over(authored, derived)
                    if self._catalog:
                        log.info(
                            "Field type catalogue: %d type(s) (%d from code, %d authored)",
                            len(self._catalog), len(derived), len(authored),
                        )
        return self._catalog

    def get(self, type_id: str | None) -> FieldTypeEntry | None:
        if not type_id or not str(type_id).strip():
            return None
        wanted = str(type_id).strip()
        return next((t for t in self.catalog() if t.id == wanted), None)

    def derived(self) -> list[FieldTypeEntry]:
        by_id: dict[str, FieldTypeEntry] = {}
        for supplier in self._suppliers:
            try:
                contributed = supplier().field_types() or []
            except Exception as e:  # noqa: BLE001 - a failing supplier contributes nothing
                log.warning("Field type catalogue: %s failed (%s)", getattr(supplier, "__name__", supplier), e)
                continue
            for entry in contributed:
                if isinstance(entry, FieldTypeEntry) and entry.id and entry.id.strip():
                    by_id[entry.id.strip()] = entry
        return list(by_id.values())

    def authored(self) -> list[FieldTypeEntry]:
        path = self._file or (self._dir / FILE)
        if not path.is_file():
            return []
        try:
            root = yaml.safe_load(path.read_text(encoding="utf-8"))
        except Exception as e:  # noqa: BLE001 - a broken file must not take the app down
            log.warning("Failed to read %s (%s)", path, e)
            return []
        nodes = root.get("types") if isinstance(root, dict) else root
        if not isinstance(nodes, list):
            return []
        out = []
        for node in nodes:
            entry = FieldTypeEntry.of_node(node)
            if entry is None:
                log.warning("Ignoring a field type with no id in %s", path)
                continue
            out.append(entry)
        return out

    # ── resolution ────────────────────────────────────────────────────────────
    def resolve(self, tree: Any) -> Any:
        """``tree`` with its ``fieldType`` references resolved (a copy; the tree itself when it
        names no type — then the catalogue is not even loaded)."""
        if not mentions_a_field_type(tree):
            return tree
        return resolve_field_types(tree, self.catalog())


def merged_over(authored: list[FieldTypeEntry], derived: list[FieldTypeEntry]) -> list[FieldTypeEntry]:
    """Authored over derived, by id: an authored entry replaces the derived one in place; new ids
    append."""
    by_id: dict[str, FieldTypeEntry] = {t.id: t for t in derived}
    for t in authored:
        by_id[t.id] = t
    return list(by_id.values())


def mentions_a_field_type(node: Any) -> bool:
    if isinstance(node, dict):
        if isinstance(node.get(KEY), str):
            return True
        return any(mentions_a_field_type(v) for v in node.values())
    if isinstance(node, list):
        return any(mentions_a_field_type(v) for v in node)
    return False


def resolve_field_types(tree: Any, types: list[FieldTypeEntry] | None) -> Any:
    """A copy of ``tree`` with every ``fieldType`` reference resolved against ``types``."""
    if not mentions_a_field_type(tree):
        return tree
    by_id = {t.id.strip(): t for t in (types or [])}
    warned: set[str] = set()

    def walk(node: Any) -> Any:
        if isinstance(node, list):
            return [walk(v) for v in node]
        if not isinstance(node, dict):
            return node
        out = {k: walk(v) for k, v in node.items() if k != KEY}
        ref = node.get(KEY)
        if isinstance(ref, str):
            apply(out, ref)
        return out

    def apply(target: dict, ref: str) -> None:
        entry = by_id.get(ref.strip())
        if entry is None:
            if ref not in warned:
                warned.add(ref)
                log.warning(
                    "Unknown field type '%s' (on '%s') — rendered as declared. Declare it in"
                    " specs/ui/types.yaml or a FieldTypeCatalogSupplier.",
                    ref,
                    target.get("id") or "",
                )
            return
        allowed = ONLY_FOR.get(str(target.get("type") or ""), ALL_ATTRIBUTES)
        attributes = entry.attributes()
        for key in allowed:
            if key in attributes and target.get(key) is None:
                target[key] = copy.deepcopy(attributes[key])

    return walk(tree)


_default: FieldTypeRegistry | None = None


def default_registry() -> FieldTypeRegistry:
    """A registry over ``MATEU_SPECS_DIR`` with no code suppliers — for the YAML readers that are
    not wired to the app's handler (the live preview, the component catalogue)."""
    global _default
    if _default is None:
        _default = FieldTypeRegistry()
    return _default


__all__ = [
    "FieldTypeCatalogSupplier",
    "FieldTypeEntry",
    "FieldTypeRegistry",
    "KEY",
    "ONLY_FOR",
    "default_registry",
    "mentions_a_field_type",
    "merged_over",
    "resolve_field_types",
]
