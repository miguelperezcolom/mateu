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

import logging
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable

import yaml

from mateu_core import yaml_access
from mateu_core.partial_registry import PartialRegistry
from mateu_core.route_registry import RouteRegistry
from mateu_core.translations import TranslationRegistry, mentions_i18n
from mateu_core.yaml_preview import parse_spec_tree

_log = logging.getLogger("mateu.yaml_specs")


@dataclass(frozen=True)
class Spec:
    """A parsed page spec: the layout (or, for a ``layoutDelta:`` page, the delta to re-apply over
    the view model's inferred layout), plus the ModelView class name when known.

    ``source`` is the raw tree of a spec that depends on WHO asks (access keys) or in which
    LANGUAGE (``${i18n.…}``) — such a spec is re-derived per request by
    :meth:`YamlSpecLoader.load_spec_for`. ``refused_actions``/``locked_fields`` are what that
    derivation took away for the caller (Java's ``YamlPageSpec``)."""

    model_view: str | None
    layout: object | None
    delta: object | None = None
    source: Any = None
    refused_actions: frozenset = field(default_factory=frozenset)
    locked_fields: frozenset = field(default_factory=frozenset)

    def depends_on_request(self) -> bool:
        return self.source is not None


class YamlSpecLoader:
    def __init__(
        self,
        directory: str | None = None,
        registry: RouteRegistry | None = None,
        partials: PartialRegistry | None = None,
        translations: TranslationRegistry | None = None,
        field_types=None,
    ) -> None:
        self._dir = Path(directory or os.environ.get("MATEU_SPECS_DIR") or Path("specs") / "ui")
        self._by_route: dict[str, Spec | None] = {}
        #: Resolves ``type: Partial`` nodes against ``<specs>/partials/``, so a definition can reuse
        #: a piece rather than repeat it.
        self.partials = partials if partials is not None else PartialRegistry(str(self._dir))
        #: When a route's registry entry names a ``definition``, THAT file is the layout — instead
        #: of the ``<route>.yaml`` convention, which ties a screen's layout to its URL and so
        #: prevents one definition from serving several routes.
        self._registry = registry if registry is not None else RouteRegistry(str(self._dir))
        #: The catalogue ``${i18n.…}`` expressions are resolved against.
        self.translations = (
            translations if translations is not None else TranslationRegistry(str(self._dir))
        )
        #: The field type catalogue (``specs/ui/types.yaml`` + code suppliers): a field naming a
        #: type by ``fieldType:`` takes its attributes as defaults before it is built.
        if field_types is None:
            from mateu_core.field_type_registry import FieldTypeRegistry

            field_types = FieldTypeRegistry(str(self._dir))
        self.field_types = field_types
        #: The action catalogue (an ActionRegistry, set by the SyncHandler): a catalogue entry with
        #: ``access:`` that a definition names is enforced like the definition's own actions.
        self.action_catalog: Any = None

        from mateu_core import dev_specs

        dev_specs.register(self)

    def invalidate_specs(self) -> None:
        """Dev mode: a spec changed — every parsed definition is read again on next use."""
        self._by_route.clear()

    def _names_restricted_catalogue_action(self, tree: Any) -> bool:
        catalog = self.action_catalog
        if catalog is None or not catalog.restricts_any():
            return False
        from mateu_core.action_registry import catalogue_ids_named_by

        return bool(catalogue_ids_named_by(tree) & catalog.restricted_ids())

    def _catalogue_actions_refused_in(self, tree: Any, authorized) -> set[str]:
        """The catalogue actions ``tree`` names (OWNER FIRST: not the ones it declares itself)
        that the caller may NOT run (Java's ``catalogueActionsRefusedIn``)."""
        catalog = self.action_catalog
        if catalog is None or not catalog.restricts_any():
            return set()
        from mateu_core.action_registry import catalogue_ids_named_by

        return catalogue_ids_named_by(tree) & catalog.refused_for(authorized)

    def load_spec_for(
        self,
        route: str | None,
        authorized: Callable[[Any], bool],
        locale: str | None,
    ) -> Spec | None:
        """The spec for a route AS THIS REQUEST SEES IT: a spec that declares access keys or
        ``${i18n.…}`` is re-derived from its source tree for the caller's identity (``authorized``,
        the mapper's gate check) and ``locale`` — on the server, so what reaches the wire is what the
        caller may see, in their language (Java's ``YamlUidlLoader.loadSpec(route, httpRequest)``)."""
        spec = self.load_spec(route)
        if spec is None or not spec.depends_on_request():
            return spec
        try:
            tree = spec.source
            refused: frozenset = frozenset()
            locked: frozenset = frozenset()
            catalogue_refused = self._catalogue_actions_refused_in(tree, authorized)
            if yaml_access.declares_access(tree) or catalogue_refused:
                applied = yaml_access.apply(
                    tree,
                    authorized,
                    lambda path: self._registry.is_reachable(path, authorized),
                    catalogue_refused,
                )
                tree, refused, locked = applied.tree, applied.refused_actions, applied.locked_fields
            else:
                import copy

                tree = copy.deepcopy(tree)
            if tree is None:
                return None
            self.translations.translate_tree(tree, locale)
            _, layout, delta = parse_spec_tree(tree, self.partials, self.field_types)
            return Spec(spec.model_view, layout, delta, None, refused, locked)
        except Exception as e:  # noqa: BLE001 - fall back to the shared spec
            _log.warning("Failed to personalise the YAML spec for %s: %s", route, e)
            return spec

    def load_spec(self, route: str | None) -> Spec | None:
        key = _normalize(route)
        if key not in self._by_route:
            self._by_route[key] = self._parse(key)
        return self._by_route[key]

    def _parse(self, normalized_route: str) -> Spec | None:
        match = self._registry.match(normalized_route)
        entry = match.entry if match is not None else None
        declared = (entry.definition if entry is not None else None) or None
        path = self._dir / (declared if declared else f"{normalized_route}.yaml")
        if not path.is_file():
            return None
        try:
            data = yaml.safe_load(path.read_text())
        except (OSError, yaml.YAMLError):
            return None
        model_view, layout, delta = parse_spec_tree(data, self.partials, self.field_types)
        # A spec that depends on who asks or in which language keeps its source tree, so it can be
        # re-derived per request (load_spec_for); everything else is shared as-is.
        source = (
            data
            if (
                yaml_access.declares_access(data)
                or mentions_i18n(data)
                or self._names_restricted_catalogue_action(data)
            )
            else None
        )
        if layout is None and delta is None:
            return None
        # The definition is layout; the binding to a view model belongs to the route entry. A YAML
        # that still declares modelView: keeps working and wins — but a definition shared by several
        # routes must NOT name one, or it could only ever serve the class it names.
        if not model_view and entry is not None:
            model_view = entry.view_model or None
        if layout is None and not model_view:
            return None  # a delta with no view model to infer from: nothing to render
        return Spec(model_view, layout, delta, source)


def _normalize(route: str | None) -> str:
    r = route or ""
    q = r.find("?")
    if q >= 0:
        r = r[:q]
    r = r.strip("/")
    return "" if r in ("_empty", "_no_route", "_no_home_route") else r
