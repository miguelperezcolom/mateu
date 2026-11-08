"""The app's business-component catalogue (the Python port of Java's ``ComponentRegistry``).

Derived half: ``@business_component`` methods on the classes the app registers + the
``ComponentCatalogSupplier`` classes; authored half: ``specs/ui/components.yaml`` merged on top —
authored wins, in place. Never fails: a broken file or a failing producer logs and contributes
nothing.
"""

from __future__ import annotations

import copy
import dataclasses
import inspect
import logging
import os
import threading
from pathlib import Path
from typing import Any, Callable

import yaml

from mateu_ui.core import yaml_access
from mateu_ui.uidl import components as fluent
from mateu_ui.uidl.business_components import ComponentCatalogSupplier, ComponentEntry

log = logging.getLogger("mateu.components")

FILE = "components.yaml"


class ComponentRegistry:
    def __init__(
        self,
        directory: str | None = None,
        classes: list[type] | None = None,
        suppliers: list[type] | None = None,
    ) -> None:
        self._dir = Path(directory or os.environ.get("MATEU_SPECS_DIR") or Path("specs") / "ui")
        self._classes = list(classes or [])
        self._suppliers = list(suppliers or [])
        self._catalog: list[ComponentEntry] | None = None
        #: authored entries whose composition declares access keys, by name: their SOURCE, rebuilt
        #: per caller (Java's ComponentRegistry.get(name, request)) and read by the write-side guard
        self._sources: dict[str, Any] = {}
        self._lock = threading.Lock()
        from mateu_ui.core import dev_specs

        dev_specs.register(self)

    def invalidate_specs(self) -> None:
        """Dev mode: a spec changed — the catalogue is read again on next use."""
        self._catalog = None
        self._sources = {}

    def catalog(self) -> list[ComponentEntry]:
        if self._catalog is None:
            with self._lock:
                if self._catalog is None:
                    self._sources = {}
                    by_name = {e.name: e for e in self.derived()}
                    for e in self.authored():
                        by_name[e.name] = e
                    self._catalog = list(by_name.values())
        return self._catalog

    def get(self, name: str | None) -> ComponentEntry | None:
        if not name:
            return None
        return next((e for e in self.catalog() if e.name == name.strip()), None)

    def derived(self) -> list[ComponentEntry]:
        by_name: dict[str, ComponentEntry] = {}
        for cls in self._classes:
            for attr, raw in cls.__dict__.items():
                fn = raw.__func__ if isinstance(raw, (staticmethod, classmethod)) else raw
                name = getattr(fn, "__mateu_business_component__", None)
                if not name:
                    continue
                try:
                    bound = getattr(cls, attr) if isinstance(raw, (staticmethod, classmethod)) else getattr(cls(), attr)
                    component = bound() if callable(bound) else bound
                except Exception as e:  # noqa: BLE001 - a broken producer contributes nothing
                    log.warning("Business component '%s' (%s.%s) failed: %s", name, cls.__name__, attr, e)
                    continue
                if component is not None:
                    by_name[name] = ComponentEntry(name, component)
        for supplier in self._suppliers:
            try:
                contributed = supplier().business_components() or []
            except Exception as e:  # noqa: BLE001
                log.warning("Component catalogue: %s failed (%s)", supplier.__name__, e)
                continue
            for entry in contributed:
                if isinstance(entry, ComponentEntry) and entry.name and entry.component is not None:
                    by_name[entry.name] = entry
        return list(by_name.values())

    def authored(self) -> list[ComponentEntry]:
        path = self._dir / FILE
        if not path.is_file():
            return []
        try:
            root = yaml.safe_load(path.read_text(encoding="utf-8"))
        except Exception as e:  # noqa: BLE001
            log.warning("Ignoring unreadable %s (%s)", path, e)
            return []
        nodes = root.get("components") if isinstance(root, dict) else root
        if not isinstance(nodes, list):
            return []
        from .yaml_preview import build_node

        out = []
        for node in nodes:
            if not isinstance(node, dict) or not str(node.get("name") or "").strip():
                continue
            component = build_node(node.get("component"))
            if component is None:
                log.warning("components.yaml: could not parse component '%s'", node.get("name"))
                continue
            name = str(node["name"]).strip()
            if yaml_access.declares_access(node.get("component")):
                self._sources[name] = copy.deepcopy(node.get("component"))
            out.append(ComponentEntry(name, component))
        return out

    # ── per caller ───────────────────────────────────────────────────────────────────────────────

    def get_for(self, name: str | None, authorized: Callable[[Any], bool] | None) -> ComponentEntry | None:
        """The entry AS THIS CALLER SEES IT: an authored composition declaring ``eyesOnly:`` /
        ``readOnlyUnless:`` / ``disabledUnless:`` / ``access:`` is rebuilt from its source with
        the access keys applied (Java's ``ComponentRegistry.get(name, request)``). A failure
        applying them yields an EMPTY composition, never the unrestricted one."""
        entry = self.get(name)
        if entry is None:
            return None
        source = self._sources.get(entry.name)
        if source is None:
            return entry
        try:
            applied = yaml_access.apply(source, authorized or _nobody)
            if applied.tree is None:
                return ComponentEntry(entry.name, fluent.VerticalLayout(content=()))
            from .yaml_preview import build_node

            return ComponentEntry(entry.name, build_node(applied.tree) or fluent.VerticalLayout(content=()))
        except Exception:  # noqa: BLE001 - fail closed
            log.exception("Could not apply the access keys of business component '%s'", entry.name)
            return ComponentEntry(entry.name, fluent.VerticalLayout(content=()))

    def restricted_names(self) -> list[str]:
        self.catalog()
        return list(self._sources)

    def locked_for(self, names, authorized: Callable[[Any], bool] | None) -> set[str]:
        """The ids of the fields the business components ``names`` (and the ones they nest) hide or
        lock for the caller — dropped from the state the client posts (Java's
        ``ClientLockedFields``). Fails CLOSED: a composition whose access keys cannot be evaluated
        locks every field it holds."""
        self.catalog()
        out: set[str] = set()
        for name in names:
            self._locked(str(name).strip(), authorized, (), out, lock_all=False)
        return out

    def _locked(self, name, authorized, chain, out: set[str], lock_all: bool) -> None:
        if name in chain or len(chain) >= 20:
            return
        source = self._sources.get(name)
        if source is None:
            return  # nothing authored with access keys: it locks nothing of its own
        chain = (*chain, name)
        nested = _refs_in_yaml(source)
        visible = nested
        if lock_all:
            out.update(_field_ids_in(source))
            visible = set()
        else:
            try:
                applied = yaml_access.apply(source, authorized or _nobody)
                out.update(applied.locked_fields)
                if applied.tree is None:
                    out.update(_field_ids_in(source))
                    visible = set()
                else:
                    visible = _refs_in_yaml(applied.tree)
            except Exception:  # noqa: BLE001 - fail closed
                log.exception("Could not apply the access keys of business component '%s'", name)
                out.update(_field_ids_in(source))
                visible = set()
        for child in nested:
            self._locked(child, authorized, chain, out, lock_all=child not in visible)


