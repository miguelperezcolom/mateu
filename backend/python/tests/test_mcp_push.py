"""Live UI push (phase C), Python side: ``conformance/mcp/push.json`` — the push tools byte for byte
and the scripted scenario every backend runs — plus the registry's limits (expiry, rate, capacity,
pairing attempts, channel ownership), the switches, and the real SSE endpoint carrying a pushed
message to an open ``_agent-channel``."""

from __future__ import annotations

import json
import logging
import re
import sys
import threading
from contextlib import nullcontext
from datetime import datetime, timezone
from pathlib import Path

import pytest

from mateu_ui.core import MateuRegistry, MateuRequest, RunActionRq, SyncHandler, agent_push, mcp
from mateu_ui.core.agent_push import AgentChannel, AgentSessions, Caller, PushContext, fingerprint
from mateu_ui.core.identity import framework_identity_provider
from mateu_ui.core.request_context import bound_request
from mateu_ui.uidl import Identity, UserFacingException, title, ui


def _corpus_file() -> Path | None:
    for parent in Path(__file__).resolve().parents:
        candidate = parent / "conformance" / "mcp" / "push.json"
        if candidate.is_file():
            return candidate
    return None


CORPUS_FILE = _corpus_file()
CORPUS = json.loads(CORPUS_FILE.read_text(encoding="utf-8")) if CORPUS_FILE else {}
needs_corpus = pytest.mark.skipif(CORPUS_FILE is None, reason="the conformance corpus is not present")

@ui("push-home")
@title("Push home")
class PushHome:
    pass


MODULE = sys.modules[__name__]


def _identity(principal: str | None) -> Identity | None:
    return Identity(name=principal) if principal else None


def _bound(principal: str | None, agent_key: str | None = None):
    headers = {agent_push.AGENT_KEY_HEADER: agent_key} if agent_key else {}
    return bound_request(MateuRequest(headers=headers, principal=_identity(principal)))


def _handler(rate: int = 30, max_sessions: int = 1000) -> SyncHandler:
    handler = SyncHandler(MateuRegistry(MODULE), identity_provider=framework_identity_provider())
    handler.enable_agent_push(rate_per_minute=rate, max_sessions=max_sessions)
    return handler


class Ui:
    """One open UI: its channel collects what it receives (AgentPush data)."""

    def __init__(self, handler, session_id, secret, principal, route="", renderer="vaadin"):
        self.handler, self.session_id, self.secret, self.principal = handler, session_id, secret, principal
        self.route, self.renderer = route, renderer
        self.received: list[dict] = []
        self.closed = False
        self.code: str | None = None
        self.channel = AgentChannel(self.received.append, self._close)

    def _close(self):
        self.closed = True

    def params(self, **extra):
        return {"sessionId": self.session_id, "secret": self.secret, **extra}

    def run(self, action_id, parameters, channel=None):
        rq = RunActionRq(action_id=action_id, parameters=parameters)
        with _bound(self.principal):
            with agent_push.bound_channel(channel) if channel is not None else nullcontext():
                try:
                    return self.handler.handle(rq).model_dump(by_alias=True, mode="json")
                except UserFacingException as refused:  # the adapter's error boundary shows it as written
                    return {"messages": [{"text": refused.message}]}

    def open(self):
        inc = self.run(
            agent_push.CHANNEL_ACTION, self.params(route=self.route, renderer=self.renderer), self.channel
        )
        self.received.extend(c["data"] for c in inc["commands"] if c["type"] == "AgentPush")
        return inc

    def pair(self):
        inc = self.run(agent_push.PAIR_ACTION, self.params())
        pairing = inc["fragments"][0]["data"]["_agentPairing"]
        self.code = pairing["code"]
        return pairing

    def unpair(self):
        return self.run(agent_push.UNPAIR_ACTION, self.params())["fragments"][0]["data"]

    def disconnect(self):
        self.handler.agent_push.channel_closed(self.channel)

    def take(self):
        out, self.received[:] = list(self.received), []
        return out


def call(handler, principal, tool, args, agent_key=None):
    """A ``tools/call`` as the caller; answers the result JSON, or ``{"error": text}``."""

    def sync_fn(route, action_id, component_state, parameters):
        rq = RunActionRq(
            route=route or "", action_id=action_id or "",
            component_state=component_state or {}, parameters=parameters or {},
        )
        return handler.handle(rq).model_dump(by_alias=True, mode="json")

    with _bound(principal, agent_key):
        push = PushContext(handler.agent_push, Caller.of(principal, agent_key))
        response = mcp.handle_jsonrpc(
            {"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": tool, "arguments": args}},
            sync_fn,
            push=push,
        )
    result = response["result"]
    text = result["content"][0]["text"]
    if result.get("isError"):
        assert text.startswith("Error: ")
        return {"error": text[len("Error: "):]}
    return json.loads(text)


