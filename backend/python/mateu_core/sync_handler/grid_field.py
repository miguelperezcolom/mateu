"""The row-editing actions of a list (grid) field on a form: add / select / create / save / prev /
next / remove / move-up / move-down / cancel (Java's FieldCrudActionRunner +
crudfieldhandlers/*).

The rows live in the form's component state (a list of row maps keyed by ``_rowNumber``); these
handlers edit that list and answer the new state, so the edits are saved with the form like any
other field. Opening a row (``_add`` / ``_select``) also answers the ROW EDITOR — a titled form for
the row type — into the grid's detail container (``<field>-container``), which the renderer shows
beside (or over) the grid. ``_show_detail`` / ``_editing`` maps in the state say, per field, whether
the editor is open and whether it edits an existing row.

An ``InlineEditing()`` grid has no editor (its cells are the editor): ``_add`` appends an empty row
in place instead.
"""

from __future__ import annotations

import uuid
from typing import Any

from mateu_dtos import (
    Button,
    ClientSideComponent,
    FormMetadata,
    ServerSideComponent,
    TextMetadata,
    UIFragment,
    UIIncrement,
)
from mateu_uidl import InlineEditing

from ..mapper import ReflectionMapper
from ..mapper.fields import LIST_FIELD_ACTION_SUFFIXES, is_list_field
from ..naming import camel_case, humanize
from ..reflection import view_fields
from ..registry import type_name
from ._base import MixinBase
from ._common import RunActionRq

# longest first, so "_create-and-stay" is not read as "…_create" of a field named "x-and-stay"
_SUFFIXES = sorted(LIST_FIELD_ACTION_SUFFIXES, key=len, reverse=True)


