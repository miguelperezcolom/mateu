"""Sync tests for ``@auto_layout`` inference — the Python mirror of Java's
``LayoutInferenceSyncTest``: fold-optionals (required fields visible, optionals collapsed into a
"More options" accordion), sections-to-tabs on heavy read-only views (with the editable escape
hatch), small-enum-as-radio (plus the ``UseRadioButtons`` override), and the
``groupRelationship``/``adaptable`` semantic hints on the tab layout wire DTO — asserted on the
DTO tree a real sync request produces, and asserting classes WITHOUT ``@auto_layout`` keep the
previous behaviour.

Deviations from the Java suite (features the Python backend does not have yet):
- no sticky-section fixture (``Section`` has no ``sticky`` here, nor ``@Toc``/``@Zones``).
"""

import sys
from enum import Enum
from pathlib import Path
from typing import Annotated

# Make the backend/python packages importable when run from anywhere.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import (  # noqa: E402
    Required,
    Section,
    Stereotype,
    Tab,
    UseRadioButtons,
    auto_layout,
    read_only,
    title,
    ui,
)


class Size(Enum):
    SMALL = 1
    MEDIUM = 2
    LARGE = 3


class Weekday(Enum):
    MONDAY = 1
    TUESDAY = 2
    WEDNESDAY = 3
    THURSDAY = 4
    FRIDAY = 5
    SATURDAY = 6
    SUNDAY = 7


@ui("infer-small")
@title("Small")
@auto_layout
class SmallAutoForm:
    """Light form: inference enabled but under every threshold — must stay a plain flat form."""

    name: Annotated[str, Required()] = "n"
    nickname: str = "nick"
    city: str = "c"


@ui("infer-fold")
@title("Fold")
@auto_layout
class HeavyAutoForm:
    """Heavy unstructured editable form: required stays visible, optionals fold away."""

    name: Annotated[str, Required()] = "n"
    email: Annotated[str, Required()] = "e"
    phone: Annotated[str, Required()] = "p"
    notes1: Annotated[str, Stereotype("textarea")] = ""
    notes2: Annotated[str, Stereotype("textarea")] = ""
    notes3: Annotated[str, Stereotype("textarea")] = ""
    notes4: Annotated[str, Stereotype("textarea")] = ""
    extra1: str = ""
    extra2: str = ""


@ui("infer-fold-off")
@title("Fold off")
class HeavyPlainForm:
    """Same shape as HeavyAutoForm but no @auto_layout: previous behaviour."""

    name: Annotated[str, Required()] = "n"
    email: Annotated[str, Required()] = "e"
    phone: Annotated[str, Required()] = "p"
    notes1: Annotated[str, Stereotype("textarea")] = ""
    notes2: Annotated[str, Stereotype("textarea")] = ""
    notes3: Annotated[str, Stereotype("textarea")] = ""
    notes4: Annotated[str, Stereotype("textarea")] = ""
    extra1: str = ""
    extra2: str = ""


@ui("infer-enums")
@title("Enums")
@auto_layout
class AutoEnumForm:
    size: Size = Size.MEDIUM
    day: Weekday = Weekday.MONDAY


@ui("infer-enums-off")
@title("Enums off")
class PlainEnumForm:
    size: Size = Size.MEDIUM
    day: Annotated[Weekday, UseRadioButtons()] = Weekday.MONDAY


@ui("infer-tabs")
@title("Tabs")
@auto_layout
@read_only
class ReadOnlySectionsView:
    """Heavy read-only view with many substantial sections: presented as adaptable tabs."""

    a1: Annotated[str, Section("Uno"), Stereotype("textarea")] = "x"
    a2: Annotated[str, Stereotype("textarea")] = "x"
    b1: Annotated[str, Section("Dos"), Stereotype("textarea")] = "x"
    b2: Annotated[str, Stereotype("textarea")] = "x"
    c1: Annotated[str, Section("Tres"), Stereotype("textarea")] = "x"
    c2: Annotated[str, Stereotype("textarea")] = "x"
    d1: Annotated[str, Section("Cuatro"), Stereotype("textarea")] = "x"
    d2: Annotated[str, Stereotype("textarea")] = "x"
    e1: Annotated[str, Section("Cinco"), Stereotype("textarea")] = "x"
    e2: Annotated[str, Stereotype("textarea")] = "x"