# ── The corpus ───────────────────────────────────────────────────────────────────────────────
@needs_corpus
def test_push_tools_are_the_corpus_byte_for_byte_after_the_base_tools_and_before_save_spec():
    assert json.dumps(mcp.PUSH_TOOLS) == json.dumps(CORPUS["pushTools"])
    listed = mcp.tools(dev_mode=True, push=True)
    assert listed[: len(mcp.TOOLS)] == mcp.TOOLS
    assert listed[len(mcp.TOOLS): -1] == CORPUS["pushTools"]
    assert listed[-1]["name"] == "mateu_save_spec"
    assert [t["name"] for t in mcp.tools(dev_mode=False)] == [t["name"] for t in mcp.TOOLS]


@needs_corpus
def test_error_texts_are_the_corpus():
    errors = CORPUS["errors"]
    assert agent_push.DISABLED == errors["disabled"]
    assert agent_push.unknown_session("s") == errors["unknownSession"].format(session="s")
    assert agent_push.not_connected("s") == errors["notConnected"].format(session="s")
    assert agent_push.RATE_LIMITED == errors["rateLimited"]
    assert agent_push.INVALID_CODE == errors["invalidCode"]
    assert agent_push.TOO_MANY_ATTEMPTS == errors["tooManyAttempts"]
    assert agent_push.reserved_event("e") == errors["reservedEvent"].format(event="e")
    assert agent_push.invalid_event("e") == errors["invalidEvent"].format(event="e")
    assert agent_push.DETAIL_TOO_LARGE == errors["detailTooLarge"]
    assert agent_push.invalid_target("t") == errors["invalidTarget"].format(target="t")
    assert agent_push.CHANNEL_REFUSED == errors["channelRefused"]
    assert agent_push.TOO_MANY_SESSIONS == errors["tooManySessions"]
    assert agent_push.HAS_ERRORS == CORPUS["reasons"]["hasErrors"]
    assert agent_push.NOT_A_PAGE == CORPUS["reasons"]["notAPage"]


PAIRING_CODE = re.compile(r"^[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$")


def _normalised(value, handles: dict[str, str]):
    """Volatile values → the corpus placeholders: a session handle → <session:ID>, connectedAt →
    <time>, a pairing code → <code>."""
    if isinstance(value, dict):
        out = {}
        for k, v in value.items():
            if k == "connectedAt" and isinstance(v, str):
                out[k] = "<time>"
            elif k == "code" and isinstance(v, str) and PAIRING_CODE.match(v):
                out[k] = "<code>"
            else:
                out[k] = _normalised(v, handles)
        return out
    if isinstance(value, list):
        return [_normalised(v, handles) for v in value]
    if isinstance(value, str):
        for handle, session_id in handles.items():
            value = value.replace(handle, f"<session:{session_id}>")
        return value
    return value


def _substituted(value, uis: dict[str, Ui], handle_of):
    if isinstance(value, dict):
        return {k: _substituted(v, uis, handle_of) for k, v in value.items()}
    if isinstance(value, str) and value.startswith("<session:") and value.endswith(">"):
        return handle_of(value[len("<session:"):-1])
    if isinstance(value, str) and value.startswith("<code:") and value.endswith(">"):
        return uis[value[len("<code:"):-1]].code
    return value


@needs_corpus
def test_the_scripted_scenario():
    scenario = CORPUS["scenario"]
    handler = _handler()
    uis: dict[str, Ui] = {}
    for s in scenario["sessions"]:
        ui_ = Ui(handler, s["sessionId"], s["secret"], s["principal"], s["route"], s["renderer"])
        ui_.open()
        uis[s["sessionId"]] = ui_
    sessions = handler.agent_push
    handles = {sessions._sessions[sid].handle: sid for sid in uis}

    def handle_of(session_id):
        return next(h for h, sid in handles.items() if sid == session_id)

    principals = {"alice": "alice", "bob": "bob", "anon": None}
    for index, step in enumerate(scenario["steps"]):
        where = f"step {index}: {json.dumps(step)[:120]}"
        if "received" in step:
            assert _normalised(uis[step["received"]].take(), handles) == step["expect"], where
        elif "ui" in step:
            target = uis[step["sessionId"]]
            {"pair": target.pair, "unpair": target.unpair, "disconnect": target.disconnect}[step["ui"]]()
        else:
            args = _substituted(step["args"], uis, handle_of)
            actual = call(handler, principals[step["as"]], step["tool"], args)
            assert _normalised(actual, handles) == step["expect"], where


