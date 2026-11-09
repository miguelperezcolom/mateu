"""Reattach, ETA, OS notifications and the server-side inbox — the Python mirror of the items of
design/progress-and-notifications.md "Completed in 3.0": a task survives its stream for the grace
period and a reloaded tab picks it up again (owner-scoped, a foreign task indistinguishable from an
unknown one); the server stamps an honest ETA (conformance/progress/eta.json); ``@app`` opts in to
OS notifications / a store-only bell; an ``inbox`` message of a signed-in user is stored and
published."""

import json
import sys
import threading
import time
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, progress, type_name  # noqa: E402
from mateu_ui.core.eta_estimator import EtaEstimator  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    AppNotification,
    Identity,
    InboxStore,
    InMemoryInboxStore,
    LiveNotifications,
    LongTask,
    Message,
    MessageAction,
    MessagePersistence,
    MessageVariant,
    NotificationsSupplier,
    app,
    button,
    ui,
)

CORPUS = Path(__file__).resolve().parents[3] / "conformance" / "progress" / "eta.json"
CANCELLED: list[bool] = []
GATE = threading.Event()


@ui("reattach")
class Jobs:
    @button()
    def gated(self):
        """Runs until GATE opens: one step, then waits, then ends done."""

        def work(p):
            yield p.step("half", done=1, total=2)
            while not GATE.wait(0.01):
                yield p.step("waiting", done=1, total=2)
            yield p.step("all", done=2, total=2)

        return (LongTask.create("Gated").background().notify_when_done()
                .on_cancel(lambda: CANCELLED.append(True)).run(work))

    @button()
    def endless(self):
        def work(p):
            i = 0
            while True:
                i += 1
                time.sleep(0.005)
                yield p.step(f"tick {i}", done=i, total=10_000)

        return LongTask.create("Endless").on_cancel(lambda: CANCELLED.append(True)).run(work)

    @button()
    def notify(self):
        return Message("Imported", MessageVariant.SUCCESS,
                       persistence=MessagePersistence.INBOX,
                       actions=[MessageAction.open("Open", "/reports/1"), MessageAction.run("Undo", "undo")])


MODULE = sys.modules[__name__]
ANA = Identity(name="ana", roles=("user",))
BOB = Identity(name="bob", roles=("user",))


def handler(identity=None) -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE), identity_provider=lambda: identity)


def rq(action_id, parameters=None, route="/reattach", ssn=None) -> RunActionRq:
    return RunActionRq(
        route=route,
        server_side_type=ssn if ssn is not None else type_name(Jobs),
        action_id=action_id,
        component_state={},
        parameters=parameters or {},
    )


def wire(inc) -> dict:
    return json.loads(json.dumps(inc.model_dump(by_alias=True, mode="json")))


def progress_of(increments) -> list[dict]:
    return [c["data"] for i in increments for c in wire(i)["commands"] if c["type"] == "Progress"]


class Collector:
    def __init__(self):
        self.items = []
        self.ended = threading.Event()

    def __call__(self, item):
        if item is progress.END:
            self.ended.set()
        else:
            self.items.append(item)


def started(action_id, identity=None, grace=60.0):
    """A task started the way the SSE endpoint starts it: hot, with one subscriber."""
    progress.configure(grace)
    with progress.collecting_streams() as streams:
        first = handler(identity).handle(rq(action_id))
    task_id = progress.task_id_of(first)
    hot = progress.hot(task_id, streams[0], lambda fn: fn())
    primary = Collector()
    subscription = hot.subscribe(primary)
    hot.start()
    return task_id, hot, subscription, primary


@pytest.fixture(autouse=True)
def _reset():
    GATE.clear()
    CANCELLED.clear()
    yield
    GATE.set()
    progress.configure(None)


def wait_until(predicate, timeout=3.0):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if predicate():
            return True
        time.sleep(0.01)
    return False


# ── reattach ──────────────────────────────────────────────────────────────────────────────────