@ui("infer-tabs-editable")
@title("Tabs editable")
@auto_layout
class EditableSectionsForm:
    """Same as ReadOnlySectionsView but editable: hiding groups could hide invalid fields."""

    a1: Annotated[str, Section("Uno"), Stereotype("textarea")] = "x"
    a2: Annotated[str, Stereotype("textarea")] = "x"
    b1: Annotated[str, Section("Dos"), Stereotype("textarea")] = "x"
    b2: Annotated[str, Stereotype("textarea")] = "x"
    c1: Annotated[str, Section("Tres"), Stereotype("textarea")] = "x"
    c2: Annotated[str, Stereotype("textarea")] = "x"
    d1: Annotated[str, Section("Cuatro"), Stereotype("textarea")] = "x"
    d2: Annotated[str, Stereotype("textarea")] = "x"
    e1: Annotated[str, Section("Cinco"), Stereotype("textarea")] = "x"
    e2: Annotated[str, Stereotype("textarea")] = "x"


@ui("infer-devtabs")
@title("Dev tabs")
@auto_layout
class AutoDevTabsForm:
    """Developer-declared tabs on an inferring class: respected, and marked adaptable."""

    first: Annotated[str, Tab("Uno")] = "1"
    second: Annotated[str, Tab("Dos")] = "2"


@ui("infer-devtabs-off")
@title("Dev tabs off")
class PlainDevTabsForm:
    first: Annotated[str, Tab("Uno")] = "1"
    second: Annotated[str, Tab("Dos")] = "2"


MODULE = sys.modules[__name__]


# ── Helpers ─────────────────────────────────────────────────────────────────────
def component_tree(view_cls) -> dict:
    handler = SyncHandler(MateuRegistry(MODULE))
    inc = handler.handle(RunActionRq(server_side_type=type_name(view_cls)))
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]


def walk(node):
    """Every component dict in the tree, descending children AND metadata content (Card/Div nest
    their content inside the metadata record, like the Java wire)."""
    if not isinstance(node, dict):
        return
    yield node
    meta = node.get("metadata")
    if isinstance(meta, dict) and isinstance(meta.get("content"), dict):
        yield from walk(meta["content"])
    for child in node.get("children") or []:
        yield from walk(child)


def all_metadata(root, meta_type: str) -> list[dict]:
    return [
        c
        for c in walk(root)
        if isinstance(c.get("metadata"), dict) and c["metadata"].get("type") == meta_type
    ]


def field_ids(root) -> list[str]:
    return [c["metadata"]["fieldId"] for c in all_metadata(root, "FormField")]


def field(root, field_id: str) -> dict:
    return next(
        c["metadata"] for c in all_metadata(root, "FormField") if c["metadata"]["fieldId"] == field_id
    )


# ── Fold optionals ──────────────────────────────────────────────────────────────
def test_light_auto_form_stays_flat():
    tree = component_tree(SmallAutoForm)
    assert all_metadata(tree, "AccordionLayout") == []
    assert all_metadata(tree, "TabLayout") == []
    assert {"name", "nickname", "city"} <= set(field_ids(tree))


def test_heavy_auto_form_folds_optional_fields_into_a_more_options_panel():
    tree = component_tree(HeavyAutoForm)
    (accordion,) = all_metadata(tree, "AccordionLayout")
    # Like the Java wire, panels is empty on the metadata — the panels are the children.
    assert accordion["metadata"]["panels"] == []
    assert len(accordion["children"]) == 1
    panel = accordion["children"][0]
    assert panel["metadata"]["type"] == "AccordionPanel"
    assert panel["metadata"]["label"] == "More options"


