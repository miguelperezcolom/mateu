"""Declared constraints on both legs: Min/Max/Size/Pattern/Required markers, @validation and
ValidationSupplier travel as the component's ``validations`` (Java's ValidationDto, same conditions
and messages) and are re-checked on the server when a crud form is saved."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import (  # noqa: E402
    Crud,
    Hidden,
    Max,
    Min,
    Pattern,
    ReadOnly,
    Required,
    Size,
    Step,
    Text,
    Validation,
    ValidationSupplier,
    Wizard,
    read_only,
    title,
    ui,
    validation,
)

MODULE = sys.modules[__name__]


@ui("val-form")
@title("Constraints")
@validation("state['to'] >= state['from']", "to", "Ends before it starts")
class Constrained:
    name: Annotated[str, Required()] = ""
    age: Annotated[int, Min(18), Max(99)] = 36
    code: Annotated[str, Size(min=3, max=8), Pattern("^[A-Z]+$")] = "ABC"
    nick: Annotated[str, Required(), Hidden("!state.special")] = ""
    locked: Annotated[str, Required(), ReadOnly()] = "x"
    ratio: Annotated[float, Min(0.5)] = 1.0
    caption: Annotated[str, Text(size="xl")] = "Hello"
    from_: int = 1
    to: int = 2


@ui("val-ro")
@read_only
class ReadOnlyView:
    name: Annotated[str, Required()] = "x"


@ui("val-supplied")
class Supplied(ValidationSupplier):
    name: Annotated[str, Required()] = ""

    def validations(self):
        return [Validation("state['name'] != 'root'", "name", "Reserved")]


class Member:
    id: str = ""
    name: Annotated[str, Required()] = ""
    age: Annotated[int, Min(18)] = 18


STORE: list[Member] = []


@ui("val-members")
class Members(Crud[Member]):
    def fetch(self, search):
        return list(STORE)

    def save(self, entity):
        STORE.append(entity)


@ui("val-wizard")
class SignUp(Wizard):
    name: Annotated[str, Step(1), Required()] = ""
    age: Annotated[int, Step(2), Min(18)] = 18


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def component(cls, **rq):
    inc = handler().handle(RunActionRq(server_side_type=type_name(cls), **rq))
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]


def entries(cls, **rq):
    return [(v["fieldId"], v["condition"], v["message"]) for v in component(cls, **rq)["validations"]]


def test_markers_travel_as_java_validations_in_java_order():
    got = entries(Constrained)
    assert got[:6] == [
        ("name", "state['name']", "Cannot be empty"),
        ("age", "state['age'] >= 18", "Must be at least 18"),
        ("age", "state['age'] <= 99", "Must be at most 99"),
        ("code", "state['code'] && state['code'].length < 3", "Size must be between 3 and 8"),
        ("code", "state['code'] && state['code'].length > 8", "Size must be between 3 and 8"),
        ("code", "/^[A-Z]+$/.test(state['code'])", "Invalid format"),
    ]


def test_a_conditionally_hidden_field_is_relaxed_while_hidden():
    assert ("nick", "(!state.special) || (state['nick'])", "Cannot be empty") in entries(Constrained)


def test_a_field_the_user_cannot_type_into_carries_no_constraint():
    assert not [e for e in entries(Constrained) if e[0] in ("locked", "caption")]
    assert entries(ReadOnlyView) == []


def test_a_fractional_bound_keeps_its_decimals():
    assert ("ratio", "state['ratio'] >= 0.5", "Must be at least 0.5") in entries(Constrained)


def test_class_level_validation_is_appended():
    assert entries(Constrained)[-1] == ("to", "state['to'] >= state['from']", "Ends before it starts")


def test_a_validation_supplier_replaces_the_derived_ones():
    assert entries(Supplied) == [("name", "state['name'] != 'root'", "Reserved")]


def test_the_crud_form_carries_its_entity_constraints():
    comp = component(Members, route="/val-members/new")
    assert [v["fieldId"] for v in comp["validations"]] == ["name", "age"]


def test_the_server_rejects_a_save_breaking_min():
    STORE.clear()
    inc = handler().handle(
        RunActionRq(
            route="/val-members/new",
            action_id="create",
            server_side_type=type_name(Members),
            component_state={"name": "Kid", "age": 12},
        )
    )
    assert inc.messages[0].variant == "error"
    assert "Age: Must be at least 18" in inc.messages[0].text
    assert STORE == []


def test_the_server_accepts_a_valid_save():
    STORE.clear()
    inc = handler().handle(
        RunActionRq(
            route="/val-members/new",
            action_id="create",
            server_side_type=type_name(Members),
            component_state={"name": "Ann", "age": 30},
        )
    )
    assert inc.messages[0].variant != "error"
    assert [m.name for m in STORE] == ["Ann"]


def test_a_wizard_carries_only_the_current_steps_constraints():
    assert [v["fieldId"] for v in component(SignUp)["validations"]] == ["name"]
