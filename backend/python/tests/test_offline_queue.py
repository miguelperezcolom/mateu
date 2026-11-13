"""The offline send queue's server contract (mirrors Java's OfflineQueueSyncTest and .NET's
OfflineQueueTests): ``@action_options(offline=OfflinePolicy.QUEUE)`` travels as ``offline: "queue"``,
and an ``Idempotency-Key`` runs once per caller, action and key over the real sync endpoint."""

import sys
import threading

import pytest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, idempotency_keys  # noqa: E402
from mateu_ui.core.action_guard import MateuForbiddenException  # noqa: E402
from mateu_ui.fastapi import add_mateu  # noqa: E402
from mateu_ui.uidl import Crud, Identity, Message, OfflinePolicy, action_options, audience, button, disabled_unless, title, ui  # noqa: E402

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


def test_a_repeat_waits_for_a_stuck_run_only_a_bounded_time(monkeypatch):
    """A join holds a worker thread: it gives up after join_timeout_seconds with the busy refusal
    (which the client keeps queued) instead of parking the thread until the stuck run ends."""
    import time

    from mateu_ui.uidl.messages import UserFacingException

    idempotency_keys.clear()
    monkeypatch.setattr(idempotency_keys, "join_timeout_seconds", 0.2)
    gate = threading.Event()
    started = threading.Event()

    def stuck():
        started.set()
        gate.wait(10)
        return "late"

    first = threading.Thread(target=lambda: idempotency_keys.once("u", "save", "key-0010-stuck", stuck))
    first.start()
    try:
        assert started.wait(5)
        began = time.monotonic()
        try:
            idempotency_keys.once("u", "save", "key-0010-stuck", lambda: "duplicate")
            raise AssertionError("the repeat should have been refused")
        except UserFacingException as busy:
            assert idempotency_keys.BUSY_TITLE in str(busy) or getattr(busy, "title", None) == idempotency_keys.BUSY_TITLE
        assert time.monotonic() - began < 5
    finally:
        gate.set()
        first.join(5)
        idempotency_keys.clear()


def test_finished_answers_are_bounded():
    idempotency_keys.clear()
    previous = idempotency_keys.max_entries
    idempotency_keys.max_entries = 2
    try:
        runs = []
        for key in ("key-a-000001", "key-b-000002", "key-c-000003"):
            idempotency_keys.once("u", "save", key, lambda: runs.append(1) or "ok")
        # the least recently used FINISHED answer was dropped: it runs again
        idempotency_keys.once("u", "save", "key-a-000001", lambda: runs.append(1) or "ok")
        assert len(runs) == 4
    finally:
        idempotency_keys.max_entries = previous
        idempotency_keys.clear()


def test_a_run_in_flight_is_never_evicted_a_full_table_refuses_a_new_key():
    from mateu_ui.uidl.messages import UserFacingException

    idempotency_keys.clear()
    previous = idempotency_keys.max_entries
    idempotency_keys.max_entries = 1
    gate = threading.Event()
    started = threading.Event()
    runs = []

    def slow(label):
        def run():
            runs.append(label)
            started.set()
            gate.wait(5)
            return label

        return run

    try:
        results = []
        a = threading.Thread(target=lambda: results.append(idempotency_keys.once("u", "save", "key-A-000001", slow("original"))))
        a.start()
        assert started.wait(5)
        # B arrives while A is in flight and the table is full: refused, A untouched
        try:
            idempotency_keys.once("u", "save", "key-B-000002", slow("b"))
            raise AssertionError("B should have been refused")
        except UserFacingException as refusal:
            assert refusal.title == idempotency_keys.BUSY_TITLE
        assert idempotency_keys.in_flight() == 1
        # a retry of A joins A: never a second execution
        retry = threading.Thread(target=lambda: results.append(idempotency_keys.once("u", "save", "key-A-000001", slow("duplicate"))))
        retry.start()
        gate.set()
        a.join(5)
        retry.join(5)
        assert runs == ["original"]
        assert results == ["original", "original"]
        assert idempotency_keys.in_flight() == 0
        # once A finished, B is admitted
        assert idempotency_keys.once("u", "save", "key-B-000002", lambda: "b") == "b"
    finally:
        idempotency_keys.max_entries = previous
        idempotency_keys.clear()


def test_the_caller_scope_is_complete_and_canonical():
    base = idempotency_keys.caller_of(Identity(name="ana", roles=("clerk",)))
    variants = {
        base,
        idempotency_keys.caller_of(Identity(name="ana", roles=("clerk",), groups=("g",))),
        idempotency_keys.caller_of(Identity(name="ana", roles=("clerk",), scopes=("s",))),
        idempotency_keys.caller_of(Identity(name="ana", roles=("clerk",), permissions=("p",))),
    }
    assert len(variants) == 4
    assert idempotency_keys.caller_of(Identity(name="ana", roles=("b", "a"))) == idempotency_keys.caller_of(
        Identity(name="ana", roles=("a", "b"))
    )


