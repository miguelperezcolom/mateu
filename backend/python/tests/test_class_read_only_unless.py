"""Class-level read_only_unless (.NET's class-level [ReadOnlyUnless], Java's @ReadOnlyUnless on a
type): every field of the view is read-only unless the caller is authorized, sends no constraints
the user cannot satisfy, and is never written from the wire for an unauthorized caller."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import Identity, Required, button, read_only_unless, ui  # noqa: E402

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


def test_the_unauthorized_see_every_field_read_only_and_no_constraints():
    inc = load(Identity(roles=("staff",)))
    found = fields(inc, {})
    assert found["employee"].get("readOnly") is True and found["amount"].get("readOnly") is True
    assert inc["fragments"][0]["component"]["validations"] == []


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
