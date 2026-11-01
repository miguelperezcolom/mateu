"""The acceptance criteria of server-side micro frontend resolution and content slots
(docs/specs/microfrontend-server-resolution.md) — the Python mirror of Java's
``MicroFrontendServerResolutionSyncTest``, against REAL remotes: a local HTTP server that speaks the
Mateu sync endpoint and plays a fast, a slow, a broken, an empty and several cacheable remotes,
recording every request it gets. The host is a FastAPI app wired by ``add_mateu``."""

from __future__ import annotations

import json
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

fastapi = pytest.importorskip("fastapi")
from fastapi.testclient import TestClient  # noqa: E402

from mateu_ui.core import MateuRegistry  # noqa: E402
from mateu_ui.core.microfrontends import ContentSlotKeyError  # noqa: E402
from mateu_ui.fastapi import add_mateu  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    ComponentTreeSupplier,
    ContentSlot,
    MicroFrontendResolutionEvent,
    MicroFrontendResolutionListener,
    RemoteCatalogSupplier,
    RemoteDescriptor,
    RemoteIdentityStrategy,
    ResolutionOutcome,
    ui,
)
from mateu_ui.uidl import components as fluent  # noqa: E402

Outcome = ResolutionOutcome

REQUESTS: list[dict] = []
EVENTS: list[MicroFrontendResolutionEvent] = []
BASE = ""

# The deadline of a remote that is expected to ANSWER: generous, so a loaded CI runner never turns
# "answers in time" into a timeout (the .NET port's twin flaked that way). Deadline tests use their own.
IN_TIME = 5000


# ── the remotes ───────────────────────────────────────────────────────────────────────────────


class _Remote(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *args):  # quiet
        pass

    def do_POST(self):  # noqa: N802 - http.server's naming
        path = self.path
        headers = {"path": path}
        for name in ("Authorization", "X-Mateu-Correlation-Id", "X-Mateu-Fragment-Keys"):
            value = self.headers.get(name)
            if value is not None:
                headers[name] = value
        REQUESTS.append(headers)
        length = int(self.headers.get("Content-Length") or 0)
        request = json.loads(self.rfile.read(length) or b"{}")
        remote = path[1:path.index("/", 1)]
        if remote == "slow":
            time.sleep(3)
        elif remote == "delayed":
            time.sleep(0.4)
        elif remote == "broken":
            return self._reply(500, "boom")
        policy = None
        text = "hello from " + remote
        if remote == "cachekey":
            auth = str(headers.get("Authorization"))
            key = "aud-A" if ("alice" in auth or "anna" in auth) else "aud-B"
            held = headers.get("X-Mateu-Fragment-Keys", "")
            if key in held.split(","):
                return self._reply(200, json.dumps(_increment(None, {
                    "maxAgeSeconds": 60, "varyBy": "key", "key": key, "notModified": True})))
            policy = {"maxAgeSeconds": 60, "varyBy": "key", "key": key}
            text = "content for " + key
        elif remote == "cacheuser":
            policy = {"maxAgeSeconds": 60, "varyBy": "user"}
        elif remote == "cacheshared":
            policy = {"maxAgeSeconds": 60, "varyBy": "shared"}
        elif remote == "cachenone":
            policy = {"maxAgeSeconds": 60, "varyBy": "none"}
        elif remote == "_content-hub":
            if "front-office.home.vacio" in path:
                return self._reply(204, "")
            if path.endswith("front-office.home.caido"):
                return self._reply(503, "down")
            if path.endswith("front-office.home.lento"):
                time.sleep(3)
            text = "slot " + path[path.rindex("/") + 1:]
        fragment = {
            "targetComponentId": request.get("initiatorComponentId"),
            "component": {"type": "ClientSide", "id": "t", "children": [],
                          "metadata": {"type": "Text", "text": text, "container": "p"}},
            "state": {}, "data": {}, "action": "Replace",
        }
        self._reply(200, json.dumps(_increment(fragment, policy)))

    def _reply(self, status: int, body: str):
        data = body.encode("utf-8")
        try:
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            if status != 204:
                self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            if status != 204:
                self.wfile.write(data)
        except OSError:
            pass  # the host gave up on it


def _increment(fragment, policy):
    out = {
        "commands": [],
        # a remote's message never reaches the host's page
        "messages": [{"variant": "info", "position": "bottom", "title": "", "text": "remote toast",
                      "duration": 3000}],
        "fragments": [] if fragment is None else [fragment],
    }
    if policy is not None:
        out["fragmentCache"] = policy
    return out


# ── host wiring: registry, identity, listener ─────────────────────────────────────────────────


