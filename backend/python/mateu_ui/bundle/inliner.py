"""Resolves, at BUILD time, the references a shipped (specs-mode) definition may carry that the
browser cannot: a ``type: Partial`` (its file lives in ``specs/ui/partials/``, which a bundle does
not ship) and a ``type: ComponentRef`` (the business component catalogue, ``components.yaml``).

The Python twin of Java's ``DefinitionInliner`` (``io.mateu.core.application.export``), same rules:
a partial of several components is SPLICED into the list holding it (a single slot gets them
stacked in a VerticalLayout), partials compose, a cycle or an unknown file is logged and left as it
was (the browser then shows its placeholder).
"""

from __future__ import annotations

import copy
import logging
from pathlib import Path
from typing import Any

import yaml

from mateu_ui.core.partial_registry import (
    PartialRegistry,
    guarded_by_access_keys,
    is_partial_document,
)

log = logging.getLogger("mateu.bundle")

MAX_DEPTH = 20
COMPONENTS = "components.yaml"


class DefinitionInliner:
    def __init__(self, specs_dir: str | Path) -> None:
        self._dir = Path(specs_dir)
        self._components: dict[str, Any] | None = None

    def inline(self, definition: Any) -> Any:
        """The definition with its partials and business-component references inlined."""
        return self._rewrite(definition, [])

    def _rewrite(self, node: Any, chain: list[str]) -> Any:
        if isinstance(node, list):
            out: list[Any] = []
            for element in node:
                expanded = self._expand(element, chain)
                if expanded is None:
                    out.append(self._rewrite(element, chain))
                else:
                    out.extend(expanded)
            return out
        if isinstance(node, dict):
            single = self._expand(node, chain)
            if single is not None:
                return single[0] if len(single) == 1 else _stack(single)
            return {k: self._slot(v, chain) for k, v in node.items()}
        return node

    def _slot(self, value: Any, chain: list[str]) -> Any:
        if isinstance(value, dict):
            expanded = self._expand(value, chain)
            if expanded is not None:
                return expanded[0] if len(expanded) == 1 else _stack(expanded)
        return self._rewrite(value, chain)

    def _expand(self, node: Any, chain: list[str]) -> list[Any] | None:
        if not isinstance(node, dict):
            return None
        kind = str(node.get("type") or "")
        ref = str(node.get("ref") or "").strip()
        if not ref:
            return None
        if len(chain) >= MAX_DEPTH:
            log.error("bundle: references nest deeper than %s at '%s'; left as it was", MAX_DEPTH, ref)
            return None
        if kind == "ComponentRef":
            component = self.components().get(ref)
            if component is None:
                log.warning("bundle: business component '%s' is not in %s — left as a reference", ref, COMPONENTS)
                return None
            key = "component:" + ref
            if key in chain:
                log.error("bundle: business component '%s' includes itself; left as a reference", ref)
                return None
            chain.append(key)
            try:
                return [self._rewrite(copy.deepcopy(component), chain)]
            finally:
                chain.pop()
        if kind != "Partial":
            return None
        relative = self._partial_path(ref)
        if relative is None:
            log.warning(
                "bundle: no partial '%s' at %s — left as a reference", ref, PartialRegistry.candidate_paths(ref)
            )
            return None
        key = "partial:" + relative
        if key in chain:
            log.error("bundle: partial '%s' includes itself; left as it was", ref)
            return None
        root = self._partial(ref, relative)
        if root is None:
            return None
        chain.append(key)
        try:
            out: list[Any] = []
            if is_partial_document(root):
                for child in root["content"]:
                    nested = self._expand(child, chain)
                    if nested is None:
                        out.append(self._rewrite(child, chain))
                    else:
                        out.extend(nested)
                # the document's own access keys stay on what it holds (cosmetic in a bundle, but
                # the structure must match what the server composes)
                out = guarded_by_access_keys(root, out)
            else:
                # a typed root IS one component, kept whole with its access keys, id and style
                out.append(self._rewrite(root, chain))
            return guarded_by_access_keys(node, out)
        finally:
            chain.pop()

    def _partial_path(self, ref: str) -> str | None:
        if "." in ref and not ref.endswith((".yaml", ".yml")):
            return None  # a class partial: rendered by a server, not inlinable here
        return next((c for c in PartialRegistry.candidate_paths(ref) if (self._dir / c).is_file()), None)

    def _partial(self, ref: str, relative: str) -> Any:
        try:
            return yaml.safe_load((self._dir / relative).read_text())
        except Exception as e:  # noqa: BLE001 - an unreadable partial stays a reference
            log.warning("bundle: could not read partial '%s': %s", ref, e)
            return None

    def components(self) -> dict[str, Any]:
        if self._components is None:
            self._components = {}
            file = self._dir / COMPONENTS
            if file.is_file():
                try:
                    root = yaml.safe_load(file.read_text())
                    entries = root.get("components") if isinstance(root, dict) else root
                    for entry in entries or []:
                        if isinstance(entry, dict) and entry.get("name") and isinstance(entry.get("component"), dict):
                            self._components[str(entry["name"])] = entry["component"]
                except Exception as e:  # noqa: BLE001
                    log.warning("bundle: could not read %s: %s", COMPONENTS, e)
        return self._components


def _stack(children: list[Any]) -> dict[str, Any]:
    return {"type": "VerticalLayout", "content": children}
