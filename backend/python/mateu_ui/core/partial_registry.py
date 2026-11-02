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
        from mateu_ui.core import dev_specs

        dev_specs.register(self)

    def invalidate_specs(self) -> None:
        """Dev mode: a spec changed — the YAML partials are read again (code registrations stay)."""
        self._by_ref.clear()

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

    @staticmethod
    def candidate_paths(ref: str) -> list[str]:
        """The paths, relative to the specs directory, a partial ``ref`` may live at, in lookup
        order. A short name is ``partials/<ref>.yaml`` (or ``.yml``); an explicit ``.yaml``/``.yml``
        path is relative to the specs directory, and the classpath spelling Java takes
        (``specs/ui/partials/x.yaml``, leading slash ignored) is honoured too — one definition
        resolves in every backend."""
        if not ref:
            return []
        if not ref.endswith((".yaml", ".yml")):
            return [f"partials/{ref}.yaml", f"partials/{ref}.yml"]
        path = ref.lstrip("/")
        return [path, path[len("specs/ui/") :]] if path.startswith("specs/ui/") else [path]

    def key(self, ref: str) -> str:
        """What identifies the partial a ref names — the file it resolves to (the ref itself when
        registered in code or missing), so two spellings of one file are one link of a cycle."""
        if ref in self._registered:
            return ref
        return next((c for c in self.candidate_paths(ref) if (self._dir / c).is_file()), ref)

    def _from_yaml(self, ref: str) -> list[Any]:
        relative = next((c for c in self.candidate_paths(ref) if (self._dir / c).is_file()), None)
        if relative is None:
            return _NONE
        path = self._dir / relative
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

    def compose(self, tree: Any) -> Any:
        """The tree with its partials inlined as SOURCE — each ``{type: Partial, ref: …}`` node
        replaced by the partial's own nodes, recursively — the twin of Java's ``YamlPartials``.

        Done before anything else reads a definition, so the access keys (``eyesOnly:``,
        ``readOnlyUnless:``, ``disabledUnless:``, ``access:``) and ``${i18n.…}`` texts of a partial
        are seen by the passes that apply them per caller. Built as components, a partial had
        already lost them: a section guarded in a partial reached every caller. In a list the
        partial's nodes are spliced; in a one-component slot several are stacked in a
        ``VerticalLayout``. A ref that resolves to nothing is left for the builder (no content)."""
        if not _mentions_partial(tree):
            return tree
        return self._compose_node(tree, [])

    def _compose_node(self, node: Any, chain: list[str]) -> Any:
        if isinstance(node, list):
            out: list[Any] = []
            for child in node:
                items = self._items_of(child, chain)
                if items is None:
                    out.append(self._compose_node(child, chain))
                else:
                    out.extend(items)
            return out
        if isinstance(node, dict):
            out_map: dict[Any, Any] = {}
            for name, value in node.items():
                items = self._items_of(value, chain)
                if items is None:
                    out_map[name] = self._compose_node(value, chain)
                elif len(items) == 1:
                    out_map[name] = items[0]
                elif items:
                    out_map[name] = {"type": "VerticalLayout", "content": items}
            return out_map
        return node

    def _items_of(self, node: Any, chain: list[str]) -> list[Any] | None:
        """The composed nodes a partial node stands for; None when ``node`` is not a partial or
        names nothing (left to the builder); empty for a cycle or a nesting too deep."""
        if not (isinstance(node, dict) and node.get("type") == "Partial" and node.get("ref")):
            return None
        ref = node["ref"]
        nodes = self.resolve(ref)
        if not nodes:
            return None
        key = self.key(ref)
        if key in chain or len(chain) >= _MAX_COMPOSE_DEPTH:
            return []
        chain.append(key)
        try:
            out: list[Any] = []
            for child in nodes:
                items = self._items_of(child, chain)
                out.extend(items if items is not None else [self._compose_node(child, chain)])
            return out
        finally:
            chain.pop()


_MAX_COMPOSE_DEPTH = 20


def _mentions_partial(node: Any) -> bool:
    if isinstance(node, dict):
        if node.get("type") == "Partial":
            return True
        return any(_mentions_partial(v) for v in node.values())
    if isinstance(node, list):
        return any(_mentions_partial(v) for v in node)
    return False
