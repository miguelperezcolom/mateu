"""The resolver's pieces in isolation — the Python mirror of Java's
``MicroFrontendServerResolverTest``: cancellation at the deadline, the remote registry's matching,
the remote side's cache stamping, the in-memory store, the island id and the correlation id."""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_ui.core.microfrontends import (  # noqa: E402
    DefaultCorrelationIdProvider,
    DefaultRemoteRegistry,
    InMemoryFragmentCacheStore,
    MicroFrontendServerResolver,
    ServerResolution,
    micro_frontend_id,
    stamp_fragment_cache,
)
from mateu_ui.core.request_context import MateuRequest, bound_request  # noqa: E402
from mateu_ui.dtos import ClientSideComponent, MicroFrontendMetadata, UIFragment, UIIncrement  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    ComponentTreeSupplier,
    FragmentCachePolicy,
    RemoteCatalogSupplier,
    RemoteDescriptor,
    cacheable_fragment,
    ui,
)
from mateu_ui.uidl import components as fluent  # noqa: E402

BASE = "https://orders.acme.com/ui"


class HangingClient:
    """A client whose calls never answer: what the resolver does with them is the point."""

    def __init__(self):
        self.started = 0
        self.cancelled = 0

    async def post_json(self, url, payload, headers):
        self.started += 1
        try:
            await asyncio.sleep(3600)
        except asyncio.CancelledError:
            self.cancelled += 1
            raise


class _Orders(RemoteCatalogSupplier):
    def remotes(self):
        return [RemoteDescriptor("orders", BASE, 100)]


def resolver(http):
    return MicroFrontendServerResolver(registry=DefaultRemoteRegistry([_Orders()]), http=http)


def page_with(base_url):
    meta = MicroFrontendMetadata(base_url=base_url, route="/x")
    meta._server = ServerResolution(timeout_ms=80, degrade_to_client=True)
    host = ClientSideComponent(metadata=meta, id="mfe")
    return UIIncrement(fragments=[UIFragment(target_component_id="page", component=host, action="Replace")])


def test_the_call_still_running_at_the_deadline_is_cancelled():
    http = HangingClient()
    resolved = resolver(http).resolve_sync(page_with(BASE + "/orders"), MateuRequest())
    assert (http.started, http.cancelled) == (1, 1)
    meta = resolved.fragments[0].component.metadata
    assert meta.resolved is None
    assert meta.base_url == BASE + "/orders"
    assert "resolved" not in resolved.model_dump(by_alias=True)["fragments"][0]["component"]["metadata"]


@pytest.mark.parametrize("url", [
    "https://orders.acme.com/uix",
    "https://orders.acme.com.evil.io/ui",
    "http://orders.acme.com/ui",
    "https://orders.acme.com:8443/ui",
    "https://orders.acme.com/ui/../admin",
    "https://user@orders.acme.com/ui",
])
def test_a_url_that_only_looks_like_a_registered_remote_is_refused(url):
    http = HangingClient()
    with pytest.raises(ValueError, match="is not under any registered remote"):
        resolver(http).resolve_sync(page_with(url), MateuRequest())
    assert http.started == 0


def test_registry_matches_by_scheme_host_port_and_path_segment():
    class Supplier(RemoteCatalogSupplier):
        def remotes(self):
            return [
                RemoteDescriptor("root", "https://a.com"),
                RemoteDescriptor("deep", "https://a.com/x"),
                RemoteDescriptor("hub", "/_content-hub"),
                RemoteDescriptor("bad", "ftp://a.com"),
            ]

    registry = DefaultRemoteRegistry([Supplier()], [RemoteDescriptor("props", "https://b.com/p", 250)])
    assert registry.for_url("https://a.com/x/y").id == "deep"
    assert registry.for_url("https://a.com/xy").id == "root"
    assert registry.for_url("https://A.com:443/x").id == "deep"
    assert registry.for_url("/_content-hub").id == "hub"
    assert registry.for_url("/_content-hubx") is None
    assert registry.for_url("https://b.com/p/q").timeout_ms == 250
    assert registry.by_id("bad") is None, "not an http(s) url: not registered"


def test_an_explicit_remote_wins_over_a_supplied_one_with_the_same_id():
    registry = DefaultRemoteRegistry([_Orders()], [RemoteDescriptor("orders", "https://other.com", 5)])
    assert registry.by_id("orders").base_url == "https://other.com"


