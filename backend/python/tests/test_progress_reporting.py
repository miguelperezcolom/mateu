"""Progress reporting — the Python mirror of Java's ``ProgressReportingSyncTest`` and
``LongTaskProgressTest``: a ``LongTask`` streams ``Progress`` commands carrying the whole state of
its task (never a server-built dialog), cancellable by its own caller only, always ending done,
failed or cancelled."""

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, progress, type_name  # noqa: E402
from mateu_ui.dtos import UICommand  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    Identity,
    LongTask,
    MessageAction,
    UserFacingException,
    button,
    ui,
)

CANCELLED: list[bool] = []


@ui("progress-reporting")
class Jobs:
    @button()
    def import_all(self):
        return (
            LongTask.create("Importing")
            .with_progress_bar()
            .done("Imported", "3 rows")
            .close_after(2)
            .with_command(UICommand(target_component_id="ux_main", type="NavigateTo", data="/results"))
            .run(lambda p: (p.step("Row 2", done=2, total=3) if i == 2 else p.step(f"Row {i}") for i in range(1, 4)))
        )

    @button()
    def background(self):
        return (
            LongTask.create("Syncing")
            .background()
            .cancellable()
            .retryable()
            .result_action(MessageAction.open("Open report", "/reports/1"))
            .notify_when_done()
            .run(lambda p: (p.step(f"Row {i}") for i in range(1, 2)))
        )

    @button()
    def endless(self):
        def work(p):
            i = 0
            while True:
                i += 1
                yield p.step(f"tick {i}", done=i, total=1000)

        return LongTask.create("Endless").on_cancel(lambda: CANCELLED.append(True)).run(work)

    @button()
    def broken(self):
        def work(p):
            yield p.step("Row 1")
            raise UserFacingException("Row 2 is invalid")

        return LongTask.create("Broken").retryable().run(work)

    @button()
    def crashing(self):
        def work(p):
            yield p.step("Row 1")
            raise RuntimeError("postgres://db.internal/prod password=hunter2")

        return LongTask.create("Crashing").run(work)


MODULE = sys.modules[__name__]


def handler(identity=None) -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE), identity_provider=lambda: identity)


def rq(action_id, parameters=None) -> RunActionRq:
    return RunActionRq(
        route="/progress-reporting",
        server_side_type=type_name(Jobs),
        action_id=action_id,
        component_state={},
        parameters=parameters or {},
    )


def wire(inc) -> dict:
    return json.loads(json.dumps(inc.model_dump(by_alias=True, mode="json")))


def progress_of(increments) -> list[dict]:
    return [c["data"] for i in increments for c in wire(i)["commands"] if c["type"] == "Progress"]


def streamed(action_id, identity=None) -> tuple:
    """The first increment and the generator of the rest, as the SSE endpoint gets them."""
    with progress.collecting_streams() as streams:
        first = handler(identity).handle(rq(action_id))
    assert streams, "the LongTask handed no stream over"
    return first, streams[0]


def test_a_long_task_streams_the_whole_state_of_its_task_and_no_dialog():
    first, rest = streamed("importAll")
    increments = [first, *rest]
    assert all(wire(i)["fragments"] == [] for i in increments)
    steps = progress_of(increments)
    assert len(steps) == 5
    assert {s["taskId"] for s in steps} == {steps[0]["taskId"]}
    start = steps[0]
    assert start["state"] == "running" and start["title"] == "Importing"
    assert start["text"] == "Starting..." and start["fraction"] == 0.0
    assert start["blocking"] is True and start["cancellable"] is False
    assert start["startedAt"] is not None
    counted = steps[2]
    assert counted["text"] == "Row 2" and counted["done"] == 2 and counted["total"] == 3
    assert counted["fraction"] == pytest.approx(2 / 3)
    # a later step keeps what an earlier one said (each command is self-contained)
    assert steps[3]["title"] == "Importing" and steps[3]["total"] == 3
    done = steps[4]
    assert done["state"] == "done" and done["title"] == "Imported" and done["text"] == "3 rows"
    assert done["fraction"] == 1.0 and done["closeAfterSeconds"] == 2
    last = wire(increments[-1])
    assert "NavigateTo" in [c["type"] for c in last["commands"]]
    assert all(c["targetComponentId"] is None for c in last["commands"])
    assert not progress.is_running(done["taskId"])


def test_a_background_task_says_so_and_posts_its_result_to_the_inbox():
    first, rest = streamed("background")
    increments = [first, *rest]
    steps = progress_of(increments)
    start = steps[0]
    assert start["blocking"] is False and start["backgroundable"] is False
    assert start["cancellable"] is True and start["retryable"] is True
    assert start["fraction"] is None
    done = steps[-1]
    assert done["resultActions"] == [
        {"label": "Open report", "actionId": None, "parameters": None, "route": "/reports/1", "style": None}
    ]
    messages = wire(increments[-1])["messages"]
    assert len(messages) == 1
    assert messages[0]["persistence"] == "inbox"
    assert messages[0]["key"] == "task-" + done["taskId"]
    assert len(messages[0]["actions"]) == 1


