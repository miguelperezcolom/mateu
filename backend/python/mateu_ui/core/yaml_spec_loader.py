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

from mateu_ui.core import yaml_access
from mateu_ui.core.partial_registry import PartialRegistry
from mateu_ui.core.route_registry import RouteRegistry
from mateu_ui.core.translations import TranslationRegistry, mentions_i18n
from mateu_ui.core.yaml_preview import parse_spec_tree

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
    #: The ``pageType:`` the definition declares (wire name), or None — inferred.
    page_type: str | None = None

    def depends_on_request(self) -> bool:
        return self.source is not None


def hides_the_page(source: Any, applied: Any) -> bool:
    """Whether applying the access keys took the whole page away: the root itself was removed, or
    the ``layout:`` of an envelope was (what is left is no page)."""
    if applied is None:
        return True
    return (
        isinstance(source, dict)
        and source.get("layout") is not None
        and (not isinstance(applied, dict) or applied.get("layout") is None)
    )


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
            from mateu_ui.core.field_type_registry import FieldTypeRegistry

            field_types = FieldTypeRegistry(str(self._dir))
        self.field_types = field_types
        #: The action catalogue (an ActionRegistry, set by the SyncHandler): a catalogue entry with
        #: ``access:`` that a definition names is enforced like the definition's own actions.
        self.action_catalog: Any = None

        from mateu_ui.core import dev_specs

        dev_specs.register(self)

    def invalidate_specs(self) -> None:
        """Dev mode: a spec changed — every parsed definition is read again on next use."""
        self._by_route.clear()

    def _names_restricted_catalogue_action(self, tree: Any) -> bool:
        catalog = self.action_catalog
        if catalog is None or not catalog.restricts_any():
            return False
        from mateu_ui.core.action_registry import catalogue_ids_named_by

        return bool(catalogue_ids_named_by(tree) & catalog.restricted_ids())

    def _catalogue_actions_refused_in(self, tree: Any, authorized) -> set[str]:
        """The catalogue actions ``tree`` names (OWNER FIRST: not the ones it declares itself)
        that the caller may NOT run (Java's ``catalogueActionsRefusedIn``)."""
        catalog = self.action_catalog
        if catalog is None or not catalog.restricts_any():
            return set()
        from mateu_ui.core.action_registry import catalogue_ids_named_by

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
        # Who may see what is decided FIRST, and a failure there is never answered with the shared
        # spec: that one has no restriction applied, so falling back to it handed the caller the
        # very layout, state and actions the access keys were taking away (mirrors Java).
        source = spec.source
        refused: frozenset = frozenset()
        locked: frozenset = frozenset()
        try:
            catalogue_refused = self._catalogue_actions_refused_in(source, authorized)
            if yaml_access.declares_access(source) or catalogue_refused:
                applied = yaml_access.apply(
                    source,
                    authorized,
                    lambda path: self._registry.is_reachable(path, authorized),
                    catalogue_refused,
                )
                tree, refused, locked = applied.tree, applied.refused_actions, applied.locked_fields
            else:
                import copy

                tree = copy.deepcopy(source)
        except Exception as e:
            _log.exception("Could not apply the access keys of the YAML spec for %s", route)
            raise RuntimeError(
                f"the access keys of the definition for route '{route}' could not be applied"
            ) from e
        if hides_the_page(source, tree):
            # The caller may see NOTHING of the page: refused like a class-level @eyes_only,
            # before any state is hydrated or any action runs — no restricted version to serve.
            from mateu_ui.core import action_guard

            action_guard.deny(
                f"the definition of route '{route}' is hidden from the caller"
                " (eyesOnly:/access: on its root)"
            )
        try:
            self.translations.translate_tree(tree, locale)
        except Exception as e:  # noqa: BLE001 - a translation problem is not an authorization one
            # the caller keeps the page THEY may see, restrictions applied, just untranslated
            _log.warning("Could not translate the YAML spec for %s (served untranslated): %s", route, e)
        try:
            _, layout, delta = parse_spec_tree(tree, self.partials, self.field_types)
        except Exception as e:
            _log.exception("Could not build the personalised YAML spec for %s", route)
            raise RuntimeError(
                f"the definition for route '{route}' could not be personalised for the caller"
            ) from e
        return Spec(spec.model_view, layout, delta, None, refused, locked, spec.page_type)

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
            if declared:
                # routes.yaml names a layout file that is not there: say so, or the route answers
                # "not found" with nothing to tell a typo in the file name from a missing route
                _log.warning(
                    'routes.yaml: route "%s" names layout "%s", but %s does not exist. Check the'
                    " file name (it is relative to specs/ui/) or create the file.",
                    normalized_route,
                    declared,
                    path,
                )
            return None
        try:
            data = yaml.safe_load(path.read_text())
        except yaml.YAMLError as e:
            _log.warning("Could not read the definition %s", describe_yaml_error(path, e))
            return None
        except OSError:
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
        return Spec(model_view, layout, delta, source, page_type=page_type_of(data))


_PAGE_TYPES = ("landing", "collection", "detail", "form", "process", "dashboard")


def page_type_of(data: Any) -> str | None:
    """The page type a definition DECLARES (``pageType:`` beside ``layout:``) as its wire name, or
    None when it declares none — the YAML twin of ``@page_template``: a declared type wins over the
    shape inference. Matched without regard to case; an unknown value is ignored (logged), so a typo
    never costs the page (Java's ``YamlUidlLoader.pageTypeOf``)."""
    if not isinstance(data, dict):
        return None
    raw = data.get("pageType")
    declared = str(raw).strip() if raw is not None else ""
    if not declared:
        return None
    if declared.lower() in _PAGE_TYPES:
        return declared.lower()
    _log.warning(
        "Unknown pageType '%s' ignored (expected landing, collection, detail, form, process or"
        " dashboard) — the page type is inferred instead",
        declared,
    )
    return None


def describe_yaml_error(path, error: Exception) -> str:
    """``specs/ui/form.yaml, line 11: <what the parser says>`` — the line a developer has to fix,
    and what happens until they do (Java's ``YamlSpecProblems.describe``)."""
    mark = getattr(error, "problem_mark", None)
    where = f"{path}, line {mark.line + 1}" if mark is not None else f"{path}"
    problem = getattr(error, "problem", None) or str(error)
    return (
        f"{where}: {problem}. The definition is ignored until this is fixed, so its route answers"
        ' "Page not found".'
    )


def _normalize(route: str | None) -> str:
    r = route or ""
    q = r.find("?")
    if q >= 0:
        r = r[:q]
    r = r.strip("/")
    return "" if r in ("_empty", "_no_route", "_no_home_route") else r
