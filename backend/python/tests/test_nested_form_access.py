"""Access markers inside a NESTED form are enforced like at the top level (GA review S3; the Java
probe found them neither stripped on read nor enforced on write): an ``EyesOnly`` nested value
never reaches the wire, and an ``EyesOnly`` / ``ReadOnlyUnless`` nested field is never written."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import EyesOnly, Identity, Inline, Message, ReadOnlyUnless, button, ui  # noqa: E402

MODULE = sys.modules[__name__]
SAVED: dict = {}


class Pay:
    salary: Annotated[float, ReadOnlyUnless(roles=["manager"])] = 100.0
    secret_note: Annotated[str, EyesOnly(roles=["manager"])] = "TOP-SECRET-NOTE"
    comment: str = ""


@ui("nested-employee")
class NestedEmployee:
    bonus: Annotated[float, ReadOnlyUnless(roles=["manager"])] = 1.0
    pay: Annotated[Pay, Inline()] = None  # type: ignore[assignment]
    other: Pay = None  # type: ignore[assignment]

    def __init__(self):
        self.pay = Pay()
        self.other = Pay()

    @button
    def save(self):
        SAVED.update(
            bonus=self.bonus, pay_salary=self.pay.salary, pay_note=self.pay.secret_note,
            other_salary=self.other.salary, other_note=self.other.secret_note,
            pay_comment=self.pay.comment,
        )
        return Message("saved")


def _handler(roles=()):
    return SyncHandler(MateuRegistry(MODULE), identity_provider=lambda: Identity(roles=tuple(roles)))


def test_a_nested_eyes_only_value_never_reaches_the_wire():
    out = json.dumps(_handler().handle(RunActionRq(route="nested-employee")).model_dump(by_alias=True, mode="json"))
    assert "TOP-SECRET-NOTE" not in out
    manager = json.dumps(
        _handler(("manager",)).handle(RunActionRq(route="nested-employee")).model_dump(by_alias=True, mode="json")
    )
    assert "TOP-SECRET-NOTE" in manager


def _save(roles=()):
    SAVED.clear()
    forged = {"salary": 999, "secretNote": "pwned", "comment": "ok"}
    _handler(roles).handle(RunActionRq(
        route="nested-employee", server_side_type=type_name(NestedEmployee), action_id="save",
        component_state={
            "bonus": 999, "pay": dict(forged), "other": dict(forged),
            "pay-salary": 999, "pay-secretNote": "pwned", "other-salary": 999, "other-secretNote": "pwned",
        },
    ))
    return dict(SAVED)


def test_nested_locked_and_hidden_fields_are_not_written_from_the_wire():
    saved = _save()
    assert saved == {
        "bonus": 1.0, "pay_salary": 100.0, "pay_note": "TOP-SECRET-NOTE",
        "other_salary": 100.0, "other_note": "TOP-SECRET-NOTE", "pay_comment": "ok",
    }


def test_an_authorized_caller_writes_them():
    saved = _save(("manager",))
    assert (saved["bonus"], saved["pay_salary"], saved["pay_note"], saved["other_salary"]) == (999, 999, "pwned", 999)
