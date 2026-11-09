"""Nested data objects in a form — the Python mirror of Java's ``@Inline`` nested forms and
non-inline sub-forms (``NestedStateSyncTest``, ``InlineConstraintsSyncTest``): prefixed field ids,
the flattened state and its round trip, the nested object's actions
(``nested-form-action-<field>-<method>``), its shortcut, a grid row click inside it, and the
column count an inline object adds. ``Inline()`` on a field holding a ROUTED view keeps meaning an
embedded island (test_embedded_islands)."""

import sys
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core import form_columns_inference  # noqa: E402
from mateu_ui.core.nested_forms import flatten_state, nested_state_of, state_expression  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    Inline,
    Lookup,
    LookupLabelSupplier,
    Message,
    OnRowSelected,
    Required,
    Section,
    action,
    button,
    shortcut,
    title,
    toolbar,
    ui,
)
from mateu_ui.uidl import Text as TextField  # noqa: E402


SEEN: list = []


class Address:
    street: str = "Main st"
    city: str = "Palma"
    note: Annotated[str, TextField()] = "hello"

    @toolbar
    @action
    @shortcut("ctrl+alt+a")
    def verify(self):
        SEEN.append(self)
        return Message(f"verified:{self.city}")

    @button
    def locate(self):
        return Message(f"located:{self.street}")

    def secret(self):  # not an action: never reachable from the wire
        return Message("leaked")


class Contact:
    email: str = "a@b.c"
    phone: str = "555"

    @toolbar
    def call(self):
        return Message(f"calling:{self.phone}")


class Guest:
    name: str = ""


class Party:
    guests: Annotated[list[Guest], OnRowSelected("pick")] = None  # type: ignore[assignment]

    def __init__(self):
        self.guests = []

    def pick(self, row: Guest):
        return Message(f"picked:{row.name}")


@ui("/nested")
@title("Nested")
class NestedForm:
    owner: Annotated[str, Section("Owner")] = "Ada"
    address: Annotated[Address, Section("Address"), Inline()] = None  # type: ignore[assignment]
    contact: Annotated[Contact, Section("Contact")] = None  # type: ignore[assignment]

    def __init__(self):
        self.address = Address()
        self.contact = Contact()


@ui("/nested-single")
@title("Single")
class SingleSectionNested:
    """One section: Java renders no inline toolbar/buttons outside the multi-section path."""

    owner: str = "Ada"
    address: Annotated[Address, Inline()] = None  # type: ignore[assignment]

    def __init__(self):
        self.address = Address()


@ui("/nested-party")
@title("Party")
class PartyForm:
    host: Annotated[str, Section("Host")] = "Ada"
    party: Annotated[Party, Section("Party"), Inline()] = None  # type: ignore[assignment]

    def __init__(self):
        self.party = Party()


class Supplier:
    supplier_id: Annotated[str, Lookup()] = "S-1"


@ui("/nested-lookup")
@title("Lookup")
class LookupHost(LookupLabelSupplier):
    vendor: Annotated[str, Lookup()] = "V-1"
    supplier: Annotated[Supplier, Inline()] = None  # type: ignore[assignment]

    def __init__(self):
        self.supplier = Supplier()

    def label(self, field_name, value):
        return f"label-{value}"


class Wide:
    a: str = ""
    b: str = ""
    c: str = ""
    d: str = ""
    e: str = ""


@ui("/nested-wide")
class WideHost:
    x: str = ""
    y: str = ""
    wide: Annotated[Wide, Inline()] = None  # type: ignore[assignment]


class RequiredAddress:
    street: Annotated[str | None, Required()] = None

    @button
    def save_address(self):
        return Message("saved")


@ui("/nested-required")
@title("Required")
class RequiredInside:
    owner: Annotated[str, Section("Owner")] = "Ada"
    address: Annotated[RequiredAddress, Section("Address"), Inline()] = None  # type: ignore[assignment]

    def __init__(self):
        self.address = RequiredAddress()


class Node:
    """A self-referencing type: its nested child is not expanded again."""

    label: str = "root"
    child: "Node | None" = None


@ui("/nested-self")
@title("Self")
class SelfReferencing:
    node: Annotated[Node, Inline()] = None  # type: ignore[assignment]

    def __init__(self):
        self.node = Node()


MODULE = sys.modules[__name__]


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def load(view) -> dict:
    inc = handler().handle(RunActionRq(server_side_type=type_name(view)))
    return inc.model_dump(by_alias=True, mode="json")


def run(view, action_id: str, state: dict | None = None, parameters: dict | None = None) -> dict:
    inc = handler().handle(RunActionRq(
        server_side_type=type_name(view), action_id=action_id,
        component_state=state or {}, parameters=parameters or {},
    ))
    return inc.model_dump(by_alias=True, mode="json")