# ── The registry ─────────────────────────────────────────────────────────────────────────────
class Clock:
    def __init__(self):
        self.t = 1000.0

    def __call__(self):
        return self.t


def _sessions(clock, **kw) -> AgentSessions:
    return AgentSessions(clock=clock, now=lambda: datetime(2026, 10, 19, 10, 0, tzinfo=timezone.utc), **kw)


def _open(sessions, sid, principal="alice", secret="s3cret", channel=None):
    channel = channel or AgentChannel(lambda d: None)
    sessions.open_channel(sid, secret, principal, "/r", "vaadin", channel)
    return channel


ALICE = Caller.of("alice")


def test_a_disconnected_session_is_forgotten_120_seconds_later_with_its_pairings():
    clock = Clock()
    sessions = _sessions(clock)
    channel = _open(sessions, "ui-1", principal=None)
    code, ttl = sessions.new_code("ui-1", "s3cret", None)
    assert ttl == 300 and len(code) == 9 and code[4] == "-"
    assert set(code.replace("-", "")) <= set(agent_push.CODE_ALPHABET)
    entry = sessions.pair(ALICE, code)
    assert entry["paired"] and entry["connectedAt"] == "2026-10-19T10:00:00Z"
    sessions.channel_closed(channel)
    clock.t += 119
    assert [e["connected"] for e in sessions.list(ALICE)] == [False]
    clock.t += 1
    assert sessions.list(ALICE) == []
    with pytest.raises(UserFacingException, match="Unknown session"):
        sessions.send(ALICE, entry["session"], agent_push.message("event", "x", {}), "event=x")


def test_a_reconnect_keeps_the_session_and_ends_the_old_stream():
    clock = Clock()
    sessions = _sessions(clock)
    closed = []
    first = AgentChannel(lambda d: None, lambda: closed.append(1))
    _open(sessions, "ui-1", channel=first)
    handle = sessions.list(ALICE)[0]["session"]
    sessions.channel_closed(first)
    clock.t += 100
    second = AgentChannel(lambda d: None)
    _open(sessions, "ui-1", channel=second)
    clock.t += 100
    assert [e["session"] for e in sessions.list(ALICE)] == [handle]
    assert sessions.list(ALICE)[0]["connected"]
    third = AgentChannel(lambda d: None)
    _open(sessions, "ui-1", channel=third)
    assert closed == []  # the first stream had already ended: nothing to close
    sessions.channel_closed(second)  # an old stream ending does not disconnect the new one
    assert sessions.list(ALICE)[0]["connected"]


def test_a_newer_channel_closes_the_older_stream():
    sessions = _sessions(Clock())
    closed = []
    _open(sessions, "ui-1", channel=AgentChannel(lambda d: None, lambda: closed.append("old")))
    _open(sessions, "ui-1", channel=AgentChannel(lambda d: None))
    assert closed == ["old"]


def test_the_rate_limit_is_per_session_per_rolling_minute():
    clock = Clock()
    sessions = _sessions(clock, rate_per_minute=3)
    got = []
    _open(sessions, "ui-1", channel=AgentChannel(got.append))
    _open(sessions, "ui-2", channel=AgentChannel(lambda d: None))
    two, one = [e["session"] for e in sessions.list(ALICE)]  # most recently registered first
    data = agent_push.message("event", "ping", {})
    for _ in range(3):
        sessions.send(ALICE, one, data, "event=ping")
    with pytest.raises(UserFacingException, match="Too many messages"):
        sessions.send(ALICE, one, data, "event=ping")
    sessions.send(ALICE, two, data, "event=ping")  # another session has its own budget
    clock.t += 60
    sessions.send(ALICE, one, data, "event=ping")
    assert len(got) == 4


def test_max_sessions_evicts_a_disconnected_one_else_refuses():
    sessions = _sessions(Clock(), max_sessions=2)
    first = _open(sessions, "ui-1")
    _open(sessions, "ui-2")
    with pytest.raises(UserFacingException, match="Too many live UI sessions"):
        _open(sessions, "ui-3")
    sessions.channel_closed(first)
    _open(sessions, "ui-3")
    assert sorted(e["route"] for e in sessions.list(ALICE)) == ["/r", "/r"]
    assert "ui-1" not in sessions._sessions


