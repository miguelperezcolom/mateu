"""Handles a single POST /mateu/v3/sync/{route} call -> a UIIncrement. Port of C#'s SyncHandler."""

from __future__ import annotations

import hashlib
import inspect
import json
import os
import re
import urllib.error
import urllib.request
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Any, get_args, get_origin

from mateu_dtos import (
    Banner as BannerDto,
    ButtonMetadata,
    ClientSideComponent,
    CustomEventRecord,
    FormFieldMetadata,
    DialogMetadata,
    DrawerMetadata,
    HorizontalLayoutMetadata,
    Message as MessageDto,
    ServerSideComponent,
    TextMetadata,
    UICommand,
    UIFragment,
    UIIncrement,
    VerticalLayoutMetadata,
)
from mateu_uidl import (
    DataManagement,
    GanttPage,
    Aggregate,
    ComponentTreeSupplier,
    AggregateFunction,
    CalendarPage,
    Creatable,
    DateRange,
    Deletable,
    Editable,
    Filterable,
    GlobalSearchSupplier,
    GroupBy,
    Label,
    ListingData,
    LookupLabelSupplier,
    Lookup,
    Message,
    Navigable,
    NotificationsSupplier,
    NumberRange,
    PageBanner,
    Pageable,
    Required,
    Searchable,
    SearchRequest,
    Selector,
    SortSpec,
    Step,
    TodoList,
    Version,
    Wizard,
)
from mateu_uidl import components as fluent
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from .mapper import (
    ReflectionMapper,
    capability_class,
    crud_element_type,
    enum_set_element_type,
    is_enum,
    listing_types,
    set_current_audience,
)
from .naming import camel_case, humanize
from .reflection import view_fields
from .registry import MateuRegistry, normalize, type_name
from .yaml_spec_loader import YamlSpecLoader


def _sort_key(value):
    """None-safe, type-stable sort key: (is_none, coerced) so None sorts first and mixed
    numeric/string columns never raise a TypeError."""
    if value is None:
        return (0, 0.0, "")
    if isinstance(value, bool):
        return (1, float(value), "")
    if isinstance(value, (int, float)):
        return (1, float(value), "")
    return (1, 0.0, str(value).lower())


def version_field(entity_class):
    """The entity's ``Version()`` field (walks base classes via ``view_fields``); None when the
    entity declares none — every optimistic-locking step is then a no-op (mirrors Java's
    ``OptimisticLock.versionField``)."""
    return next((f for f in view_fields(entity_class) if f.has(Version)), None)


class RunActionRq(BaseModel):
    """Inbound request (mirrors io.mateu.dtos.RunActionRqDto / the C# RunActionRqDto)."""

    model_config = ConfigDict(populate_by_name=True, alias_generator=to_camel, extra="ignore")

    component_state: dict[str, Any] = Field(default_factory=dict)
    app_state: dict[str, Any] = Field(default_factory=dict)
    parameters: dict[str, Any] = Field(default_factory=dict)
    initiator_component_id: str | None = None
    consumed_route: str | None = None
    action_id: str | None = None
    route: str | None = None
    server_side_type: str | None = None
    server_side_component_route: str | None = None
    #: The structure hash (ETag) the client already holds for this route (phase b of the client
    #: structure cache). When it matches the hash of the structure the server would send, the
    #: server omits the component and replies with only state/data. None = full structure
    #: (mirrors io.mateu.dtos.RunActionRqDto.knownStructureHash).
    known_structure_hash: str | None = None


# The event the edit_in_drawer drawer emits on save: the listing refreshes by re-running its
# search (mirrors Java's Crud.SAVED_IN_DRAWER_EVENT).
SAVED_IN_DRAWER_EVENT = "mateu-crud:saved-in-drawer"


