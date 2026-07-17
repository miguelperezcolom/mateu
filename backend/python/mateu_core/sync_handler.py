"""Handles a single POST /mateu/v3/sync/{route} call -> a UIIncrement. Port of C#'s SyncHandler."""

from __future__ import annotations

import inspect
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Any, get_args, get_origin

from mateu_dtos import (
    Banner as BannerDto,
    ClientSideComponent,
    CustomEventRecord,
    DialogMetadata,
    Message as MessageDto,
    UICommand,
    UIFragment,
    UIIncrement,
)
from mateu_uidl import (
    Aggregate,
    AggregateFunction,
    DateRange,
    GroupBy,
    Label,
    LookupLabelSupplier,
    Lookup,
    Message,
    NumberRange,
    PageBanner,
    Pageable,
    Required,
    Searchable,
    SortSpec,
    Step,
    Wizard,
)
from mateu_uidl import components as fluent
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from .mapper import (
    ReflectionMapper,
    crud_element_type,
    enum_set_element_type,
    is_enum,
    listing_types,
    set_current_audience,
)
from .naming import camel_case, humanize
from .reflection import view_fields
from .registry import MateuRegistry, normalize


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


class SyncHandler:
    def __init__(self, registry: MateuRegistry, translator=None, identity_provider=None):
        self.registry = registry
        self.mapper = ReflectionMapper(translator, identity_provider)

    def handle(self, rq: RunActionRq, request_base_url: str | None = None) -> UIIncrement:
        # 0. Audience projection: the appState value under "audience" (the @app_context selector
        # named audience) filters Audience()-marked members for the whole request.
        set_current_audience(rq.app_state.get("audience"))

        # 1. App shell at the root route.
        if not rq.action_id:
            t0 = self.registry.resolve(rq.server_side_type, rq.route)
            if t0 is not None and "__mateu_app__" in t0.__dict__:
                return self.render_app(t0, rq, request_base_url)

        # 2. A Crud (by serverSideType or route prefix) — list / detail / new / edit + actions.
        c = self.resolve_crud(rq)
        if c is not None:
            return self.handle_crud(*c, rq)

        type_ = self.registry.resolve(rq.server_side_type, rq.route)
        if type_ is None:
            return self.error(f"Route not found: {rq.route}")

        # 3. A wizard.
        if issubclass(type_, Wizard):
            return self.handle_wizard(type_, rq)

        # 3b. A declarative Listing — a read-only searchable listing with typed filters.
        listing = listing_types(type_)
        if listing is not None:
            view = type_()
            if rq.action_id == "search":
                return self.listing_search(view, listing[0], listing[1], rq)
            # A selector dialog's row pick: write (id, label) back into the host field.
            if rq.action_id == "action-on-row-select":
                return self.selector_row_selected(view, listing[1], rq)
            return self.render(type_, view, rq)

        # 4. A plain view.
        instance = type_()
        self.bind_state(instance, rq.component_state)
        if rq.action_id and rq.action_id.startswith("search-"):
            return self.field_search(instance, rq)
        if rq.action_id and rq.action_id.startswith("codesearch-"):
            return self.field_code_search(type_, rq)
        if not rq.action_id:
            return self.render(type_, instance, rq)
        return self.run_action(type_, instance, rq)

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
            step += 1
        return self.fragment_response(self.title(type_), self.mapper.map_wizard(type_, wizard, route, step), rq)

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

    def render_entity(self, crud_type, element, entity, mode, route, rq: RunActionRq | None = None) -> UIIncrement:
        return self.fragment_response(
            self.title(crud_type),
            self.mapper.map_entity_form(crud_type, element, entity, mode, route),
            rq,
            self.lookup_labels(element, entity, crud_type()),
        )

    def crud_save(self, crud, element, id_, rq: RunActionRq, base_route) -> UIIncrement:
        entity = self.get_or_new(crud, element, id_) if id_ is not None else element()
        self.bind_state(entity, rq.component_state)
        if id_ is not None:
            setattr(entity, "id", id_)
        missing = self.required_missing(entity, element)
        if missing:
            return self.error("Please fill: " + ", ".join(missing))
        crud.save(entity)
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
        crud.save(entity)
        return UIIncrement.of(
            messages=[MessageDto(variant="success", position="middle", title="", text="Saved", duration=3000)]
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

        component = self.mapper.map_listing(
            selector_type, listing[0], listing[1], rq.consumed_route or ""
        )
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

    def listing_search(self, view, filters_type, row_type, rq: RunActionRq) -> UIIncrement:
        """A declarative Listing's search: hydrates the TYPED filters from the component state —
        ``<field>_from``/``<field>_to`` keys assemble into DateRange/NumberRange, value lists (or
        comma-joined strings after a URL restore) into enum sets, blank/unparseable bounds and
        stale constants dropped (mirrors Java's FilterStateAssembler) — calls
        ``search(search_text, filters)`` and sorts + paginates the returned rows."""
        filters = self.assemble_filters(filters_type, rq.component_state or {})
        items = list(view.search(self.search_text(rq), filters))
        return self._page_rows(items, view_fields(row_type), rq)

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
            field = prop_by_camel.get(spec.get("field", ""), spec.get("field", ""))
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

    def render(self, type_, instance, rq: RunActionRq) -> UIIncrement:
        route = rq.consumed_route if rq.consumed_route else "_empty"
        return self.fragment_response(
            self.title(type_),
            self.mapper.map_view(type_, instance, route),
            rq,
            self.lookup_labels(type_, instance, instance),
        )

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
            if isinstance(clicked, dict) and isinstance(ann, type) and ann is not str:
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
        return UIIncrement.of(
            commands=[UICommand(target_component_id=t, type="SetWindowTitle", data=title)],
            fragments=[UIFragment(target_component_id=t, component=component, data=data, action="Replace")],
        )

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