def test_a_session_answers_only_its_secret_and_its_principal():
    sessions = _sessions(Clock())
    _open(sessions, "ui-1", principal="alice", secret="right")
    for secret, principal in (("wrong", "alice"), ("right", "bob"), ("right", None)):
        with pytest.raises(UserFacingException, match="belongs to another channel"):
            sessions.open_channel("ui-1", secret, principal, "", "", AgentChannel(lambda d: None))
        with pytest.raises(UserFacingException, match="belongs to another channel"):
            sessions.new_code("ui-1", secret, principal)
        with pytest.raises(UserFacingException, match="belongs to another channel"):
            sessions.unpair("ui-1", secret, principal)
    with pytest.raises(UserFacingException, match="belongs to another channel"):
        sessions.new_code("never-registered", "x", None)
    sessions.unpair("never-registered", "x", None)  # nothing to unpair: no error


def test_more_than_ten_failed_pairings_a_minute_are_refused_even_with_the_right_code():
    clock = Clock()
    sessions = _sessions(clock)
    _open(sessions, "ui-1", principal=None)
    code, _ = sessions.new_code("ui-1", "s3cret", None)
    bob = Caller.of("bob")
    for _ in range(10):
        with pytest.raises(UserFacingException, match="Invalid or expired"):
            sessions.pair(bob, "ZZZZ-ZZZZ")
    with pytest.raises(UserFacingException, match="Too many pairing attempts"):
        sessions.pair(bob, code)
    sessions.pair(ALICE, code.lower().replace("-", ""))  # another caller; case and dash optional
    clock.t += 60
    _open(sessions, "ui-2", principal=None)
    code2, _ = sessions.new_code("ui-2", "s3cret", None)
    assert sessions.pair(bob, code2)["paired"]


def test_a_code_works_once_for_300_seconds_and_a_new_one_kills_the_previous():
    clock = Clock()
    sessions = _sessions(clock)
    _open(sessions, "ui-1", principal=None)
    old, _ = sessions.new_code("ui-1", "s3cret", None)
    new, _ = sessions.new_code("ui-1", "s3cret", None)
    with pytest.raises(UserFacingException, match="Invalid or expired"):
        sessions.pair(ALICE, old)
    clock.t += 300
    with pytest.raises(UserFacingException, match="Invalid or expired"):
        sessions.pair(ALICE, new)


def test_an_agent_key_identifies_a_caller_without_a_principal():
    short = Caller.of(None, "too-short")
    assert short.anonymous
    keyed = Caller.of(None, "k" * 16)
    assert keyed.key is not None and keyed.key.startswith("key:") and "k" * 16 not in keyed.key
    assert keyed.label == "an agent"
    assert Caller.of("alice", "k" * 16).key == "user:alice"
    sessions = _sessions(Clock())
    _open(sessions, "ui-1", principal="carol")
    code, _ = sessions.new_code("ui-1", "s3cret", "carol")
    sessions.pair(keyed, code)
    assert [e["user"] for e in sessions.list(keyed)] == ["carol"]
    assert sessions.list(Caller.of(None, "x" * 16)) == []  # another key sees nothing
    assert sessions.list(Caller()) == []  # nor does an anonymous caller


def test_handles_are_opaque_url_safe_and_long():
    sessions = _sessions(Clock())
    _open(sessions, "ui-1")
    handle = sessions.list(ALICE)[0]["session"]
    assert handle != "ui-1" and len(handle) >= 22
    assert all(c.isalnum() or c in "-_" for c in handle)


