"""``add_mateu(oracle_cdn_url=…)`` / ``MATEU_ORACLE_CDN_URL`` (Java: ``mateu.oracle-cdn.url``): the
Redwood page loads Oracle's CDN content (JET, Spectra, the VB runtime, gallery images) from a mirror
the organisation hosts. Mateu never bundles those files — it only re-points the URLs of the page it
serves."""

from __future__ import annotations

import logging
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import ui_page  # noqa: E402

TEMPLATE = (
    "<html><head><title>AQUIELTITULODELAPAGINA</title>"
    '<link rel="preconnect" href="https://static.oracle.com" crossorigin>'
    "<script>window.vbInitConfig = { JET_CDN_PATH: 'https://static.oracle.com/cdn/jet/18.1.0-2510.3', "
    "JET_CDN_VERSION: '18.1.0' };</script>"
    '<script type="text/mateu-deferred" data-src="https://static.oracle.com/cdn/vb/2510.3/visual-runtime.js"></script>'
    '<link rel="stylesheet" href="https://static.oracle.com/cdn/spectra/25.10.0/oj-sp.css">'
    "</head><body><!-- AQUIUI --><!-- HASTAAQUIUI --></body></html>"
)


@pytest.fixture(autouse=True)
def _no_env(monkeypatch):
    monkeypatch.delenv(ui_page.ORACLE_CDN_ENV_VAR, raising=False)


def test_off_leaves_the_page_unchanged():
    assert ui_page.render_index(TEMPLATE, "", "T", oracle_cdn=None) == ui_page.render_index(TEMPLATE, "", "T")
    assert "https://static.oracle.com/cdn/jet/18.1.0-2510.3" in ui_page.render_index(TEMPLATE, "", "T")
    assert ui_page.resolve_oracle_cdn(None) == (None, None)
    assert ui_page.resolve_oracle_cdn("   ") == (None, None)


def test_on_no_static_oracle_com_is_left():
    mirror, rejected = ui_page.resolve_oracle_cdn("https://cdn.example.com:8443/oracle/cdn/")
    assert rejected is None
    assert mirror == "https://cdn.example.com:8443/oracle/cdn"
    html = ui_page.render_index(TEMPLATE, "", "T", oracle_cdn=mirror)
    assert "static.oracle.com" not in html
    assert "JET_CDN_PATH: 'https://cdn.example.com:8443/oracle/cdn/jet/18.1.0-2510.3'" in html
    assert 'data-src="https://cdn.example.com:8443/oracle/cdn/vb/2510.3/visual-runtime.js"' in html
    assert '<link rel="preconnect" href="https://cdn.example.com:8443" crossorigin>' in html
    # only the URLs change
    back = html.replace(mirror, ui_page.ORACLE_CDN).replace(
        'href="https://cdn.example.com:8443"', ui_page.ORACLE_CDN_PRECONNECT
    )
    assert back == ui_page.render_index(TEMPLATE, "", "T")


@pytest.mark.parametrize(
    "value",
    [
        "cdn.example.com/oracle/cdn",
        "/oracle/cdn",
        "ftp://cdn.example.com/oracle/cdn",
        "javascript:alert(1)",
        'https://cdn.example.com/"><script>alert(1)</script>',
        "https://cdn.example.com/a b",
        "https://cdn.example.com/it's",
    ],
)
def test_an_invalid_value_is_ignored_with_a_warning(value):
    mirror, rejected = ui_page.resolve_oracle_cdn(value)
    assert mirror is None
    assert rejected


def test_the_environment_variable_is_the_fallback(monkeypatch):
    monkeypatch.setenv(ui_page.ORACLE_CDN_ENV_VAR, "https://mirror.example.org/cdn")
    assert ui_page.resolve_oracle_cdn(None)[0] == "https://mirror.example.org/cdn"
    assert ui_page.resolve_oracle_cdn("https://opt.example.org/cdn")[0] == "https://opt.example.org/cdn"


fastapi = pytest.importorskip("fastapi")
from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from mateu_ui.fastapi import add_mateu  # noqa: E402
from mateu_ui.uidl import title, ui  # noqa: E402

MODULE = sys.modules[__name__]


@ui("oracle-cdn-probe")
@title("Probe")
class OracleCdnProbe:
    name: str = "x"


@pytest.mark.parametrize(
    "mirror,rewritten",
    [("https://cdn.example.com/oracle/cdn", True), ("not a url", False), (None, False)],
)
def test_the_served_page_is_re_pointed_at_the_mirror(tmp_path, caplog, mirror, rewritten):
    (tmp_path / ui_page.INDEX).write_text(TEMPLATE, encoding="utf-8")
    app = FastAPI()
    with caplog.at_level(logging.WARNING):
        add_mateu(app, MODULE, ui=tmp_path, oracle_cdn_url=mirror)
    page = TestClient(app, headers={"accept": "text/html"}).get("/").text
    assert ("static.oracle.com" in page) is (not rewritten)
    if rewritten:
        assert "https://cdn.example.com/oracle/cdn/vb/2510.3/visual-runtime.js" in page
    assert ("Ignoring the Oracle CDN mirror" in caplog.text) is (mirror == "not a url")
