"""Resolving the Crud / capability Listing a request targets and handling listing actions (Java's CapabilityCrud bridge / ListRouteResolver)."""

from __future__ import annotations

from typing import Any

import inspect

from mateu_dtos import (
    Message as MessageDto,
    UICommand,
    UIIncrement,
)
from mateu_uidl import (
    Creatable,
    Deletable,
    Editable,
    Filterable,
    Navigable,
    Pageable,
    Searchable,
    SearchRequest,
    Selector,
    SortSpec,
)

from .. import action_guard
from ..mapper import (
    capability_class,
    crud_element_type,
    listing_types,
)
from ..registry import normalize
from ._base import MixinBase
from ._common import (
    RunActionRq,
    SAVED_IN_DRAWER_EVENT,
)


class ListingHandlerMixin(MixinBase):
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
        filters_type, row_type = listing_types(cls) or (None, None)
        aid = rq.action_id
        navigable = issubclass(cls, Navigable)
        editable = issubclass(cls, Editable)
        creatable = issubclass(cls, Creatable)
        deletable = issubclass(cls, Deletable)
        # Editable without Navigable = the "editable listing": rows open the editor in a
        # drawer over the listing (mirrors Java's CapabilityCrud.editInDrawer).
        drawer_editor = editable and not navigable
        editor_type: Any = capability_class(cls, Editable) or row_type
        form_type: Any = capability_class(cls, Creatable) or row_type

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
        # Only a @list_toolbar_button method is a bulk row action (security: the id is wire input).
        fn = action_guard.resolve_row_action(cls, (rq.action_id or "")[len("action-on-row-"):])
        if fn is None:
            return self.error(f"Action not found: {rq.action_id}")
        action_guard.ensure_may_invoke(self.mapper, cls, fn, rq.action_id)
        method = fn.__get__(view, cls)
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
