"""Loads a page defined in a YAML file under ``specs/ui/`` relative to the working directory — the
Python analogue of Java's classpath-based YamlUidlLoader and .NET's YamlSpecLoader.

A spec is a component tree, optionally wrapped in an envelope with a ``modelView:`` key naming the
logic class that supplies state and actions (the YAML supplies only the layout). The binding is by
convention, as everywhere in Mateu: a FormField ``id="name"`` binds to the ModelView's ``name``
attribute, a Button ``actionId="save"`` to its ``save()`` method.

Specs are static files, so each route is parsed once and cached (a miss too, so an unmatched route —
checked on every request that has no view class — does not stat the disk each time). Editing a spec
during development needs a restart to be picked up. Override the directory with the
``MATEU_SPECS_DIR`` environment variable (default: ``specs/ui`` under the cwd).
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from mateu_core.yaml_preview import parse_spec


@dataclass(frozen=True)
class Spec:
    """A parsed page spec: the layout, plus the ModelView class name when the YAML declares one."""

    model_view: str | None
    layout: object | None


class YamlSpecLoader:
    def __init__(self, directory: str | None = None) -> None:
        self._dir = Path(directory or os.environ.get("MATEU_SPECS_DIR") or Path("specs") / "ui")
        self._by_route: dict[str, Spec | None] = {}

    def load_spec(self, route: str | None) -> Spec | None:
        key = _normalize(route)
        if key not in self._by_route:
            self._by_route[key] = self._parse(key)
        return self._by_route[key]

    def _parse(self, normalized_route: str) -> Spec | None:
        path = self._dir / f"{normalized_route}.yaml"
        if not path.is_file():
            return None
        try:
            model_view, layout = parse_spec(path.read_text())
        except OSError:
            return None
        return Spec(model_view, layout) if layout is not None else None


def _normalize(route: str | None) -> str:
    r = route or ""
    q = r.find("?")
    if q >= 0:
        r = r[:q]
    r = r.strip("/")
    return "" if r in ("_empty", "_no_route", "_no_home_route") else r