class Remotes(RemoteCatalogSupplier):
    def remotes(self):
        out = [RemoteDescriptor(name, f"{BASE}/{name}", IN_TIME) for name in (
            "fast", "slow", "broken", "delayed", "cachekey", "cacheuser", "cacheshared", "cachenone")]
        out.append(RemoteDescriptor("anon", f"{BASE}/anon", IN_TIME, RemoteIdentityStrategy.NONE))
        out.append(RemoteDescriptor("exchanged", f"{BASE}/exchanged", IN_TIME, "exchange"))
        out.append(RemoteDescriptor("unknownid", f"{BASE}/unknownid", IN_TIME, "nobody-declared-it"))
        # a path on this server, as a content hub is deployed
        out.append(RemoteDescriptor("content", "/_content-hub", 1000))
        return out


class ExchangeIdentity(RemoteIdentityStrategy):
    """A token exchange: the remote gets a token for ITS audience, not the user's own."""

    def name(self):
        return "exchange"

    def headers(self, remote, request):
        return {"Authorization": "Bearer exchanged-for-" + remote.id}


class Recorder(MicroFrontendResolutionListener):
    def on_resolution(self, event):
        EVENTS.append(event)


# ── the screens ───────────────────────────────────────────────────────────────────────────────


def mfe(remote, resolve, timeout_ms, route="/widget"):
    return fluent.MicroFrontend(base_url=f"{BASE}/{remote}", route=route, server_side_type="remote.Widget",
                                resolve=resolve, timeout_ms=timeout_ms)


class _Page(ComponentTreeSupplier):
    def parts(self):  # pragma: no cover - overridden
        return []

    def component(self):
        return fluent.VerticalLayout(content=tuple(self.parts()))


@ui("mfe-client")
class ClientOnly(_Page):
    def parts(self):
        return [fluent.MicroFrontend(base_url=f"{BASE}/fast", route="/widget")]


@ui("mfe-fast")
class FastServer(_Page):
    def parts(self):
        return [mfe("fast", fluent.Resolve.SERVER, IN_TIME)]


@ui("mfe-slow")
class SlowServer(_Page):
    def parts(self):
        return [mfe("slow", fluent.Resolve.SERVER, 150)]


@ui("mfe-broken")
class BrokenServer(_Page):
    def parts(self):
        return [mfe("broken", fluent.Resolve.SERVER, IN_TIME)]


@ui("mfe-unregistered")
class Unregistered(_Page):
    def parts(self):
        return [
            mfe("fast", fluent.Resolve.SERVER, IN_TIME),
            fluent.MicroFrontend(base_url="http://169.254.169.254/latest", route="/meta-data",
                                 resolve=fluent.Resolve.SERVER),
        ]


@ui("mfe-unknown-identity")
class UnknownIdentity(_Page):
    def parts(self):
        return [mfe("fast", fluent.Resolve.SERVER, IN_TIME), mfe("unknownid", fluent.Resolve.SERVER, IN_TIME)]


@ui("mfe-parallel")
class Parallel(_Page):
    def parts(self):
        return [mfe("delayed", fluent.Resolve.SERVER, 2000),
                mfe("delayed", fluent.Resolve.SERVER, 2000, "/second"),
                mfe("delayed", fluent.Resolve.SERVER, 2000, "/third")]


@ui("mfe-cache-key")
class CacheByKey(_Page):
    def parts(self):
        return [mfe("cachekey", fluent.Resolve.SERVER, IN_TIME)]


@ui("mfe-cache-user")
class CachePerUser(_Page):
    def parts(self):
        return [mfe("cacheuser", fluent.Resolve.SERVER, IN_TIME)]


@ui("mfe-cache-shared")
class CacheShared(_Page):
    def parts(self):
        return [mfe("cacheshared", fluent.Resolve.SERVER, IN_TIME)]


@ui("mfe-cache-none")
class CacheNone(_Page):
    def parts(self):
        return [mfe("cachenone", fluent.Resolve.SERVER, IN_TIME)]


@ui("mfe-anon")
class Anonymous(_Page):
    def parts(self):
        return [mfe("anon", fluent.Resolve.SERVER, IN_TIME)]


@ui("mfe-exchanged")
class Exchanged(_Page):
    def parts(self):
        return [mfe("exchanged", fluent.Resolve.SERVER, IN_TIME)]


@ui("slot-page")
class SlotPage:
    name: str = "Front office"
    destacado: Annotated[str | None, ContentSlot(key="front-office.home.destacado", fallback="No news")] = None
    vacio: Annotated[str | None, ContentSlot(key="front-office.home.vacio", fallback="Nothing yet")] = None
    vacio_sin_fallback: Annotated[str | None, ContentSlot(key="front-office.home.vacio-sin-fallback")] = None


