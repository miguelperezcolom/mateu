"""Wizard navigation the user drives: Back (and its cancelable hook), the step pager's
jump-to-step (backward only), Skip and the completion action vetoed by ``before_step_navigate``,
completing from a step that does not offer it, and draft actions on a wizard that is not
Draftable — the Python mirror of Java's WizardActionDispatcher rules."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import Message, Step, Wizard, title, ui, wizard_completion_action  # noqa: E402

MODULE = sys.modules[__name__]
VETOES: list[tuple[int, int]] = []
DONE: list[str] = []


@ui("/nav-wizard")
@title("Trip")
class NavWizard(Wizard):
    city: Annotated[str, Step(1)] = ""
    hotel: Annotated[str, Step(2)] = ""
    extras: Annotated[str, Step(3)] = ""
    result: Annotated[str, Step(4)] = ""

    def step_skippable(self, step: int) -> bool:
        return step == 2

    def before_step_navigate(self, from_step: int, to_step: int):
        if (from_step, to_step) in VETOES:
            return Message(f"Not from {from_step} to {to_step}")
        return None

    @wizard_completion_action("Book")
    def book(self):
        DONE.append(self.city)


@ui("/plain-wizard")
@title("Plain")
class PlainWizard(Wizard):
    a: Annotated[str, Step(1)] = ""
    b: Annotated[str, Step(2)] = ""


def run(cls, route, action_id=None, state=None, parameters=None):
    return SyncHandler(MateuRegistry(MODULE)).handle(
        RunActionRq(route=route, consumed_route=route, server_side_type=type_name(cls),
                    action_id=action_id, initiator_component_id="c1_app",
                    component_state=state or {}, parameters=parameters or {})
    )


def step(inc) -> int:
    frag = inc.fragments[0]
    data = dict(getattr(frag.component, "initial_data", None) or {})
    data.update(frag.state or {})
    return data["__step"]


def texts(inc):
    return [m.text for m in inc.messages]


def setup_function():
    VETOES.clear()
    DONE.clear()


def test_back_goes_one_step_back_and_never_below_the_first():
    assert step(run(NavWizard, "/nav-wizard", "back", {"__step": 3})) == 2
    assert step(run(NavWizard, "/nav-wizard", "back", {"__step": 1})) == 1


def test_back_can_be_cancelled_by_the_hook():
    VETOES.append((3, 2))
    inc = run(NavWizard, "/nav-wizard", "back", {"__step": 3})
    assert texts(inc) == ["Not from 3 to 2"]
    assert not any(f.component is not None for f in inc.fragments)


def test_the_step_pager_jumps_backward_only():
    assert step(run(NavWizard, "/nav-wizard", "goToStep", {"__step": 3}, {"_stepId": "step-1"})) == 1
    # forward would skip validation: stays put
    assert step(run(NavWizard, "/nav-wizard", "goToStep", {"__step": 1}, {"_stepId": "step-3"})) == 1
    # a malformed bullet id is ignored
    assert step(run(NavWizard, "/nav-wizard", "goToStep", {"__step": 3}, {"_stepId": "step-x"})) == 3
    assert step(run(NavWizard, "/nav-wizard", "goToStep", {"__step": 3}, {"_stepId": 2})) == 3


def test_a_jump_can_be_cancelled_by_the_hook():
    VETOES.append((3, 1))
    inc = run(NavWizard, "/nav-wizard", "goToStep", {"__step": 3}, {"_stepId": "step-1"})
    assert texts(inc) == ["Not from 3 to 1"]


def test_skip_can_be_cancelled_by_the_hook():
    VETOES.append((2, 3))
    inc = run(NavWizard, "/nav-wizard", "skip", {"__step": 2})
    assert texts(inc) == ["Not from 2 to 3"]


def test_the_completion_action_can_be_cancelled_and_then_does_not_run():
    VETOES.append((3, 4))
    inc = run(NavWizard, "/nav-wizard", "book", {"__step": 3, "city": "Palma"})
    assert texts(inc) == ["Not from 3 to 4"]
    assert DONE == []
    VETOES.clear()
    run(NavWizard, "/nav-wizard", "book", {"__step": 3, "city": "Palma"})
    assert DONE == ["Palma"]


def test_the_completion_action_is_refused_from_a_step_that_does_not_offer_it():
    inc = run(NavWizard, "/nav-wizard", "book", {"__step": 1, "city": "Palma"})
    assert texts(inc) == ["The wizard cannot complete from this step"]
    assert DONE == []


def test_draft_actions_on_a_wizard_that_is_not_draftable_just_re_render():
    inc = run(PlainWizard, "/plain-wizard", "saveDraft", {"__step": 2})
    assert step(inc) == 2
    assert texts(inc) == []