@ui("offline-mine")
@title("Mine")
class OfflineMine:
    counted: int = 0

    @button()
    @action_options(offline=OfflinePolicy.QUEUE)
    def save(self):
        from mateu_ui.core import current_request

        RUNS["n"] += 1
        return Message(f"Saved for {current_request().headers.get('x-app-user')}")

    @button()
    @action_options(offline=OfflinePolicy.QUEUE)
    @disabled_unless(permissions=("stock.write",))
    def guarded(self):
        return _run("Guarded")

    @button()
    @action_options(offline=OfflinePolicy.QUEUE)
    @audience("staff")
    def staff_only(self):
        return _run("Staff")


def _gateway_identity():
    """The app's own identity provider: user + permissions its gateway put in headers."""
    from mateu_ui.core import current_request

    request = current_request()
    user = request.headers.get("x-app-user") if request is not None else None
    if user is None:
        return None
    permissions = request.headers.get("x-app-permissions")
    return Identity(name=user, permissions=tuple(permissions.split(",")) if permissions else ())


def _mine_client() -> TestClient:
    app = FastAPI()
    add_mateu(app, OfflineMine, identity_provider=_gateway_identity)
    return TestClient(app)


def _send_mine(client, action_id, user, key, permissions=None, app_state=None):
    headers = {idempotency_keys.HEADER: key, "X-App-User": user}
    if permissions:
        headers["X-App-Permissions"] = permissions
    return client.post(
        "/mateu/v3/sync/offline-mine",
        json={
            "route": "/offline-mine", "consumedRoute": "_empty", "actionId": action_id,
            "serverSideType": OfflineMine.__module__ + "." + OfflineMine.__qualname__,
            "componentState": {"counted": 0}, "appState": app_state or {},
        },
        headers=headers,
    )


def test_two_users_of_a_custom_identity_provider_never_share_a_key():
    idempotency_keys.clear()
    RUNS["n"] = 0
    client = _mine_client()
    alice = _send_mine(client, "save", "alice", "key-0010-same")
    bob = _send_mine(client, "save", "bob", "key-0010-same")
    assert "Saved for alice" in alice.text
    assert "Saved for bob" in bob.text
    assert RUNS["n"] == 2
    idempotency_keys.clear()


def test_a_revoked_permission_is_refused_not_served_from_memory():
    idempotency_keys.clear()
    RUNS["n"] = 0
    client = _mine_client()
    first = _send_mine(client, "guarded", "alice", "key-0011-same", permissions="stock.write")
    assert "Guarded 1" in first.text
    second = _send_mine(client, "guarded", "alice", "key-0011-same")
    assert "Guarded 1" not in second.text
    assert second.status_code == 403 or '"error"' in second.text
    assert RUNS["n"] == 1
    idempotency_keys.clear()


class OfflineTogglePart:
    id: str = ""
    name: str = ""


class OfflineToggleParts(Crud[OfflineTogglePart]):
    """A crud whose write gate is APP LOGIC, not identity (.NET's OfflineToggleParts)."""

    EDITABLE = {"on": True}
    SAVES = {"n": 0}
    ROWS: dict = {}

    def fetch(self, search):
        return list(self.ROWS.values())

    def get(self, id_):
        return self.ROWS.get(id_)

    def save(self, entity):
        OfflineToggleParts.SAVES["n"] += 1
        self.ROWS[entity.id] = entity

    def can_edit(self):
        return OfflineToggleParts.EDITABLE["on"]


OfflineToggleParts = ui("offline-toggle-parts")(OfflineToggleParts)


def _reset_toggle():
    part = OfflineTogglePart()
    part.id, part.name = "p1", "Bolt"
    OfflineToggleParts.ROWS.clear()
    OfflineToggleParts.ROWS["p1"] = part
    OfflineToggleParts.SAVES["n"] = 0
    OfflineToggleParts.EDITABLE["on"] = True


def _save_toggle(key):
    handler = SyncHandler(MateuRegistry(OfflineToggleParts))
    rq = RunActionRq(
        route="offline-toggle-parts/p1/edit", consumed_route="/offline-toggle-parts",
        server_side_type=f"{__name__}.OfflineToggleParts", action_id="save", initiator_component_id="c1",
        component_state={"name": "Nut"},
    )
    return idempotency_keys.guarded(
        "u", "save", key, lambda: handler.handle(rq), view=rq.server_side_type, route=rq.route
    )