@ui("dead-slot-page")
class DeadSlotPage:
    name: str = "Front office"
    caido: Annotated[str | None, ContentSlot(key="front-office.home.caido", fallback="Down fallback")] = None
    lento: Annotated[str | None, ContentSlot(key="front-office.home.lento", fallback="Slow fallback",
                                             timeout_ms=100)] = None


SOURCES = (Remotes, ExchangeIdentity, Recorder, ClientOnly, FastServer, SlowServer, BrokenServer,
           Unregistered, UnknownIdentity, Parallel, CacheByKey, CachePerUser, CacheShared, CacheNone,
           Anonymous, Exchanged, SlotPage, DeadSlotPage)


# ── fixtures and helpers ──────────────────────────────────────────────────────────────────────


@pytest.fixture(scope="module")
def host():
    global BASE
    server = ThreadingHTTPServer(("127.0.0.1", 0), _Remote)
    server.daemon_threads = True
    threading.Thread(target=server.serve_forever, daemon=True).start()
    BASE = f"http://127.0.0.1:{server.server_address[1]}"
    app = fastapi.FastAPI()
    handler = add_mateu(app, *SOURCES, dev=False, self_base_url=BASE, max_budget_ms=2 * IN_TIME)
    client = TestClient(app)
    # warm up: the first resolution pays the cold start; each test clears what it reads
    load(client, "mfe-fast")
    yield client, handler
    server.shutdown()
    server.server_close()


@pytest.fixture(autouse=True)
def clear():
    REQUESTS.clear()
    EVENTS.clear()


def load(client, route, headers=None, action_id=""):
    headers = {"authorization": "Bearer alice"} if headers is None else headers
    response = client.post(f"/mateu/v3/sync/{route}", json={"route": route, "actionId": action_id},
                           headers=headers)
    return response


def walk(node):
    if isinstance(node, dict):
        yield node
        for value in node.values():
            yield from walk(value)
    elif isinstance(node, list):
        for value in node:
            yield from walk(value)


def micro_frontends(increment):
    return [n for n in walk(increment.get("fragments")) if n.get("type") == "MicroFrontend"]


def only_micro_frontend(increment):
    found = micro_frontends(increment)
    assert len(found) == 1, found
    return found[0]


def texts(node):
    return [n["text"] for n in walk(node) if n.get("type") == "Text"]


def hits(remote):
    return sum(1 for r in REQUESTS if r["path"].startswith(f"/{remote}/"))


# ── acceptance criteria ───────────────────────────────────────────────────────────────────────


def test_a_micro_frontend_without_resolve_is_exactly_as_before(host):
    client, _ = host
    microfrontend = only_micro_frontend(load(client, "mfe-client").json())
    assert "resolved" not in microfrontend
    assert set(microfrontend) == {"type", "baseUrl", "route", "consumedRoute", "style", "cssClasses",
                                  "serverSideType", "appState", "actionId"}
    assert REQUESTS == [], "the host asks nobody"


def test_a_server_micro_frontend_that_answers_in_time_is_embedded_keeping_its_origin(host):
    client, _ = host
    increment = load(client, "mfe-fast").json()
    microfrontend = only_micro_frontend(increment)
    assert texts(microfrontend["resolved"]) == ["hello from fast"]
    # resolving is not absorbing: the island still points at the remote
    assert microfrontend["baseUrl"] == f"{BASE}/fast"
    assert microfrontend["route"] == "/widget"
    assert microfrontend["serverSideType"] == "remote.Widget"
    # its fragments target the island the renderer hosts it in (ids from the wire values)
    import re

    expected = "mfe_" + re.sub(r"[^a-zA-Z0-9]", "_", f"{BASE}/fast|/widget|_empty|remote.Widget")
    assert microfrontend["resolved"]["fragments"][0]["targetComponentId"] == expected
    # what acts on a page stays out: the page is the host's
    assert microfrontend["resolved"]["messages"] == []
    assert increment["messages"] == []
    assert hits("fast") == 1
    assert [e.outcome for e in EVENTS] == [Outcome.EMBEDDED]


def test_a_slow_remote_degrades_to_the_client_at_its_deadline_and_is_not_waited_for(host):
    client, _ = host
    started = time.monotonic()
    increment = load(client, "mfe-slow").json()
    elapsed_ms = (time.monotonic() - started) * 1000
    microfrontend = only_micro_frontend(increment)
    assert "resolved" not in microfrontend
    assert microfrontend["baseUrl"] == f"{BASE}/slow"
    assert elapsed_ms < 1500, "the remote takes 3 s, the budget is 150 ms"
    assert len(EVENTS) == 1
    event = EVENTS[0]
    assert (event.outcome, event.degraded_to, event.remote_id) == (Outcome.TIMEOUT, "client", "slow")


