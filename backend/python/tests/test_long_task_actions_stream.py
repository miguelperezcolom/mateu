"""A ``@button`` / ``@toolbar`` / ``@action`` method declared ``-> LongTaskRun`` is advertised with
``sse`` (.NET infers it from the LongTaskRun return type, Java from a Flux): without it the client
calls /sync and nothing streams. Python only knows the DECLARED return type, so an unannotated
method needs ``@action_options(sse=True)``; and like .NET an explicit ``@action_options`` without
``sse`` cannot switch the inferred streaming off (``sse=False`` is the decorator's default)."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import LongTask, action, action_options, button, toolbar, ui  # noqa: E402
from mateu_ui.uidl.progress import LongTaskRun  # noqa: E402

MODULE = sys.modules[__name__]


def _task() -> LongTaskRun:
    return LongTask.create("x").run(lambda p: (p.step("a") for _ in range(1)))


@ui("ltas-page")
class LongTaskPage:
    name: str = ""

    @button
    def annotated(self) -> LongTaskRun:
        return _task()

    @button
    def unannotated(self):
        return _task()

    @button
    @action_options(sse=True)
    def declared(self):
        return _task()

    @button
    @action_options(timeout_millis=5000)
    def annotated_with_options(self) -> LongTaskRun:
        return _task()

    @toolbar
    def from_toolbar(self) -> "LongTaskRun":
        return _task()

    @action
    def bare_action(self) -> LongTaskRun:
        return _task()

    @button
    def plain(self) -> str:
        return "done"


def _actions() -> dict:
    rq = RunActionRq(server_side_type=type_name(LongTaskPage), action_id="")
    doc = SyncHandler(MateuRegistry(MODULE)).handle(rq).model_dump(by_alias=True, mode="json")
    return {a["id"]: a for a in doc["fragments"][0]["component"]["actions"]}


def test_a_button_declared_to_answer_a_long_task_streams():
    assert _actions()["annotated"]["sse"] is True


def test_a_toolbar_action_with_a_string_annotation_streams():
    assert _actions()["fromToolbar"]["sse"] is True


def test_a_bare_action_declared_to_answer_a_long_task_streams():
    assert _actions()["bareAction"]["sse"] is True


def test_an_unannotated_method_streams_only_when_declared():
    actions = _actions()
    assert actions["unannotated"]["sse"] is False
    assert actions["declared"]["sse"] is True


def test_action_options_without_sse_keep_the_inferred_streaming():
    a = _actions()["annotatedWithOptions"]
    assert a["sse"] is True
    assert a["timeoutMillis"] == 5000


def test_an_ordinary_button_does_not_stream():
    assert _actions()["plain"]["sse"] is False