def test_a_task_outlives_its_stream_and_a_resume_picks_it_up():
    task_id, hot, subscription, _ = started("gated", ANA)
    hot.unsubscribe(subscription)  # the tab reloads: nobody watches
    time.sleep(0.05)
    assert progress.is_running(task_id) and CANCELLED == []
    # the reloaded tab asks which of its tasks are still there
    listed = handler(ANA).handle(rq("_progress-tasks", {"taskIds": [task_id, "nope"]}))
    assert [(p["taskId"], p["state"]) for p in progress_of([listed])] == [(task_id, "running")]
    resumed = Collector()
    first, again = progress.resume(task_id, ANA, resumed)
    assert again is not None
    assert progress_of([first])[0]["state"] == "running"
    GATE.set()
    assert resumed.ended.wait(3)
    states = [p["state"] for p in progress_of(resumed.items)]
    assert states[-1] == "done"
    # reduced to the page-level parts: no fragments, only Progress / NotificationsChanged commands
    assert all(wire(i)["fragments"] == [] for i in resumed.items)
    assert all(c["type"] in ("Progress", "NotificationsChanged") for i in resumed.items for c in wire(i)["commands"])
    # the terminal increment's inbox message travels with it
    assert any(m["persistence"] == "inbox" for i in resumed.items for m in wire(i)["messages"])
    assert CANCELLED == []


def test_a_finished_task_is_still_told_for_the_grace_period():
    task_id, hot, subscription, primary = started("gated", ANA)
    hot.unsubscribe(subscription)
    GATE.set()
    assert wait_until(lambda: not progress.is_running(task_id))
    listed = handler(ANA).handle(rq("_progress-tasks", {"taskIds": [task_id]}))
    assert [p["state"] for p in progress_of([listed])] == ["done"]
    first, again = progress.resume(task_id, ANA, Collector())
    assert again is None
    assert progress_of([first])[0]["state"] == "done"
    assert wire(first)["messages"][0]["key"] == "task-" + task_id
    snapshot = handler(ANA).handle(rq("_progress-resume", {"taskId": task_id}))
    assert progress_of([snapshot])[0]["state"] == "done"


def test_nobody_coming_back_in_time_cancels_the_task():
    task_id, hot, subscription, primary = started("endless", ANA, grace=0.1)
    hot.unsubscribe(subscription)
    assert wait_until(lambda: CANCELLED == [True])
    assert wait_until(lambda: not progress.is_running(task_id))
    listed = handler(ANA).handle(rq("_progress-tasks", {"taskIds": [task_id]}))
    assert [p["state"] for p in progress_of([listed])] == ["cancelled"]


def test_a_resume_in_time_calls_the_cancel_off():
    task_id, hot, subscription, _ = started("endless", ANA, grace=0.2)
    hot.unsubscribe(subscription)
    resumed = Collector()
    _, again = progress.resume(task_id, ANA, resumed)
    time.sleep(0.4)
    assert CANCELLED == [] and progress.is_running(task_id)
    handler(ANA).handle(rq("_progress-cancel", {"taskId": task_id}))
    assert resumed.ended.wait(3)
    assert progress_of(resumed.items)[-1]["state"] == "cancelled"


def test_grace_zero_cancels_when_the_stream_closes():
    task_id, hot, subscription, _ = started("endless", ANA, grace=0)
    hot.unsubscribe(subscription)
    assert wait_until(lambda: CANCELLED == [True])
    # nothing kept: with no grace a finished task is forgotten at once
    assert progress_of([handler(ANA).handle(rq("_progress-tasks", {"taskIds": [task_id]}))]) == []


def test_another_caller_cannot_list_or_resume_the_task():
    task_id, hot, subscription, _ = started("gated", ANA)
    try:
        for other in (BOB, Identity(name="ana", roles=("user", "admin")), None):
            assert wire(handler(other).handle(rq("_progress-tasks", {"taskIds": [task_id]})))["commands"] == []
            assert progress.resume(task_id, other, Collector()) == (None, None)
            assert wire(handler(other).handle(rq("_progress-resume", {"taskId": task_id})))["commands"] == []
        # indistinguishable from an unknown task
        assert progress.resume("nope", ANA, Collector()) == (None, None)
        assert wire(handler(ANA).handle(rq("_progress-tasks", {"taskIds": ["nope"]})))["commands"] == []
    finally:
        GATE.set()


def test_an_anonymous_task_is_reachable_by_its_id_only():
    task_id, hot, subscription, _ = started("gated", None)
    try:
        assert progress_of([handler(None).handle(rq("_progress-tasks", {"taskIds": [task_id]}))])
        assert progress.resume(task_id, ANA, Collector()) == (None, None)
    finally:
        GATE.set()