def test_a_remote_error_degrades_to_the_client_and_leaves_a_trace(host, caplog):
    client, _ = host
    with caplog.at_level("INFO", logger="mateu_ui.microfrontends"):
        microfrontend = only_micro_frontend(load(client, "mfe-broken").json())
    assert "resolved" not in microfrontend
    assert microfrontend["baseUrl"] == f"{BASE}/broken"
    assert len(EVENTS) == 1
    event = EVENTS[0]
    assert event.outcome is Outcome.ERROR and event.degraded_to == "client"
    assert "HTTP 500" in event.error
    assert event.correlation_id
    assert any(r.levelname == "WARNING" and "outcome=ERROR" in r.getMessage() for r in caplog.records)


def test_a_url_outside_the_registered_remotes_is_a_configuration_error_and_nothing_is_asked(host):
    client, _ = host
    increment = load(client, "mfe-unregistered").json()
    assert REQUESTS == [], "not even the registered one"
    assert micro_frontends(increment) == []
    assert any("Reference" in m["text"] for m in increment["messages"])


def test_an_unknown_identity_strategy_is_a_configuration_error_and_nothing_is_asked(host):
    client, _ = host
    increment = load(client, "mfe-unknown-identity").json()
    assert REQUESTS == []
    assert any("Reference" in m["text"] for m in increment["messages"])


def test_several_fragments_are_asked_in_parallel(host):
    client, _ = host
    started = time.monotonic()
    increment = load(client, "mfe-parallel").json()
    elapsed_ms = (time.monotonic() - started) * 1000
    found = micro_frontends(increment)
    assert len(found) == 3 and all("resolved" in m for m in found)
    assert hits("delayed") == 3
    # each takes 400 ms: in a row that is 1.2 s
    assert elapsed_ms < 1100


def test_the_remote_gets_the_users_identity_and_the_correlation_id(host):
    client, _ = host
    load(client, "mfe-fast", {"authorization": "Bearer alice", "X-Mateu-Correlation-Id": "corr-42"})
    assert len(REQUESTS) == 1
    assert REQUESTS[0].get("Authorization") == "Bearer alice"
    assert REQUESTS[0].get("X-Mateu-Correlation-Id") == "corr-42"


def test_a_remote_gets_the_identity_its_strategy_says(host):
    client, _ = host
    load(client, "mfe-anon")
    load(client, "mfe-exchanged")
    assert len(REQUESTS) == 2
    assert REQUESTS[0].get("Authorization") is None, "none: anonymous"
    assert REQUESTS[0].get("X-Mateu-Correlation-Id")
    assert REQUESTS[1].get("Authorization") == "Bearer exchanged-for-exchanged"


def test_a_fragment_cached_by_key_is_shared_by_callers_with_the_same_key(host):
    client, _ = host
    first = only_micro_frontend(load(client, "mfe-cache-key", {"authorization": "Bearer alice"}).json())
    assert texts(first["resolved"]) == ["content for aud-A"]
    assert hits("cachekey") == 1
    # the same caller again, within the max age: from the cache, nobody asked
    again = only_micro_frontend(load(client, "mfe-cache-key", {"authorization": "Bearer alice"}).json())
    assert texts(again["resolved"]) == ["content for aud-A"]
    assert hits("cachekey") == 1
    # another caller with the SAME key: the remote is told what the host holds and answers "yours"
    anna = only_micro_frontend(load(client, "mfe-cache-key", {"authorization": "Bearer anna"}).json())
    assert texts(anna["resolved"]) == ["content for aud-A"]
    assert REQUESTS[1].get("X-Mateu-Fragment-Keys") == "aud-A"
    assert EVENTS[-1].outcome is Outcome.FROM_CACHE
    # another key: not from the cache
    bob = only_micro_frontend(load(client, "mfe-cache-key", {"authorization": "Bearer bob"}).json())
    assert texts(bob["resolved"]) == ["content for aud-B"]
    assert EVENTS[-1].outcome is Outcome.EMBEDDED


def test_a_fragment_cached_per_user_is_not_shared_between_users(host):
    client, _ = host
    load(client, "mfe-cache-user", {"authorization": "Bearer carol"})
    load(client, "mfe-cache-user", {"authorization": "Bearer carol"})
    assert hits("cacheuser") == 1
    load(client, "mfe-cache-user", {"authorization": "Bearer dave"})
    assert hits("cacheuser") == 2