def test_the_registry_is_thread_safe():
    sessions = _sessions(Clock(), max_sessions=10_000, max_sessions_per_owner=10_000)

    def register(n):
        for i in range(100):
            _open(sessions, f"ui-{n}-{i}")

    threads = [threading.Thread(target=register, args=(n,)) for n in range(8)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert len(sessions.list(ALICE)) == 800


def test_dispatch_event_checks_and_logs_every_delivery(caplog):
    handler = _handler()
    a = Ui(handler, "ui-1", "s", "alice", "/orders")
    a.open()
    a.take()
    handle = handler.agent_push.list(ALICE)[0]["session"]
    big = {"x": "y" * 70_000}
    assert call(handler, "alice", "mateu_dispatch_event", {"session": handle, "event": "e", "detail": big}) == {
        "error": "The detail is larger than the 65536-byte limit."
    }
    assert call(handler, "alice", "mateu_dispatch_event", {"session": handle}) == {"error": 'Missing argument "event".'}
    assert call(handler, "alice", "mateu_push_ui", {"session": handle}) == {"error": 'Missing argument "yaml".'}
    with caplog.at_level(logging.INFO, logger="mateu.agentpush"):
        assert call(handler, "alice", "mateu_dispatch_event", {"session": handle, "event": "ping"}) == {
            "delivered": True, "session": handle,
        }
        call(handler, "alice", "mateu_navigate", {
            "session": handle, "route": "/x", "uriPrefix": "", "serverSideType": "T", "actionId": 7,
        })
    assert a.take() == [
        {"kind": "event", "event": "ping", "detail": {}},
        {"kind": "navigate", "event": "navigation-requested",
         "detail": {"route": "/x", "consumedRoute": "", "serverSideType": "T", "uriPrefix": ""}},
    ]
    # the handle is a capability: the log names the session by its fingerprint only (NM4)
    assert handle not in caplog.text
    assert f"Mateu agent push: caller=alice session={fingerprint(handle)} kind=event event=ping bytes=" in caplog.text
    assert "kind=navigate route=/x" in caplog.text


def test_a_non_page_is_not_pushed():
    handler = _handler()
    Ui(handler, "ui-1", "s", "alice").open()
    handle = handler.agent_push.list(ALICE)[0]["session"]
    out = call(handler, "alice", "mateu_push_ui", {"session": handle, "yaml": "type: Routes\nroutes: []\n"})
    assert out["delivered"] is False and out["reason"] == agent_push.NOT_A_PAGE


def test_the_ui_actions_need_their_parameters_and_the_channel_needs_the_sse_endpoint():
    handler = _handler()
    a = Ui(handler, "ui-1", "s", "alice")
    inc = a.run(agent_push.CHANNEL_ACTION, a.params())  # the sync endpoint: no stream to register
    assert "SSE endpoint" in inc["messages"][0]["text"]
    inc = a.run(agent_push.PAIR_ACTION, {"sessionId": "ui-1"})
    assert inc["messages"][0]["text"] == "This UI session belongs to another channel."
    a.open()
    assert a.unpair() == {"_agentPairing": None}


# ── Off by default ───────────────────────────────────────────────────────────────────────────
def test_with_push_off_the_actions_refuse_and_the_tools_are_neither_listed_nor_callable():
    handler = SyncHandler(MateuRegistry(MODULE))
    a = Ui(handler, "ui-1", "s", None)
    for action in agent_push.ACTIONS:
        inc = a.run(action, a.params(), a.channel)
        assert inc["messages"][0]["text"] == "Live UI push is not enabled."

    def sync_fn(*_):
        return {}

    listed = mcp.handle_jsonrpc({"jsonrpc": "2.0", "id": 1, "method": "tools/list"}, sync_fn)
    assert not {t["name"] for t in listed["result"]["tools"]} & set(agent_push.TOOL_NAMES)
    called = mcp.handle_jsonrpc(
        {"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "mateu_list_sessions"}}, sync_fn
    )
    assert called["result"]["content"][0]["text"] == "Error: Unknown tool: mateu_list_sessions"


def test_the_app_says_whether_push_is_on():
    from mateu_ui.uidl import app

    @app("Push app")
    class PushApp:
        pass

    def meta(handler):
        inc = handler.handle(RunActionRq(server_side_type=f"{__name__}.PushApp", route=""))
        return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]["metadata"]

    reg = MateuRegistry(PushApp)
    assert meta(SyncHandler(reg))["agentPush"] is False
    on = SyncHandler(reg)
    on.enable_agent_push()
    assert meta(on)["agentPush"] is True


# ── Over HTTP ────────────────────────────────────────────────────────────────────────────────
def _api(monkeypatch, **kw):
    fastapi = pytest.importorskip("fastapi")
    import mateu_ui.fastapi
    from mateu_ui.fastapi import add_mateu

    monkeypatch.setattr(mateu_ui.fastapi, "AGENT_MAX_SECONDS", 1.5)
    monkeypatch.setattr(mateu_ui.fastapi, "AGENT_HEARTBEAT_SECONDS", 0.05)
    api = fastapi.FastAPI()

    @api.middleware("http")
    async def sign_in(request, call_next):
        user = request.headers.get("x-test-user")
        if user:
            request.state.mateu_identity = Identity(name=user)
        return await call_next(request)

    handler = add_mateu(api, MODULE, **kw)
    return api, handler


def _rpc(client, tool, args, user=None, key=None):
    headers = {}
    if user:
        headers["x-test-user"] = user
    if key:
        headers["X-Mateu-Agent-Key"] = key
    rs = client.post(
        "/mateu/mcp",
        json={"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": tool, "arguments": args}},
        headers=headers,
    )
    result = rs.json()["result"]
    text = result["content"][0]["text"]
    return {"error": text} if result.get("isError") else json.loads(text)


