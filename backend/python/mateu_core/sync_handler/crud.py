"""CRUD actions: routes, export, bulk actions, the drawer, save, inline row updates, optimistic locking (Java's crud ActionHandlers / OptimisticLock)."""

from __future__ import annotations

import base64
from enum import Enum
import inspect
from typing import (
    Any,
    get_args,
    get_origin,
)

from mateu_dtos import (
    Button as ButtonRecord,
    ButtonMetadata,
    ClientSideComponent,
    DialogMetadata,
    DrawerMetadata,
    HorizontalLayoutMetadata,
    Message as MessageDto,
    TextMetadata,
    UICommand,
    UIFragment,
    UIIncrement,
    VerticalLayoutMetadata,
)

from mateu_uidl import components as fluent
from mateu_uidl.export import ListingExport
from mateu_uidl.messages import UserFacingException

from .. import action_guard
from ..naming import camel_case
from ..reflection import view_fields
from ..registry import normalize
from ..export import FORMATS
from ._base import MixinBase
from ._common import (
    RunActionRq,
    SAVED_IN_DRAWER_EVENT,
    version_field,
)


#: The edit drawer's "Save and next" action (the Redwood create-edit-drawer
#: spPrimaryActionAndNext; Java's PersistActionHandler.SAVE_AND_NEXT).
SAVE_AND_NEXT = "save-and-next"


