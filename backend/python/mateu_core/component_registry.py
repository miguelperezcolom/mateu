"""The app's business-component catalogue (the Python port of Java's ``ComponentRegistry``).

Derived half: ``@business_component`` methods on the classes the app registers + the
``ComponentCatalogSupplier`` classes; authored half: ``specs/ui/components.yaml`` merged on top —
authored wins, in place. Never fails: a broken file or a failing producer logs and contributes
nothing.
"""

from __future__ import annotations

import inspect
import logging
import os
import threading
from pathlib import Path
from typing import Any

import yaml

from mateu_uidl.business_components import ComponentCatalogSupplier, ComponentEntry

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
        self._lock = threading.Lock()
        from mateu_core import dev_specs

        dev_specs.register(self)

    def invalidate_specs(self) -> None:
        """Dev mode: a spec changed — the catalogue is read again on next use."""
        self._catalog = None

    def catalog(self) -> list[ComponentEntry]:
        if self._catalog is None:
            with self._lock:
                if self._catalog is None:
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
            out.append(ComponentEntry(str(node["name"]).strip(), component))
        return out


def is_catalog_supplier(cls: Any) -> bool:
    return (
        inspect.isclass(cls)
        and issubclass(cls, ComponentCatalogSupplier)
        and cls is not ComponentCatalogSupplier
    )


__all__ = ["ComponentRegistry", "is_catalog_supplier"]
