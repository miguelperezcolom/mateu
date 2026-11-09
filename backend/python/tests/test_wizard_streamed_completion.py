"""A ``@wizard_completion_action`` answering a ``LongTask`` (Java: a completion returning a Flux):
its progress streams, then the wizard lands on its result step — built once the work is over, so it
shows what the work set. A task that reports an error stays on the step. The action is advertised
over SSE so the client receives the progress as it is produced."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Annotated

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, progress, type_name  # noqa: E402
from mateu_ui.uidl import LongTask, Message, MessageVariant, Step, Wizard, ui, wizard_completion_action  # noqa: E402
from mateu_ui.uidl.progress import LongTaskRun  # noqa: E402

MODULE = sys.modules[__name__]


@ui("wsc-end-of-day")
class EndOfDay(Wizard):
    cashiers_closed: Annotated[bool, Step(1)] = False
    confirm: Annotated[bool, Step(2)] = True
    status: Annotated[str, Step(3)] = ""

    @wizard_completion_action("Run end of day")
    def run(self) -> LongTaskRun:
        def work(p):
            if not self.cashiers_closed:
                yield Message("Close the open cashiers first.", variant=MessageVariant.ERROR)
                return
            for i in range(1, 4):
                self.status = f"{i} of 3 procedures run"
                yield p.step(f"Procedure {i}", done=i, total=3)

        return LongTask.create("Running end of day").with_progress_bar().run(work)


def rq(state: dict, action: str = "run") -> RunActionRq:
    return RunActionRq(server_side_type=type_name(EndOfDay), action_id=action, component_state=state)


def handle(state: dict, action: str = "run"):
    return SyncHandler(MateuRegistry(MODULE)).handle(rq(state, action))


def test_the_streaming_completion_is_advertised_over_sse():
    doc = handle({"__step": 1}, "next").model_dump(by_alias=True, mode="json")
    action = next(a for a in doc["fragments"][0]["component"]["actions"] if a["id"] == "run")
    assert action["sse"] is True
    assert action["validationRequired"] is True


def test_the_progress_streams_then_the_result_step_shows_what_the_work_set():
    inc = handle({"__step": 2, "cashiersClosed": True, "confirm": True})
    progress_commands = [c for c in inc.commands if c.type == "Progress"]
    assert progress_commands, "the task's progress travels"
    assert progress_commands[-1].data.state == "done"
    # the last increment is the wizard on its result step, built after the work ran
    fragment = inc.fragments[-1]
    assert fragment.state["__step"] == 3
    assert fragment.state["status"] == "3 of 3 procedures run"


def test_over_sse_the_result_step_follows_the_progress():
    with progress.collecting_streams() as holder:
        first = handle({"__step": 2, "cashiersClosed": True, "confirm": True})
    assert [c.type for c in first.commands] == ["Progress"]
    rest = list(holder[0])
    assert rest[-1].fragments[0].state["__step"] == 3
    assert all(not i.fragments for i in rest[:-1])


def test_a_stream_reporting_an_error_stays_on_the_step():
    inc = handle({"__step": 2, "cashiersClosed": False, "confirm": True})
    assert [m.text for m in inc.messages if m.variant == "error"] == ["Close the open cashiers first."]
    assert not inc.fragments  # no result step: the user fixes the step and runs it again
