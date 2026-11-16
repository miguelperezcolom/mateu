"""rc.1 re-verification of GA review round 2, J1 (Python), over HTTP through ``add_mateu``.

The review's own scenario: an anonymous caller, a definition-only page under ``access:`` with a
proxied action carrying ``X-Api-Key: ${secret.KEY}``. No spelling but the authored one may serve the
page, and none may make the server call the upstream with the real key."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core.sync_handler import proxy  # noqa: E402
from mateu_ui.fastapi import add_mateu  # noqa: E402

MODULE = sys.modules[__name__]


def _page(text: str) -> str:
    return (
        "actions:\n"
        "  - id: purge\n"
        "    restAction:\n"
        "      source:\n"
        "        url: https://upstream.invalid/purge\n"
        "        method: DELETE\n"
        "        proxy: true\n"
        "        headers: {X-Api-Key: '${secret.KEY}'}\n"
        "layout:\n  type: VerticalLayout\n  content:\n"
        f"    - {{type: Text, text: {text}}}\n"
        "    - {type: Button, label: Purge, actionId: purge}\n"
    )


@pytest.fixture()
def client(tmp_path, monkeypatch):
    specs = tmp_path / "specs" / "ui"
    (specs / "pages").mkdir(parents=True)
    (tmp_path / "other").mkdir()
    (specs / "routes.yaml").write_text(
        "routes:\n"
        "  - route: admin\n    layout: admin.yaml\n    access: {roles: [admin]}\n"
        "  - route: adm2\n    layout: pages/adm.yaml\n    access: {roles: [admin]}\n"
        "  - route: hello\n    layout: hello.yaml\n"
    )
    (specs / "admin.yaml").write_text(_page("ADMIN-PAGE"))
    (specs / "pages" / "adm.yaml").write_text(_page("ADM2-PAGE"))
    (specs / "hello.yaml").write_text(_page("HELLO-PAGE"))
    (tmp_path / "other" / "page.yaml").write_text(_page("OUTSIDE-PAGE"))
    monkeypatch.setenv("MATEU_SPECS_DIR", str(specs))

    calls: list[dict] = []

    class _Answer:
        status = 200
        headers: dict = {}

        def read(self, *_):
            return b"{}"

        def getcode(self):
            return 200

        def __enter__(self):
            return self

        def __exit__(self, *_):
            return False

    def _record(request, timeout):
        calls.append({"url": request.full_url, "headers": dict(request.header_items())})
        return _Answer()

    monkeypatch.setattr(proxy, "_open", _record)
    app = FastAPI()
    add_mateu(app, MODULE, secrets_provider=lambda key: "REAL-KEY" if key == "KEY" else None)
    c = TestClient(app, raise_server_exceptions=False)
    c.calls = calls  # type: ignore[attr-defined]
    return c


def _post(client, route: str, action_id: str = ""):
    params = {"_sourceKind": "action", "_sourceId": "purge"} if action_id == "__restfetch__" else {}
    return client.post(
        "/mateu/v3/sync/x",
        json={"route": route, "actionId": action_id, "componentState": {}, "parameters": params},
    )


SPELLINGS = ["/./admin", "/Admin", "/pages/../admin", "/pages/adm", "/hello/../admin"]


def test_authored_spelling_is_refused_and_public_page_served(client):
    assert _post(client, "/admin").status_code == 403
    assert _post(client, "/adm2").status_code == 403
    r = _post(client, "/hello")
    assert r.status_code == 200 and "HELLO-PAGE" in r.text


@pytest.mark.parametrize("route", SPELLINGS)
def test_other_spellings_do_not_serve_the_page(client, route):
    r = _post(client, route)
    assert "ADMIN-PAGE" not in r.text and "ADM2-PAGE" not in r.text, (route, r.status_code)


@pytest.mark.parametrize("route", SPELLINGS + ["/admin", "/adm2"])
def test_other_spellings_never_call_the_upstream(client, route):
    _post(client, route, "__restfetch__")
    assert client.calls == [], (route, client.calls)


def test_no_yaml_outside_the_specs_dir(client):
    r = _post(client, "/../../../other/page")
    assert "OUTSIDE-PAGE" not in r.text
    _post(client, "/../../../other/page", "__restfetch__")
    assert client.calls == []


def test_the_public_page_does_call_the_upstream_with_the_key(client):
    """Control: the probe would see a call if one were made."""
    _post(client, "/hello", "__restfetch__")
    assert client.calls and client.calls[0]["headers"].get("X-api-key") == "REAL-KEY"