def test_progress_tasks_looks_at_fifty_ids_at_most():
    task_id, hot, subscription, _ = started("gated", ANA)
    try:
        ids = [f"x{i}" for i in range(50)] + [task_id]
        assert wire(handler(ANA).handle(rq("_progress-tasks", {"taskIds": ids})))["commands"] == []
    finally:
        GATE.set()


def test_sse_resume_streams_the_task_and_is_empty_for_a_foreign_one():
    fastapi = pytest.importorskip("fastapi")
    from fastapi.testclient import TestClient

    from mateu_ui.fastapi import add_mateu

    caller = {"identity": ANA}
    api = fastapi.FastAPI()
    add_mateu(api, MODULE, identity_provider=lambda: caller["identity"], progress_reattach_grace_seconds=30)
    client = TestClient(api)
    task_id, hot, subscription, _ = started("gated", ANA, grace=30)
    hot.unsubscribe(subscription)
    caller["identity"] = BOB
    foreign = client.post("/mateu/v3/sse/reattach", json={"actionId": "_progress-resume", "parameters": {"taskId": task_id}})
    assert foreign.status_code == 200 and "data:" not in foreign.text
    caller["identity"] = ANA
    threading.Timer(0.2, GATE.set).start()
    rs = client.post("/mateu/v3/sse/reattach", json={"actionId": "_progress-resume", "parameters": {"taskId": task_id}})
    events = [json.loads(c[len("data:"):].strip()) for c in rs.text.split("\n\n") if c.startswith("data:")]
    states = [c["data"]["state"] for e in events for c in e["commands"] if c["type"] == "Progress"]
    assert states[0] == "running" and states[-1] == "done"


# ── ETA ───────────────────────────────────────────────────────────────────────────────────────


def test_the_eta_follows_the_conformance_corpus():
    corpus = json.loads(CORPUS.read_text())
    assert corpus["cases"]
    for case in corpus["cases"]:
        estimator = EtaEstimator()
        got = [
            estimator.observe(s["t"], s.get("fraction"), s.get("done"), s.get("total"), s.get("state", "running"))
            for s in case["samples"]
        ]
        assert got == case["expected"], case["name"]


def test_the_server_stamps_the_eta_on_the_progress_it_streams(monkeypatch):
    clock = {"t": 0.0}
    monkeypatch.setattr(progress, "clock_ms", lambda: clock["t"])

    def work(p):
        for i in range(1, 6):
            clock["t"] = i * 1000.0
            yield p.step(f"row {i}", done=i, total=10)

    run = LongTask.create("Import").run(work)
    increments = list(progress.stream(run, None, map_item=lambda x: x, describe_error=lambda e: {}))
    etas = [p["etaSeconds"] for p in progress_of(increments)]
    assert etas[:3] == [None, None, None]
    assert etas[3] is not None and etas[4] is not None and etas[4] <= etas[3]
    assert etas[-1] is None  # done


# ── @app flags ────────────────────────────────────────────────────────────────────────────────


@app("Flags", os_notifications=True, inbox=True)
@ui("flags-app")
class FlagsApp:
    pass


def app_metadata(cls) -> dict:
    h = SyncHandler(MateuRegistry(cls), identity_provider=lambda: ANA)
    inc = wire(h.handle(RunActionRq(route="/flags-app", server_side_type=type_name(cls), action_id="", component_state={})))
    found = []

    def walk(node):
        if isinstance(node, dict):
            if node.get("type") == "App":
                found.append(node)
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)

    walk(inc)
    assert found, "no App metadata"
    return found[0]


def test_app_opts_in_to_os_notifications_and_a_store_only_bell():
    meta = app_metadata(FlagsApp)
    assert meta["osNotifications"] is True
    assert meta["notificationsEnabled"] is True


# ── server-side inbox ─────────────────────────────────────────────────────────────────────────


def test_an_inbox_message_of_a_signed_in_user_is_stored_keyed_and_published():
    changes = []
    unsubscribe = LiveNotifications.subscribe(changes.append)
    try:
        h = handler(ANA)
        answer = wire(h.handle(rq("notify")))
    finally:
        unsubscribe()
    message = answer["messages"][0]
    assert message["key"] and message["key"].startswith("inbox-")
    stored = h.inbox_store.list("ana")
    assert [e.id for e in stored] == [message["key"]]
    entry = stored[0]
    assert entry.title == "Imported" and entry.unread and entry.variant == "success"
    assert [a.route for a in entry.actions] == ["/reports/1"]  # the actionId one needs its screen
    assert entry.when and len(entry.when) == len("2026-01-01 10:00")
    assert [(c.principal, c.notification.id) for c in changes] == [("ana", message["key"])]