def walk(node):
    if isinstance(node, dict):
        yield node
        for value in node.values():
            yield from walk(value)
    elif isinstance(node, list):
        for value in node:
            yield from walk(value)


def field_ids(wire) -> list[str]:
    return [
        n["metadata"]["fieldId"] for n in walk(wire)
        if isinstance(n.get("metadata"), dict) and n["metadata"].get("type") == "FormField"
    ]


def buttons(wire) -> list[dict]:
    return [
        n["metadata"] for n in walk(wire)
        if isinstance(n.get("metadata"), dict) and n["metadata"].get("type") == "Button"
    ]


def messages(wire) -> list[str]:
    return [m["text"] for m in wire.get("messages") or []]


# ── first load ──────────────────────────────────────────────────────────────────


def test_nested_fields_carry_the_prefix_of_the_field_holding_them():
    ids = field_ids(load(NestedForm))
    assert ids == ["owner", "address-street", "address-city", "contact-email", "contact-phone"]


def test_an_inline_object_expands_into_a_full_row_custom_field():
    wire = load(NestedForm)
    custom = [
        n for n in walk(wire)
        if isinstance(n.get("metadata"), dict) and n["metadata"].get("type") == "CustomField"
    ]
    assert len(custom) == 1 and custom[0]["metadata"]["label"] == ""
    assert {"address-street", "address-city"} <= set(field_ids(custom[0]))


def test_a_nested_object_without_inline_is_a_sub_form_in_a_card():
    wire = load(NestedForm)
    pages = [
        n["metadata"] for n in walk(wire)
        if isinstance(n.get("metadata"), dict) and n["metadata"].get("type") == "Page"
        and n["metadata"].get("level") == 1
    ]
    assert [p["title"] for p in pages] == ["Contact"]
    # the sub-form's own toolbar dispatches the nested scheme
    assert [b["actionId"] for b in pages[0]["toolbar"]] == ["nested-form-action-contact-call"]


def test_a_text_field_inside_reads_its_prefixed_key_with_bracket_access():
    texts = [
        n["metadata"]["text"] for n in walk(load(NestedForm))
        if isinstance(n.get("metadata"), dict) and n["metadata"].get("type") == "Text"
        and "state" in (n["metadata"].get("text") or "")
    ]
    assert texts == ["${state['address-note']}"]
    assert state_expression("owner") == "${state.owner}"


def test_the_inline_toolbar_sits_on_the_section_title_row_and_its_buttons_below():
    wire = load(NestedForm)
    found = {b["actionId"]: b for b in buttons(wire)}
    verify = found["nested-form-action-address-verify"]
    assert verify["size"] == "small" and verify["shortcut"] == "ctrl+alt+a"
    assert found["nested-form-action-address-locate"]["size"] == "small"
    rows = [
        n for n in walk(wire)
        if isinstance(n.get("metadata"), dict) and n["metadata"].get("type") == "HorizontalLayout"
    ]
    title_row = next(r for r in rows if r.get("style") == "align-items: center; width: 100%;")
    assert [c["metadata"].get("text") or c["metadata"].get("actionId") for c in title_row["children"]] == [
        "Address", "nested-form-action-address-verify"]
    footer = next(r for r in rows if r.get("style") == "justify-content: flex-end; width: 100%;")
    assert [c["metadata"]["actionId"] for c in footer["children"]] == ["nested-form-action-address-locate"]


def test_a_single_section_form_renders_no_inline_buttons_like_java():
    wire = load(SingleSectionNested)
    assert not [b for b in buttons(wire) if b["actionId"].startswith("nested-form-action-")]
    # ...but still advertises (and so runs) the nested actions
    component = wire["fragments"][0]["component"]
    assert "nested-form-action-address-verify" in [a["id"] for a in component["actions"]]


def test_the_nested_actions_come_first_with_their_shortcut_and_validation():
    component = load(NestedForm)["fragments"][0]["component"]
    actions = {a["id"]: a for a in component["actions"]}
    ids = [a["id"] for a in component["actions"]]
    assert ids[:3] == [
        "nested-form-action-address-verify",
        "nested-form-action-address-locate",
        "nested-form-action-contact-call",
    ]
    assert actions["nested-form-action-address-verify"]["shortcut"] == "ctrl+alt+a"
    assert not actions["nested-form-action-address-verify"].get("validationRequired")
    assert actions["nested-form-action-address-locate"]["validationRequired"] is True
    assert "nested-form-action-address-secret" not in actions


