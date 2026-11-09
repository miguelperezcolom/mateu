"""Loads a page defined in a YAML file under ``specs/ui/`` relative to the working directory — the
Python analogue of Java's classpath-based YamlUidlLoader and .NET's YamlSpecLoader.

A spec is a component tree, optionally wrapped in an envelope with a ``viewModel:`` key naming the
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
    #: The definition's own ``actions:`` (beside ``layout:``) as :class:`DeclaredAction`\ s — what
    #: a definition-only page advertises (Java's SeededYamlPage.actions).
    actions: tuple = ()
    #: A ``type: Form`` definition declaring ``confirmOnNavigationIfDirty: true``.
    confirm_on_navigation_if_dirty: bool = False
    #: The definition's own ``triggers:`` (beside ``layout:``) as wire triggers — what a
    #: definition-only page fires without a click (Java's SeededYamlPage.triggers).
    triggers: tuple = ()

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
        return Spec(
            spec.model_view,
            layout,
            delta,
            None,
            refused,
            locked,
            spec.page_type,
            # re-read from the caller's copy: a refused action is gone, its texts translated
            tuple(a for a in declared_actions_of(tree) if a.id not in refused),
            spec.confirm_on_navigation_if_dirty,
            declared_triggers_of(tree),
        )

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
        # partials inlined as SOURCE first, so their access keys and i18n texts are applied per
        # caller like inline ones (mirrors Java YamlPartials)
        data = self.partials.compose(data)
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
        # that declares viewModel: wins — but a definition shared by several
        # routes must NOT name one, or it could only ever serve the class it names.
        if not model_view and entry is not None:
            model_view = entry.view_model or None
        if layout is None and not model_view:
            return None  # a delta with no view model to infer from: nothing to render
        return Spec(
            model_view, layout, delta, source, page_type=page_type_of(data),
            actions=declared_actions_of(data),
            confirm_on_navigation_if_dirty=confirms_on_navigation_if_dirty(data),
            triggers=declared_triggers_of(data),
        )


_PAGE_TYPES = ("landing", "collection", "detail", "form", "process", "dashboard")


@dataclass(frozen=True)
class DeclaredAction:
    """One action a definition declares: what travels (``dto``), plus the request the server keeps
    for the proxy leg (``source``, whose headers and body never travel when proxied)."""

    dto: Any
    source: Any = None

    @property
    def id(self) -> str:
        return self.dto.id


def declared_actions_of(data: Any) -> tuple:
    """The ``actions:`` a definition declares beside its ``layout:`` (Java's
    ``YamlUidlLoader.actionsOf``), read into the wire action AS WRITTEN — Java deserialises the
    whole fluent ``Action`` record: its knobs (``validationRequired``, ``confirmationRequired``,
    ``shortcut`` …), its ``steps`` lowered to commands and its ``restAction`` with ``successRoute``.
    An entry with no id is dropped (nothing could name it); a malformed one with a warning."""
    nodes = data.get("actions") if isinstance(data, dict) else None
    if not isinstance(nodes, list):
        return ()
    parsed = []
    for node in nodes:
        if not isinstance(node, dict) or not str(node.get("id") or "").strip():
            continue
        try:
            parsed.append(_declared_action(str(node["id"]).strip(), node))
        except Exception as e:  # noqa: BLE001 - one malformed action must not cost the page
            _log.warning("Ignoring an unparseable action in a YAML spec: %s", e)
    return tuple(parsed)


def _declared_action(action_id: str, node: dict) -> DeclaredAction:
    from mateu_ui.dtos import Action, ConfirmationTextsRecord, CustomEventRecord, RestAction

    from .action_registry import _step, lower

    def flag(n: dict, key: str) -> bool:
        return str(n.get(key)).lower() == "true"

    def text(n: dict, key: str) -> str | None:
        value = n.get(key)
        return str(value) if value is not None and str(value).strip() else None

    rest = node.get("restAction") if isinstance(node.get("restAction"), dict) else None
    source = _declared_source(rest.get("source")) if rest is not None else None
    steps = [s for s in (_step(n) for n in node.get("steps") or []) if s is not None]
    texts = node.get("confirmationTexts")
    event = node.get("customEvent")
    dto = Action(
        id=action_id,
        validation_required=flag(node, "validationRequired"),
        confirmation_required=flag(node, "confirmationRequired"),
        rows_selected_required=flag(node, "rowsSelectedRequired"),
        bubble=flag(node, "bubble"),
        background=flag(node, "background"),
        sse=flag(node, "sse"),
        idempotent=flag(node, "idempotent"),
        timeout_millis=int(node.get("timeoutMillis") or 0),
        shortcut=text(node, "shortcut"),
        fields_to_validate=text(node, "fieldsToValidate"),
        href=text(node, "href"),
        js=text(node, "js"),
        confirmation_texts=(
            ConfirmationTextsRecord(
                title=texts.get("title"),
                message=texts.get("message"),
                confirmation_text=texts.get("confirmationText"),
                denial_text=texts.get("denialText"),
            )
            if isinstance(texts, dict)
            else None
        ),
        custom_event=(
            CustomEventRecord(event_name=str(event.get("eventName") or ""), detail=event.get("detail"))
            if isinstance(event, dict)
            else None
        ),
        rest_action=(
            RestAction(
                source=source if source is not None else _declared_source({}),
                success_message=rest.get("successMessage"),
                result_path=rest.get("resultPath"),
                success_route=text(rest, "successRoute"),
                for_each_selected_row=flag(rest, "forEachSelectedRow"),
            )
            if rest is not None
            else None
        ),
        commands=[lower(s) for s in steps] or None,
    )
    return DeclaredAction(dto, source)


def _declared_source(node: Any):
    """A ``source:`` as DECLARED — only the keys written (a bare string is the ref shorthand): what
    travels is the surface as authored, as Java's record deserialisation keeps it; the catalogue
    entry it names is resolved by the server only for its own proxy leg."""
    from mateu_ui.dtos import RestDataSource

    if isinstance(node, str) and node.strip():
        return RestDataSource(ref=node.strip())
    if not isinstance(node, dict):
        return None

    def text(key: str) -> str | None:
        value = node.get(key)
        return str(value) if value is not None and str(value).strip() else None

    headers = node.get("headers")
    return RestDataSource(
        ref=text("ref"),
        url=text("url"),
        method=text("method"),
        headers={str(k): str(v) for k, v in headers.items()} if isinstance(headers, dict) else None,
        body=text("body"),
        items_path=text("itemsPath"),
        value_path=text("valuePath"),
        label_path=text("labelPath"),
        proxy=str(node.get("proxy")).lower() == "true",
        sample=node.get("sample"),
    )


def declared_triggers_of(data: Any) -> tuple:
    """The ``triggers:`` a definition declares beside its ``layout:`` (Java's
    ``YamlUidlLoader.triggersOf``), as the wire triggers Java's ``TriggerMapper.mapTrigger`` emits.
    Each entry is discriminated by ``type`` — the Java record's simple name (``OnLoadTrigger``,
    ``OnCustomEventTrigger``, ``OnValueChangeTrigger``, ``OnSuccessTrigger``, ``OnErrorTrigger``,
    ``AutoSaveTrigger``). One that does not parse (no or an unknown type, an unknown ``source``) is
    dropped with a warning: the rest still fire."""
    nodes = data.get("triggers") if isinstance(data, dict) else None
    if not isinstance(nodes, list):
        return ()
    parsed = []
    for node in nodes:
        if not isinstance(node, dict):
            continue
        trigger = _declared_trigger(node)
        if trigger is None:
            _log.warning("Ignoring an unparseable trigger in a YAML spec (type %r)", node.get("type"))
            continue
        parsed.append(trigger)
    return tuple(parsed)


def _declared_trigger(node: dict) -> Any:
    from mateu_ui.dtos import (
        CustomTrigger,
        OnErrorTrigger,
        OnLoadTrigger,
        OnSuccessTrigger,
        OnValueChangeTrigger,
    )

    def text(key: str) -> str | None:
        value = node.get(key)
        return None if value is None else str(value)

    def number(key: str) -> int:
        try:
            return int(node.get(key) or 0)
        except (TypeError, ValueError):
            return 0

    def flag(key: str) -> bool:
        return str(node.get(key)).lower() == "true"

    action_id = text("actionId") or ""
    kind = node.get("type")
    if kind == "OnLoadTrigger":
        # an absent `times` is 0 here, as Java's record reads it (not the code builder's 1)
        return OnLoadTrigger(
            action_id=action_id,
            timeout_millis=number("timeoutMillis"),
            times=number("times"),
            condition=text("condition"),
            background=flag("background"),
        )
    if kind == "OnCustomEventTrigger":
        # an absent source is SELF — the record's own default, not @subscribe_to's DOCUMENT
        source = text("source") or "SELF"
        if source not in ("DOCUMENT", "COMPONENT", "SELF"):
            return None
        return CustomTrigger(
            event=text("eventName") or "",
            action_id=action_id,
            source=source,
            from_=text("from"),
            condition=text("condition"),
        )
    if kind == "OnValueChangeTrigger":
        return OnValueChangeTrigger(
            action_id=action_id, property_name=text("propertyName"), condition=text("condition")
        )
    if kind == "OnSuccessTrigger":
        return OnSuccessTrigger(
            action_id=action_id,
            called_action_id=text("calledActionId"),
            condition=text("condition"),
            timeout_millis=number("timeoutMillis"),
            background=flag("background"),
        )
    if kind == "OnErrorTrigger":
        return OnErrorTrigger(
            action_id=action_id, called_action_id=text("calledActionId"), condition=text("condition")
        )
    if kind == "AutoSaveTrigger":
        # debounceMillis always travels (0 = no debounce), as Java's AutoSaveTriggerDto
        return {"type": "AutoSave", "actionId": action_id, "debounceMillis": number("debounceMillis")}
    return None


@dataclass(frozen=True)
class DeclaredSource:
    """One source a definition-only page declares: its wire kind (``action`` | ``options`` |
    ``rows``), the id the browser names it by and the source as the ENDPOINT declares it (resolved
    against the catalogue)."""

    kind: str
    id: str
    source: Any


def definition_sources(spec: Spec, resolve: Any = None) -> list:
    """Every source a definition-only page declares (Java's ``SeededYamlPage.declaredRestSources``):
    its actions' calls and — walking the layout — a select's ``optionsSource`` (by the field's id),
    a listing's ``rowsSource`` (by its id, else ``crud``) and a live kanban's (else ``kanban``),
    each resolved by ``resolve`` (the catalogue). Without these a PROXIED listing or select on a
    classless page had nobody to fetch it: ``__restfetch__`` was never advertised and the listing
    stayed empty."""
    import dataclasses

    from mateu_ui.uidl.components import FormField, Kanban, ListingComponent

    from .mapper.components import ComponentMapperMixin

    def resolved(source: Any) -> Any:
        return (resolve(source) if resolve is not None else None) or source

    out: list = []
    for action in spec.actions:
        if action.source is not None:
            out.append(DeclaredSource("action", action.id, resolved(action.source)))

    def add(kind: str, id_: str, source: Any) -> None:
        dto = ComponentMapperMixin._fluent_rest_source(source)
        if dto is not None:
            out.append(DeclaredSource(kind, id_, resolved(dto)))

    seen: set[int] = set()

    def walk(node: Any) -> None:
        if node is None or isinstance(node, (str, bytes, int, float, bool)) or id(node) in seen:
            return
        seen.add(id(node))
        if isinstance(node, FormField) and node.options_source is not None and node.field_id:
            add("options", node.field_id, node.options_source)
        elif isinstance(node, ListingComponent) and node.rows_source is not None:
            add("rows", node.id or "crud", node.rows_source)  # the listing mapper's default id
        elif isinstance(node, Kanban) and node.rows_source is not None:
            add("rows", node.id or "kanban", node.rows_source)
        if isinstance(node, (list, tuple)):
            for item in node:
                walk(item)
            return
        if dataclasses.is_dataclass(node) and type(node).__module__.startswith("mateu_ui.uidl"):
            for f in dataclasses.fields(node):
                walk(getattr(node, f.name, None))

    walk(spec.layout)
    return out


def source_for(sources: list, kind: Any, source_id: Any) -> Any:
    """The source a ``__restfetch__`` for ``kind``/``source_id`` names: the one declared with that
    id first; rows (one per page) fall back to the first of their kind (Java's RestSourceResolver
    over a RestSourceSupplier) — never a client url."""
    of_kind = [s for s in sources if s.kind == kind]
    wanted = str(source_id or "")
    match = next((s for s in of_kind if s.id == wanted), None)
    if match is None and kind in ("rows", "data") and of_kind:
        match = of_kind[0]
    return match.source if match is not None else None


def confirms_on_navigation_if_dirty(data: Any) -> bool:
    """Whether the page asks before it is left with unsaved changes: a ``type: Form`` definition
    declaring ``confirmOnNavigationIfDirty: true`` (Java's SeededYamlPage reads the Form's flag)."""
    if not isinstance(data, dict):
        return False
    layout = data.get("layout")
    page: dict = layout if isinstance(layout, dict) else data
    return page.get("type") == "Form" and str(page.get("confirmOnNavigationIfDirty")).lower() == "true"


def required_field_validations(layout: Any) -> list:
    """The checks the browser runs before an action marked ``validationRequired``: one per
    ``required: true`` field of the definition, with the condition and message a class form's
    required field gets (Java's ``SeededYamlPage.validations``)."""
    import dataclasses

    from mateu_ui.dtos import ValidationRecord
    from mateu_ui.uidl.components import FormField

    from .validation import required_condition

    out: list = []
    seen: set[int] = set()

    def walk(node: Any) -> None:
        if node is None or isinstance(node, (str, bytes, int, float, bool)) or id(node) in seen:
            return
        seen.add(id(node))
        if isinstance(node, FormField):
            if node.required and not node.read_only and node.field_id.strip():
                out.append(
                    ValidationRecord(
                        condition=required_condition(f"state['{node.field_id}']"),
                        field_id=node.field_id,
                        message="Cannot be empty",
                    )
                )
            return
        if isinstance(node, (list, tuple)):
            for item in node:
                walk(item)
            return
        if dataclasses.is_dataclass(node):
            for f in dataclasses.fields(node):
                walk(getattr(node, f.name, None))

    walk(layout)
    return out


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