def test_an_anonymous_callers_inbox_message_is_not_stored():
    h = handler(None)
    answer = wire(h.handle(rq("notify")))
    assert answer["messages"][0].get("key") is None
    assert h.inbox_store.list("None") == [] and h.inbox_store.list("") == []


class Recording(InboxStore):
    def __init__(self):
        self.added = []

    def add(self, principal, entry):
        self.added.append((principal, entry.id))

    def list(self, principal):
        return []

    def mark_read(self, principal, ids):
        pass

    def dismiss(self, principal, ids):
        pass


def test_the_app_can_replace_the_store():
    fastapi = pytest.importorskip("fastapi")
    from mateu_ui.fastapi import add_mateu

    store = Recording()
    h = add_mateu(fastapi.FastAPI(), MODULE, identity_provider=lambda: ANA, inbox_store=store)
    h.handle(rq("notify"))
    assert store.added and store.added[0][0] == "ana"


SUPPLIED: list[str] = []


@app("Inbox")
@ui("inbox-app")
class InboxApp(NotificationsSupplier):
    def notifications(self, request=None):
        return [AppNotification(id="s1", title="Supplied", unread=True)]

    def mark_notifications_read(self, ids, request=None):
        SUPPLIED.extend(ids)


@app("Store only", inbox=True)
@ui("store-only")
class StoreOnly:
    pass


def listed(h, cls, action="_notifications-list", parameters=None, route="/inbox-app") -> list[dict]:
    inc = wire(h.handle(RunActionRq(route=route, server_side_type=type_name(cls), action_id=action,
                                    component_state={}, parameters=parameters or {})))
    return [n for f in inc["fragments"] for n in (f.get("data") or {}).get("_notifications", [])]


def test_the_list_merges_the_supplier_and_the_store_and_routes_ids_back():
    SUPPLIED.clear()
    h = SyncHandler(MateuRegistry(InboxApp), identity_provider=lambda: ANA)
    h.inbox_store.add("ana", AppNotification(id="k1", title="Stored"))
    h.inbox_store.add("ana", AppNotification(id="s1", title="Duplicate of supplied"))
    h.inbox_store.add("bob", AppNotification(id="b1", title="Bob's"))
    assert [n["id"] for n in listed(h, InboxApp)] == ["s1", "k1"]
    after = listed(h, InboxApp, "_notifications-read", {"ids": ["k1", "s1", "b1"]})
    assert SUPPLIED == ["s1"]
    assert [n["unread"] for n in after if n["id"] == "k1"] == [False]
    assert h.inbox_store.list("bob")[0].unread is True  # another user's id never reaches the store
    after = listed(h, InboxApp, "_notifications-dismiss", {"ids": ["k1", "b1"]})
    assert [n["id"] for n in after] == ["s1"]
    assert [e.id for e in h.inbox_store.list("bob")] == ["b1"]


def test_a_store_only_app_serves_its_bell_from_the_store():
    h = SyncHandler(MateuRegistry(StoreOnly), identity_provider=lambda: ANA)
    h.inbox_store.add("ana", AppNotification(id="k1", title="Stored"))
    assert [n["id"] for n in listed(h, StoreOnly, route="/store-only")] == ["k1"]
    # a stored entry offers no action to run: refused like any entry not offering it
    from mateu_ui.core import MateuForbiddenException

    with pytest.raises(MateuForbiddenException):
        listed(h, StoreOnly, "_notifications-act", {"id": "k1", "actionId": "x"}, route="/store-only")


def test_the_in_memory_store_is_bounded():
    store = InMemoryInboxStore(max_per_principal=3, max_principals=2)
    for i in range(5):
        store.add("ana", AppNotification(id=f"e{i}", title=str(i)))
    assert [e.id for e in store.list("ana")] == ["e4", "e3", "e2"]
    store.add("bob", AppNotification(id="b", title="b"))
    store.add("carl", AppNotification(id="c", title="c"))
    assert store.list("ana") == []  # least recently used principal went first