def test_a_replay_refused_by_a_non_identity_rule_is_refused_not_served_from_memory():
    """The crud's write gate is app logic, not identity: the caller scope is the same, so only
    checking the key AFTER the request's checks keeps the remembered answer from being handed out
    (.NET's twin)."""
    idempotency_keys.clear()
    _reset_toggle()
    _save_toggle("key-0012-same")
    assert OfflineToggleParts.SAVES["n"] == 1
    OfflineToggleParts.EDITABLE["on"] = False
    with pytest.raises(MateuForbiddenException):
        _save_toggle("key-0012-same")
    assert idempotency_keys.in_flight() == 0
    # the gate allowing it again: the same key answers from memory, the save does not run again
    OfflineToggleParts.EDITABLE["on"] = True
    _save_toggle("key-0012-same")
    assert OfflineToggleParts.SAVES["n"] == 1
    idempotency_keys.clear()


def test_a_replay_of_an_action_that_is_no_longer_offered_is_refused():
    idempotency_keys.clear()
    RUNS["n"] = 0
    client = _mine_client()
    first = _send_mine(client, "staffOnly", "alice", "key-0013-same", app_state={"audience": "staff"})
    assert "Staff 1" in first.text
    removed = OfflineMine.__dict__["staff_only"]
    delattr(OfflineMine, "staff_only")
    try:
        replay = _send_mine(client, "staffOnly", "alice", "key-0013-same", app_state={"audience": "staff"})
        assert "Staff 1" not in replay.text
        assert replay.status_code == 403 or '"error"' in replay.text, replay.text
    finally:
        OfflineMine.staff_only = removed
    assert RUNS["n"] == 1
    idempotency_keys.clear()


def test_a_request_refused_before_its_checkpoint_never_claims_the_key():
    idempotency_keys.clear()
    _reset_toggle()
    OfflineToggleParts.EDITABLE["on"] = False
    with pytest.raises(MateuForbiddenException):
        _save_toggle("key-0014-same")
    assert idempotency_keys.in_flight() == 0
    OfflineToggleParts.EDITABLE["on"] = True
    _save_toggle("key-0014-same")
    assert OfflineToggleParts.SAVES["n"] == 1
    idempotency_keys.clear()


@ui("offline-count-2")
@title("Stock count 2")
class OfflineStockCountTwo:
    counted: int = 0

    @button()
    @action_options(offline=OfflinePolicy.QUEUE)
    def save(self):
        return _run("Saved")


def test_the_key_is_scoped_to_the_view():
    idempotency_keys.clear()
    RUNS["n"] = 0
    app = FastAPI()
    add_mateu(app, OfflineStockCount, OfflineStockCountTwo)
    client = TestClient(app)

    def send(route: str, view) -> str:
        response = client.post(
            f"/mateu/v3/sync/{route}",
            json={
                "route": f"/{route}", "consumedRoute": "_empty", "actionId": "save",
                "serverSideType": view.__module__ + "." + view.__qualname__,
                "componentState": {"counted": 3},
            },
            headers={idempotency_keys.HEADER: "key-0015-same"},
        )
        assert response.status_code == 200, response.text
        return response.text

    assert "Saved 1" in send("offline-count", OfflineStockCount)
    assert "Saved 2" in send("offline-count-2", OfflineStockCountTwo)
    assert "Saved 1" in send("offline-count", OfflineStockCount)  # replayed on its own view
    assert RUNS["n"] == 2
    idempotency_keys.clear()


def test_each_caller_has_its_own_in_flight_share(monkeypatch):
    """GA review S10: past ITS share a caller's NEW key is refused; another caller is unaffected."""
    from mateu_ui.uidl.messages import UserFacingException

    idempotency_keys.clear()
    monkeypatch.setattr(idempotency_keys, "max_entries_per_caller", 2)
    gate = threading.Event()
    threads = []
    try:
        for i in range(2):
            started = threading.Event()

            def slow(started=started):
                started.set()
                gate.wait(5)
                return "done"

            t = threading.Thread(target=lambda i=i, slow=slow: idempotency_keys.once("ana", "save", f"key-share-{i:04d}", slow))
            t.start()
            threads.append(t)
            assert started.wait(5)
        try:
            idempotency_keys.once("ana", "save", "key-share-9999", lambda: "third")
            raise AssertionError("over her share: refused")
        except UserFacingException as busy:
            assert getattr(busy, "title", idempotency_keys.BUSY_TITLE) == idempotency_keys.BUSY_TITLE
        assert idempotency_keys.once("bob", "save", "key-share-9999", lambda: "bob's") == "bob's"
    finally:
        gate.set()
        for t in threads:
            t.join(5)
        idempotency_keys.clear()


