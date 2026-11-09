"""Class-level read_only_unless (.NET's class-level [ReadOnlyUnless], Java's @ReadOnlyUnless on a
type): every field of the view is read-only unless the caller is authorized, keeps its constraints
(as Java's ValidationMapper / ServerConstraintCheck do), and is never written from the wire for an
unauthorized caller."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import Identity, Required, button, read_only_unless, ui  # noqa: E402
from mateu_ui.uidl.messages import UserFacingException  # noqa: E402

MODULE = sys.modules[__name__]
SEEN: list[str] = []


@ui("salary")
@read_only_unless(roles=("hr",))
class Salary:
    employee: Annotated[str, Required()] = "Ada"
    amount: int = 100

    @button()
    def check(self):
        SEEN.append(f"{self.employee}:{self.amount}")


def handler(identity):
    return SyncHandler(MateuRegistry(MODULE), identity_provider=lambda: identity)


def fields(node, out):
    if isinstance(node, dict):
        meta = node.get("metadata")
        if isinstance(meta, dict) and meta.get("type") == "FormField":
            out[meta["fieldId"]] = meta
        for v in node.values():
            fields(v, out)
    elif isinstance(node, list):
        for v in node:
            fields(v, out)
    return out


def load(identity):
    return handler(identity).handle(RunActionRq(route="salary")).model_dump(by_alias=True, mode="json")


def test_the_unauthorized_see_every_field_read_only_and_keep_its_constraints():
    inc = load(Identity(roles=("staff",)))
    found = fields(inc, {})
    assert found["employee"].get("readOnly") is True and found["amount"].get("readOnly") is True
    # Java's ValidationMapper does not ask ReadOnlyUnless: the locked value travels pre-filled and
    # its constraint with it (conformance validation-unless)
    assert [v["fieldId"] for v in inc["fragments"][0]["component"]["validations"]] == ["employee"]


def test_the_authorized_edit_them():
    found = fields(load(Identity(roles=("hr",))), {})
    assert not found["employee"].get("readOnly") and not found["amount"].get("readOnly")


def test_the_wire_never_writes_them_for_the_unauthorized():
    SEEN.clear()
    rq = RunActionRq(server_side_type=type_name(Salary), action_id="check",
                     component_state={"employee": "Eve", "amount": 999})
    handler(Identity(roles=("staff",))).handle(rq)
    handler(Identity(roles=("hr",))).handle(rq)
    assert SEEN == ["Ada:100", "Eve:999"]


@ui("salary-unset")
@read_only_unless(roles=("hr",))
class UnsetSalary:
    employee: Annotated[str, Required()] = ""

    @button()
    def check(self):
        SEEN.append("ran")


def test_the_server_rechecks_a_locked_fields_constraint_like_java():
    # Java's ServerConstraintCheck asks rendersAsInput, which does not consult @ReadOnlyUnless: the
    # locked (unwritable) value is still checked, as the client checks it
    SEEN.clear()
    rq = RunActionRq(server_side_type=type_name(UnsetSalary), action_id="check", component_state={})
    with pytest.raises(UserFacingException) as refused:
        handler(Identity(roles=("staff",))).handle(rq)
    assert SEEN == []
    assert "• Employee: Cannot be empty" in str(refused.value)