class GridFieldHandlerMixin(MixinBase):
    def list_field_action(self, cls, action_id: str | None):
        """``(field, field_id, suffix)`` when ``action_id`` is a row-editing action of one of the
        view's list fields (on a wizard: the CURRENT step's), else None."""
        if not action_id:
            return None
        for suffix in _SUFFIXES:
            if action_id.endswith(suffix):
                fid = action_id[: -len(suffix)]
                for f in view_fields(cls):
                    if camel_case(f.name) == fid and is_list_field(f):
                        return f, fid, suffix
        return None

    def handle_list_field_action(self, cls, field, fid: str, suffix: str, rq: RunActionRq) -> UIIncrement:
        state: dict[str, Any] = dict(rq.component_state or {})
        show = dict(state.get("_show_detail") or {})
        editing = dict(state.get("_editing") or {})
        params: dict[str, Any] = dict(rq.parameters or {})
        rows = [dict(r) for r in (state.get(fid) or []) if isinstance(r, dict)]
        row_type = ReflectionMapper.grid_row_type(field)

        def new_state() -> dict[str, Any]:
            out = dict(state)
            out["_show_detail"] = show
            out["_editing"] = editing
            return out

        if suffix == "_add":
            if field.has(InlineEditing) or row_type is None:
                show[fid] = False
                editing[fid] = False
                out = new_state()
                empty = self._row_map(row_type) if row_type is not None else {}
                empty["_rowNumber"] = uuid.uuid4().hex
                out[fid] = _numbered(rows) + [empty]
                return self._state_only(out, rq)
            show[fid] = True
            editing[fid] = False
            out = new_state()
            out[fid] = _numbered(rows)
            return self._state_and_editor(
                out, rq, fid, field, row_type, "New", self._row_map(row_type),
                toolbar=[], buttons=_editor_buttons(fid, "_create", another=True),
            )
        if suffix in ("_create", "_create-and-stay"):
            stay = suffix == "_create-and-stay"
            show[fid] = stay
            editing[fid] = not stay
            item = dict(params.get("initiatorState") or {})
            item.pop("_position", None)
            built = self._row_map(row_type, item) if row_type is not None else item
            built["_rowNumber"] = item.get("_rowNumber") or uuid.uuid4().hex
            out = new_state()
            out[fid] = _numbered(rows) + [built]
            if stay:
                return self._state_and_editor(
                    out, rq, fid, field, row_type, "New", self._row_map(row_type),
                    toolbar=[], buttons=_editor_buttons(fid, "_create", another=True),
                )
            return self._state_only(out, rq)
        if suffix == "_select":
            show[fid] = True
            editing[fid] = True
            rows = _numbered(rows)
            number = params.get("_rowNumber")
            position = _position_of(rows, number)
            data = dict(rows[position]) if position is not None else {}
            data["_position"] = f"{(position or 0) + 1}/{len(rows)}"
            out = new_state()
            out[fid] = rows
            return self._state_and_editor(
                out, rq, fid, field, row_type, "Edit", data,
                toolbar=[
                    Button(label="Prev", action_id=f"{fid}_prev"),
                    Button(label="Next", action_id=f"{fid}_next"),
                ],
                buttons=_editor_buttons(fid, "_save", another=False),
                header=[ClientSideComponent(metadata=TextMetadata(text="${state['_position']}"))],
            )
        if suffix == "_selected":
            out = new_state()
            selected = state.get(f"{fid}_selected_items") or []
            if selected and isinstance(selected[0], dict):
                values = selected[0]
                for key, value in values.items():
                    out[f"{fid}-{key}"] = value
                position = _position_of(rows, values.get("_rowNumber"))
                if position is not None:
                    out[f"{fid}_position"] = f"{position + 1}/{len(rows)}"
            return self._state_only(out, rq)
        if suffix in ("_prev", "_next"):
            current = dict(params.get("initiatorState") or {})
            position = _position_of(rows, current.get("_rowNumber"))
            if position is None:
                return self.error("The row is no longer in the list")
            target = position + (-1 if suffix == "_prev" else 1)
            if target < 0:
                return self.error("This is the first item. No previous item to select.")
            if target >= len(rows):
                return self.error("No more items")
            data = dict(rows[target])
            data["_position"] = f"{target + 1}/{len(rows)}"
            return UIIncrement.of(
                fragments=[
                    UIFragment(target_component_id=f"{fid}-container", state=data, action="Replace")
                ]
            )
        if suffix == "_save":
            show[fid] = False
            editing[fid] = False
            edited = dict(params.get("initiatorState") or {})
            edited.pop("_position", None)
            out = new_state()
            updated = []
            for row in rows:
                if row.get("_rowNumber") is not None and row.get("_rowNumber") == edited.get("_rowNumber"):
                    row = {**row, **edited}
                updated.append(row)
            out[fid] = updated
            return self._state_only(out, rq)
        if suffix == "_remove":
            show[fid] = False
            selected = state.get(f"{fid}_selected_items")
            out = new_state()
            if selected:
                out[fid] = [row for row in rows if not any(_same_row(row, s) for s in selected)]
            return self._state_only(out, rq)
        if suffix in ("_move-up", "_move-down"):
            show[fid] = False
            selected = state.get(f"{fid}_selected_items") or []
            out = new_state()
            if selected:
                out[fid] = _moved(rows, selected, up=suffix == "_move-up")
            return self._state_only(out, rq)
        # _cancel
        show[fid] = False
        editing[fid] = False
        return self._state_only(new_state(), rq)

    # ── helpers ──────────────────────────────────────────────────────────────
    def _row_map(self, row_type, values: dict | None = None) -> dict[str, Any]:
        """A row as the map the grid holds: a fresh row object (keeping its field defaults) with
        ``values`` bound over it, serialised like the form's rows."""
        row = row_type()
        if values:
            self.bind_state(row, values)
        return self.mapper.form_initial_data(row_type, row)

    def _state_only(self, state: dict[str, Any], rq: RunActionRq) -> UIIncrement:
        return UIIncrement.of(
            fragments=[UIFragment(target_component_id=self.target(rq), state=state, action="Replace")]
        )

    def _state_and_editor(
        self, state, rq, fid, field, row_type, verb, data, toolbar, buttons, header=None
    ) -> UIIncrement:
        container = f"{fid}-container"
        row = row_type()
        content = self.mapper.form_cards(row_type, row)
        form = ClientSideComponent(
            metadata=FormMetadata(
                title=f"{verb} {_row_name(row_type)}",
                toolbar=toolbar,
                buttons=buttons,
                header=header or [],
            ),
            children=content,
            style="width: 100%;",
        )
        editor = ServerSideComponent(
            id=uuid.uuid4().hex,
            server_side_type=type_name(row_type),
            route=rq.route or "",
            children=[form],
            initial_data=data,
            style="width: 100%;",
            rules=self.mapper.map_rules(row_type, row),
            validations=_validations(self.mapper, row_type, row),
        )
        return UIIncrement.of(
            fragments=[
                UIFragment(target_component_id=self.target(rq), state=state, action="Replace"),
                UIFragment(
                    target_component_id=container,
                    component=editor,
                    state=data,
                    action="Replace",
                    container_id=container,
                ),
            ]
        )


