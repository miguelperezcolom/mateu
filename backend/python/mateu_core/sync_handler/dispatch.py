"""Request dispatch: route seeds (routes.yaml state/appState/data/appData) and the reserved and routed actions (Java's RunActionUseCase / ActionInstanceCreator)."""

from __future__ import annotations

from mateu_dtos import (
    Action,
    ClientSideComponent,
    RestAction,
    RestDataSource,
    ServerSideComponent,
    Trigger,
    UIIncrement,
)
from mateu_uidl import (
    CalendarPage,
    ComponentTreeSupplier,
    DataManagement,
    GanttPage,
    TodoList,
    Wizard,
)

from .. import capabilities
from ..mapper import set_current_audience
from ..registry import type_name
from ._base import MixinBase
from ._common import (
    _route_seed,
    RunActionRq,
)


class DispatchMixin(MixinBase):
    def _seed_increment(self, inc: UIIncrement, rq: RunActionRq) -> UIIncrement:
        """Apply a matched route's `appState`/`appData` seeds onto the response (component `data`
        rides on the component via the mapper's __restdata__ path; `state` was folded into the
        component state at resolution). appState is merged UNDER the client's app state so the
        route's values are defaults and the persisted @app_context still wins; appData is emitted
        on the app metadata (mirrors ReflectionUiIncrementMapper.mapToAppState + AppDto.appDataSource)."""
        seed = _route_seed.get()
        if seed is None:
            return inc
        entry = seed.entry
        if entry.app_state:
            merged = dict(entry.app_state)
            merged.update(rq.app_state or {})
            inc = inc.model_copy(update={"app_state": merged})
        # `data`: the route names a component-scope source. Advertise the same synthetic
        # __restdata__ action + OnLoad trigger the @rest_data surface uses, so the client fetches it
        # and merges it into the state (mirrors Java's ActionMapper/TriggerMapper reading _routeData).
        if entry.data is not None:
            inc = self._advertise_route_data(inc, entry.data)
        # `appData`: an app-scope source, emitted on the app metadata (AppDto.appDataSource) so the
        # shell fetches it once. Applied only when the response carries the app shell.
        if entry.app_data is not None:
            inc = self._advertise_route_app_data(inc, entry.app_data)
        return inc

    @staticmethod
    def _rest_action_from_ref(source) -> RestAction:
        """A client-side REST descriptor for a route-declared data/appData source (a ref into
        sources.yaml, or an inline endpoint). Blank result_path merges the whole response."""
        return RestAction(
            source=RestDataSource(
                ref=source.ref,
                url=source.url,
                method=source.method,
                body=source.body,
                items_path=source.items_path,
                value_path=source.value_path,
                label_path=source.label_path,
                proxy=source.proxy,
            ),
            success_message=None,
            result_path="",
        )

    def _advertise_route_data(self, inc: UIIncrement, source) -> UIIncrement:
        rest_action = self._rest_action_from_ref(source)
        for i, frag in enumerate(inc.fragments):
            comp = frag.component
            if not isinstance(comp, ServerSideComponent):
                continue
            actions = list(comp.actions or [])
            if not any(a.id == "__restdata__" for a in actions):
                actions.append(
                    Action(id="__restdata__", validation_required=False, rest_action=rest_action)
                )
            triggers = list(comp.triggers or [])
            if not any(
                (isinstance(t, Trigger) and t.type == "OnLoad" and t.action_id == "__restdata__")
                or (isinstance(t, dict) and t.get("type") == "OnLoad" and t.get("actionId") == "__restdata__")
                for t in triggers
            ):
                triggers.append(Trigger(type="OnLoad", action_id="__restdata__"))
            new_comp = comp.model_copy(update={"actions": actions, "triggers": triggers})
            inc.fragments[i] = frag.model_copy(update={"component": new_comp})
            break
        return inc

    def _advertise_route_app_data(self, inc: UIIncrement, source) -> UIIncrement:
        rest_source = RestDataSource(
            ref=source.ref,
            url=source.url,
            method=source.method,
            body=source.body,
            items_path=source.items_path,
            value_path=source.value_path,
            label_path=source.label_path,
            proxy=source.proxy,
        )
        for i, frag in enumerate(inc.fragments):
            comp = frag.component
            if isinstance(comp, ClientSideComponent) and getattr(comp.metadata, "type", None) == "App":
                # app-data becomes a REQUIRED capability the moment an app-scope source is present
                # (the descriptor never contradicts the metadata it is derived from). Sorted+deduped.
                caps = set(getattr(comp.metadata, "required_capabilities", []) or [])
                caps.add(capabilities.APP_DATA)
                new_meta = comp.metadata.model_copy(
                    update={
                        "app_data_source": rest_source,
                        "required_capabilities": sorted(caps),
                    }
                )
                new_comp = comp.model_copy(update={"metadata": new_meta})
                inc.fragments[i] = frag.model_copy(update={"component": new_comp})
                break
        return inc

    def _handle_inner(self, rq: RunActionRq, request_base_url: str | None = None) -> UIIncrement:
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

        # The AUTHORED registry answers before the decorator-declared views — explicit beats
        # derived, the same precedence the layout and page inference already use. Its parameters are
        # folded into the component state here, at the single point every downstream step reads:
        #
        #   fixed > client state > path > defaults
        #
        # The fixed ones are re-applied on the SERVER rather than trusted from the client, because
        # route resolution also runs in the browser (a statically deployed mount has no server to
        # ask) and a parameter pinned only there would be a suggestion, not a constraint.
        route_match = self.routes.match(rq.route)
        type_ = None
        if route_match is not None:
            rq = rq.model_copy(
                update={"component_state": route_match.params(rq.component_state or {})}
            )
            if route_match.entry.view_model:
                type_ = self.registry.type_by_name(route_match.entry.view_model)
        if type_ is None:
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
        # 4a. A list (grid) field's row editing: add / select / create / save / move / remove
        # edit the rows held in the form state (Java's FieldCrudActionRunner).
        list_action = self.list_field_action(type_, rq.action_id)
        if list_action is not None:
            return self.handle_list_field_action(type_, *list_action, rq)
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
        # period (a month, week or day by the view) and the view buttons (parameters._view)
        # switch the view, both re-rendering; a date cell click (parameters._date) runs
        # action_on_day; an event click ACTS on the
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
            if rq.action_id == "switchCalendarView":
                instance.switch_calendar_view((rq.parameters or {}).get("_view"))
                return self.render(type_, instance, rq)
            if rq.action_id == "openCalendarDay":
                opened_day = instance.open_calendar_day((rq.parameters or {}).get("_date"))
                return (
                    self.map_result(opened_day, rq)
                    if opened_day is not None
                    else self.render(type_, instance, rq)
                )
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
        return self.run_action(type_, instance, rq, layout_override)

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