def test_a_pushed_message_reaches_an_open_agent_channel_over_the_real_sse_endpoint(monkeypatch):
    from fastapi.testclient import TestClient

    api, handler = _api(monkeypatch, mcp=True, mcp_push=True, identity_provider=None)
    client = TestClient(api)
    delivered: dict = {}

    def push_when_registered():
        import time

        for _ in range(200):
            listed = _rpc(client, "mateu_list_sessions", {}, user="alice")
            if listed.get("sessions"):
                handle = listed["sessions"][0]["session"]
                delivered["result"] = _rpc(
                    client, "mateu_push_ui",
                    {"session": handle, "yaml": "type: Text\ntext: Hi\n", "target": "dialog"}, user="alice",
                )
                return
            time.sleep(0.01)

    pusher = threading.Thread(target=push_when_registered)
    pusher.start()
    with client.stream(
        "POST", "/mateu/v3/sse/_empty",
        json={"actionId": "_agent-channel", "route": "", "componentState": {},
              "parameters": {"sessionId": "tab-1", "secret": "s", "route": "/home", "renderer": "vaadin"}},
        headers={"x-test-user": "alice"},
    ) as rs:
        assert rs.headers["content-type"].startswith("text/event-stream")
        messages = []
        for line in rs.iter_lines():
            if not line.startswith("data:"):
                continue
            inc = json.loads(line[len("data:"):])
            messages += [c["data"] for c in inc["commands"] if c["type"] == "AgentPush"]
            if len(messages) == 2:
                break
    pusher.join(5)
    assert messages[0] == {"kind": "status", "event": "mateu-agent-status", "detail": {"paired": False, "agents": []}}
    assert messages[1] == {"kind": "render", "event": "render-screen",
                           "detail": {"yaml": "type: Text\ntext: Hi\n", "target": "dialog"}}
    assert delivered["result"]["delivered"] is True
    # the pairing code over the sync endpoint, then an agent key pairs with it
    rs = client.post("/mateu/v3/sync/_empty", json={
        "actionId": "_agent-pair", "parameters": {"sessionId": "tab-1", "secret": "s"}}, headers={"x-test-user": "alice"})
    code = rs.json()["fragments"][0]["data"]["_agentPairing"]["code"]
    paired = _rpc(client, "mateu_pair_session", {"code": code}, key="sidecar-key-0123456789")
    assert paired["paired"] is True and paired["user"] == "alice"
    assert _rpc(client, "mateu_list_sessions", {}, key="sidecar-key-0123456789")["sessions"][0]["session"] == paired["session"]
    assert _rpc(client, "mateu_list_sessions", {}, user="bob") == {"sessions": []}
    # another principal cannot take the session over
    rs = client.post("/mateu/v3/sync/_empty", json={
        "actionId": "_agent-pair", "parameters": {"sessionId": "tab-1", "secret": "s"}}, headers={"x-test-user": "bob"})
    assert rs.json()["messages"][0]["text"] == "This UI session belongs to another channel."


def test_push_needs_the_mcp_endpoint_and_its_own_switch(monkeypatch):
    from fastapi.testclient import TestClient

    monkeypatch.delenv("MATEU_MCP_PUSH_ENABLED", raising=False)
    monkeypatch.delenv("MATEU_MCP_ENABLED", raising=False)
    api, handler = _api(monkeypatch, mcp=False, mcp_push=True)
    assert handler.agent_push is None
    api, handler = _api(monkeypatch, mcp=True)
    assert handler.agent_push is None
    names = [t["name"] for t in TestClient(api).post(
        "/mateu/mcp", json={"jsonrpc": "2.0", "id": 1, "method": "tools/list"}).json()["result"]["tools"]]
    assert "mateu_push_ui" not in names
    monkeypatch.setenv("MATEU_MCP_PUSH_ENABLED", "true")
    monkeypatch.setenv("MATEU_MCP_PUSH_RATE_PER_MINUTE", "7")
    monkeypatch.setenv("MATEU_MCP_PUSH_MAX_SESSIONS", "nope")
    api, handler = _api(monkeypatch, mcp=True)
    assert handler.agent_push is not None
    assert handler.agent_push.rate_per_minute == 7 and handler.agent_push.max_sessions == 1000
    names = [t["name"] for t in TestClient(api).post(
        "/mateu/mcp", json={"jsonrpc": "2.0", "id": 1, "method": "tools/list"}).json()["result"]["tools"]]
    assert names[len(mcp.TOOLS): len(mcp.TOOLS) + 5] == list(agent_push.TOOL_NAMES)