def test_the_state_carries_each_nested_object_nested_and_flattened():
    fragment = load(NestedForm)["fragments"][0]
    assert fragment["component"]["initialData"]["address"] == {
        "street": "Main st", "city": "Palma", "note": "hello"}
    assert "address-street" not in fragment["component"]["initialData"]
    state = fragment["state"]
    assert state["address"]["city"] == "Palma"
    assert state["address-city"] == "Palma" and state["contact-email"] == "a@b.c"


def test_flattening_and_reading_back_are_recursive_and_the_flattened_keys_win():
    flat = flatten_state({"a": {"x": 1, "b": {"y": 2, "z": None}}})
    assert flat["a-x"] == 1 and flat["a-b-y"] == 2 and flat["a-b"] == {"y": 2}
    assert "a-b-z" not in flat
    assert nested_state_of({"a": {"x": 1}, "a-x": 9, "ab": 3}, "a") == {"x": 9}
    assert nested_state_of({"owner": "x"}, "a") is None


# ── second request ────────────────────────────────────────────────────────────


def test_a_nested_toolbar_action_runs_on_the_object_rehydrated_from_the_flattened_keys():
    SEEN.clear()
    wire = run(NestedForm, "nested-form-action-address-verify", {
        "owner": "Bob", "address": {"street": "Main st", "city": "Palma"}, "address-city": "Inca",
    })
    assert messages(wire) == ["verified:Inca"]
    assert len(SEEN) == 1 and SEEN[0].street == "Main st"


def test_a_nested_button_action_runs_and_a_sub_form_rehydrates_from_its_nested_map():
    wire = run(NestedForm, "nested-form-action-address-locate", {"address-street": "Sol 3"})
    assert messages(wire) == ["located:Sol 3"]
    wire = run(NestedForm, "nested-form-action-contact-call", {"contact": {"phone": "777"}})
    assert messages(wire) == ["calling:777"]


def test_a_nested_button_is_refused_while_a_required_nested_field_is_empty():
    with pytest.raises(Exception) as e:
        run(RequiredInside, "nested-form-action-address-saveAddress", {"owner": "Ada"})
    assert "Street: Cannot be empty" in str(e.value)
    ok = run(RequiredInside, "nested-form-action-address-saveAddress", {"address-street": "Sol"})
    assert messages(ok) == ["saved"]


def test_a_row_click_on_a_grid_inside_an_inline_object_runs_the_nested_method():
    wire = load(PartyForm)
    grids = [
        n["metadata"] for n in walk(wire)
        if isinstance(n.get("metadata"), dict) and n["metadata"].get("stereotype") == "grid"
    ]
    assert grids[0]["fieldId"] == "party-guests"
    assert grids[0]["onItemSelectionActionId"] == "nested-form-action-party-pick"
    ids = [a["id"] for a in wire["fragments"][0]["component"]["actions"]]
    assert "nested-form-action-party-pick" in ids
    picked = run(PartyForm, "nested-form-action-party-pick", {}, {"_clickedRow": {"name": "Eve"}})
    assert messages(picked) == ["picked:Eve"]


@pytest.mark.parametrize("action_id", [
    "nested-form-action-",
    "nested-form-action-address",
    "nested-form-action-address-",
    "nested-form-action--verify",
    "nested-form-action-nobody-verify",
    "nested-form-action-owner-verify",
    "nested-form-action-address-secret",
    "nested-form-action-address-__init__",
])
def test_a_crafted_nested_id_is_refused(action_id):
    with pytest.raises(Exception) as e:
        run(NestedForm, action_id)
    assert type(e.value).__name__ == "MateuForbiddenException", repr(e.value)


# ── what Java does NOT do, the port does not either ───────────────────────────


def test_lookup_labels_cover_top_level_fields_only_like_java():
    data = load(LookupHost)["fragments"][0].get("data") or {}
    assert data.get("vendor-label") == "label-V-1"
    assert not any(k.startswith("supplier-") for k in data)
    assert "supplier-supplierId" in field_ids(load(LookupHost))


def test_an_inline_object_counts_its_own_fields_in_the_column_inference():
    # x, y + the 5 inline fields = 7 → two columns (a plain nested object would count as one)
    assert form_columns_inference.form_columns(WideHost) == 2


def test_a_type_nested_in_itself_is_not_expanded_forever():
    assert field_ids(load(SelfReferencing)) == ["node-label"]


def test_the_constraints_of_an_inline_object_travel_under_the_prefixed_id():
    component = load(RequiredInside)["fragments"][0]["component"]
    validations = [v for v in component["validations"] if v["fieldId"] == "address-street"]
    assert validations and "state['address-street']" in validations[0]["condition"]