def test_a_shared_fragment_is_cached_for_everyone(host):
    client, _ = host
    load(client, "mfe-cache-shared", {"authorization": "Bearer erin"})
    load(client, "mfe-cache-shared", {"authorization": "Bearer frank"})
    assert hits("cacheshared") == 1


def test_a_fragment_declared_none_is_never_cached(host):
    client, _ = host
    for _ in range(3):
        load(client, "mfe-cache-none")
    assert hits("cachenone") == 3


def test_a_content_slot_with_content_is_painted_in_the_same_response(host):
    client, _ = host
    increment = load(client, "slot-page").json()
    slots = micro_frontends(increment)
    assert len(slots) == 1
    assert texts(slots[0]["resolved"]) == ["slot front-office.home.destacado"]
    # the url was built from the key, against the registered content remote
    assert slots[0]["baseUrl"] == "/_content-hub"
    paths = [r["path"] for r in REQUESTS]
    assert "/_content-hub/mateu/v3/sync/content-slots/front-office.home.destacado" in paths
    assert all(p.startswith("/_content-hub/") for p in paths)
    assert all(r.get("Authorization") == "Bearer alice" for r in REQUESTS)
    # the empty slot paints its fallback; the one without fallback paints nothing — and the client
    # is never handed a slot to ask for
    all_texts = texts(increment["fragments"])
    assert "Nothing yet" in all_texts and "No news" not in all_texts
    ids = [n.get("id") for n in walk(increment["fragments"]) if n.get("type") == "ClientSide"]
    assert "slot_front_office_home_vacio_sin_fallback" not in ids
    outcomes = {(e.slot_key, e.outcome) for e in EVENTS}
    assert ("front-office.home.destacado", Outcome.EMBEDDED) in outcomes
    assert ("front-office.home.vacio", Outcome.EMPTY) in outcomes


def test_a_content_slot_that_is_down_or_slow_paints_its_fallback_and_the_screen_stands(host):
    client, _ = host
    started = time.monotonic()
    increment = load(client, "dead-slot-page").json()
    elapsed_ms = (time.monotonic() - started) * 1000
    assert micro_frontends(increment) == []
    assert {"Down fallback", "Slow fallback"} <= set(texts(increment["fragments"]))
    assert increment["messages"] == []
    assert elapsed_ms < 1500
    assert sorted(e.outcome.value for e in EVENTS) == ["ERROR", "TIMEOUT"]
    assert all(e.degraded_to == "fallback" for e in EVENTS)


def test_the_slot_descriptor_is_served_only_when_enabled(host):
    client, handler = host
    refused = load(client, "slot-page", {}, action_id="__content_slots__")
    assert refused.status_code == 403
    handler.content_slots_descriptor_enabled = True
    try:
        answer = load(client, "slot-page", {}, action_id="__content_slots__")
    finally:
        handler.content_slots_descriptor_enabled = False
    assert answer.status_code == 200
    descriptor = answer.json()["appData"]["_contentSlots"]
    assert descriptor["version"] == 1 and descriptor["duplicates"] == []
    by_key = {slot["key"]: slot for slot in descriptor["slots"]}
    assert set(by_key) >= {"front-office.home.destacado", "front-office.home.caido", "front-office.home.lento"}
    assert by_key["front-office.home.lento"] == {
        "key": "front-office.home.lento",
        "application": "front-office",
        "screen": "home",
        "name": "lento",
        "declaredIn": f"{DeadSlotPage.__module__}.DeadSlotPage",
        "field": "lento",
        "route": "dead-slot-page",
        "fallback": "Slow fallback",
        "description": "",
        "timeoutMs": 100,
        "degradeToClient": False,
    }
    assert REQUESTS == [], "the descriptor asks no remote"


def test_an_invalid_slot_key_fails_at_registration():
    class BadKey:
        slot: Annotated[str | None, ContentSlot(key="Front Office.home")] = None

    with pytest.raises(ContentSlotKeyError, match="application.screen.name"):
        MateuRegistry(BadKey)


def test_a_duplicated_slot_key_fails_at_registration():
    class First:
        a: Annotated[str | None, ContentSlot(key="app.screen.same")] = None

    class Second:
        b: Annotated[str | None, ContentSlot(key="app.screen.same")] = None

    with pytest.raises(ContentSlotKeyError, match="already used by"):
        MateuRegistry(First, Second)
    # the same declaration seen twice (a base of two views) is not a duplicate
    class Child1(First):
        pass

    class Child2(First):
        pass

    assert set(MateuRegistry(Child1, Child2).content_slots) == {"app.screen.same"}