def test_a_refused_channel_streams_its_error(monkeypatch):
    from fastapi.testclient import TestClient

    api, handler = _api(monkeypatch, mcp=True, mcp_push=False)
    rs = TestClient(api).post("/mateu/v3/sse/_empty", json={
        "actionId": "_agent-channel", "parameters": {"sessionId": "t", "secret": "s"}})
    events = [json.loads(c[len("data:"):]) for c in rs.text.split("\n\n") if c.startswith("data:")]
    assert events[0]["messages"][0]["text"] == "Live UI push is not enabled."


def test_the_channel_heartbeats_and_ends_on_its_own(monkeypatch):
    from fastapi.testclient import TestClient

    import mateu_ui.fastapi

    api, handler = _api(monkeypatch, mcp=True, mcp_push=True)
    monkeypatch.setattr(mateu_ui.fastapi, "AGENT_MAX_SECONDS", 0.3)
    rs = TestClient(api).post("/mateu/v3/sse/_empty", json={
        "actionId": "_agent-channel", "parameters": {"sessionId": "t", "secret": "s"}})
    events = [json.loads(c[len("data:"):]) for c in rs.text.split("\n\n") if c.startswith("data:")]
    assert events[0]["commands"][0]["type"] == "AgentPush"
    assert len(events) >= 2 and all(e["commands"] == [] for e in events[1:])
    # the stream ended: the session counts as disconnected
    assert handler.agent_push._sessions["t"].connected is False


# ── max-sessions-per-owner ───────────────────────────────────────────────────────────────────
def _open_from(sessions, sid, principal=None, address=None):
    channel = AgentChannel(lambda d: None)
    sessions.open_channel(sid, "s3cret", principal, "/r", "vaadin", channel, address)
    return channel


def test_the_owner_is_the_principal_else_the_client_address_else_unknown():
    assert agent_push.owner_of("alice", "10.0.0.1") == "alice"
    assert agent_push.owner_of(None, " 10.0.0.1 ") == "10.0.0.1"
    assert agent_push.owner_of(None, "  ") == agent_push.UNKNOWN_OWNER == "unknown"
    assert agent_push.owner_of("", None) == "unknown"
    assert agent_push.DEFAULT_MAX_SESSIONS_PER_OWNER == 20
    assert AgentSessions().max_sessions_per_owner == 20


def test_a_new_session_over_its_owners_cap_is_refused_when_all_of_them_are_connected():
    sessions = _sessions(Clock(), max_sessions_per_owner=2)
    _open_from(sessions, "ui-1", "alice")
    _open_from(sessions, "ui-2", "alice")
    with pytest.raises(UserFacingException) as refused:
        _open_from(sessions, "ui-3", "alice")
    assert refused.value.message == agent_push.TOO_MANY_SESSIONS
    assert "ui-3" not in sessions._sessions


def test_the_owners_longest_disconnected_session_is_evicted():
    clock = Clock()
    sessions = _sessions(clock, max_sessions_per_owner=3)
    oldest = _open_from(sessions, "ui-1", "alice")
    newer = _open_from(sessions, "ui-2", "alice")
    _open_from(sessions, "ui-3", "alice")
    bobs = _open_from(sessions, "bob-1", "bob")
    sessions.channel_closed(bobs)  # disconnected longest ago, but another owner's
    clock.t += 1
    sessions.channel_closed(oldest)
    clock.t += 1
    sessions.channel_closed(newer)
    clock.t += 1
    _open_from(sessions, "ui-4", "alice")
    assert set(sessions._sessions) == {"ui-2", "ui-3", "ui-4", "bob-1"}


def test_another_owner_is_unaffected_by_a_full_owner():
    sessions = _sessions(Clock(), max_sessions_per_owner=1)
    _open_from(sessions, "ui-1", "alice")
    with pytest.raises(UserFacingException, match="Too many live UI sessions"):
        _open_from(sessions, "ui-2", "alice")
    _open_from(sessions, "bob-1", "bob")
    assert {s.owner for s in sessions._sessions.values()} == {"alice", "bob"}


def test_anonymous_uis_are_counted_by_client_address():
    sessions = _sessions(Clock(), max_sessions_per_owner=1)
    _open_from(sessions, "a-1", None, "10.0.0.1")
    _open_from(sessions, "b-1", None, "10.0.0.2")
    with pytest.raises(UserFacingException, match="Too many live UI sessions"):
        _open_from(sessions, "a-2", None, "10.0.0.1")
    _open_from(sessions, "u-1", None, None)  # no address: the owner "unknown"
    with pytest.raises(UserFacingException, match="Too many live UI sessions"):
        _open_from(sessions, "u-2", None, None)
    # a signed-in UI from the same address is its principal's, not the address's
    _open_from(sessions, "c-1", "carol", "10.0.0.1")
    assert sessions._sessions["a-1"].owner == "10.0.0.1"
    assert sessions._sessions["u-1"].owner == "unknown"


