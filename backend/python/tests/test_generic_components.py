"""The generic fluent building blocks ported from Java (M-A5): Element, Tooltip, ConfirmDialog,
Details, SplitLayout, Breadcrumbs, Icon and Notification. The full wire shape is pinned by the
``generic-components`` conformance case; these tests pin the defaults and the ids Java's mappers
give them (ConfirmDialog "Save" / "true", "fieldId", the Element's own id or a stable hash)."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core.mapper import ReflectionMapper  # noqa: E402
from mateu_ui.uidl import components as fluent  # noqa: E402



def mapped(component) -> dict:
    return ReflectionMapper().map_component(component).model_dump(by_alias=True, mode="json")


def test_a_confirm_dialog_defaults_its_confirm_text_and_opened_condition():
    dto = mapped(fluent.ConfirmDialog(header="Sure?"))
    assert dto["metadata"]["confirmText"] == "Save"
    assert dto["metadata"]["openedCondition"] == "true"
    assert dto["children"] == []  # a header-only dialog has no content child
    assert dto["id"] == "fieldId"


def test_an_element_is_keyed_by_its_own_id_attribute_else_a_stable_hash():
    assert mapped(fluent.Element(name="x-el", attributes={"id": "plan"}))["id"] == "plan"
    first = mapped(fluent.Element(name="x-el", content="a"))["id"]
    assert first == mapped(fluent.Element(name="x-el", content="a"))["id"]
    assert first != mapped(fluent.Element(name="x-el", content="b"))["id"]
    # FNV-1a of the definition: the very id the .NET port computes for the same element
    assert mapped(fluent.Element(name="x-el"))["id"] == "element-95a0641d"


def test_the_ids_java_hardcodes_default_to_field_id_unless_the_component_names_one():
    for component in (
        fluent.Icon(icon="vaadin:plus"),
        fluent.Notification(text="Saved"),
        fluent.Breadcrumbs(current_item_text="Here"),
        fluent.Tooltip(text="t", wrapped=fluent.Text(text="w")),
        fluent.Details(summary=fluent.Text(text="s")),
    ):
        assert mapped(component)["id"] == "fieldId"
    assert mapped(fluent.Icon(icon="vaadin:plus", id="mine"))["id"] == "mine"


def test_a_split_layout_without_orientation_sends_none_and_its_two_panes_as_children():
    dto = mapped(fluent.SplitLayout(master=fluent.Text(text="m"), detail=fluent.Text(text="d")))
    assert dto["metadata"]["orientation"] is None
    assert [c["metadata"]["text"] for c in dto["children"]] == ["m", "d"]