class SyncHandler:
    def __init__(self, registry: MateuRegistry, translator=None, identity_provider=None, secrets_provider=None):
        self.registry = registry
        self.mapper = ReflectionMapper(translator, identity_provider)
        #: resolves ${secret.X} for proxy mode; None → same-named env var fallback.
        self._secrets = secrets_provider
        self.yaml_specs = YamlSpecLoader()

    def handle(self, rq: RunActionRq, request_base_url: str | None = None) -> UIIncrement:
        # 0. Audience projection: the appState value under "audience" (the @app_context selector
        # named audience) filters Audience()-marked members for the whole request.
        set_current_audience(rq.app_state.get("audience"))

        # 0b. Visual-builder contract: the ModelView's bindable fields + actions instead of a render
        # (the tooling POSTs a sync request with the ModelView as serverSideType and this action;
        # mirrors Java's __contract__ reserved action).
        if rq.action_id == "__contract__" and rq.server_side_type:
            cls = self.registry.resolve(rq.server_side_type, rq.route)
            if cls is not None:
                return self._contract_response(cls, rq)

        # 0c. Visual-builder live preview: render arbitrary YAML page text (the plugin's preview
        # pane POSTs the editor buffer under _yaml). No ModelView binding — layout only (mirrors
        # Java's __preview__ reserved action / YamlUidlLoader.parseText).
        if rq.action_id == "__preview__" and rq.parameters.get("_yaml"):
            return self._preview_response(rq.parameters["_yaml"], rq)

        # 0d. Proxy-mode external fetch: a proxy source's renderer POSTs __restfetch__ with
        # _sourceKind/_sourceId + component state; resolve the DECLARED source (never a client url),
        # inject ${secret.X} and fetch server-side, returning the raw JSON on app_data._restfetch
        # (mirrors Java's __restfetch__ reserved action).
        if rq.action_id == "__restfetch__":
            return self._rest_fetch_response(rq)

        # 1. App shell at the root route.
        if not rq.action_id:
            t0 = self.registry.resolve(rq.server_side_type, rq.route)
            if t0 is not None and "__mateu_app__" in t0.__dict__:
                return self.render_app(t0, rq, request_base_url)

        # 2. A Crud (by serverSideType or route prefix) — list / detail / new / edit + actions.
        c = self.resolve_crud(rq)
        if c is not None:
            return self.handle_crud(*c, rq)

        # 2a. A capability Listing (by serverSideType or route prefix) — the listing plus ONLY
        # the routes/actions of the capabilities the class declares (mirrors Java's
        # CapabilityCrud bridging).
        lst = self.resolve_listing(rq)
        if lst is not None:
            return self.handle_listing(*lst, rq)

        type_ = self.registry.resolve(rq.server_side_type, rq.route)
        yaml_spec = self.yaml_specs.load_spec(rq.route)
        if type_ is None and yaml_spec is not None:
            # A route with no view class → a YAML page. A bare layout renders as a static, unbound
            # page; a page that declares modelView: instantiates that logic class (state + actions)
            # and renders the YAML layout bound to it (mirrors Java's ActionInstanceCreator.load_yaml).
            if not yaml_spec.model_view:
                return self.fragment_response(
                    rq.route or "", self.mapper.map_component(yaml_spec.layout), rq
                )
            type_ = self.registry.type_by_name(yaml_spec.model_view)
        if type_ is None:
            return self.error(f"Route not found: {rq.route}")
        # A YAML page bound to this modelView re-applies its layout on every render (first load AND
        # any in-place re-render) so the layout stays authoritative (mirrors Java's
        # ReflectionObjectToComponentMapper.layout_for_route).
        layout_override = (
            yaml_spec.layout
            if yaml_spec is not None and yaml_spec.model_view == type_name(type_)
            else None
        )

        # 2b. The notification inbox's app-level actions — dispatched with the app's
        # serverSideType (the same rail as the @app_context pickers' remote search), exempt
        # from regular action resolution.
        if rq.action_id in ("_notifications-list", "_notifications-read"):
            return self.notifications_action(type_, rq)

        # 2c. The command palette's entity search — same app-level rail (mirrors Java's
        # GlobalSearchActionRunner).
        if rq.action_id == "_globalsearch":
            return self.global_search_action(type_, rq)

        # 3. A wizard.
        if issubclass(type_, Wizard):
            return self.handle_wizard(type_, rq)

        # 4. A plain view.
        instance = type_()
        self.bind_state(instance, rq.component_state)
        if isinstance(instance, (TodoList, CalendarPage)):
            # The archetype's data (and its click's action_on) may depend on the inbound
            # request — the port's analogue of Java's HttpRequest injection.
            instance.http_request = rq
        if rq.action_id and rq.action_id.startswith("search-"):
            return self.field_search(instance, rq)
        if rq.action_id and rq.action_id.startswith("codesearch-"):
            return self.field_code_search(type_, rq)
        if not rq.action_id:
            return self.render(type_, instance, rq, layout_override)
        # 4b. Archetype in-place actions (CollectionDetail / GeneralOverview): selection, search
        # filtering and record switching mutate the bound state and re-render the tree — no
        # navigation, no method dispatch.
        if isinstance(instance, ComponentTreeSupplier):
            if rq.action_id == "selectCollectionItem":
                raw = rq.parameters.get("_item") if rq.parameters else None
                instance.selected_id = None if raw is None else str(raw)
                return self.render(type_, instance, rq)
            if rq.action_id in ("filterCollection", "switchRecord"):
                return self.render(type_, instance, rq)
        # 4c. A CalendarPage's built-in actions: the toolbar chevrons/Today move the displayed
        # month and re-render (re-running events for the new month); an event click ACTS on the
        # event — the frontend sends it as parameters._clickedEvent = {id, title, date, color}
        # and the archetype finds it back by id, its action_on result mapping as a regular
        # action result (a route string → NavigateTo); "+ Create" runs create_action. Unknown
        # events / None results just re-render the page (mirrors Java's CalendarPage actions
        # returning `this`).
        if isinstance(instance, CalendarPage):
            if rq.action_id == "openCalendarEvent":
                opened = instance.open_calendar_event(self._clicked_event_id(rq))
                return self.map_result(opened, rq) if opened is not None else self.render(type_, instance, rq)
            if rq.action_id == "previousCalendarMonth":
                instance.previous_calendar_month()
                return self.render(type_, instance, rq)
            if rq.action_id == "nextCalendarMonth":
                instance.next_calendar_month()
                return self.render(type_, instance, rq)
            if rq.action_id == "goCalendarToday":
                instance.go_calendar_today()
                return self.render(type_, instance, rq)
            if rq.action_id == "createCalendarEvent":
                created = instance.create_calendar_event()
                return self.map_result(created, rq) if created is not None else self.render(type_, instance, rq)
        # 4d. A GanttPage bar click ACTS on the task: the frontend sends its id as
        # parameters._clickedTaskId and the archetype opens it in a side Drawer (mirrors Java's
        # GanttPage.select_gantt_task). Unknown task / None just re-renders the canvas.
        if isinstance(instance, GanttPage) and rq.action_id == "selectGanttTask":
            clicked = (rq.parameters or {}).get("_clickedTaskId")
            task_id = None if clicked is None else str(clicked)
            drawer = instance.select_gantt_task(task_id)
            return self.map_result(drawer, rq) if drawer is not None else self.render(type_, instance, rq)
        # 4e. A DataManagement toolbar switch flips the active view and re-renders in place.
        if isinstance(instance, DataManagement) and rq.action_id in ("switchToGrid", "switchToGantt"):
            instance.view = "gantt" if rq.action_id == "switchToGantt" else "grid"
            return self.render(type_, instance, rq)
        return self.run_action(type_, instance, rq)

    @staticmethod
    def _clicked_event_id(rq: RunActionRq) -> str | None:
        """The id inside the calendar's ``_clickedEvent`` action parameter — a map
        ``{id, title, date, color}`` the frontend sends with every "openCalendarEvent" dispatch
        (mirrors Java reading ``httpRequest.runActionRq().parameters().get("_clickedEvent")`` as
        a Map)."""
        clicked = (rq.parameters or {}).get("_clickedEvent")
        if isinstance(clicked, dict) and clicked.get("id") is not None:
            return str(clicked.get("id"))
        return None

    # ── Wizard ─────────────────────────────────────────────────────────────────
    def handle_wizard(self, type_, rq: RunActionRq) -> UIIncrement:
        wizard = type_()
        self.bind_state(wizard, rq.component_state)
        step = self.step_of(rq)
        steps = [(f.marker(Step).step if f.has(Step) else 1) for f in view_fields(type_)]
        total = max(steps, default=1)
        route = "/" + normalize(getattr(type_, "__mateu_ui__", ""))

        if rq.action_id == "back":
            step = max(1, step - 1)
        elif rq.action_id == "next" and step >= total:
            return self.map_result(wizard.complete())
        elif rq.action_id == "next":
            wizard.on_next(step, step + 1)
            step += 1
        elif rq.action_id == "goToStep":
            # The drawer step pager's jump-to-step: `_stepId` = the bullet id "step-N"; jump only
            # BACKWARD (to an already-visited step) so we never skip a step's validation forward.
            target = self._go_to_step_target(rq)
            if target is not None and 1 <= target < step:
                step = target
        return self.fragment_response(self.title(type_), self.mapper.map_wizard(type_, wizard, route, step), rq)

    @staticmethod
    def _go_to_step_target(rq: RunActionRq) -> int | None:
        params = rq.parameters or {}
        sid = params.get("_stepId") if isinstance(params, dict) else None
        if isinstance(sid, str) and sid.startswith("step-"):
            try:
                return int(sid[5:])
            except ValueError:
                return None
        return None

    @staticmethod
    def step_of(rq: RunActionRq) -> int:
        v = rq.component_state.get("__step")
        return int(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else 1

    # ── CRUD ───────────────────────────────────────────────────────────────────
    def resolve_crud(self, rq: RunActionRq):
        if rq.server_side_type:
            by_name = self.registry.resolve(rq.server_side_type, None)
            if by_name is not None and crud_element_type(by_name) is not None:
                base = "/" + normalize(getattr(by_name, "__mateu_ui__", ""))
                return by_name, crud_element_type(by_name), base
        pref = self.registry.resolve_by_prefix(rq.route)
        if pref is not None:
            t, base = pref
            el = crud_element_type(t)
            if el is not None:
                return t, el, "/" + base
        return None

    # ── Capability listings (Listing + Searchable/Filterable/Navigable/Editable/Creatable/
    # Deletable — mirrors Java's CapabilityCrud) ─────────────────────────────────

    def resolve_listing(self, rq: RunActionRq):
        """The capability Listing addressed by the request (by serverSideType, or by route
        prefix so the /:id — /:id/edit — /new sub-routes of its declared capabilities resolve),
        with its base route."""
        if rq.server_side_type:
            by_name = self.registry.resolve(rq.server_side_type, None)
            if by_name is not None and listing_types(by_name) is not None:
                return by_name, "/" + normalize(getattr(by_name, "__mateu_ui__", ""))
        pref = self.registry.resolve_by_prefix(rq.route)
        if pref is not None:
            t, base = pref
            if listing_types(t) is not None:
                return t, "/" + base
        return None

    @staticmethod
    def _invoke(method, *args):
        """Calls a listing/capability method passing as many of ``args`` as its signature
        accepts — so the trailing ``http`` request argument is optional in overrides (the
        port's analogue of Java's optional HttpRequest injection)."""
        try:
            sig = inspect.signature(method)
        except (TypeError, ValueError):
            return method(*args)
        if any(p.kind == p.VAR_POSITIONAL for p in sig.parameters.values()):
            return method(*args)
        arity = len([
            p for p in sig.parameters.values()
            if p.kind in (p.POSITIONAL_OR_KEYWORD, p.POSITIONAL_ONLY)
        ])
        return method(*args[:arity])

    @staticmethod
    def _selected_ids(rq: RunActionRq) -> list[str]:
        """The ids of the rows selected in the grid (componentState crud_selected_items)."""
        raw = (rq.component_state or {}).get("crud_selected_items")
        return [
            str(item.get("id"))
            for item in (raw if isinstance(raw, list) else [])
            if isinstance(item, dict) and item.get("id") is not None
        ]

    def handle_listing(self, cls, base_route, rq: RunActionRq) -> UIIncrement:
        view = cls()
        filters_type, row_type = listing_types(cls)
        aid = rq.action_id
        navigable = issubclass(cls, Navigable)
        editable = issubclass(cls, Editable)
        creatable = issubclass(cls, Creatable)
        deletable = issubclass(cls, Deletable)
        # Editable without Navigable = the "editable listing": rows open the editor in a
        # drawer over the listing (mirrors Java's CapabilityCrud.editInDrawer).
        drawer_editor = editable and not navigable
        editor_type = capability_class(cls, Editable) or row_type
        form_type = capability_class(cls, Creatable) or row_type

        if aid and aid.startswith("search-"):
            return self.field_search(view, rq)
        if aid and aid.startswith("codesearch-"):
            return self.field_code_search(cls, rq)
        if aid == "search":
            return self.listing_search(view, rq)
        # A selector dialog's row pick: write (id, label) back into the host field.
        if aid == "action-on-row-select" and issubclass(cls, Selector):
            return self.selector_row_selected(view, row_type, rq)
        # A @list_toolbar_button bulk method declared on the listing itself.
        if aid and aid.startswith("action-on-row-"):
            return self.listing_bulk_action(view, cls, row_type, rq)

        if navigable and aid == "view":
            row_id = self._row_id(rq)
            if row_id is not None:
                return self.navigate(f"{base_route}/{row_id}", None, rq)
        if drawer_editor:
            if aid in ("view", "edit"):
                row_id = self._row_id(rq)
                if row_id is not None:
                    editor = self._invoke(view.edit, row_id, rq)
                    return self.crud_drawer(
                        cls, editor_type or type(editor), editor, "edit",
                        f"{base_route}/{row_id}/edit", rq, save_action_id="save",
                    )
            if creatable and aid == "new":
                form = self._invoke(view.creation_form, rq)
                return self.crud_drawer(
                    cls, form_type or type(form), form, "new", f"{base_route}/new", rq,
                )
            if aid in ("cancel-new", "cancel-edit", "cancel-view"):
                close = UICommand.close_modal()
                return UIIncrement(
                    commands=[close.model_copy(update={"target_component_id": self.target(rq)})]
                )
        if editable and aid == "save":
            editor = editor_type()
            self.bind_state(editor, rq.component_state or {})
            saved_id = self._invoke(view.save, editor, rq)
            if drawer_editor:
                return self._close_drawer_and_research(rq)
            back = f"{base_route}/{saved_id}" if saved_id is not None else base_route
            return self.navigate(back, "Saved", rq)
        if creatable and aid == "create":
            form = form_type()
            self.bind_state(form, rq.component_state or {})
            self._invoke(view.create, form, rq)
            if drawer_editor:
                return self._close_drawer_and_research(rq)
            return self.navigate(base_route, "Saved", rq)
        if deletable and aid == "delete":
            self._invoke(view.delete_all_by_id, self._selected_ids(rq), rq)
            refreshed = self.listing_search(view, rq)
            return refreshed.model_copy(update={"messages": [
                MessageDto(variant="success", position="middle", title="", text="Deleted", duration=3000)
            ]})

        if aid in (None, ""):
            mode, id_ = self.parse_crud_route(base_route, rq.route)
            if mode == "new" and creatable:
                form = self._invoke(view.creation_form, rq)
                return self.fragment_response(
                    self.title(cls),
                    self.mapper.map_entity_form(
                        cls, form_type or type(form), form, "new", f"{base_route}/new",
                        can_edit=editable, can_create=creatable,
                    ),
                    rq,
                )
            if mode == "view" and navigable and id_ is not None:
                detail = self._invoke(view.view, id_, rq)
                return self.fragment_response(
                    self.title(cls),
                    self.mapper.map_entity_form(
                        cls, type(detail), detail, "view", f"{base_route}/{id_}",
                        can_edit=editable, can_create=creatable,
                    ),
                    rq,
                )
            if mode == "edit" and editable and id_ is not None:
                editor = self._invoke(view.edit, id_, rq)
                return self.fragment_response(
                    self.title(cls),
                    self.mapper.map_entity_form(
                        cls, editor_type or type(editor), editor, "edit",
                        f"{base_route}/{id_}/edit", can_edit=editable, can_create=creatable,
                        save_action_id="save",
                    ),
                    rq,
                )
            return self.render(cls, view, rq)
        # Anything else: a @button/@toolbar method declared on the listing class.
        return self.run_action(cls, view, rq)

    def _close_drawer_and_research(self, rq: RunActionRq) -> UIIncrement:
        """Drawer-editor save/create: no navigation — close the drawer emitting the saved event
        and re-run the listing's search in place (same contract as the edit_in_drawer crud)."""
        close = UICommand.close_modal(SAVED_IN_DRAWER_EVENT)
        return UIIncrement(
            commands=[
                close.model_copy(update={"target_component_id": self.target(rq)}),
                UICommand(
                    target_component_id=self.target(rq),
                    type="RunAction",
                    data={"actionId": "search", "targetComponentId": self.target(rq)},
                ),
            ],
            messages=[MessageDto(variant="success", position="middle", title="", text="Saved", duration=3000)],
        )

    def listing_bulk_action(self, view, cls, row_type, rq: RunActionRq) -> UIIncrement:
        """A @list_toolbar_button bulk action on a capability listing: runs the named method
        with the grid's selected rows rebuilt as typed Row objects; a None result re-runs the
        search so the listing reflects the changes."""
        name = self._resolve_action(cls, rq.action_id[len("action-on-row-"):])
        if name is None:
            return self.error(f"Action not found: {rq.action_id}")
        method = getattr(view, name)
        result = method(*self._build_bulk_arguments(method, row_type, rq))
        if result is not None:
            return self.map_result(result, rq)
        return self.listing_search(view, rq)

    def build_search_request(self, view, filters_type, rq: RunActionRq) -> SearchRequest:
        """Builds the SearchRequest from the component state (mirrors Java's
        SearchRequestBuilder): free text only when the listing is Searchable (empty otherwise),
        the hydrated filters object only when it is Filterable, and the Pageable — sort entries
        accept both the fieldId key (declarative grid) and the field key (crud grid)."""
        state = rq.component_state or {}
        search_text = (self.search_text(rq) or "") if isinstance(view, Searchable) else ""
        filters = (
            self.assemble_filters(filters_type, state)
            if isinstance(view, Filterable) and filters_type is not None
            else None
        )
        sort = tuple(
            SortSpec(
                field=str(s.get("fieldId") or s.get("field") or ""),
                descending=s.get("direction") == "descending",
            )
            for s in (state.get("sort") or [])
            if isinstance(s, dict) and s.get("direction") is not None
        )
        return SearchRequest(
            search_text=search_text,
            filters=filters,
            pageable=Pageable(
                page=int(state.get("page", 0) or 0),
                size=int(state.get("size", 10) or 10),
                sort=sort,
            ),
        )

    def handle_crud(self, crud_type, element, base_route, rq: RunActionRq) -> UIIncrement:
        crud = crud_type()
        mode, id_ = self.parse_crud_route(base_route, rq.route)
        aid = rq.action_id

        # A Lookup() field on the entity form searches its options through the crud view.
        if aid and aid.startswith("search-"):
            return self.field_search(crud, rq)
        # A Searchable() field on the entity form opens its selector dialog.
        if aid and aid.startswith("codesearch-"):
            return self.field_code_search(element, rq)

        if aid == "search":
            return self.crud_search(crud, element, rq)
        if aid in ("create", "save"):
            return self.crud_save(crud, element, id_, rq, base_route)
        if aid == "update-row":
            return self.update_row(crud, element, rq)
        if aid == "delete":
            return self.navigate(base_route, None if id_ is None else self.delete(crud, id_), rq)
        # edit_in_drawer (the Redwood "Create and Edit - Drawer" template): New and row clicks
        # open the crud form in a Drawer over the listing instead of navigating; cancels just
        # close it. Route-based /new — /{id}/edit deep links keep working unchanged.
        if getattr(crud_type, "__mateu_edit_in_drawer__", False):
            if aid == "new":
                return self.crud_drawer(crud_type, element, element(), "new", f"{base_route}/new", rq)
            if aid in ("view", "edit"):
                row_id = self._row_id(rq)
                if row_id is not None:
                    return self.crud_drawer(
                        crud_type, element, self.get_or_new(crud, element, row_id), "edit",
                        f"{base_route}/{row_id}/edit", rq,
                    )
            if aid in ("cancel-new", "cancel-edit", "cancel-view"):
                close = UICommand.close_modal()
                return UIIncrement(commands=[close.model_copy(update={"target_component_id": self.target(rq)})])
        if aid in (None, ""):
            if mode == "new":
                return self.render_entity(crud_type, element, element(), "new", f"{base_route}/new")
            if mode == "view":
                return self.render_entity(
                    crud_type, element, self.get_or_new(crud, element, id_), "view", f"{base_route}/{id_}"
                )
            if mode == "edit":
                return self.render_entity(
                    crud_type, element, self.get_or_new(crud, element, id_), "edit", f"{base_route}/{id_}/edit"
                )
            return self.fragment_response(self.title(crud_type), self.mapper.map_view(crud_type, crud, base_route), rq)
        if aid.startswith("action-on-row-"):
            return self.action_on_rows(crud, crud_type, element, rq)
        return self.error(f"Action not found: {aid}")

    def action_on_rows(self, crud, crud_type, element, rq: RunActionRq) -> UIIncrement:
        """A @list_toolbar_button bulk action: runs the named method on the crud with the grid's
        selected rows (componentState crud_selected_items) rebuilt as typed entities — a
        ``list[Row]``-annotated parameter receives them. A None result re-runs the search so the
        listing reflects the changes; anything else maps as a regular action result (mirrors
        Java's ActionOnRowActionHandler)."""
        name = self._resolve_action(crud_type, rq.action_id[len("action-on-row-"):])
        if name is None:
            return self.error(f"Action not found: {rq.action_id}")
        method = getattr(crud, name)
        result = method(*self._build_bulk_arguments(method, element, rq))
        if result is not None:
            return self.map_result(result, rq)
        return self.crud_search(crud, element, rq)

    def _build_bulk_arguments(self, method, element, rq: RunActionRq) -> list:
        """Fills a bulk method's parameters: a ``list[Row]`` (or bare ``list``) parameter
        receives the selected rows rebuilt as typed entities (the same bind_state path
        update-row uses); anything unfillable is None."""
        params = [
            p for p in inspect.signature(method).parameters.values()
            if p.kind in (p.POSITIONAL_OR_KEYWORD, p.POSITIONAL_ONLY)
        ]
        if not params:
            return []
        raw = (rq.component_state or {}).get("crud_selected_items")
        selection = raw if isinstance(raw, list) else []
        args = []
        for p in params:
            row_type = self._selected_row_type(p.annotation, element)
            if row_type is None:
                args.append(None)
                continue
            rows = []
            for item in selection:
                if isinstance(item, dict):
                    row = row_type()
                    self.bind_state(row, item)
                    rows.append(row)
            args.append(rows)
        return args

    @staticmethod
    def _selected_row_type(annotation, element):
        """The row type of a ``list[Row]`` parameter (a bare ``list`` defaults to the crud
        element type)."""
        if annotation is list:
            return element
        if get_origin(annotation) is list:
            args = get_args(annotation)
            return args[0] if args and isinstance(args[0], type) else element
        return None

    @staticmethod
    def parse_crud_route(base_route: str, route: str | None):
        r = "/" + normalize(route)
        bp = base_route.rstrip("/")
        suffix = r[len(bp):].strip("/") if len(r) > len(bp) and r.startswith(bp) else ""
        if suffix == "":
            return "list", None
        if suffix == "new":
            return "new", None
        parts = suffix.split("/")
        if len(parts) >= 2 and parts[1] == "edit":
            return "edit", parts[0]
        return "view", parts[0]

    def crud_drawer(
        self, crud_type, element, entity, mode, route, rq: RunActionRq,
        save_action_id: str = "create",
    ) -> UIIncrement:
        """The edit_in_drawer create/edit form: the same entity form the /new — /{id}/edit routes
        render, wrapped in a Drawer emitted as an Add fragment over the listing."""
        form = self.mapper.map_entity_form(
            crud_type, element, entity, mode, route, save_action_id=save_action_id
        )
        drawer = ClientSideComponent(
            metadata=DrawerMetadata(
                id="crud-edit-drawer",
                header_title="New" if mode == "new" else "Edit",
                content=form,
                width="36rem",
            ),
            id="crud-edit-drawer",
        )
        return UIIncrement(
            fragments=[
                UIFragment(
                    target_component_id=self.target(rq),
                    component=drawer,
                    data=self.lookup_labels(element, entity, crud_type()),
                    action="Add",
                )
            ]
        )

    def _row_id(self, rq: RunActionRq) -> str | None:
        raw = rq.parameters.get("id") if rq.parameters else None
        if raw is None:
            raw = rq.component_state.get("id") if rq.component_state else None
        return None if raw is None else str(raw)

    def render_entity(self, crud_type, element, entity, mode, route, rq: RunActionRq | None = None) -> UIIncrement:
        return self.fragment_response(
            self.title(crud_type),
            self.mapper.map_entity_form(crud_type, element, entity, mode, route),
            rq,
            self.lookup_labels(element, entity, crud_type()),
        )

    def crud_save(self, crud, element, id_, rq: RunActionRq, base_route) -> UIIncrement:
        entity = self.get_or_new(crud, element, id_) if id_ is not None else element()
        # Optimistic locking (Version()): an EDITOR save (creates don't check/bump) whose version
        # is older than the stored one is rejected with the reload/overwrite conflict dialog —
        # BEFORE the state binds, so the stored entity is never mutated on a conflict (mirrors
        # Java's FilteredAutoCrud.save → OptimisticLock.check/bump).
        version = version_field(element) if id_ is not None else None
        stored_version = None
        if version is not None and crud.get(id_) is not None:
            stored_version = self._version_of(crud.get(id_), version)
            if not self._force_overwrite(rq):
                raw = rq.component_state.get(camel_case(version.name))
                incoming_version = (
                    int(raw)
                    if isinstance(raw, (int, float)) and not isinstance(raw, bool)
                    else stored_version
                )
                if stored_version > incoming_version:
                    return self.conflict_response(
                        "Este registro ha cambiado mientras lo editabas. Puedes recargar para"
                        " ver los cambios (perdiendo los tuyos) o sobrescribir con tu versión.",
                        "cancel-edit",
                        rq.action_id,
                        rq,
                    )
        self.bind_state(entity, rq.component_state)
        if id_ is not None:
            setattr(entity, "id", id_)
        missing = self.required_missing(entity, element)
        if missing:
            return self.error("Please fill: " + ", ".join(missing))
        if version is not None:
            if stored_version is not None and self._force_overwrite(rq):
                # the user chose to overwrite from the conflict dialog: adopt the STORED version
                # so the bump below moves it forward instead of resurrecting the stale one
                setattr(entity, version.name, stored_version)
            setattr(entity, version.name, self._version_of(entity, version) + 1)
        crud.save(entity)
        if getattr(type(crud), "__mateu_edit_in_drawer__", False):
            # drawer mode: no navigation — close the drawer emitting the saved event and re-run
            # the listing's search in place so the new/edited row shows up.
            close = UICommand.close_modal(SAVED_IN_DRAWER_EVENT)
            return UIIncrement(
                commands=[
                    close.model_copy(update={"target_component_id": self.target(rq)}),
                    UICommand(
                        target_component_id=self.target(rq),
                        type="RunAction",
                        data={"actionId": "search", "targetComponentId": self.target(rq)},
                    ),
                ],
                messages=[MessageDto(variant="success", position="middle", title="", text="Saved", duration=3000)],
            )
        return self.navigate(base_route, "Saved", rq)

    def field_search(self, instance, rq: RunActionRq) -> UIIncrement:
        """Answers a lookup field's ``search-<fieldId>`` action: the view's ``options(field_name)``
        options for that field, filtered by the typed text (case-insensitive containment on the
        label) and paged, returned as a data-only fragment keyed by the field (mirrors Java's
        SearchFieldActionRunner)."""
        field_id = rq.action_id[len("search-"):]
        options = self.mapper._supplied_options(instance, field_id)
        if not options:
            return self.error(f"no lookup options supplier found for field {field_id}")

        params = rq.parameters or {}
        search_text = str(params.get("searchText") or "").lower()
        page = int(params.get("page") or 0)
        size = int(params.get("size") or 50)
        if size <= 0:
            size = 50

        matching = [o for o in options if not search_text or search_text in o.label.lower()]
        content = matching[page * size : (page + 1) * size]
        data = {
            field_id: {
                "content": [o.model_dump(by_alias=True) for o in content],
                "pageSize": size,
                "pageNumber": page,
                "totalElements": len(matching),
            }
        }
        return UIIncrement.of(
            fragments=[
                UIFragment(
                    target_component_id=rq.initiator_component_id or "ux_main",
                    data=data,
                    action="Replace",
                )
            ]
        )

    def update_row(self, crud, element, rq: RunActionRq) -> UIIncrement:
        """Persists a single row edited in place in the listing grid (inline editing). The edited
        row travels in the _editedRow action parameter (mirrors Java's UpdateRowActionHandler →
        FilteredAutoCrud.updateRow: rebuild the entity, save)."""
        row = (rq.parameters or {}).get("_editedRow")
        if not isinstance(row, dict):
            return self.error("update-row requires an _editedRow parameter")
        entity = element()
        self.bind_state(entity, row)
        # Optimistic locking (Version()): an inline-edit over someone else's save is rejected
        # with the same reload/overwrite dialog; Sobrescribir re-sends the SAME edited row (the
        # button's parameters merge into the action request), Recargar re-runs the search
        # (mirrors Java's FilteredAutoCrud.updateRow + UpdateRowActionHandler).
        version = version_field(element)
        if version is not None:
            stored = crud.get(crud.id_of(entity))
            if stored is not None:
                stored_version = self._version_of(stored, version)
                if self._force_overwrite(rq):
                    # adopt the STORED version so the bump moves it forward, never backwards
                    setattr(entity, version.name, stored_version)
                elif stored_version > self._version_of(entity, version):
                    return self.conflict_response(
                        "Esta fila ha cambiado mientras la editabas. Recarga para ver los"
                        " cambios o sobrescribe con tu versión.",
                        "search",
                        "update-row",
                        rq,
                        {"_editedRow": row},
                    )
            setattr(entity, version.name, self._version_of(entity, version) + 1)
        crud.save(entity)
        return UIIncrement.of(
            messages=[MessageDto(variant="success", position="middle", title="", text="Saved", duration=3000)]
        )

    # ── Optimistic locking (Version(), mirrors Java's OptimisticLock) ────────────
    @staticmethod
    def _version_of(entity, version) -> int:
        v = getattr(entity, version.name, 0)
        return int(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else 0

    @staticmethod
    def _force_overwrite(rq: RunActionRq) -> bool:
        """The conflict dialog's explicit override: the Sobrescribir button re-dispatches the
        save with ``_forceOverwrite`` (a bool, or "true" from a serialized round-trip)."""
        v = (rq.parameters or {}).get("_forceOverwrite")
        if isinstance(v, bool):
            return v
        return v is not None and str(v).lower() == "true"

    def conflict_response(
        self, text, reload_action_id, overwrite_action_id, rq: RunActionRq,
        overwrite_parameters: dict | None = None,
    ) -> UIIncrement:
        """The optimistic-lock conflict dialog: reload (discard my changes and see theirs) or
        overwrite (my version wins, explicitly — the Sobrescribir button re-dispatches the save
        action with ``_forceOverwrite`` merged into its parameters). Emitted as an Add fragment
        on the initiator like every overlay (mirrors Java's OptimisticLock.conflictDialog)."""
        parameters: dict[str, Any] = {"_forceOverwrite": True}
        if overwrite_parameters:
            parameters.update(overwrite_parameters)
        buttons = ClientSideComponent(
            metadata=HorizontalLayoutMetadata(),
            children=[
                ClientSideComponent(
                    metadata=ButtonMetadata(label="Recargar", action_id=reload_action_id),
                    children=[],
                ),
                ClientSideComponent(
                    metadata=ButtonMetadata(
                        label="Sobrescribir", action_id=overwrite_action_id,
                        button_style="primary", parameters=parameters,
                    ),
                    children=[],
                ),
            ],
            style="justify-content: flex-end; gap: 0.5rem;",
        )
        dialog = ClientSideComponent(
            metadata=DialogMetadata(
                header_title="Modificado por otro usuario",
                width="30rem",
                content=ClientSideComponent(
                    metadata=VerticalLayoutMetadata(),
                    children=[
                        ClientSideComponent(metadata=TextMetadata(text=text), children=[]),
                        buttons,
                    ],
                ),
            ),
            children=[],
        )
        return UIIncrement.of(
            fragments=[
                UIFragment(target_component_id=self.target(rq), component=dialog, action="Add")
            ]
        )

    def field_code_search(self, host_type, rq: RunActionRq) -> UIIncrement:
        """Opens a ``Searchable()`` field's selector dialog: the selector Listing (with its Select
        column, own actions and OnLoad search) rides as the content of a Dialog emitted as an Add
        fragment; the host field id travels in the selector's initial data so the row pick can
        address it back (mirrors Java's CodeSearchFieldActionRunner)."""
        field_id = rq.action_id[len("codesearch-"):]
        selector_type = None
        for f in view_fields(host_type):
            if camel_case(f.name) == field_id and f.has(Searchable):
                selector_type = f.marker(Searchable).selector
                break
        listing = listing_types(selector_type) if selector_type is not None else None
        if listing is None:
            return self.error(f"no selector found for field {field_id}")

        component = self.mapper.map_listing(selector_type, rq.consumed_route or "")
        component.initial_data = {"_fieldId": field_id}
        dialog = ClientSideComponent(
            metadata=DialogMetadata(content=component), children=[],
        )
        return UIIncrement.of(
            fragments=[
                UIFragment(
                    target_component_id=rq.initiator_component_id or "ux_main",
                    component=dialog,
                    action="Add",
                )
            ]
        )

    def selector_row_selected(self, view, row_type, rq: RunActionRq) -> UIIncrement:
        """A selector dialog's row pick: rebuilds the clicked row, asks the Selector for the
        (id, label) pair and writes it back into the host field via the event bus —
        value-changed sets the value, data-changed the display label, close-modal-requested
        dismisses the dialog (mirrors Java's Listing.handleActionOnRow("select"))."""
        raw = (rq.parameters or {}).get("_clickedRow")
        if not isinstance(raw, dict):
            return self.error("action-on-row-select requires a _clickedRow parameter")
        row = row_type()
        self.bind_state(row, raw)

        selected = view.selected(row)
        field_id = str((rq.component_state or {}).get("_fieldId") or "")
        return UIIncrement.of(
            commands=[
                UICommand(target_component_id=self.target(rq), type="DispatchEvent",
                          data=CustomEventRecord(event_name="value-changed",
                                                 detail={"fieldId": field_id, "value": selected.id})),
                UICommand(target_component_id=self.target(rq), type="DispatchEvent",
                          data=CustomEventRecord(event_name="data-changed",
                                                 detail={"key": field_id + "-label", "value": selected.label})),
                UICommand(target_component_id=self.target(rq), type="DispatchEvent",
                          data=CustomEventRecord(event_name="close-modal-requested")),
            ]
        )

    def listing_search(self, view, rq: RunActionRq) -> UIIncrement:
        """A capability Listing's search: builds the :class:`SearchRequest` — free text only
        when the listing is Searchable, and when it is Filterable the TYPED filters hydrated
        from the component state (``<field>_from``/``<field>_to`` keys assemble into
        DateRange/NumberRange, value lists — or comma-joined strings after a URL restore —
        into enum sets, blank/unparseable bounds and stale constants dropped, mirroring Java's
        FilterStateAssembler) — calls ``search(request, http)`` and sorts + paginates the
        returned rows (unless the ListingData carries its own total: database pushdown, the
        rows are the already-paged window)."""
        filters_type, row_type = listing_types(type(view)) or (None, None)
        request = self.build_search_request(view, filters_type, rq)
        found = self._invoke(view.search, request, rq)
        props = view_fields(row_type) if row_type is not None else []
        if isinstance(found, ListingData):
            if found.total_elements is not None:
                rows = [self._row_dict(item, props) for item in found.rows]
                data = {"crud": {"page": {
                    "content": rows,
                    "pageSize": request.pageable.size,
                    "pageNumber": request.pageable.page,
                    "totalElements": found.total_elements,
                }}}
                return UIIncrement.of(
                    fragments=[UIFragment(target_component_id=self.target(rq), data=data, action="Replace")]
                )
            items = list(found.rows)
        else:
            items = list(found or [])
        return self._page_rows(items, props, rq)

    def assemble_filters(self, filters_type, state: dict):
        filters = filters_type()

        def bound(key: str) -> str | None:
            raw = state.get(key)
            return str(raw) if raw is not None and str(raw).strip() != "" else None

        for f in view_fields(filters_type):
            key = camel_case(f.name)
            t = f.type
            if t is DateRange:
                lower = self._parse_date(bound(key + "_from"))
                upper = self._parse_date(bound(key + "_to"))
                if lower is not None or upper is not None:
                    setattr(filters, f.name, DateRange(from_=lower, to=upper))
            elif t is NumberRange:
                lower = self._parse_number(bound(key + "_from"))
                upper = self._parse_number(bound(key + "_to"))
                if lower is not None or upper is not None:
                    setattr(filters, f.name, NumberRange(from_=lower, to=upper))
            elif enum_set_element_type(t) is not None:
                if key not in state:
                    continue
                el = enum_set_element_type(t)
                values = set()
                for v in self._multi_values(state[key]):
                    try:
                        values.add(el[v])
                    except KeyError:
                        continue  # stale constant after a URL restore — dropped, not fatal
                setattr(filters, f.name, values)
            elif key in state and state[key] is not None:
                value = self.convert_value(state[key], t)
                if value is not None:
                    setattr(filters, f.name, value)
        return filters

    @staticmethod
    def _parse_date(raw: str | None):
        if not raw:
            return None
        try:
            return date.fromisoformat(raw[:10])
        except ValueError:
            return None

    @staticmethod
    def _parse_number(raw: str | None):
        if not raw:
            return None
        try:
            return float(raw)
        except ValueError:
            return None

    def _page_rows(self, items: list, props, rq: RunActionRq) -> UIIncrement:
        """Sorts (Pageable.sort), paginates and serializes rows into the standard listing data
        fragment — shared by crud and declarative-listing searches."""
        state = rq.component_state or {}
        prop_by_camel = {camel_case(p.name): p.name for p in props}
        for spec in reversed(state.get("sort") or []):
            key = spec.get("fieldId") or spec.get("field") or ""
            field = prop_by_camel.get(key, key)
            if not field:
                continue
            reverse = spec.get("direction", "ascending") == "descending"
            items.sort(key=lambda it, f=field: _sort_key(getattr(it, f, None)), reverse=reverse)
        total = len(items)
        page = int(state.get("page", 0) or 0)
        size = int(state.get("size", 10) or 10)
        if size <= 0:
            size = total or 1
        window = items[page * size : page * size + size]
        rows = [self._row_dict(item, props) for item in window]
        data = {"crud": {"page": {"content": rows, "pageSize": size, "pageNumber": page, "totalElements": total}}}
        return UIIncrement.of(
            fragments=[UIFragment(target_component_id=self.target(rq), data=data, action="Replace")]
        )

    def _row_dict(self, item, props) -> dict:
        """A row as a camelCase dict; a self-referential children list (tree layouts) recurses so
        every level of the hierarchy rides in the same payload."""
        row = {}
        for p in props:
            child_type = ReflectionMapper.grid_row_type(p)
            value = getattr(item, p.name, None)
            if child_type is not None:
                child_props = view_fields(child_type)
                row[camel_case(p.name)] = [self._row_dict(c, child_props) for c in (value or [])]
            else:
                row[camel_case(p.name)] = self.cell_value(value)
        return row

    def crud_search(self, crud, element, rq: RunActionRq) -> UIIncrement:
        props = view_fields(element)
        state = rq.component_state or {}
        spec = self._summary_spec(props)
        # The GroupBy() column is the implicit primary sort, so rows of the same group stay
        # contiguous in the listing (the user's own sort applies within groups; mirrors Java's
        # ListingSummarySpec.prependGroupSort).
        sort = self._prepend_group_sort(list(state.get("sort") or []), spec)

        # Database pushdown: an overridden find runs search+filter+sort+paginate as one query
        # and returns the page with its real total — skip the in-memory pipeline entirely
        # (Aggregate()/GroupBy() summaries are still computed in memory over fetch, the analogue
        # of Java's default CrudRepository.summaries over findAll()).
        pageable = Pageable(
            page=int(state.get("page", 0) or 0),
            size=int(state.get("size", 10) or 10),
            sort=tuple(
                SortSpec(field=s.get("field", ""), descending=s.get("direction") == "descending")
                for s in sort
            ),
        )
        found = crud.find(self.search_text(rq), state, pageable)
        if found is not None:
            rows = [self._row_dict(item, props) for item in found.content]
            crud_data = {"page": {
                "content": rows, "pageSize": pageable.size, "pageNumber": pageable.page,
                "totalElements": found.total_elements,
            }}
            self._attach_summaries(crud_data, spec, lambda: self._filtered_rows(crud, props, rq))
            return UIIncrement.of(
                fragments=[UIFragment(target_component_id=self.target(rq), data={"crud": crud_data}, action="Replace")]
            )

        # filter
        items = self._filtered_rows(crud, props, rq)
        # sort — Pageable.sort is a list of {field, direction:'ascending'|'descending'}; the field
        # is the camelCased column, mapped back to the item attribute.
        prop_by_camel = {camel_case(p.name): p.name for p in props}
        for sort_spec in reversed(sort):
            field = prop_by_camel.get(sort_spec.get("field", ""), sort_spec.get("field", ""))
            if not field:
                continue
            reverse = sort_spec.get("direction", "ascending") == "descending"
            items.sort(key=lambda it, f=field: _sort_key(getattr(it, f, None)), reverse=reverse)
        total = len(items)
        # paginate in memory
        page = int(state.get("page", 0) or 0)
        size = int(state.get("size", 10) or 10)
        if size <= 0:
            size = total or 1
        window = items[page * size : page * size + size]
        rows = [
            {camel_case(p.name): self.cell_value(getattr(item, p.name, None)) for p in props}
            for item in window
        ]
        crud_data = {
            "page": {
                "content": rows,
                "pageSize": size,
                "pageNumber": page,
                "totalElements": total,
            }
        }
        self._attach_summaries(crud_data, spec, lambda: items)
        return UIIncrement.of(
            fragments=[UIFragment(target_component_id=self.target(rq), data={"crud": crud_data}, action="Replace")]
        )

    def _filtered_rows(self, crud, props, rq: RunActionRq) -> list:
        """fetch + the smart-search-bar filters: the WHOLE filtered result set the summaries
        aggregate over (not just the visible page)."""
        state = rq.component_state or {}
        return [
            item
            for item in crud.fetch(self.search_text(rq))
            if self._matches_filters(item, props, state)
        ]

    # ── Listing aggregates + row grouping (Aggregate()/GroupBy(), mirrors Java's
    # ListingSummarySpec + CrudRepository.summaries) ─────────────────────────────

    @staticmethod
    def _summary_spec(props):
        """What the row class asks to be summarized: the Aggregate() columns
        ``(camel_key, field_name, function)`` and the GroupBy() field, read once per request."""
        aggregates = [
            (camel_case(f.name), f.name, f.marker(Aggregate).function)
            for f in props
            if f.has(Aggregate)
        ]
        group_by = next((f.name for f in props if f.has(GroupBy)), None)
        return aggregates, group_by

    @staticmethod
    def _prepend_group_sort(sort: list, spec) -> list:
        """Prepends the group column to the sort (unless the user already sorts by it first),
        deduping any other occurrence of it."""
        _, group_by = spec
        if group_by is None:
            return sort
        group_key = camel_case(group_by)
        if sort and sort[0].get("field") == group_key:
            return sort
        return [{"field": group_key, "direction": "ascending"}] + [
            s for s in sort if s.get("field") != group_key
        ]

    def _attach_summaries(self, crud_data: dict, spec, filtered_rows) -> None:
        """Attaches the aggregation companion of the search next to the page: ``aggregates``
        carries the totals of every Aggregate() column over the WHOLE filtered result set (the
        listing's totals footer) and ``groups`` one summary per GroupBy() group — its value (as
        text), row count and per-group aggregates, sorted case-insensitively by value (mirrors
        Java's ListingData.aggregates/groups filled by CrudRepository.summaries)."""
        aggregates, group_by = spec
        if not aggregates and group_by is None:
            return
        rows = filtered_rows()
        crud_data["aggregates"] = self._aggregate_over(rows, aggregates)
        groups = []
        if group_by is not None:
            by_group: dict[str, list] = {}
            # Java keys groups by String.valueOf(value) — sorted case-insensitively.
            for item in sorted(rows, key=lambda it: str(getattr(it, group_by, None)).casefold()):
                by_group.setdefault(str(getattr(item, group_by, None)), []).append(item)
            groups = [
                {"value": value, "count": len(members), "aggregates": self._aggregate_over(members, aggregates)}
                for value, members in by_group.items()
            ]
        crud_data["groups"] = groups

    @staticmethod
    def _aggregate_over(rows: list, aggregates: list) -> dict:
        """One aggregate per Aggregate() column over ``rows``: count counts non-None values;
        sum/avg/min/max run over the numeric values as floats (a column with no numeric values
        is omitted) — mirrors Java's CrudRepository.aggregateOver."""
        totals: dict[str, Any] = {}
        for key, name, function in aggregates:
            values = [v for v in (getattr(row, name, None) for row in rows) if v is not None]
            if function is AggregateFunction.count:
                totals[key] = len(values)
                continue
            numbers = [
                float(v) for v in values
                if isinstance(v, (int, float, Decimal)) and not isinstance(v, bool)
            ]
            if not numbers:
                continue
            if function is AggregateFunction.sum:
                totals[key] = sum(numbers)
            elif function is AggregateFunction.avg:
                totals[key] = sum(numbers) / len(numbers)
            elif function is AggregateFunction.min:
                totals[key] = min(numbers)
            elif function is AggregateFunction.max:
                totals[key] = max(numbers)
        return totals

    @staticmethod
    def _matches_filters(item, props, state: dict) -> bool:
        """Applies the smart search bar's filter values (component state) over the fetched rows,
        mirroring the Java defaults: strings by case-insensitive containment, bools/numbers by
        equality, enums as IN over the multi-select values (a list, or comma-joined after a URL
        restore), and <field>_from/<field>_to range bounds for temporals and RangeFilter numerics.
        A filter counts as applied when its key is present and non-blank."""
        for p in props:
            key = camel_case(p.name)
            t = p.type
            value = getattr(item, p.name, None)

            if not SyncHandler._in_range(value, t, state.get(key + "_from"), state.get(key + "_to")):
                return False

            if key not in state:
                continue
            raw = state[key]
            if is_enum(t):
                wanted = SyncHandler._multi_values(raw)
                current = value.name if isinstance(value, Enum) else ("" if value is None else str(value))
                if wanted and current not in wanted:
                    return False
                continue
            if raw is None or (isinstance(raw, str) and raw.strip() == ""):
                continue
            if t is str:
                if str(raw).lower() not in ("" if value is None else str(value)).lower():
                    return False
            elif t is bool:
                wanted_bool = raw if isinstance(raw, bool) else str(raw).lower() == "true"
                if value is not wanted_bool:
                    return False
            elif t in (int, float, Decimal):
                try:
                    if value is None or float(value) != float(str(raw)):
                        return False
                except (TypeError, ValueError):
                    pass  # unparseable filter value: ignored rather than fatal
            elif str(value).lower() != str(raw).lower():
                return False
        return True

    @staticmethod
    def _in_range(value, t, from_, to) -> bool:
        """Range bounds compare at date granularity for temporals (the widget picks days) and as
        floats for numerics; blank/unparseable bounds are ignored rather than fatal."""

        def blank(bound) -> bool:
            return bound is None or (isinstance(bound, str) and bound.strip() == "")

        if blank(from_) and blank(to):
            return True
        if value is None:
            return False
        if t in (date, datetime):
            day = value.date() if isinstance(value, datetime) else value

            def parse(bound):
                try:
                    return date.fromisoformat(str(bound).strip()[:10])
                except ValueError:
                    return None

            lower = None if blank(from_) else parse(from_)
            upper = None if blank(to) else parse(to)
            if lower is not None and day < lower:
                return False
            if upper is not None and day > upper:
                return False
            return True
        if t in (int, float, Decimal):

            def parse_num(bound):
                try:
                    return float(str(bound).strip())
                except ValueError:
                    return None

            v = float(value)
            lower = None if blank(from_) else parse_num(from_)
            upper = None if blank(to) else parse_num(to)
            if lower is not None and v < lower:
                return False
            if upper is not None and v > upper:
                return False
        return True

    @staticmethod
    def _multi_values(raw) -> list[str]:
        # multi-select values arrive as a list from a live client, comma-joined after a URL restore
        if raw is None:
            return []
        if isinstance(raw, list):
            return [str(v) for v in raw if str(v) != ""]
        return [v.strip() for v in str(raw).split(",") if v.strip()]

    @staticmethod
    def get_or_new(crud, element, id_):
        return (crud.get(id_) if id_ is not None else None) or element()

    @staticmethod
    def delete(crud, id_) -> str:
        crud.delete(id_)
        return "Deleted"

    @staticmethod
    def required_missing(entity, element) -> list[str]:
        out = []
        for f in view_fields(element):
            if f.has(Required):
                v = getattr(entity, f.name, None)
                if v is None or (isinstance(v, str) and v.strip() == ""):
                    out.append(f.marker(Label).value if f.has(Label) else humanize(f.name))
        return out

    # ── Plain views ─────────────────────────────────────────────────────────────
    def render_app(self, app_type, rq: RunActionRq | None = None, request_base_url: str | None = None) -> UIIncrement:
        title = getattr(app_type, "__mateu_app__")
        return UIIncrement.of(
            commands=[UICommand(target_component_id=self.target(rq), type="SetWindowTitle", data=self.mapper.T(title))],
            fragments=[UIFragment(target_component_id=self.target(rq), component=self.mapper.map_app(app_type, request_base_url), action="Replace")],
        )

    # ── Notification inbox (NotificationsSupplier, mirrors Java's NotificationsActionRunner) ──
    def notifications_action(self, cls, rq: RunActionRq) -> UIIncrement:
        """The notification inbox's app-level actions: ``_notifications-list`` answers the
        supplier's current entries as a data-only fragment under ``_notifications`` (per request,
        so per user); ``_notifications-read`` marks the resolved ids read and answers the
        REFRESHED list. The fragment targets the initiator, like the lookup searches."""
        if not (isinstance(cls, type) and issubclass(cls, NotificationsSupplier)):
            return self.error(
                "the app class does not implement NotificationsSupplier — no inbox to serve"
            )
        supplier = cls()
        if rq.action_id == "_notifications-read":
            supplier.mark_notifications_read(self._notification_read_ids(supplier, rq), rq)
        notifications = supplier.notifications(rq) or []
        data = {"_notifications": [self._notification_json(n) for n in notifications]}
        return UIIncrement.of(
            fragments=[
                UIFragment(target_component_id=self.target(rq), data=data, action="Replace")
            ]
        )

    @staticmethod
    def _notification_read_ids(supplier, rq: RunActionRq) -> list[str]:
        """The ``ids`` parameter: an explicit list, "all" → every currently-unread notification's
        id, or a single bare id."""
        ids = (rq.parameters or {}).get("ids")
        if isinstance(ids, list):
            return [str(v) for v in ids]
        if ids == "all":
            return [n.id for n in (supplier.notifications(rq) or []) if n.unread]
        return [] if ids is None else [str(ids)]

    @staticmethod
    def _notification_json(n) -> dict[str, Any]:
        """One inbox entry on the wire — {id, title, text, route, unread, when} (mirrors
        AppNotification's JSON shape)."""
        return {
            "id": n.id, "title": n.title, "text": n.text,
            "route": n.route, "unread": n.unread, "when": n.when,
        }

    # ── Global entity search (GlobalSearchSupplier, mirrors Java's GlobalSearchActionRunner) ──
    def global_search_action(self, cls, rq: RunActionRq) -> UIIncrement:
        """The command palette's entity search: ``_globalsearch`` with a ``searchText``
        parameter answers the app class's :class:`GlobalSearchSupplier` hits as a data-only
        fragment under ``_globalsearch``. The fragment targets the initiator, like the inbox."""
        if not (isinstance(cls, type) and issubclass(cls, GlobalSearchSupplier)):
            return self.error(
                "the app class does not implement GlobalSearchSupplier — no global search to serve"
            )
        raw = (rq.parameters or {}).get("searchText")
        hits = cls().global_search("" if raw is None else str(raw)) or []
        data = {
            "_globalsearch": [
                {
                    "label": h.label, "description": h.description,
                    "route": h.route, "category": h.category,
                }
                for h in hits
            ]
        }
        return UIIncrement.of(
            fragments=[
                UIFragment(target_component_id=self.target(rq), data=data, action="Replace")
            ]
        )

    def render(self, type_, instance, rq: RunActionRq, layout_override=None) -> UIIncrement:
        route = rq.consumed_route if rq.consumed_route else "_empty"
        return self.fragment_response(
            self.title(type_),
            self.mapper.map_view(type_, instance, route, layout_override),
            rq,
            self.lookup_labels(type_, instance, instance),
        )

    # ── Visual-builder live preview ────────────────────────────────────────────
    def _preview_response(self, yaml_text: str, rq: RunActionRq) -> UIIncrement:
        from mateu_core.yaml_preview import build_from_yaml
        from mateu_uidl import components as fluent

        tree = build_from_yaml(yaml_text) or fluent.Text(text="Invalid YAML")
        return self.fragment_response("Preview", self.mapper.map_component(tree), rq)

    # ── Proxy-mode external fetch (__restfetch__) ───────────────────────────────
    def _rest_fetch_response(self, rq: RunActionRq) -> UIIncrement:
        """Resolve the DECLARED source of the routed view by _sourceKind/_sourceId, interpolate
        ${state.x}/${secret.X}, fetch server-side and return the raw JSON on app_data._restfetch
        (an empty object on any failure — the renderer maps it as in direct mode)."""
        json_obj: Any = {}
        cls = self.registry.resolve(rq.server_side_type, rq.route)
        if cls is not None:
            kind = rq.parameters.get("_sourceKind")
            source_id = rq.parameters.get("_sourceId")
            source = self.mapper.resolve_rest_source(cls, kind, source_id)
            if source is not None:
                json_obj = self._fetch_proxy(source, rq.component_state)
        return UIIncrement(app_data={"_restfetch": json_obj})

    def _fetch_proxy(self, source, state: dict) -> Any:
        """Fetch a resolved source server-side (url/headers/body interpolated); an empty object on
        any non-2xx or transport error."""
        try:
            url = self._interpolate(source.url, state)
            method = (source.method or "GET").upper()
            data = None
            if method not in ("GET", "HEAD") and source.body:
                data = self._interpolate(source.body, state).encode()
            req = urllib.request.Request(url, data=data, method=method)
            req.add_header("Accept", "application/json")
            for name, value in (source.headers or {}).items():
                req.add_header(name, self._interpolate(value, state))
            with urllib.request.urlopen(req, timeout=60) as resp:
                if resp.status >= 400:
                    return {}
                return json.loads(resp.read().decode())
        except (urllib.error.URLError, ValueError, OSError):
            return {}

    def _resolve_secret(self, key: str) -> str | None:
        """Resolve a secret: the injected provider first, then the same-named env var."""
        if self._secrets is not None:
            value = self._secrets(key)
            if value is not None:
                return value
        return os.environ.get(key)

    def _interpolate(self, template: str | None, state: dict) -> str:
        """Interpolate ${state.x}/${secret.X} placeholders (unknown → empty)."""
        if not template:
            return template or ""

        def repl(m: re.Match) -> str:
            expr = m.group(1).strip()
            if expr.startswith("state."):
                v = state.get(expr[6:])
                return "" if v is None else str(v)
            if expr.startswith("secret."):
                return self._resolve_secret(expr[7:]) or ""
            return ""

        return re.sub(r"\$\{([^}]+)\}", repl, template)

    # ── ModelView contract ─────────────────────────────────────────────────────
    def _contract_response(self, cls, rq: RunActionRq) -> UIIncrement:
        instance = cls()
        self.bind_state(instance, rq.component_state)
        component = self.mapper.map_view(cls, instance, rq.consumed_route or "_empty")
        fields: list[dict] = []
        seen: set[str] = set()
        self._collect_fields(component, fields, seen)
        action_ids: list[str] = []
        for action in component.actions or []:
            aid = getattr(action, "id", None)
            if aid and aid not in action_ids:
                action_ids.append(aid)
        contract = {
            "modelView": component.server_side_type,
            "fields": fields,
            "actions": [{"id": aid} for aid in action_ids],
        }
        return UIIncrement(app_data={"_contract": contract})

    # A form field is the metadata of a ClientSideComponent — but components nest inside METADATA
    # records too (a Page/Form/Card holds its content there), so descend into metadata as well.
    def _collect_fields(self, component, fields: list[dict], seen: set[str]) -> None:
        if isinstance(component, ClientSideComponent):
            md = component.metadata
            if isinstance(md, FormFieldMetadata) and md.field_id and md.field_id not in seen:
                seen.add(md.field_id)
                fields.append({
                    "id": md.field_id,
                    "dataType": md.data_type,
                    "stereotype": md.stereotype,
                    "label": md.label,
                    "required": md.required,
                    "readOnly": md.read_only,
                })
            self._walk_metadata(md, fields, seen)
            for child in component.children:
                self._collect_fields(child, fields, seen)
        elif isinstance(component, ServerSideComponent):
            for child in component.children:
                self._collect_fields(child, fields, seen)

    def _walk_metadata(self, md, fields: list[dict], seen: set[str]) -> None:
        if md is None:
            return
        for name in getattr(type(md), "model_fields", {}):
            try:
                value = getattr(md, name)
            except Exception:
                continue
            if isinstance(value, (ClientSideComponent, ServerSideComponent)):
                self._collect_fields(value, fields, seen)
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, (ClientSideComponent, ServerSideComponent)):
                        self._collect_fields(item, fields, seen)

    def run_action(self, type_, instance, rq: RunActionRq) -> UIIncrement:
        name = self._resolve_action(type_, rq.action_id)
        if name is None:
            return self.error(f"Action not found: {rq.action_id}")
        method = getattr(instance, name)
        return self.map_result(method(*self._build_arguments(method, rq)), rq)

    def _build_arguments(self, method, rq: RunActionRq) -> list:
        """Fills a method's parameters from the action request: a row-click's _clickedRow
        parameter is rebuilt into the parameter's annotated class (OnRowSelected() methods take
        the clicked row); anything unfillable is None (mirrors Java's
        RunMethodActionRunner.createParameters)."""
        params = [
            p for p in inspect.signature(method).parameters.values()
            if p.kind in (p.POSITIONAL_OR_KEYWORD, p.POSITIONAL_ONLY)
        ]
        if not params:
            return []
        clicked = (rq.parameters or {}).get("_clickedRow")
        args = []
        for p in params:
            ann = p.annotation
            # The action request itself can be injected (the port's analogue of Java's
            # HttpRequest injection) — e.g. an undoable toast's undo action reads its
            # undoParameters from request.parameters.
            if ann is RunActionRq or (ann is inspect.Parameter.empty and p.name == "request"):
                args.append(rq)
            elif isinstance(clicked, dict) and isinstance(ann, type) and ann is not str:
                row = ann()
                self.bind_state(row, clicked)
                args.append(row)
            else:
                args.append(None)
        return args

    @staticmethod
    def _resolve_action(type_, action_id):
        for klass in type_.__mro__:
            for name, val in vars(klass).items():
                if not name.startswith("__") and callable(val) and camel_case(name) == action_id:
                    return name
        return None

    def map_result(self, result, rq: RunActionRq | None = None) -> UIIncrement:
        if result is None:
            return UIIncrement.of()
        # An overlay (drawer/dialog) → an ADD fragment on the initiator, so it stacks on top of
        # the page instead of replacing it (mirrors Java's FragmentDataSerializer.isOverlay).
        if isinstance(result, (fluent.Drawer, fluent.Dialog)):
            return UIIncrement.of(
                fragments=[
                    UIFragment(
                        target_component_id=(rq.initiator_component_id if rq else None) or "ux_main",
                        component=self.mapper.map_component(result),
                        action="Add",
                    )
                ]
            )
        if isinstance(result, Message):
            return UIIncrement.of(
                messages=[
                    MessageDto(
                        variant=result.variant.value,
                        position="middle",
                        title=result.title,
                        text=result.text,
                        duration=result.duration,
                        undo_label=result.undo_label,
                        undo_action_id=result.undo_action_id,
                        undo_parameters=result.undo_parameters,
                    )
                ]
            )
        # Action-returned page banner(s): PageBanner or a list of them → UIIncrement.banners.
        if isinstance(result, PageBanner) or (
            isinstance(result, list) and result and all(isinstance(b, PageBanner) for b in result)
        ):
            banners = result if isinstance(result, list) else [result]
            return UIIncrement.of(
                banners=[
                    BannerDto(
                        theme=b.theme.value,
                        title=b.title,
                        description=b.description,
                        has_icon=True,
                        has_close_button=b.closeable,
                        timeout_seconds=b.timeout_seconds,
                    )
                    for b in banners
                ]
            )
        # A route string → navigate; a UICommand (dispatchEvent / closeModal) → pass through.
        if isinstance(result, str) and result.startswith("/"):
            return UIIncrement.of(
                commands=[UICommand(target_component_id=self.target(rq), type="NavigateTo", data=result)]
            )
        if isinstance(result, UICommand):
            # Retarget the "ux_main" placeholder at the initiator (the frontend drops commands
            # whose target matches no component id).
            if result.target_component_id == "ux_main" and rq is not None:
                result = result.model_copy(update={"target_component_id": self.target(rq)})
            return UIIncrement.of(commands=[result])
        return UIIncrement.of()

    # ── Helpers ──────────────────────────────────────────────────────────────────
    @staticmethod
    def title(type_) -> str:
        return getattr(type_, "__mateu_title__", humanize(type_.__name__))

    @staticmethod
    def target(rq: RunActionRq | None) -> str:
        """Fragments and commands address the component that initiated the request (the web
        frontend's top ux id is "_ux" — Java echoes the initiator the same way)."""
        return (rq.initiator_component_id if rq else None) or "ux_main"

    def fragment_response(self, title: str, component, rq: RunActionRq | None = None, data=None) -> UIIncrement:
        t = self.target(rq)
        component = self._stamp_or_strip_structure(component, rq)
        return UIIncrement.of(
            commands=[UICommand(target_component_id=t, type="SetWindowTitle", data=title)],
            fragments=[UIFragment(target_component_id=t, component=component, data=data, action="Replace")],
        )

    @staticmethod
    def _stamp_or_strip_structure(component, rq: RunActionRq | None):
        """Structure ETag / template-ref (phase b of the client structure cache): stamp a routed
        component with a stable hash of its structure and, when the client echoed a still-matching
        hash, omit the component so only state/data travel (the frontend merges them onto its
        cached structure). known_structure_hash is only ever sent on a route load, so an action
        re-render can never accidentally strip. Mirrors io.mateu StructureHashPostProcessor."""
        if not isinstance(component, ServerSideComponent):
            return component
        h = SyncHandler._structure_hash(component)
        known = rq.known_structure_hash if rq else None
        # A @static_view is never omitted: the client caches its FULL response the first time it
        # sees it each session and then skips the round-trip entirely, so it must always receive
        # the component (carrying static_view=True) to learn that.
        if known and known == h and not component.static_view:
            return None
        return component.model_copy(update={"structure_hash": h})

    @staticmethod
    def _structure_hash(component: ServerSideComponent) -> str:
        # Normalize away the two per-request fields before hashing so the SAME structure always
        # hashes the same: the top-level id is a fresh value each request (an instance id, not
        # structure) and the hash slot must not feed itself. Nested/structural ids are kept. The
        # client only ever echoes the server's hash, so blanking id here is symmetric. sort_keys
        # gives a canonical order at every nesting level.
        data = component.model_copy(update={"id": "", "structure_hash": None}).model_dump(
            by_alias=True, mode="json"
        )
        canonical = json.dumps(data, sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    def lookup_labels(self, cls, instance, supplier_host) -> dict | None:
        """Display labels for reference fields whose value is already set when the form renders:
        ``Searchable()`` fields ask their selector, ``Lookup()`` fields the view's
        :class:`LookupLabelSupplier` (falling back to a match among its ``options(field_name)``).
        They ride as ``<fieldId>-label`` entries in the fragment data — where the renderer's
        combo looks before showing the raw id (mirrors Java's LookupLabelSupplier)."""
        data = None
        for f in view_fields(cls):
            value = getattr(instance, f.name, None)
            if value is None or str(value) == "":
                continue
            field_id = camel_case(f.name)
            label = None
            searchable = f.marker(Searchable)
            if searchable is not None:
                selector = searchable.selector()
                if isinstance(selector, LookupLabelSupplier):
                    label = selector.label(field_id, value)
            elif f.has(Lookup):
                if isinstance(supplier_host, LookupLabelSupplier):
                    label = supplier_host.label(field_id, value)
                if label is None:
                    for o in self.mapper._supplied_options(supplier_host, field_id):
                        if o.value == str(value):
                            label = o.label
                            break
            if label is not None:
                data = data or {}
                data[field_id + "-label"] = label
        return data

    def navigate(self, route: str, success_text: str | None, rq: RunActionRq | None = None) -> UIIncrement:
        return UIIncrement.of(
            commands=[UICommand(target_component_id=self.target(rq), type="NavigateTo", data=route)],
            messages=[]
            if success_text is None
            else [MessageDto(variant="success", position="middle", title="", text=success_text, duration=3000)],
        )

    @staticmethod
    def error(text: str) -> UIIncrement:
        return UIIncrement.of(
            messages=[MessageDto(variant="error", position="middle", title="", text=text, duration=5000)]
        )

    @staticmethod
    def search_text(rq: RunActionRq) -> str | None:
        v = rq.component_state.get("searchText")
        return v if isinstance(v, str) else None

    @staticmethod
    def cell_value(value):
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.date().isoformat()
        if isinstance(value, date):
            return value.isoformat()
        if isinstance(value, Enum):
            return value.name
        return value

    def bind_state(self, instance, state: dict[str, Any]) -> None:
        for f in view_fields(type(instance)):
            key = camel_case(f.name)
            if key not in state or state[key] is None:
                continue
            row_type = ReflectionMapper.grid_row_type(f)
            if row_type is not None and isinstance(state[key], list):
                # Grid rows arrive as camelCase dicts — rebuild them as typed row objects.
                rows = []
                for raw in state[key]:
                    if isinstance(raw, dict):
                        row = row_type()
                        self.bind_state(row, raw)
                        rows.append(row)
                setattr(instance, f.name, rows)
                continue
            value = self.convert_value(state[key], f.type)
            if value is not None:
                setattr(instance, f.name, value)

    @staticmethod
    def convert_value(raw, target):
        try:
            if raw is None:
                return None
            if target is str:
                return raw if isinstance(raw, str) else str(raw)
            if target is bool:
                return bool(raw)
            if target is int:
                return int(raw)
            if target is float:
                return float(raw)
            if target is Decimal:
                return Decimal(str(raw))
            if target is date:
                return date.fromisoformat(raw)
            if target is datetime:
                return datetime.fromisoformat(raw)
            if isinstance(target, type) and issubclass(target, Enum):
                try:
                    return target[raw]
                except KeyError:
                    return target(raw)
            return raw
        except Exception:
            return None