def _nobody(gate) -> bool:
    """No identity to ask: only what declares no restriction is granted."""
    return gate is None


def _refs_in_yaml(node: Any) -> set[str]:
    out: set[str] = set()
    if isinstance(node, dict):
        if node.get("type") == "ComponentRef" and str(node.get("ref") or "").strip():
            out.add(str(node["ref"]).strip())
        for v in node.values():
            out |= _refs_in_yaml(v)
    elif isinstance(node, list):
        for v in node:
            out |= _refs_in_yaml(v)
    return out


def _field_ids_in(node: Any) -> set[str]:
    out: set[str] = set()
    if isinstance(node, dict):
        if node.get("type") == "FormField" and node.get("id") is not None:
            out.add(str(node["id"]))
        for v in node.values():
            out |= _field_ids_in(v)
    elif isinstance(node, list):
        for v in node:
            out |= _field_ids_in(v)
    return out


def component_refs_in(tree: Any, _depth: int = 0) -> set[str]:
    """The business components a fluent tree (built in code or by the YAML builder) references."""
    out: set[str] = set()
    if tree is None or _depth > 64:
        return out
    if isinstance(tree, fluent.ComponentRef):
        if tree.ref:
            out.add(tree.ref.strip())
        return out
    if isinstance(tree, (list, tuple)):
        for v in tree:
            out |= component_refs_in(v, _depth + 1)
    elif isinstance(tree, dict):
        for v in tree.values():
            out |= component_refs_in(v, _depth + 1)
    elif dataclasses.is_dataclass(tree) and not isinstance(tree, type):
        for f in dataclasses.fields(tree):
            v = getattr(tree, f.name, None)
            if isinstance(v, (fluent.Component, list, tuple, dict)) or dataclasses.is_dataclass(v):
                out |= component_refs_in(v, _depth + 1)
    return out


def is_catalog_supplier(cls: Any) -> bool:
    return (
        inspect.isclass(cls)
        and issubclass(cls, ComponentCatalogSupplier)
        and cls is not ComponentCatalogSupplier
    )


__all__ = ["ComponentRegistry", "is_catalog_supplier"]
