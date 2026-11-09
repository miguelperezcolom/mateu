"""Envelope members and markers that used to be Java-only: Dialog placement, the rest of
@Action (action_options), @App(layout, accentColor, askLabel, askIcon), the fluent listing's grid
presentation + rowRoute, FormField css classes, MainFilter(), HiddenInList/View/Editor/Create()
and Section(sticky, columns, style)."""

from __future__ import annotations

import sys
from typing import Annotated

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name
from mateu_ui.core.mapper import ReflectionMapper
from mateu_ui.core.yaml_preview import build_from_yaml
from mateu_ui.uidl import (
    Crud,
    HiddenInCreate,
    HiddenInEditor,
    HiddenInList,
    HiddenInView,
    MainFilter,
    Required,
    Section,
    action_options,
    app,
    button,
    menu_item,
    title,
    ui,
)
from mateu_ui.uidl import components as fl


def walk(node):
    if isinstance(node, dict):
        yield node
        for v in node.values():
            yield from walk(v)
    elif isinstance(node, list):
        for v in node:
            yield from walk(v)


def dump(inc) -> dict:
    return inc.model_dump(by_alias=True, mode="json")


# ── Dialog placement ────────────────────────────────────────────────────────────────────────────


def test_dialog_carries_its_placement_and_handles():
    w = ReflectionMapper().map_component(fl.Dialog(
        header_title="Notes", content=fl.Text(text="x"), top="4rem", left="2rem",
        draggable=True, resizable=True,
    )).model_dump(by_alias=True)
    m = w["metadata"]
    assert (m["top"], m["left"], m["draggable"], m["resizable"]) == ("4rem", "2rem", True, True)
    plain = ReflectionMapper().map_component(fl.Dialog(header_title="N")).model_dump(by_alias=True)
    assert plain["metadata"]["top"] is None and plain["metadata"]["draggable"] is False


# ── The rest of @Action ─────────────────────────────────────────────────────────────────────────


@ui("env-actions")
@title("Actions")
class ActionsPage:
    name: str = "Ada"

    @button
    @action_options(sse=True, background=True)
    def import_rows(self):
        return None

    @button
    @action_options(confirmation_title="Delete?", confirmation_text="Yes", confirmation_denial_text="No")
    def delete_all(self):
        return None

    @button
    @action_options(href="https://example.com", js="console.log(1)", custom_event="refresh",
                    custom_event_detail="all")
    def open_docs(self):
        return None

    @button
    def plain(self):
        return None


def actions_of(cls) -> dict:
    inc = SyncHandler(MateuRegistry(sys.modules[__name__])).handle(
        RunActionRq(server_side_type=type_name(cls)))
    return {a["id"]: a for a in dump(inc)["fragments"][0]["component"]["actions"]}


def test_action_options_carry_the_rest_of_javas_action():
    actions = actions_of(ActionsPage)
    imp = actions["importRows"]
    assert imp["sse"] is True and imp["background"] is True and imp["confirmationTexts"] is None
    delete = actions["deleteAll"]
    assert delete["confirmationTexts"] == {
        "title": "Delete?", "message": None, "confirmationText": "Yes", "denialText": "No"}
    docs = actions["openDocs"]
    assert docs["href"] == "https://example.com" and docs["js"] == "console.log(1)"
    assert docs["customEvent"] == {"eventName": "refresh", "detail": "all"}
    plain = actions["plain"]
    assert plain["sse"] is False and plain["href"] is None and plain["customEvent"] is None


# ── @app presentation ───────────────────────────────────────────────────────────────────────────


@ui("env-home")
@title("Home")
class EnvHome:
    name: str | None = None


@app("Branded", layout="SPLIT", accent_color=" #1f6feb ", ask_label="Ask Acme", ask_icon="vaadin:chat")
class BrandedApp:
    @menu_item("Home")
    def home(self) -> "EnvHome":
        return EnvHome()


@app("Unbranded")
class UnbrandedApp:
    @menu_item("Home")
    def home(self) -> "EnvHome":
        return EnvHome()


def app_meta(cls) -> dict:
    inc = SyncHandler(MateuRegistry(cls, EnvHome)).handle(RunActionRq(server_side_type=type_name(cls)))
    return dump(inc)["fragments"][0]["component"]["metadata"]


def test_app_declares_layout_accent_colour_and_ask_entry():
    m = app_meta(BrandedApp)
    assert m["layout"] == "SPLIT" and m["accentColor"] == "#1f6feb"
    assert m["askLabel"] == "Ask Acme" and m["askIcon"] == "vaadin:chat"
    u = app_meta(UnbrandedApp)
    assert u["layout"] == "SINGLE_SLOT" and u["accentColor"] is None and u["askLabel"] is None


def test_app_refuses_an_unknown_layout():
    import pytest

    with pytest.raises(ValueError):
        app("X", layout="TRIPLE")


# ── Fluent listing presentation + rowRoute, FormField css classes ───────────────────────────────