def test_required_fields_stay_visible_and_optional_fields_fold_away():
    tree = component_tree(HeavyAutoForm)
    (accordion,) = all_metadata(tree, "AccordionLayout")
    assert sorted(field_ids(accordion)) == sorted(
        ["notes1", "notes2", "notes3", "notes4", "extra1", "extra2"]
    )
    # every field still reaches the wire exactly once — folding regroups, never drops
    assert sorted(field_ids(tree)) == sorted(
        ["name", "email", "phone", "notes1", "notes2", "notes3", "notes4", "extra1", "extra2"]
    )


def test_without_auto_layout_the_heavy_form_keeps_the_previous_flat_behaviour():
    tree = component_tree(HeavyPlainForm)
    assert all_metadata(tree, "AccordionLayout") == []
    assert len(field_ids(tree)) == 9


# ── Enums ───────────────────────────────────────────────────────────────────────
def test_small_enum_renders_as_radio_buttons_under_auto_layout():
    assert field(component_tree(AutoEnumForm), "size")["stereotype"] == "radio"


def test_large_enum_keeps_the_dropdown_under_auto_layout():
    assert field(component_tree(AutoEnumForm), "day")["stereotype"] == "select"


def test_without_auto_layout_enums_render_as_a_dropdown():
    # Java parity (and Mateu.NET since its port): enums render as "select" by default.
    assert field(component_tree(PlainEnumForm), "size")["stereotype"] == "select"


def test_use_radio_buttons_forces_radio_regardless_of_size_and_auto_layout():
    assert field(component_tree(PlainEnumForm), "day")["stereotype"] == "radio"


def test_radio_enum_still_carries_its_options():
    values = [o["value"] for o in field(component_tree(AutoEnumForm), "size")["options"]]
    assert values == ["SMALL", "MEDIUM", "LARGE"]


# ── Sections → tabs ─────────────────────────────────────────────────────────────
def test_heavy_read_only_sections_become_adaptable_tabs():
    tree = component_tree(ReadOnlySectionsView)
    (tab_layout,) = all_metadata(tree, "TabLayout")
    assert tab_layout["id"] == "_tabs"
    assert tab_layout["metadata"]["adaptable"] is True
    assert tab_layout["metadata"]["groupRelationship"] == "alternative"
    labels = [t["metadata"]["label"] for t in tab_layout["children"]]
    assert labels == ["Uno", "Dos", "Tres", "Cuatro", "Cinco"]


def test_every_section_field_survives_the_tabs_presentation():
    assert sorted(field_ids(component_tree(ReadOnlySectionsView))) == sorted(
        ["a1", "a2", "b1", "b2", "c1", "c2", "d1", "d2", "e1", "e2"]
    )


def test_read_only_view_fields_are_read_only_on_the_wire():
    assert field(component_tree(ReadOnlySectionsView), "a1")["readOnly"] is True


def test_editable_sections_stay_stacked_so_validation_never_hides():
    assert all_metadata(component_tree(EditableSectionsForm), "TabLayout") == []


# ── Semantic hints on developer-declared tabs ───────────────────────────────────
def test_developer_tabs_on_an_inferring_class_are_adaptable():
    (tab_layout,) = all_metadata(component_tree(AutoDevTabsForm), "TabLayout")
    assert tab_layout["metadata"]["adaptable"] is True
    assert tab_layout["metadata"]["groupRelationship"] == "alternative"


def test_developer_tabs_without_auto_layout_carry_semantics_but_are_not_adaptable():
    (tab_layout,) = all_metadata(component_tree(PlainDevTabsForm), "TabLayout")
    assert tab_layout["metadata"]["adaptable"] is False
    assert tab_layout["metadata"]["groupRelationship"] == "alternative"