def _validations(mapper, row_type, row):
    from ..validation import client_validations

    return client_validations(mapper, row_type, row)


def _editor_buttons(fid: str, save_suffix: str, another: bool) -> list[Button]:
    """The row editor's own actions at the foot of its form: Save first and primary, Cancel last
    (Java's CrudFieldHandlerHelper.rowEditorButtons)."""
    buttons = [Button(label="Save", action_id=fid + save_suffix, button_style="primary")]
    if another:
        buttons.append(Button(label="Save and add another", action_id=f"{fid}_create-and-stay"))
    buttons.append(Button(label="Cancel", action_id=f"{fid}_cancel", button_style="tertiary"))
    return buttons


def _row_name(row_type) -> str:
    """"room", not "RoomViewModel": a ``@title`` wins, else the class name minus its technical
    suffix, spaced and lower-cased (Java's CrudFieldHandlerHelper.rowName)."""
    titled = getattr(row_type, "__mateu_title__", None)
    if titled:
        return titled
    name = row_type.__name__
    for tail in ("ViewModel", "View", "Dto", "DTO", "Form", "Row"):
        if name.endswith(tail) and len(name) > len(tail):
            name = name[: -len(tail)]
            break
    return humanize(name).lower()


def _numbered(rows: list[dict]) -> list[dict]:
    """Every row carries a ``_rowNumber`` — the identity the grid and the editor share."""
    out = []
    for i, row in enumerate(rows):
        if row.get("_rowNumber") is None:
            row = {**row, "_rowNumber": i}
        out.append(row)
    return out


def _position_of(rows: list[dict], number) -> int | None:
    for i, row in enumerate(rows):
        if number is not None and str(row.get("_rowNumber")) == str(number):
            return i
    return None


def _same_row(row: dict, selected) -> bool:
    if not isinstance(selected, dict):
        return False
    if selected.get("_rowNumber") is not None and row.get("_rowNumber") is not None:
        return str(selected.get("_rowNumber")) == str(row.get("_rowNumber"))
    return row == selected


def _moved(rows: list[dict], selected: list, up: bool) -> list[dict]:
    """Moves the selected rows one place up (or down); a run of selected rows moves together
    (Java's MoveUp/MoveDownActionHandler)."""
    out = list(rows)
    is_selected = [any(_same_row(r, s) for s in selected) for r in out]
    indices = range(1, len(out)) if up else range(len(out) - 2, -1, -1)
    for i in indices:
        j = i - 1 if up else i + 1
        if is_selected[i] and not is_selected[j]:
            out[i], out[j] = out[j], out[i]
            is_selected[i], is_selected[j] = is_selected[j], is_selected[i]
    return out


__all__ = ["GridFieldHandlerMixin"]
