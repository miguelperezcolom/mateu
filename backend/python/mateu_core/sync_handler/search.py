"""Searching: selectors, lookups, listing and crud search, filters, aggregates and grouping (Java's SearchActionHandler / FilterStateAssembler / CrudStore.find)."""

from __future__ import annotations

from datetime import (
    date,
    datetime,
)
from decimal import Decimal
from enum import Enum
from typing import Any

from mateu_dtos import (
    ClientSideComponent,
    CustomEventRecord,
    DialogMetadata,
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
    ListingData,
    NumberRange,
    Pageable,
    Required,
    Searchable,
    SortSpec,
)

from ..mapper import (
    enum_set_element_type,
    is_enum,
    listing_types,
    ReflectionMapper,
)
from ..naming import (
    camel_case,
    humanize,
)
from ..reflection import view_fields
from ._base import MixinBase
from ._common import (
    _sort_key,
    RunActionRq,
)


class SearchHandlerMixin(MixinBase):
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

            if not SearchHandlerMixin._in_range(value, t, state.get(key + "_from"), state.get(key + "_to")):
                return False

            if key not in state:
                continue
            raw = state[key]
            if is_enum(t):
                wanted = SearchHandlerMixin._multi_values(raw)
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
