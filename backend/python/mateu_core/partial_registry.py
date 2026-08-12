"""Resolves a partial's ``ref`` into the YAML nodes it stands for — the Python analogue of Java's
``PartialRegistry`` and .NET's ``PartialRegistry``.

A partial is authored exactly like a page — one component, or a ``content:`` list of them — but has
no route and no chrome. Definitions live in ``<specs>/partials/<ref>.yaml``; a ref that already ends
in ``.yaml`` is honoured as a path relative to the specs directory, so a partial can live next to the
pages that use it.

Refs resolve to raw YAML nodes rather than to built components: the builder splices them into the
parent's node list and builds once, which is what lets a partial standing for several components
behave like those components rather than like a wrapper around them.

A ref that resolves to nothing is **not** fatal — the partial renders as no content. A page is not
worth taking down over one piece of it, and the alternative turns a typo into a 500 on every request
to every page that mentions the ref.

Unlike the Java server, a ref here cannot name a class: the ports carry the declarative form only,
as with ``@Overline``.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import yaml

_NONE: list[Any] = []


class PartialRegistry:
    def __init__(self, directory: str | None = None) -> None:
        self._dir = Path(directory or os.environ.get("MATEU_SPECS_DIR") or Path("specs") / "ui")
        self._by_ref: dict[str, list[Any]] = {}
        self._registered: dict[str, list[Any]] = {}

    def register(self, ref: str, nodes: list[Any]) -> None:
        """Contribute a partial programmatically. A registration wins over a file of the same name —
        the same precedence a route registration has over the route convention."""
        self._registered[ref] = list(nodes)
        self._by_ref.pop(ref, None)

    def reset(self) -> None:
        """Forget everything registered in code, and every cached lookup. Tests."""
        self._registered.clear()
        self._by_ref.clear()

    def resolve(self, ref: str | None) -> list[Any]:
        """The YAML nodes ``ref`` stands for; empty when it resolves to nothing."""
        if not ref:
            return _NONE
        if ref in self._registered:
            return self._registered[ref]
        if ref not in self._by_ref:
            self._by_ref[ref] = self._from_yaml(ref)
        return self._by_ref[ref]

    def _from_yaml(self, ref: str) -> list[Any]:
        relative = ref if ref.endswith((".yaml", ".yml")) else str(Path("partials") / f"{ref}.yaml")
        path = self._dir / relative
        if not path.is_file():
            return _NONE
        try:
            root = yaml.safe_load(path.read_text())
        except (OSError, yaml.YAMLError):
            return _NONE
        if root is None:
            return _NONE
        # `content:` holds several; a file that is just a component IS the partial.
        if isinstance(root, dict) and isinstance(root.get("content"), list):
            return list(root["content"])
        return [root]