def test_a_yaml_listing_carries_row_route_and_grid_presentation():
    built = build_from_yaml("""
type: Listing
rowRoute: people/${row.id}
rowStripes: true
columnBorders: true
wrapCellContent: true
allRowsVisible: true
gridStyle: "height: 20rem"
columns:
  - type: GridColumn
    id: name
""")
    m = ReflectionMapper().map_component(built).model_dump(by_alias=True)["metadata"]
    assert m["rowRoute"] == "people/${row.id}" and m["gridStyle"] == "height: 20rem"
    assert m["rowStripes"] and m["columnBorders"] and m["wrapCellContent"] and m["allRowsVisible"]
    assert not m["noBorder"] and not m["columnReorderingAllowed"]


def test_a_fluent_form_field_carries_its_css_classes_in_the_metadata():
    w = ReflectionMapper().map_component(fl.FormField(field_id="x", css_classes="wide")).model_dump(by_alias=True)
    assert w["metadata"]["cssClasses"] == "wide" and w["cssClasses"] == "wide"


# ── MainFilter + HiddenIn* on a Crud ────────────────────────────────────────────────────────────


class Guest:
    id: Annotated[str, HiddenInCreate(), Required()] = ""
    name: Annotated[str, MainFilter()] = ""
    city: str = ""
    notes: Annotated[str, HiddenInList()] = ""
    secret_code: Annotated[str, HiddenInView()] = ""
    created_by: Annotated[str, HiddenInEditor()] = ""


@ui("env-guests")
@title("Guests")
class Guests(Crud[Guest]):
    def fetch(self, search):
        g = Guest()
        g.id, g.name = "1", "Ada"
        return [g]


def handle(route: str) -> dict:
    return dump(SyncHandler(MateuRegistry(sys.modules[__name__])).handle(RunActionRq(route=route)))


def form_field_ids(inc: dict) -> set[str]:
    return {n["metadata"]["fieldId"] for n in walk(inc["fragments"])
            if isinstance(n.get("metadata"), dict) and n["metadata"].get("type") == "FormField"}


def test_main_filter_marks_the_smart_search_filter():
    crud = next(n for n in walk(handle("env-guests")) if n.get("type") == "Crud")
    flags = {f["fieldId"]: f["mainFilter"] for f in crud["filters"]}
    assert flags["name"] is True and flags["city"] is False


def test_hidden_in_list_drops_the_column():
    crud = next(n for n in walk(handle("env-guests")) if n.get("type") == "Crud")
    ids = [c["metadata"]["id"] for c in crud["columns"]]
    assert "notes" not in ids and "name" in ids and "secretCode" in ids


def test_hidden_in_view_editor_and_create_drop_the_field_from_that_form_only():
    view = form_field_ids(handle("env-guests/1"))
    edit = form_field_ids(handle("env-guests/1/edit"))
    new = form_field_ids(handle("env-guests/new"))
    assert "secretCode" not in view and "createdBy" in view and "id" in view
    assert "createdBy" not in edit and "secretCode" in edit and "id" in edit
    assert "id" not in new and "createdBy" in new and "secretCode" in new


def test_a_save_takes_no_value_for_a_field_its_form_does_not_render():
    from mateu_ui.core.mapper.crud_modes import without_hidden_inputs

    state = {"id": "X", "name": "Ada", "createdBy": "mallory"}
    assert without_hidden_inputs(Guest, state, creating=True) == {"name": "Ada", "createdBy": "mallory"}
    assert without_hidden_inputs(Guest, state, creating=False) == {"id": "X", "name": "Ada"}


# ── Section(sticky, columns, style) ─────────────────────────────────────────────────────────────


@ui("env-sections")
@title("Sections")
class SectionsForm:
    guests: Annotated[str, Section("Guests", sticky=True)] = ""
    a: Annotated[str, Section("Details", columns=1, style="gap: 2rem;")] = ""
    b: str = ""
    c: str = ""
    d: str = ""
    e: str = ""
    f: str = ""
    g: str = ""


def test_sections_honour_sticky_columns_and_style():
    inc = dump(SyncHandler(MateuRegistry(sys.modules[__name__])).handle(
        RunActionRq(server_side_type=type_name(SectionsForm))))
    cards = [n for n in walk(inc["fragments"]) if n.get("cssClasses", "") and "mateu-section" in n["cssClasses"]]
    sticky, details = cards
    assert sticky["cssClasses"] == "mateu-section mateu-section--sticky"
    assert "position: sticky" in sticky["style"]
    assert details["cssClasses"] == "mateu-section" and "sticky" not in details["style"]
    assert details["metadata"]["content"]["style"] == "gap: 2rem;"
    layouts = [n["metadata"]["maxColumns"] for n in walk(details)
               if isinstance(n.get("metadata"), dict) and n["metadata"].get("type") == "FormLayout"]
    # 8 fields infer two columns for the form; the Details section declares one
    assert layouts == [1]
    sticky_layouts = [n["metadata"]["maxColumns"] for n in walk(sticky)
                      if isinstance(n.get("metadata"), dict) and n["metadata"].get("type") == "FormLayout"]
    assert sticky_layouts == [2]


def test_a_required_field_the_create_form_hides_is_not_reported_missing():
    from mateu_ui.core.mapper.crud_modes import crud_form_mode
    from mateu_ui.core.sync_handler.search import SearchHandlerMixin

    g = Guest()
    with crud_form_mode("new"):
        assert SearchHandlerMixin.required_missing(g, Guest) == []
    with crud_form_mode("edit"):
        assert SearchHandlerMixin.required_missing(g, Guest) == ["Id"]
