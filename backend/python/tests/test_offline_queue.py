"""The offline send queue's server contract (mirrors Java's OfflineQueueSyncTest and .NET's
OfflineQueueTests): ``@action_options(offline=OfflinePolicy.QUEUE)`` travels as ``offline: "queue"``,
and an ``Idempotency-Key`` runs once per caller, action and key over the real sync endpoint."""

import sys
import threading
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, idempotency_keys  # noqa: E402
from mateu_ui.fastapi import add_mateu  # noqa: E402
from mateu_ui.uidl import Identity, Message, OfflinePolicy, action_options, button, title, ui  # noqa: E402

RUNS = {"n": 0}


def _run(text: str) -> Message:
    RUNS["n"] += 1
    return Message(f"{text} {RUNS['n']}")


@ui("offline-count")
@title("Stock count")
class OfflineStockCount:
    counted: int = 0

    @button()
    @action_options(offline=OfflinePolicy.QUEUE)
    def save(self):
        return _run("Saved")

    @button()
    def other(self):
        return _run("Other")

    @button()
    def fail(self):
        RUNS["n"] += 1
        raise RuntimeError("boom")


def _actions():
    handler = SyncHandler(MateuRegistry(OfflineStockCount))
    rq = RunActionRq.model_validate(
        {"route": "offline-count", "consumedRoute": "_empty", "actionId": "", "componentState": {}}
    )
    increment = handler.handle(rq, "")
    return {a.id: a for a in increment.fragments[0].component.actions}


def test_the_offline_policy_travels_on_the_action_dto():
    actions = _actions()
    assert actions["save"].offline == "queue"
    assert actions["other"].offline is None
    assert "offline" not in actions["other"].model_dump(by_alias=True, exclude_none=True)


def test_an_unknown_offline_policy_fails_loudly():
    try:
        action_options(offline="later")
    except (ValueError, TypeError):
        return
    raise AssertionError("an unknown offline policy should be rejected")


def test_an_idempotency_key_runs_once_per_caller_action_and_key():
    idempotency_keys.clear()
    RUNS["n"] = 0
    app = FastAPI()
    add_mateu(app, OfflineStockCount)
    client = TestClient(app)

    def send(action_id: str, key: str | None) -> str:
        headers = {idempotency_keys.HEADER: key} if key is not None else {}
        response = client.post(
            "/mateu/v3/sync/offline-count",
            json={
                "route": "/offline-count", "consumedRoute": "_empty", "actionId": action_id,
                "serverSideType": OfflineStockCount.__module__ + "." + OfflineStockCount.__qualname__,
                "componentState": {"counted": 3},
            },
            headers=headers,
        )
        assert response.status_code == 200, response.text
        return response.text

    assert "Saved 1" in send("save", "key-0001-aaaa")
    assert "Saved 1" in send("save", "key-0001-aaaa")  # replayed, not run
    assert RUNS["n"] == 1
    assert "Saved 2" in send("save", "key-0002-bbbb")
    assert "Other 3" in send("other", "key-0001-aaaa")  # scoped to the action
    assert "Saved 4" in send("save", None)
    assert "Saved 5" in send("save", "short")  # malformed: ignored
    assert "Saved 6" in send("save", "short")
    # a failed run is forgotten: the same key runs again
    assert '"error"' in send("fail", "key-0003-cccc")
    assert RUNS["n"] == 7
    assert '"error"' in send("fail", "key-0003-cccc")
    assert RUNS["n"] == 8
    idempotency_keys.clear()


def test_the_key_is_scoped_to_the_caller():
    idempotency_keys.clear()
    runs = []
    alice = idempotency_keys.caller_of(Identity(name="alice", roles=("staff",)))
    bob = idempotency_keys.caller_of(Identity(name="bob", roles=("staff",)))
    assert idempotency_keys.once(alice, "save", "key-0005-eeee", lambda: runs.append(1) or "a") == "a"
    assert idempotency_keys.once(alice, "save", "key-0005-eeee", lambda: runs.append(1) or "x") == "a"
    assert idempotency_keys.once(bob, "save", "key-0005-eeee", lambda: runs.append(1) or "b") == "b"
    assert len(runs) == 2
    idempotency_keys.clear()


def test_a_repeat_arriving_while_the_first_run_is_in_flight_waits_for_it():
    idempotency_keys.clear()
    gate = threading.Event()
    started = threading.Event()
    runs = []

    def slow():
        runs.append(1)
        started.set()
        gate.wait(5)
        return "first"

    results = []
    first = threading.Thread(target=lambda: results.append(idempotency_keys.once("u", "save", "key-0009-zzzz", slow)))
    first.start()
    started.wait(5)
    second = threading.Thread(target=lambda: results.append(idempotency_keys.once("u", "save", "key-0009-zzzz", slow)))
    second.start()
    gate.set()
    first.join(5)
    second.join(5)
    assert results == ["first", "first"]
    assert len(runs) == 1
    idempotency_keys.clear()


def test_entries_are_bounded():
    idempotency_keys.clear()
    previous = idempotency_keys.max_entries
    idempotency_keys.max_entries = 2
    try:
        runs = []
        for key in ("key-a-000001", "key-b-000002", "key-c-000003"):
            idempotency_keys.once("u", "save", key, lambda: runs.append(1) or "ok")
        # the least recently used one was dropped: it runs again
        idempotency_keys.once("u", "save", "key-a-000001", lambda: runs.append(1) or "ok")
        assert len(runs) == 4
    finally:
        idempotency_keys.max_entries = previous
        idempotency_keys.clear()
