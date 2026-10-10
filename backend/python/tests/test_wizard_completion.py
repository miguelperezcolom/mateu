"""``@wizard_completion_action`` (Java's ``@WizardCompletionAction``): the penultimate step runs the
completion instead of Next, the last step is a read-only result screen at 100% with no
navigation."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import Message, Required, Step, Wizard, ui, wizard_completion_action  # noqa: E402

MODULE = sys.modules[__name__]


@ui("wc-booking")
class Booking(Wizard):
    guest: Annotated[str, Step(1), Required()] = ""
    nights: Annotated[int, Step(2)] = 1
    reference: Annotated[str, Step(3)] = ""

    @wizard_completion_action("Book")
    def book(self):
        self.reference = f"R-{self.guest}-{self.nights}"
        return Message("Booked")


def run(action: str, state: dict):
    return SyncHandler(MateuRegistry(MODULE)).handle(
        RunActionRq(server_side_type=type_name(Booking), action_id=action, component_state=state)
    ).model_dump(by_alias=True, mode="json")


def nodes(doc):
    if isinstance(doc, dict):
        yield doc
        for v in doc.values():
            yield from nodes(v)
    elif isinstance(doc, list):
        for v in doc:
            yield from nodes(v)


def buttons(doc) -> list[str]:
    return [n["actionId"] for n in nodes(doc) if n.get("type") == "Button" and "actionId" in n]


def test_the_penultimate_step_offers_the_completion_action():
    doc = run("next", {"__step": 1, "guest": "Ann"})
    assert buttons(doc) == ["back", "book"]
    actions = [a["id"] for a in doc["fragments"][0]["component"]["actions"]]
    assert actions[:2] == ["next", "book"]


def test_completion_runs_and_shows_the_read_only_result_step():
    doc = run("book", {"__step": 2, "guest": "Ann", "nights": 3})
    assert doc["fragments"][0]["state"]["__step"] == 3
    assert doc["fragments"][0]["state"]["reference"] == "R-Ann-3"
    assert [m["text"] for m in doc["messages"]] == ["Booked"]
    assert buttons(doc) == []  # no navigation on the result step
    field = next(n for n in nodes(doc) if n.get("type") == "FormField")
    assert field["readOnly"] is True
    assert next(n for n in nodes(doc) if n.get("type") == "ProgressBar")["value"] == 1.0


def test_the_result_step_is_reached_only_through_the_completion():
    assert run("next", {"__step": 2, "guest": "Ann"})["fragments"][0]["state"]["__step"] == 2
    refused = run("book", {"__step": 1, "guest": "Ann"})
    assert refused["messages"][0]["variant"] == "error"
