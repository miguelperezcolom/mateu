"""Remote push — the Python mirror of Java's RemotePushSyncTest / ExpoPushSenderTest and .NET's
RemotePushTests: a phone registers its token (``_push-register``), an ``inbox`` message reaches the
app's ``PushSender`` with the caller's tokens, gone tokens are dropped, the app says push is on,
and Mateu's Expo sender batches by a hundred against a fake Expo service (a real local HTTP
server)."""

import json
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core import push as remote_push  # noqa: E402
from mateu_ui.core.request_context import MateuRequest, bound_request  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    AppNotification,
    Identity,
    InMemoryPushTokenStore,
    Message,
    MessageAction,
    MessagePersistence,
    MessageVariant,
    PushMessage,
    PushNotifications,
    PushResult,
    PushSender,
    PushToken,
    UserFacingException,
    app,
    button,
    ui,
)


@app("Push", os_notifications=True, inbox=True)
@ui("push-app")
class PushApp:
    @button()
    def exported(self):
        return Message(
            "Export ready",
            MessageVariant.SUCCESS,
            persistence=MessagePersistence.INBOX,
            actions=[MessageAction.open("Download", "/exports/7")],
        )


ANA = Identity(name="ana", roles=("user",))


class FakeSender(PushSender):
    def __init__(self):
        self.sent = []
        self.gone = set()
        self.event = threading.Event()

    def send(self, message, tokens):
        self.sent.append((message, list(tokens)))
        self.event.set()
        return PushResult(len(tokens), tuple(t.token for t in tokens if t.token in self.gone))


def handler(identity=None, sender=None, store=None) -> SyncHandler:
    h = SyncHandler(MateuRegistry(PushApp), identity_provider=lambda: identity)
    if sender is not None or store is not None:
        h.enable_push(sender, store or InMemoryPushTokenStore())
    return h


def rq(action_id, parameters=None) -> RunActionRq:
    return RunActionRq(
        route="/push-app",
        server_side_type=type_name(PushApp),
        action_id=action_id,
        component_state={},
        parameters=parameters or {},
    )


def registration(token, device_id):
    return {"token": token, "platform": "android", "deviceId": device_id,
            "ui": "https://ops.example.com/push-app"}


def wire(inc) -> dict:
    return json.loads(json.dumps(inc.model_dump(by_alias=True, mode="json")))


def registered(inc) -> bool:
    return next(f["data"]["_push"]["registered"] for f in wire(inc)["fragments"] if "_push" in (f.get("data") or {}))


def app_meta(h) -> dict:
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

    walk(wire(h.handle(rq(""))))
    return found[0]


def test_the_app_says_push_is_on_only_with_a_sender():
    assert app_meta(handler(sender=FakeSender()))["pushNotifications"] is True
    assert app_meta(handler())["pushNotifications"] is False


def test_a_registered_phone_gets_a_push_for_an_inbox_message():
    sender, store = FakeSender(), InMemoryPushTokenStore()
    h = handler(ANA, sender, store)
    assert registered(h.handle(rq("_push-register", registration("ExponentPushToken[a]", "d1"))))
    [token] = store.tokens_for("ana")
    assert (token.platform, token.ui) == ("android", "https://ops.example.com/push-app")

    h.handle(rq("exported"))
    assert sender.event.wait(5)
    message, tokens = sender.sent[0]
    assert message.title == "Export ready" and message.route == "/exports/7"
    assert message.id.startswith("inbox-")
    assert [t.token for t in tokens] == ["ExponentPushToken[a]"]

    h.handle(rq("_push-unregister", {"token": "ExponentPushToken[a]"}))
    assert store.tokens_for("ana") == []


def test_an_anonymous_phone_is_kept_under_its_session_and_gone_tokens_are_dropped():
    sender, store = FakeSender(), InMemoryPushTokenStore()
    h = handler(None, sender, store)
    with bound_request(MateuRequest(headers={"x-session-id": "s-42"})):
        h.handle(rq("_push-register", registration("ExponentPushToken[gone]", "d2")))
    key = PushNotifications.session_key("s-42")
    assert [t.token for t in store.tokens_for(key)] == ["ExponentPushToken[gone]"]
    sender.gone.add("ExponentPushToken[gone]")
    remote_push.deliver_now(key, PushMessage("Hi"), sender, store)
    assert store.tokens_for(key) == []


