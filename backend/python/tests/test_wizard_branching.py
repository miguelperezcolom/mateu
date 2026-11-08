"""Wizard branching (Java's ``Wizard.stepApplies``): ``step_applies(step)`` removes a step the
answers made irrelevant — skipped by Next and Back alike, left out of the progress, and when the
penultimate step is skipped the completion action moves to the last step that applies."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    Step,
    Wizard,
    title,
    ui,
    wizard_completion_action,
    wizard_progress,
)

MODULE = sys.modules[__name__]


@ui("/branching-wizard")
@title("Loan")
@wizard_progress("steps")
class BranchingWizard(Wizard):
    medium: Annotated[str, Step(1)] = ""
    plinth: Annotated[str, Step(2)] = ""
    lender: Annotated[str, Step(3)] = ""
    insurer: Annotated[str, Step(4)] = ""
    result: Annotated[str, Step(5)] = ""

    def step_applies(self, step: int) -> bool:
        if step == 2:
            return self.medium == "sculpture"
        if step == 4:
            return self.lender == "abroad"
        return True

    @wizard_completion_action("Request")
    def request(self):
        self.result = f"{self.medium} from {self.lender}"


def run(action_id=None, state=None):
    return SyncHandler(MateuRegistry(MODULE)).handle(
        RunActionRq(route="/branching-wizard", consumed_route="/branching-wizard",
                    server_side_type=type_name(BranchingWizard), action_id=action_id,
                    initiator_component_id="c1_app", component_state=state or {},
                    parameters={})
    )


def step(inc) -> int:
    frag = inc.fragments[0]
    data = dict(getattr(frag.component, "initial_data", None) or {})
    data.update(frag.state or {})
    return data["__step"]


def walk(node):
    yield node
    for child in getattr(node, "children", None) or []:
        yield from walk(child)


def metadata_of(inc, type_):
    return [n.metadata for n in walk(inc.fragments[0].component)
            if getattr(getattr(n, "metadata", None), "type", None) == type_]


def action_ids(inc):
    return [m.action_id for m in metadata_of(inc, "Button")]


def test_next_skips_a_step_that_does_not_apply():
    assert step(run("next", {"__step": 1, "medium": "painting"})) == 3
    assert step(run("next", {"__step": 1, "medium": "sculpture"})) == 2


def test_back_skips_it_too():
    assert step(run("back", {"__step": 3, "medium": "painting"})) == 1
    assert step(run("back", {"__step": 3, "medium": "sculpture"})) == 2


def test_the_progress_leaves_out_the_steps_that_do_not_apply():
    inc = run("next", {"__step": 1, "medium": "painting"})
    bullets = metadata_of(inc, "ProgressSteps")[0].steps
    assert [b.id for b in bullets] == ["step-1", "step-3"]
    assert [b.status for b in bullets] == ["done", "current"]


def test_the_completion_moves_to_the_last_step_that_applies():
    # the insurer step (the penultimate one) does not apply: the lender step completes
    inc = run("next", {"__step": 1, "medium": "painting"})
    assert "request" in action_ids(inc)
    assert "next" not in action_ids(inc)
    done = run("request", {"__step": 3, "medium": "painting", "lender": "local"})
    assert step(done) == 5


def test_with_every_step_applying_nothing_changes():
    inc = run("next", {"__step": 3, "medium": "sculpture", "lender": "abroad"})
    assert step(inc) == 4
    assert "request" in action_ids(inc)
    bullets = metadata_of(inc, "ProgressSteps")[0].steps
    assert [b.id for b in bullets] == ["step-1", "step-2", "step-3", "step-4"]