def test_a_full_finished_share_evicts_the_callers_own_oldest_answer_only(monkeypatch):
    idempotency_keys.clear()
    monkeypatch.setattr(idempotency_keys, "max_entries_per_caller", 2)
    runs = []

    def run(name):
        runs.append(name)
        return name

    idempotency_keys.once("bob", "save", "key-bob-0001", lambda: run("bob"))
    for i in range(3):
        idempotency_keys.once("ana", "save", f"key-ana-{i:04d}", lambda i=i: run(f"ana{i}"))
    # ana's oldest answer went; bob's stayed
    assert idempotency_keys.once("bob", "save", "key-bob-0001", lambda: run("bob again")) == "bob"
    assert idempotency_keys.once("ana", "save", "key-ana-0002", lambda: run("x")) == "ana2"
    assert idempotency_keys.once("ana", "save", "key-ana-0000", lambda: run("ana0 again")) == "ana0 again"
    idempotency_keys.clear()


def test_a_key_resent_with_another_request_is_refused_and_not_remembered():
    from mateu_ui.uidl.messages import UserFacingException

    idempotency_keys.clear()
    first = idempotency_keys.fingerprint_of({"counted": 1}, {})
    same = idempotency_keys.fingerprint_of({"counted": 1}, None)
    other = idempotency_keys.fingerprint_of({"counted": 2}, {})
    assert first == same and first != other
    assert idempotency_keys.once("u", "save", "key-reuse-0001", lambda: "one", fingerprint=first) == "one"
    try:
        idempotency_keys.once("u", "save", "key-reuse-0001", lambda: "two", fingerprint=other)
        raise AssertionError("another request with the same key: refused")
    except UserFacingException as reused:
        assert str(reused) == idempotency_keys.REUSED_MESSAGE
        assert getattr(reused, "title", None) == idempotency_keys.REUSED_TITLE
    assert idempotency_keys.once("u", "save", "key-reuse-0001", lambda: "three", fingerprint=same) == "one"
    idempotency_keys.clear()


def test_a_key_resent_with_another_body_over_http_is_refused():
    idempotency_keys.clear()
    RUNS["n"] = 0
    app = FastAPI()
    add_mateu(app, OfflineStockCount)
    client = TestClient(app)

    def send(counted):
        return client.post("/mateu/v3/sync/offline-count", json={
            "route": "/offline-count", "consumedRoute": "_empty", "actionId": "save",
            "serverSideType": OfflineStockCount.__module__ + "." + OfflineStockCount.__qualname__,
            "componentState": {"counted": counted},
        }, headers={idempotency_keys.HEADER: "key-body-0001"})

    assert "Saved 1" in send(1).text
    reused = send(2)
    assert idempotency_keys.REUSED_TITLE in reused.text and "Saved" not in reused.text
    assert "Saved 1" in send(1).text
    assert RUNS["n"] == 1
    idempotency_keys.clear()


def test_a_keyed_run_outlives_a_client_that_left():
    """Detached: cancelling the awaiting request (a client disconnect) neither stops the run nor
    frees the key; the retry joins it and the action runs once."""
    import asyncio

    from starlette.concurrency import run_in_threadpool

    idempotency_keys.clear()
    gate = threading.Event()
    started = threading.Event()
    runs = []

    def slow():
        runs.append(1)
        started.set()
        gate.wait(5)
        return "landed"

    def keyed():
        return idempotency_keys.guarded("u", "save", "key-left-0001", lambda: (idempotency_keys.checkpoint(), slow())[1])

    async def scenario():
        first = asyncio.create_task(run_in_threadpool(keyed))
        while not started.is_set():
            await asyncio.sleep(0.01)
        first.cancel()  # the client left
        assert idempotency_keys.in_flight() == 1  # the key is still held by the running work
        retry = asyncio.create_task(run_in_threadpool(keyed))
        await asyncio.sleep(0.05)
        gate.set()
        return await retry

    assert asyncio.run(scenario()) == "landed"
    assert runs == [1]
    idempotency_keys.clear()


def test_the_view_is_normalised_like_in_the_other_backends():
    assert idempotency_keys.view_of(" a.B ", "/orders/7/edit/") == idempotency_keys.view_of("a.B", "orders/7/edit")
    assert idempotency_keys.view_of("a.B", "orders/7/edit") == "type=a.B\u0001route=orders/7/edit"
    assert idempotency_keys.view_of(None, None) == "type=\u0001route="