def test_without_a_sender_nothing_is_kept_and_a_token_is_required():
    store = InMemoryPushTokenStore()
    h = handler(ANA, None, store)
    assert registered(h.handle(rq("_push-register", registration("ExponentPushToken[x]", "d3")))) is False
    assert store.tokens_for("ana") == []
    with pytest.raises(UserFacingException, match="A push token is needed."):
        handler(ANA, FakeSender(), store).handle(rq("_push-register", {"platform": "ios"}))


def test_the_store_replaces_a_device_bounds_a_principal_and_drops_non_web_uis():
    store = InMemoryPushTokenStore()
    store.register("ana", remote_push.token_of("ExponentPushToken[old]", "ios", "dev", "https://a.example.com"))
    store.register("ana", remote_push.token_of("ExponentPushToken[new]", "ios", "dev", "https://a.example.com"))
    assert [t.token for t in store.tokens_for("ana")] == ["ExponentPushToken[new]"]
    assert remote_push.token_of("ExponentPushToken[js]", "x", "bad id!", "javascript:alert(1)") == PushToken(
        "ExponentPushToken[js]")
    for i in range(13):
        store.register("bob", PushToken(f"ExponentPushToken[b{i}]"))
    assert len(store.tokens_for("bob")) == 10


def test_push_notifications_send_reaches_a_subscribed_delivery():
    got = []
    unsubscribe = PushNotifications.subscribe(lambda p, m: got.append((p, m.route)))
    try:
        PushNotifications.send("ana", AppNotification(id="n1", title="T", text="x", route="/x"))
        PushNotifications.send_to_session("s1", PushMessage("Hi"))
        PushNotifications.send("", PushMessage("ignored"))
    finally:
        unsubscribe()
    assert got == [("ana", "/x"), ("session:s1", None)]


# ── Mateu's Expo sender against a fake Expo service ───────────────────────────────────────


@pytest.fixture()
def fake_expo():
    batches, authorizations = [], []

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):  # noqa: N802
            body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
            batches.append(body)
            authorizations.append(self.headers.get("Authorization"))
            tickets = [
                {"status": "error", "details": {"error": "DeviceNotRegistered"}}
                if "gone" in m["to"] else {"status": "ok", "id": "t"}
                for m in body
            ]
            answer = json.dumps({"data": tickets}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(answer)))
            self.end_headers()
            self.wfile.write(answer)

        def log_message(self, *args):
            pass

    server = HTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{server.server_port}/--/api/v2/push/send", batches, authorizations
    server.shutdown()


def test_the_expo_sender_batches_by_a_hundred_and_reports_gone_tokens(fake_expo):
    url, batches, authorizations = fake_expo
    tokens = [PushToken(f"ExponentPushToken[p{i}]", "android", None, "https://ops.example.com/app") for i in range(230)]
    tokens.append(PushToken("ExponentPushToken[gone-1]"))
    result = remote_push.ExpoPushSender(url, "secret").send(
        PushMessage("Export ready", "Your file", "/exports/7"), tokens)
    assert [len(b) for b in batches] == [100, 100, 31]
    assert result.accepted == 230
    assert result.unregistered_tokens == ("ExponentPushToken[gone-1]",)
    assert set(authorizations) == {"Bearer secret"}
    first = batches[0][0]
    assert (first["title"], first["body"], first["channelId"]) == ("Export ready", "Your file", "mateu")
    assert first["data"] == {"ui": "https://ops.example.com/app", "route": "/exports/7"}


def test_an_unreachable_expo_service_raises_nothing():
    result = remote_push.ExpoPushSender("http://127.0.0.1:1/x", None, timeout=2).send(
        PushMessage("Hi"), [PushToken("ExponentPushToken[a]")])
    assert result.accepted == 0
    time.sleep(0)
