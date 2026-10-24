"""The inferred form column count: ONE column up to 6 visible fields, TWO from 7 on — counted over
the whole form, over the fields that render as form fields. Declarations (``@form_layout(columns)``,
``@zones``) always win, each wizard step is its own form, and an inferred single column keeps
labels on top. The Python mirror of Java's ``FormColumnsInferenceSyncTest``."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core.form_columns_inference import form_columns  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    EyesOnly,
    HeaderBadge,
    Hidden,
    Section,
    Step,
    Timestamp,
    Version,
    Wizard,
    form_layout,
    title,
    ui,
    zones,
)

MODULE = sys.modules[__name__]


class One:
    f1: str = "a"


class Two(One):
    f2: str = "b"


class Three(Two):
    f3: str = "c"


class Four(Three):
    f4: str = "d"


class Five(Four):
    f5: str = "e"


@ui("/cols-six")
@title("Six")
class Six(Five):
    """Six short-labelled single-line fields: dense enough for labels aside — were it declared."""

    f6: str = "f"


@ui("/cols-seven")
@title("Seven")
class Seven(Six):
    f7: str = "g"


@ui("/cols-six-plus-excluded")
@title("Excluded")
class SixPlusExcluded(Six):
    """Six visible fields plus everything that never renders as a form field."""

    hidden: Annotated[str, Hidden()] = "h"
    badge: Annotated[str, HeaderBadge()] = "b"
    updated: Annotated[str, Timestamp("Updated")] = "now"
    version: Annotated[int, Version()] = 0


@ui("/cols-six-plus-eyes-only")
@title("EyesOnly")
class SixPlusEyesOnly(Six):
    """A permission-dependent field still counts: one class gets one layout, whoever looks."""

    secret: Annotated[str, EyesOnly(roles=["admin"])] = "s"


@ui("/cols-sections")
@title("Sections")
class SevenInSections:
    """Seven fields across two sections: the count is over the WHOLE form."""

    a1: Annotated[str, Section("A")] = ""
    a2: str = ""
    a3: str = ""
    b1: Annotated[str, Section("B")] = ""
    b2: str = ""
    b3: str = ""
    b4: str = ""


@ui("/cols-declared-two")
@title("Declared two")
@form_layout(columns=2)
class DeclaredTwo(Three):
    pass


@ui("/cols-declared-one")
@title("Declared one")
@form_layout(columns=1)
class DeclaredOne(Seven):
    pass


@ui("/cols-zones")
@title("Zones")
@zones(("left", "50%"), ("right", "50%"))
class Zoned:
    """A zoned form is a declared layout: its sections keep the classic 2."""

    l1: Annotated[str, Section("L", zone="left")] = ""
    r1: Annotated[str, Section("R", zone="right")] = ""


@ui("/cols-wizard")
@title("Wizard")
class ColsWizard(Wizard):
    a: Annotated[str, Step(1)] = ""
    b: Annotated[str, Step(1)] = ""
    c1: Annotated[str, Step(2)] = ""
    c2: Annotated[str, Step(2)] = ""
    c3: Annotated[str, Step(2)] = ""
    c4: Annotated[str, Step(2)] = ""
    c5: Annotated[str, Step(2)] = ""
    c6: Annotated[str, Step(2)] = ""
    c7: Annotated[str, Step(2)] = ""


def layouts(cls, action_id=None, state=None) -> list[dict]:
    inc = SyncHandler(MateuRegistry(MODULE)).handle(
        RunActionRq(server_side_type=type_name(cls), action_id=action_id,
                    component_state=state or {}, initiator_component_id="c1")
    )
    root = inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]
    found = [
        c["metadata"] for c in walk(root)
        if isinstance(c.get("metadata"), dict) and c["metadata"].get("type") == "FormLayout"
    ]
    assert found, f"form layouts of {cls.__name__}"
    return found


def columns(cls, action_id=None, state=None) -> list[int]:
    return [layout["maxColumns"] for layout in layouts(cls, action_id, state)]


def walk(node):
    if not isinstance(node, dict):
        return
    yield node
    meta = node.get("metadata")
    if isinstance(meta, dict) and isinstance(meta.get("content"), dict):
        yield from walk(meta["content"])
    for child in node.get("children") or []:
        yield from walk(child)


@pytest.mark.parametrize("form", [One, Two, Three, Four, Five, Six])
def test_up_to_six_visible_fields_is_one_column(form):
    assert form_columns(form) == 1


def test_seven_visible_fields_are_two_columns():
    assert form_columns(Seven) == 2


def test_the_wire_carries_the_inferred_count():
    assert set(columns(Six)) == {1}
    assert set(columns(Seven)) == {2}


def test_fields_that_never_render_as_form_fields_do_not_count():
    assert set(columns(SixPlusExcluded)) == {1}


def test_a_permission_dependent_field_counts_whoever_looks():
    assert set(columns(SixPlusEyesOnly)) == {2}


def test_the_count_is_over_the_whole_form_so_every_section_shares_it():
    assert columns(SevenInSections) == [2, 2]


def test_an_explicit_form_layout_wins():
    assert set(columns(DeclaredTwo)) == {2}
    assert set(columns(DeclaredOne)) == {1}


def test_a_zoned_form_keeps_two():
    assert set(columns(Zoned)) == {2}


def test_each_wizard_step_is_its_own_form():
    assert set(columns(ColsWizard)) == {1}
    assert set(columns(ColsWizard, "next", {"__step": 1})) == {2}


def test_an_inferred_single_column_keeps_labels_on_top():
    assert all(layout["labelsAside"] is False for layout in layouts(Six))


def test_a_declared_single_column_still_gets_labels_aside():
    assert layouts(DeclaredOne)[0]["labelsAside"] is True