class CrudHandlerMixin(MixinBase):
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
        # Crud.display(): a disabled (or off) New / Delete cannot be forced from the client either
        display = self.mapper._crud_display(crud_type, crud)
        if (aid == "new" and not display.create.enabled()) or (
            aid == "delete" and not display.delete.enabled()
        ):
            return UIIncrement.of()
        if aid in ("create", "save", SAVE_AND_NEXT):
            if aid == SAVE_AND_NEXT and not display.save_and_next.enabled():
                return UIIncrement.of()
            return self.crud_save(crud, element, id_, rq, base_route)
        if aid == "update-row":
            return self.update_row(crud, element, rq)
        if aid == "delete":
            return self.navigate(base_route, None if id_ is None else self.delete(crud, id_), rq)
        # Crud.<format>_exportable: only an exportable crud answers its export (the id is wire
        # input); the format's exporter is looked up when it runs.
        if aid in FORMATS and self.mapper._opted_into_export(crud_type, crud, aid):
            return self.export_listing(crud, crud_type, element, aid, rq)
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

    def export_listing(self, crud, crud_type, element, action_id: str, rq: RunActionRq) -> UIIncrement:
        """export-csv / export-excel / export-pdf on an exportable crud: the WHOLE filtered result
        set (search text + smart search bar filters, the same rows the listing pages through), one
        column per visible entity field, handed to the format's ListingExporter and answered as a
        DownloadFile command (mirrors Java's ExportActionRunner)."""
        _, export_format = FORMATS[action_id]
        exporter = self.mapper.exporters.for_format(export_format)
        if exporter is None:
            # the button only shows while an exporter exists: a request naming a format nobody
            # writes is a message for the user, never a crash
            raise UserFacingException(
                "This application has no exporter for that format.", title="Export not available"
            )
        rows = self._filtered_rows(crud, view_fields(element), rq)
        file = exporter.export(
            ListingExport(
                format=export_format,
                title=self.title(crud_type),
                columns=self.mapper.export_columns(element),
                rows=rows,
                search_text=(rq.component_state or {}).get("searchText"),
            )
        )
        content = base64.b64encode(file.content).decode("ascii")
        return UIIncrement(commands=[UICommand(
            target_component_id=self.target(rq),
            type="DownloadFile",
            data={
                "filename": file.filename or export_format.default_filename,
                "mimeType": file.media_type or export_format.default_media_type,
                "base64Content": content,
            },
        )])

    def export_csv(self, crud, element, rq: RunActionRq) -> UIIncrement:
        """Kept for callers of the former CSV-only entry point."""
        return self.export_listing(crud, type(crud), element, "export-csv", rq)

    def action_on_rows(self, crud, crud_type, element, rq: RunActionRq) -> UIIncrement:
        """A @list_toolbar_button bulk action: runs the named method on the crud with the grid's
        selected rows (componentState crud_selected_items) rebuilt as typed entities — a
        ``list[Row]``-annotated parameter receives them. A None result re-runs the search so the
        listing reflects the changes; anything else maps as a regular action result (mirrors
        Java's ActionOnRowActionHandler)."""
        # Only a @list_toolbar_button method is a bulk row action — never save/delete/any other
        # method of the crud (security: the id is wire input).
        fn = action_guard.resolve_row_action(crud_type, (rq.action_id or "")[len("action-on-row-"):])
        if fn is None:
            return self.error(f"Action not found: {rq.action_id}")
        action_guard.ensure_may_invoke(self.mapper, crud_type, fn, rq.action_id)
        method = fn.__get__(crud, crud_type)
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
            if p.name == "group_value":
                # a @group_action: the clicked group header's value
                args.append((rq.parameters or {}).get("_groupValue"))
                continue
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
        save_action_id: str = "create", error_message: str | None = None,
    ) -> UIIncrement:
        """The edit_in_drawer create/edit form: the same entity form the /new — /{id}/edit routes
        render, wrapped in a Drawer emitted as an Add fragment over the listing."""
        crud = crud_type()
        display = self.mapper._crud_display(crud_type, crud)
        # the edit drawer's "Save and next" (CrudDisplay.save_and_next, the Redwood
        # spPrimaryActionAndNext): saves and moves the drawer on to the next row
        save_and_next = (
            ButtonRecord(
                label=crud.save_and_next_label(),
                action_id=SAVE_AND_NEXT,
                disabled=not display.save_and_next.enabled(),
            )
            if mode == "edit" and display.save_and_next.shown()
            else None
        )
        form = self.mapper.map_entity_form(
            crud_type, element, entity, mode, route, save_action_id=save_action_id,
            save_and_next=save_and_next,
        )
        content = form
        if error_message is not None:
            # the Redwood create-edit-drawer error banner: a danger Notice over the form
            content = ClientSideComponent(
                metadata=VerticalLayoutMetadata(),
                children=[
                    self.mapper.map_component(
                        fluent.Notice(
                            id="crud-drawer-error", text=error_message, theme="danger",
                            full_width=True,
                        )
                    ),
                    form,
                ],
                style="width: 100%;",
            )
        # Always the same id: re-sending it while it is open refreshes it in place (the "same
        # Drawer.id" contract of an Add fragment) — Save and next and the error banner use it.
        drawer = ClientSideComponent(
            metadata=DrawerMetadata(
                id="crud-edit-drawer",
                header_title="New" if mode == "new" else "Edit",
                content=content,
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
        broken = self.constraint_violations(entity, element)
        if broken:
            return self.error("; ".join(broken))
        if version is not None:
            if stored_version is not None and self._force_overwrite(rq):
                # the user chose to overwrite from the conflict dialog: adopt the STORED version
                # so the bump below moves it forward instead of resurrecting the stale one
                setattr(entity, version.name, stored_version)
            setattr(entity, version.name, self._version_of(entity, version) + 1)
        in_drawer = getattr(type(crud), "__mateu_edit_in_drawer__", False)
        try:
            crud.save(entity)
        except Exception as failure:  # noqa: BLE001 - shown in the drawer, else re-raised
            # drawer mode: a failed save keeps the drawer open and shows WHY inside it (the
            # Redwood create-edit-drawer error banner), with the values the user typed — and is
            # announced, since nothing takes focus (mirrors Java's PersistActionHandler).
            if in_drawer and self.mapper._crud_display(type(crud), crud).error_banner.shown():
                message = (
                    getattr(failure, "message", None) or str(failure)
                    or "The record could not be saved"
                )
                base = base_route.rstrip("/")
                route = f"{base}/new" if id_ is None else f"{base}/{id_}/edit"
                banner = self.crud_drawer(
                    type(crud), element, entity, "new" if id_ is None else "edit", route, rq,
                    error_message=message,
                )
                return banner.model_copy(update={"commands": [
                    UICommand.announce_assertive(message).model_copy(
                        update={"target_component_id": self.target(rq)}
                    )
                ]})
            raise
        if in_drawer and rq.action_id == SAVE_AND_NEXT and id_ is not None:
            next_id = crud.next_id_after(id_)
            if next_id is not None:
                # the drawer stays open and is re-sent with the same id for the next row (the Add
                # fragment of an open overlay refreshes it in place) while the listing refreshes:
                # the saved event (Java parity) + the search re-run (the port's listing refresh)
                base = base_route.rstrip("/")
                nxt = self.crud_drawer(
                    type(crud), element, self.get_or_new(crud, element, str(next_id)), "edit",
                    f"{base}/{next_id}/edit", rq,
                )
                target = self.target(rq)
                return nxt.model_copy(update={
                    "messages": [MessageDto(
                        variant="success", position="middle", title="", text="Saved",
                        duration=3000,
                    )],
                    "commands": [
                        UICommand(target_component_id=target, type="MarkAsClean", data=None),
                        UICommand.dispatch_event(SAVED_IN_DRAWER_EVENT).model_copy(
                            update={"target_component_id": target}
                        ),
                        UICommand(
                            target_component_id=target,
                            type="RunAction",
                            data={"actionId": "search", "targetComponentId": target},
                        ),
                    ],
                })
        if in_drawer:
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
        field_id = (rq.action_id or "")[len("search-"):]
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
