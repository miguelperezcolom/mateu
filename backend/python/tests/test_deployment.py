"""Deployment behind proxies (Java's SseHeaders / ForwardedPrefix / IndexPage.underPrefix): event
streams that a buffering proxy passes on as written, the served page under a path prefix, CORS on
the app's own files, and the JSON content types every adapter accepts."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

fastapi = pytest.importorskip("fastapi")
from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from mateu_ui.core import ui_page  # noqa: E402
from mateu_ui.fastapi import SSE_HEADERS, add_mateu  # noqa: E402
from mateu_ui.uidl import title, ui  # noqa: E402

MODULE = sys.modules[__name__]
VAADIN_STATIC = Path(__file__).resolve().parents[3] / "backend/shared/frontend/vaadin-lit/src/main/resources/static"


@ui("deploy-probe")
@title("Deploy probe")
class DeployProbe:
    name: str = "x"


def client(**kwargs) -> TestClient:
    app = FastAPI()
    add_mateu(app, MODULE, **kwargs)

    @app.get("/elements/widget.js")
    def widget():
        return fastapi.responses.Response("export {}", media_type="text/javascript")

    return TestClient(app)


# ── SSE through buffering proxies ──────────────────────────────────────────────


def test_every_event_stream_tells_proxies_not_to_buffer_it():
    assert SSE_HEADERS == {"Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no"}
    r = client().post("/mateu/v3/sse/deploy-probe", json={"route": "deploy-probe"})
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("text/event-stream")
    assert r.headers["x-accel-buffering"] == "no"
    assert r.headers["cache-control"] == "no-cache, no-transform"


# ── JSON content types ────────────────────────────────────────────────────────


@pytest.mark.parametrize("content_type", ["application/vnd.mateu+json", "application/json ;charset=UTF-8"])
def test_sync_and_sse_accept_every_json_content_type(content_type):
    c = client()
    body = b'{"route": "deploy-probe"}'
    for kind in ("sync", "sse"):
        r = c.post(f"/mateu/v3/{kind}/deploy-probe", content=body, headers={"content-type": content_type})
        assert r.status_code == 200, (kind, content_type, r.text)


# ── CORS on the app's own files ───────────────────────────────────────────────


def test_cors_covers_the_apps_own_files_a_remote_screen_imports():
    # unlike Java (Mateu's API only, plus mateu.cors.paths), the port's CORS is Starlette's, which
    # already covers every path the app serves — an Element's module included
    r = client(cors_origins=["https://shell.example"]).get(
        "/elements/widget.js", headers={"Origin": "https://shell.example"}
    )
    assert r.headers.get("access-control-allow-origin") == "https://shell.example"


# ── the served page under a path prefix ───────────────────────────────────────


def test_a_prefix_is_normalised_like_java():
    assert ui_page.normalize_prefix(None) == ""
    assert ui_page.normalize_prefix("/") == ""
    assert ui_page.normalize_prefix("app/") == "/app"
    assert ui_page.normalize_prefix("/a/b, /c") == "/a/b"
    assert ui_page.normalize_prefix("//evil.example") == ""
    assert ui_page.normalize_prefix('/x"><script>') == ""
    assert ui_page.normalize_prefix("/a/../b") == ""
    assert ui_page.request_prefix("/root", "/proxy", trusted=False) == "/root"
    assert ui_page.request_prefix("/root", "/proxy", trusted=True) == "/proxy"
    assert ui_page.request_prefix("", "", trusted=True) == ""


@pytest.fixture(scope="module")
def vaadin_static() -> Path:
    if not (VAADIN_STATIC / "_index.html").is_file():
        pytest.skip("the Vaadin renderer bundle is not checked out next to this test")
    return VAADIN_STATIC


def page_client(vaadin_static, root_path: str = "", **kwargs) -> TestClient:
    app = FastAPI(root_path=root_path)
    add_mateu(app, MODULE, ui=vaadin_static, **kwargs)
    return TestClient(app, root_path=root_path, headers={"accept": "text/html"})


def test_the_x_forwarded_prefix_is_ignored_unless_trusted(vaadin_static, monkeypatch):
    monkeypatch.delenv(ui_page.FORWARDED_PREFIX_TRUSTED_ENV_VAR, raising=False)
    page = page_client(vaadin_static).get("/", headers={"x-forwarded-prefix": "/evil"}).text
    assert "/evil" not in page
    assert 'src="/assets/' in page


def test_a_trusted_x_forwarded_prefix_puts_the_page_under_it(vaadin_static):
    c = page_client(vaadin_static, forwarded_prefix_trusted=True)
    page = c.get("/", headers={"x-forwarded-prefix": "/admin"}).text
    assert 'src="/admin/assets/' in page
    assert 'baseUrl="/admin"' in page and 'publicBase="/admin"' in page
    # the proxy strips the prefix: the assets keep being served where they always were
    assert c.get("/assets/mateu-vaadin.js").status_code == 200


def test_the_trust_can_come_from_the_environment(vaadin_static, monkeypatch):
    monkeypatch.setenv(ui_page.FORWARDED_PREFIX_TRUSTED_ENV_VAR, "true")
    page = page_client(vaadin_static).get("/", headers={"x-forwarded-prefix": "/admin"}).text
    assert 'publicBase="/admin"' in page


def test_the_asgi_root_path_is_the_prefix(vaadin_static):
    c = page_client(vaadin_static, root_path="/console")
    page = c.get("/").text
    assert 'src="/console/assets/' in page
    assert 'baseUrl="/console"' in page and 'publicBase="/console"' in page
    assert c.get("/assets/mateu-vaadin.js").status_code == 200