@cacheable_fragment(max_age_seconds=30, vary_by="shared")
class AnnotatedView:
    pass


class KeyedView:
    def fragment_cache_policy(self, request):
        return FragmentCachePolicy.by_key("aud-A", 60)


def test_a_remote_view_declares_its_cache_policy_on_its_loads():
    page = page_with(BASE)
    stamped = stamp_fragment_cache(page, "", MateuRequest(), AnnotatedView)
    assert stamped.fragment_cache.max_age_seconds == 30
    assert stamped.fragment_cache.vary_by == "shared"
    assert stamped.model_dump(by_alias=True)["fragmentCache"] == {"maxAgeSeconds": 30, "varyBy": "shared"}
    # only a load: an action's answer is never embedded by a host
    assert stamp_fragment_cache(page, "save", None, AnnotatedView).fragment_cache is None
    assert stamp_fragment_cache(page, "", None, object()).fragment_cache is None
    assert "fragmentCache" not in page.model_dump(by_alias=True)


def test_a_remote_answers_not_modified_without_the_fragments_when_the_host_holds_the_key():
    page = page_with(BASE)
    held = MateuRequest(headers={"x-mateu-fragment-keys": "aud-B, aud-A"})
    stamped = stamp_fragment_cache(page, "", held, KeyedView())
    assert stamped.fragment_cache.not_modified is True
    assert stamped.fragments == []
    assert stamped.model_dump(by_alias=True)["fragmentCache"]["notModified"] is True
    fresh = stamp_fragment_cache(page, "", MateuRequest(), KeyedView())
    assert fresh.fragment_cache.not_modified is False
    assert fresh.fragment_cache.key == "aud-A"
    assert len(fresh.fragments) == 1


@ui("cached-remote-view")
@cacheable_fragment(max_age_seconds=45, vary_by="user")
class CachedRemoteView(ComponentTreeSupplier):
    def component(self):
        return fluent.Text(text="hi")


@ui("keyed-remote-view")
class KeyedRemoteView(ComponentTreeSupplier):
    def fragment_cache_policy(self, request):
        return FragmentCachePolicy.by_key("k1", 60)

    def component(self):
        return fluent.Text(text="hi")


def test_the_handler_stamps_a_routed_views_policy_on_its_load_answers():
    handler = SyncHandler(MateuRegistry(CachedRemoteView, KeyedRemoteView))
    with bound_request(MateuRequest()):
        load = handler.handle(RunActionRq(route="cached-remote-view", action_id=""))
    assert load.model_dump(by_alias=True)["fragmentCache"] == {"maxAgeSeconds": 45, "varyBy": "user"}
    with bound_request(MateuRequest(headers={"x-mateu-fragment-keys": "k1"})):
        held = handler.handle(RunActionRq(route="keyed-remote-view", action_id=""))
    assert held.fragments == [] and held.fragment_cache.not_modified


def test_the_in_memory_store_expires_and_stays_bounded():
    now = [0.0]
    store = InMemoryFragmentCacheStore(2, clock=lambda: now[0])
    store.put("a", "1", 10)
    assert store.get("a") == "1"
    now[0] = 10.0
    assert store.get("a") is None
    store.put("a", "1", 10)
    store.put("b", "2", 10)
    store.put("c", "3", 10)
    assert store.get("a") is None
    assert store.get("c") == "3"
    store.put("z", "0", 0)
    assert store.get("z") is None


def test_the_island_id_matches_the_renderers():
    assert micro_frontend_id("https://a.com/x", "/r", None, "T") == "mfe_https___a_com_x__r__T"