def test_the_sync_endpoint_runs_the_task_to_the_end():
    inc = handler().handle(rq("importAll"))
    steps = progress_of([inc])
    assert steps[0]["state"] == "running" and steps[-1]["state"] == "done"


def test_the_caller_cancels_its_task_and_the_work_is_disposed():
    CANCELLED.clear()
    me = Identity(name="ana", roles=("user",))
    first, rest = streamed("endless", me)
    task_id = progress_of([first])[0]["taskId"]
    next(rest)
    assert progress.is_running(task_id)
    answer = handler(me).handle(rq("_progress-cancel", {"taskId": task_id}))
    assert [p["state"] for p in progress_of([answer])] == ["cancelled"]
    remaining = list(rest)
    last = progress_of(remaining)[-1]
    assert last["state"] == "cancelled" and last["cancellable"] is False
    assert CANCELLED == [True]
    assert not progress.is_running(task_id)


def test_another_caller_cannot_cancel_it():
    me = Identity(name="ana", roles=("user",))
    first, rest = streamed("endless", me)
    task_id = progress_of([first])[0]["taskId"]
    try:
        answer = handler(Identity(name="ana", roles=("admin",))).handle(
            rq("_progress-cancel", {"taskId": task_id})
        )
        assert wire(answer)["commands"] == []
        assert progress.is_running(task_id)
        assert wire(handler(me).handle(rq("_progress-cancel", {"taskId": "nope"})))["commands"] == []
    finally:
        rest.close()


def test_a_task_that_fails_ends_failed_with_the_message_the_user_sees():
    first, rest = streamed("broken")
    increments = [first, *rest]
    last = progress_of(increments)[-1]
    assert last["state"] == "failed"
    assert last["error"] == "Row 2 is invalid"
    assert last["retryable"] is True
    assert any(m["text"] == "Row 2 is invalid" for i in increments for m in wire(i)["messages"])
    assert not progress.is_running(last["taskId"])


def test_a_task_that_crashes_never_streams_the_raw_exception(monkeypatch):
    monkeypatch.delenv("MATEU_ERRORS_DETAILED", raising=False)
    first, rest = streamed("crashing")
    increments = [first, *rest]
    last = progress_of(increments)[-1]
    assert last["state"] == "failed"
    assert last["error"] and "hunter2" not in last["error"]
    assert "hunter2" not in json.dumps([wire(i) for i in increments])


def test_an_anonymous_caller_cannot_cancel_an_authenticated_callers_task():
    from mateu_ui.core.identity import Identity

    ana = Identity(name="ana", roles=["user"])
    first, rest = streamed("endless", ana)
    task_id = progress_of([first])[0]["taskId"]
    try:
        assert handler(None).handle(rq("_progress-cancel", {"taskId": task_id})).commands == []
        assert handler(Identity(name="ana", roles=["user", "admin"])).handle(
            rq("_progress-cancel", {"taskId": task_id})).commands == []
        assert progress.is_running(task_id)
    finally:
        rest.close()


def test_closing_the_stream_cancels_the_work():
    CANCELLED.clear()
    first, rest = streamed("endless")
    task_id = progress_of([first])[0]["taskId"]
    next(rest)
    rest.close()
    assert CANCELLED == [True]
    assert not progress.is_running(task_id)


def test_steps_without_a_bar_stay_indeterminate():
    task = LongTask.create("Import")
    reporter, _ = task.run(lambda p: ()).start()
    assert wire(reporter.step("one", 0.5))["commands"][0]["data"]["fraction"] is None
    assert wire(reporter.step("two", "Importing"))["commands"][0]["data"]["title"] == "Importing"
    counted = wire(reporter.step("three", done=12, total=300))["commands"][0]["data"]
    assert counted["fraction"] == 0.04 and counted["done"] == 12


def test_sse_endpoint_streams_the_task(monkeypatch):
    fastapi = pytest.importorskip("fastapi")
    from fastapi.testclient import TestClient

    from mateu_ui.fastapi import add_mateu

    api = fastapi.FastAPI()
    add_mateu(api, MODULE, identity_provider=lambda: None)
    rs = TestClient(api).post(
        "/mateu/v3/sse/progress-reporting",
        json={"serverSideType": type_name(Jobs), "actionId": "importAll", "route": "/progress-reporting", "componentState": {}},
    )
    events = [json.loads(c[len("data:"):].strip()) for c in rs.text.split("\n\n") if c.startswith("data:")]
    states = [c["data"]["state"] for e in events for c in e["commands"] if c["type"] == "Progress"]
    assert states == ["running", "running", "running", "running", "done"]
    assert len(events) == 5