def test_a_reconnect_is_never_refused_by_either_cap():
    sessions = _sessions(Clock(), max_sessions_per_owner=1, max_sessions=1)
    first = _open_from(sessions, "ui-1", "alice")
    with pytest.raises(UserFacingException, match="Too many live UI sessions"):
        _open_from(sessions, "ui-2", "bob")  # the global cap, every session connected
    _open_from(sessions, "ui-1", "alice")  # a new channel for the connected session
    sessions.channel_closed(first)
    _open_from(sessions, "ui-1", "alice")
    assert list(sessions._sessions) == ["ui-1"]


def test_the_owner_cap_then_the_global_cap():
    sessions = _sessions(Clock(), max_sessions_per_owner=5, max_sessions=2)
    _open_from(sessions, "ui-1", "alice")
    _open_from(sessions, "ui-2", "bob")
    with pytest.raises(UserFacingException, match="Too many live UI sessions"):
        _open_from(sessions, "ui-3", "carol")


def _from_client(app, client):
    """The app as seen from ``client`` (a ``(host, port)`` pair, or None): TestClient's own client
    address differs across Starlette versions (``testclient`` today, None in the lowest supported),
    so the test pins the ASGI scope's ``client`` itself instead of relying on it."""
    async def asgi(scope, receive, send):
        if scope["type"] in ("http", "websocket"):
            scope = {**scope, "client": client}
        await app(scope, receive, send)
    return asgi


def test_over_fastapi_an_anonymous_ui_is_owned_by_its_client_address(monkeypatch):
    from fastapi.testclient import TestClient

    import mateu_ui.fastapi

    api, handler = _api(monkeypatch, mcp=True, mcp_push=True, mcp_push_max_sessions_per_owner=1)
    monkeypatch.setattr(mateu_ui.fastapi, "AGENT_MAX_SECONDS", 0.2)
    assert handler.agent_push.max_sessions_per_owner == 1
    rs = TestClient(_from_client(api, ("10.0.0.7", 51000))).post("/mateu/v3/sse/_empty", json={
        "actionId": "_agent-channel", "parameters": {"sessionId": "t", "secret": "s"}})
    assert rs.status_code == 200
    assert handler.agent_push._sessions["t"].owner == "10.0.0.7"
    # no client address reported by the server: the owner is "unknown"
    rs = TestClient(_from_client(api, None)).post("/mateu/v3/sse/_empty", json={
        "actionId": "_agent-channel", "parameters": {"sessionId": "t3", "secret": "s"}})
    assert rs.status_code == 200
    assert handler.agent_push._sessions["t3"].owner == agent_push.UNKNOWN_OWNER
    signed = TestClient(api).post("/mateu/v3/sse/_empty", json={
        "actionId": "_agent-channel", "parameters": {"sessionId": "t2", "secret": "s"}},
        headers={"x-test-user": "alice"})
    assert signed.status_code == 200
    assert handler.agent_push._sessions["t2"].owner == "alice"


def test_the_per_owner_cap_comes_from_the_environment(monkeypatch):
    monkeypatch.setenv("MATEU_MCP_PUSH_MAX_SESSIONS_PER_OWNER", "3")
    _, handler = _api(monkeypatch, mcp=True, mcp_push=True)
    assert handler.agent_push.max_sessions_per_owner == 3
    monkeypatch.setenv("MATEU_MCP_PUSH_MAX_SESSIONS_PER_OWNER", "nope")
    _, handler = _api(monkeypatch, mcp=True, mcp_push=True)
    assert handler.agent_push.max_sessions_per_owner == 20


def test_the_log_never_carries_a_session_handle_only_its_fingerprint(caplog):
    clock = Clock()
    sessions = _sessions(clock)
    _open(sessions, "ui-1", principal=None)
    code, _ = sessions.new_code("ui-1", "s3cret", None)
    with caplog.at_level(logging.INFO, logger="mateu.agentpush"):
        handle = sessions.pair(Caller(), code)["session"]  # anonymous: the handle IS the capability
    assert handle not in caplog.text
    assert f"session={fingerprint(handle)}" in caplog.text
    assert fingerprint("abc") == "s-ba7816bf8f01"  # the same digest as Java and .NET