def test_correlation_id_is_the_callers_when_sane_and_stable_for_the_request():
    provider = DefaultCorrelationIdProvider()
    assert provider.correlation_id(MateuRequest(headers={"x-mateu-correlation-id": "abc-1"})) == "abc-1"
    forged = MateuRequest(headers={"x-mateu-correlation-id": "a\r\nInjected: 1"}, correlation_id="own-1")
    assert provider.correlation_id(forged) == "own-1"
    traced = MateuRequest(headers={"traceparent": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"})
    assert provider.correlation_id(traced) == "4bf92f3577b34da6a3ce929d0e0e4736"


def test_a_client_micro_frontend_maps_exactly_as_before_and_marks_nothing():
    @ui("plain-mfe")
    class Plain(ComponentTreeSupplier):
        def component(self):
            return fluent.MicroFrontend(base_url="https://x.com", route="/r")

    increment = SyncHandler(MateuRegistry(Plain)).handle(RunActionRq(route="plain-mfe", action_id=""))
    dumped = increment.model_dump(by_alias=True, mode="json")

    def find(node):
        if isinstance(node, dict):
            if node.get("type") == "MicroFrontend":
                return node
            for v in node.values():
                hit = find(v)
                if hit:
                    return hit
        if isinstance(node, list):
            for v in node:
                hit = find(v)
                if hit:
                    return hit
        return None

    assert find(dumped) == {"type": "MicroFrontend", "baseUrl": "https://x.com", "route": "/r",
                            "consumedRoute": "_empty", "style": None, "cssClasses": None,
                            "serverSideType": "", "appState": None, "actionId": None}
    assert "fragmentCache" not in dumped


def test_a_fluent_slot_with_no_content_remote_paints_its_fallback_and_never_fails():
    @ui("fluent-slot")
    class FluentSlot(ComponentTreeSupplier):
        def component(self):
            return fluent.VerticalLayout(content=(
                fluent.ContentSlot(key="app.screen.help", fallback="Help is on its way"),
                fluent.ContentSlot(key="app.screen.nothing"),
            ))

    increment = SyncHandler(MateuRegistry(FluentSlot)).handle(RunActionRq(route="fluent-slot", action_id=""))
    dumped = increment.model_dump(by_alias=True, mode="json")
    text = str(dumped)
    assert "Help is on its way" in text
    assert "MicroFrontend" not in text and "slot_app_screen_nothing" not in text


def test_the_client_reads_chunked_and_empty_answers():
    import json as _json
    import threading
    from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

    from mateu_ui.core.microfrontends import AsyncioMateuHttpClient, RemoteCallError

    class Chunked(BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"

        def log_message(self, *args):
            pass

        def do_POST(self):  # noqa: N802
            self.rfile.read(int(self.headers.get("Content-Length") or 0))
            if self.path.endswith("/empty"):
                self.send_response(204)
                self.end_headers()
                return
            if self.path.endswith("/bad"):
                body = b"[]"
                self.send_response(200)
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
            body = _json.dumps({"fragments": [], "echo": self.headers.get("X-Custom")}).encode()
            self.send_response(200)
            self.send_header("Transfer-Encoding", "chunked")
            self.end_headers()
            for part in (body[:5], body[5:]):
                self.wfile.write(f"{len(part):x}\r\n".encode() + part + b"\r\n")
            self.wfile.write(b"0\r\n\r\n")

    server = ThreadingHTTPServer(("127.0.0.1", 0), Chunked)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_address[1]}"
    client = AsyncioMateuHttpClient()
    try:
        answer = asyncio.run(client.post_json(base + "/x", {}, {"X-Custom": "v", "Host": "evil", "X-Bad": "a\r\nb"}))
        assert answer == {"fragments": [], "echo": "v"}
        assert asyncio.run(client.post_json(base + "/empty", {}, {})) is None
        with pytest.raises(RemoteCallError, match="Not a UIIncrement"):
            asyncio.run(client.post_json(base + "/bad", {}, {}))
    finally:
        server.shutdown()
        server.server_close()


def test_settings_come_from_the_options_else_the_environment(monkeypatch):
    from mateu_ui.core.microfrontends import MicroFrontendSettings

    monkeypatch.setenv("MATEU_MICROFRONTENDS_MAX_BUDGET_MS", "900")
    monkeypatch.setenv("MATEU_SELF_BASE_URL", "http://localhost:8000/")
    settings = MicroFrontendSettings.from_env(default_timeout_ms=120, content_route="/c/{key}")
    assert (settings.default_timeout_ms, settings.max_budget_ms) == (120, 900)
    assert settings.content_route_for("a.b.c") == "/c/a.b.c"
    assert settings.self_base_url == "http://localhost:8000"
    assert MicroFrontendSettings.from_env(self_base_url="http://h/with/path").self_base_url is None
    assert MicroFrontendSettings.from_env(default_timeout_ms=-1).default_timeout_ms == 500
