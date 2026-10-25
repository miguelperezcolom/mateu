"""Every UI as an installable Progressive Web App (``mateu_ui.core.pwa``) — the Python mirror of
Java's ``PwaTest`` / .NET's ``PwaTests``. The manifest JSON strings are the shared parity fixtures:
the three backends answer exactly these bytes, and the worker, registration script and icons are
byte-identical copies of Java's resources."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import dev_specs, pwa, ui_page  # noqa: E402
from mateu_ui.uidl import app, menu_item, mobile_app, title, ui  # noqa: E402

JAVA_RESOURCES = (
    Path(__file__).resolve().parents[2] / "shared/core/src/main/resources/io/mateu/core/infra/pwa"
)

PLAIN_MANIFEST = (
    '{"id":"/","name":"Plain","short_name":"Plain","start_url":"/","scope":"/",'
    '"display":"standalone","background_color":"#ffffff","icons":['
    '{"src":"icon-192.png","sizes":"192x192","type":"image/png","purpose":"any"},'
    '{"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"any"},'
    '{"src":"icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]}'
)

ACME_MANIFEST = (
    '{"id":"/crm","name":"Acme CRM","short_name":"CRM","start_url":"/crm",'
    '"scope":"/crm","display":"standalone","background_color":"#ffffff",'
    '"theme_color":"#1f6feb","icons":['
    '{"src":"/images/acme.svg","sizes":"any","type":"image/svg+xml","purpose":"any"},'
    '{"src":"icon-192.png","sizes":"192x192","type":"image/png","purpose":"any"},'
    '{"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"any"},'
    '{"src":"icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]}'
)

VAADIN_PAGE = (
    '<html><head><title>T</title><script src="/assets/mateu-theme.js"></script>'
    '<script type="module" crossorigin src="/assets/mateu-vaadin.js"></script>'
    '<link rel="stylesheet" href="/assets/index.css"><link rel="icon" href="/api/me.png">'
    "</head><body></body></html>"
)

SETTINGS = ("MATEU_PWA_ENABLED", "MATEU_DEV", "MATEU_MOBILE_NAME", "MATEU_MOBILE_SHORT_NAME",
            "MATEU_MOBILE_ICON", "MATEU_MOBILE_THEME_COLOR")


@pytest.fixture(autouse=True)
def no_settings(monkeypatch):
    for name in SETTINGS:
        monkeypatch.delenv(name, raising=False)
    # dev mode may have been forced by another test's add_mateu(live_reload=True)
    monkeypatch.setattr(dev_specs, "_forced", None)


@ui("pwa-home")
@title("Home")
class PwaHome:
    name: str | None = None


# The port has no app logo / accent colour: the Acme fixture's icon comes from @mobile_app(icon=...).
@app("Acme CRM")
@mobile_app(short_name="CRM", theme_color="#1f6feb", icon="/images/acme.svg")
class AcmeApp:
    @menu_item("Home")
    def home(self) -> "PwaHome":
        return PwaHome()


@app("Plain")
class PlainApp:
    @menu_item("Home")
    def home(self) -> "PwaHome":
        return PwaHome()


def _source(icon: str | None = None, theme: str | None = None) -> type:
    """An app declaring ``icon`` / ``theme_color`` with @mobile_app (Java: a MobileManifest.Source)."""

    @app("X")
    @mobile_app(icon=icon or "", theme_color=theme or "")
    class X:
        pass

    return X


# ---------------------------------------------------------------------------------------- manifest


def test_the_manifest_is_derived_like_the_mobile_one():
    assert pwa.manifest_json(PlainApp, "/", "/") == PLAIN_MANIFEST
    assert pwa.manifest_json(AcmeApp, "/crm", "/crm") == ACME_MANIFEST


def test_a_setting_wins_as_for_the_mobile_manifest(monkeypatch):
    monkeypatch.setenv("MATEU_MOBILE_THEME_COLOR", "#000000")
    monkeypatch.setenv("MATEU_MOBILE_ICON", "https://cdn.acme.com/icon-512.png")
    json = pwa.manifest_json(AcmeApp, "/", "/")
    assert '"theme_color":"#000000"' in json
    assert (
        '{"src":"https://cdn.acme.com/icon-512.png","sizes":"any","type":"image/png","purpose":"any"}'
        in json
    )


def test_only_hex_theme_colours_and_safe_icons_are_kept():
    json = pwa.manifest_json(_source("http://insecure.example/logo.png", "red"), "/", "/")
    assert "theme_color" not in json and "insecure" not in json
    assert pwa.declared_icon(_source("logo.png")) == "/logo.png"
    assert pwa.declared_icon(_source("/favicon.ico")) is None
    assert pwa.declared_icon(_source("javascript:alert(1)")) is None
    assert pwa.declared_icon(_source("data:text/html,<b>")) is None
    assert pwa.declared_icon(_source("data:image/png;base64,AAAA")) == "data:image/png;base64,AAAA"
    assert pwa.declared_icon(_source("//cdn.example/x.png")) is None
    assert pwa.declared_icon(_source('/a"b.png')) is None
    assert pwa.declared_icon(None) is None
    assert pwa.theme_color(None) is None
    assert pwa.icon_type("/x.webp?v=1") == "image/webp"
    assert pwa.icon_type("/x.JPEG") == "image/jpeg"
    assert pwa.icon_type("/x.gif") == "image/gif"
    assert pwa.icon_type("/x") == ""


def test_an_icon_of_unknown_type_has_no_type_member():
    icons = pwa.icons(_source("/icon"))
    assert icons[0] == {"src": "/icon", "sizes": "any", "purpose": "any"}


def test_scopes_and_folders():
    assert pwa.scope_of("") == "/"
    assert pwa.scope_of(None) == "/"
    assert pwa.scope_of("/crm/") == "/crm"
    assert pwa.scope_of("back-office") == "/back-office"
    assert pwa.dir_of("") == "/mateu/v3/pwa/"
    assert pwa.dir_of("/crm") == "/crm/mateu/v3/pwa/"


# ---------------------------------------------------------------------------------------- the head


def test_the_page_gets_the_manifest_the_colour_and_the_worker():
    html = pwa.served(VAADIN_PAGE, "/crm", AcmeApp)
    assert (
        '<link rel="manifest" href="/crm/mateu/v3/pwa/manifest.webmanifest"'
        ' crossorigin="use-credentials">' in html
    )
    assert '<meta name="theme-color" content="#1f6feb">' in html
    # an SVG icon is no iOS home-screen icon: Mateu's PNG instead
    assert '<link rel="apple-touch-icon" href="/crm/mateu/v3/pwa/icon-192.png">' in html
    assert '<script src="/crm/mateu/v3/pwa/register.js" data-sw="/crm/mateu/v3/pwa/sw.js?v=' in html
    assert '&amp;s=%2Fassets%2F" data-scope="/crm" defer></script></head>' in html
    # an icon link is not a folder of the page's own files
    assert "%2Fapi%2F" not in html


def test_the_head_markup_is_javas_byte_for_byte():
    page = "<html><head></head><body></body></html>"
    links = pwa.Links("/m.webmanifest", "/sw.js", "/r.js", "/i.png", "/", ("/a b/~x*.json",))
    html = pwa.with_head(page, links, _source("https://cdn.example/a.png?x=1&y=2", "#fff"), "b1")
    v = pwa.version(page, "b1")
    assert html == (
        '<html><head><link rel="manifest" href="/m.webmanifest" crossorigin="use-credentials">'
        '<meta name="theme-color" content="#fff">'
        '<link rel="apple-touch-icon" href="https://cdn.example/a.png?x=1&amp;y=2">'
        f'<script src="/r.js" data-sw="/sw.js?v={v}&amp;p=%2Fa+b%2F%7Ex*.json" data-scope="/" defer>'
        "</script></head><body></body></html>"
    )


def test_a_page_without_head_or_with_a_manifest_is_left_alone():
    links = pwa.Links.served("")
    assert pwa.with_head("<p>x</p>", links, None, "b") == "<p>x</p>"
    page = '<head><link rel="manifest" href="/x"></head>'
    assert pwa.with_head(page, links, None, "b") == page
    assert pwa.served(None, "", None) is None


def test_the_worker_version_follows_the_page():
    def version_of(html: str) -> str:
        at = html.index("sw.js?v=") + len("sw.js?v=")
        return html[at : at + 16]

    a = pwa.served(VAADIN_PAGE, "", None, "build")
    b = pwa.served(VAADIN_PAGE.replace("mateu-vaadin.js", "mateu-vaadin2.js"), "", None, "build")
    assert len(version_of(a)) == 16 and version_of(a) != version_of(b)
    assert version_of(a) == version_of(pwa.served(VAADIN_PAGE, "", None, "build"))
    assert version_of(a) != version_of(pwa.served(VAADIN_PAGE, "", None, "another build"))


def test_static_folders_are_where_scripts_and_stylesheets_come_from():
    redwood = (
        '<head><base href="/"><link rel="preconnect" href="https://static.oracle.com">'
        '<link rel="stylesheet" type="text/css" href="https://static.oracle.com/cdn/jet/18/x.css">'
        '<link rel="stylesheet" href="_redwood/resources/css/app.css?v=1">'
        '<script type="text/mateu-deferred" data-src="https://static.oracle.com/cdn/jet/require.js"></script>'
        '<script src="/mateu/v3/x.js"></script><script src="/root.js"></script>'
        '<script src="data:text/javascript,1"></script></head>'
    )
    # scripts first, then stylesheets (Java's order)
    assert pwa.static_folders(redwood) == ["https://static.oracle.com/cdn/", "/_redwood/"]
    assert pwa.static_folders('<script src="//cdn.x.com/lib/a.js"></script><script src="./js/b.js">') == [
        "https://cdn.x.com/lib/",
        "/js/",
    ]
    assert pwa.static_folders('<script src="https://cdn.x.com"></script><script src="#x/y">') == []
    many = "".join(f'<script src="/f{i}/a.js"></script>' for i in range(12))
    assert len(pwa.static_folders(many)) == 8


# ---------------------------------------------------------------------------------------- switches


def test_switched_off_the_page_is_untouched_and_the_worker_unregisters(monkeypatch):
    monkeypatch.setenv("MATEU_PWA_ENABLED", "FALSE")
    assert not pwa.enabled()
    assert pwa.served(VAADIN_PAGE, "", None) == VAADIN_PAGE
    assert pwa.asset(pwa.MANIFEST, "", PlainApp) is None
    assert pwa.asset(pwa.REGISTER, "", PlainApp) is None
    worker = pwa.asset(pwa.WORKER, "", PlainApp)
    assert "unregister()" in worker.body.decode("utf-8")
    assert worker.body == pwa.resource(pwa.WORKER_OFF)


def test_off_in_development_mode(monkeypatch):
    monkeypatch.setenv("MATEU_DEV", "true")
    assert not pwa.enabled()
    assert pwa.served(VAADIN_PAGE, "", None) == VAADIN_PAGE


def test_on_by_default():
    assert pwa.enabled()


# ---------------------------------------------------------------------------------------- the files


def test_the_files():
    manifest = pwa.asset(pwa.MANIFEST, "/crm", AcmeApp)
    assert manifest.content_type == "application/manifest+json"
    assert manifest.body.decode("utf-8") == ACME_MANIFEST
    assert manifest.headers == {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=300",
        "X-Content-Type-Options": "nosniff",
    }

    worker = pwa.asset(pwa.WORKER, "/crm", AcmeApp)
    assert worker.headers == {
        "Content-Type": "text/javascript; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
        "Service-Worker-Allowed": "/crm",
    }
    assert "networkFirst" in worker.body.decode("utf-8")

    register = pwa.asset(pwa.REGISTER, "/crm", AcmeApp)
    assert register.body == pwa.resource(pwa.REGISTER)
    assert "Service-Worker-Allowed" not in register.headers
    for icon in (pwa.ICON_192, pwa.ICON_512, pwa.ICON_MASKABLE):
        served = pwa.asset(icon, "/crm", AcmeApp)
        assert served.content_type == "image/png"
        assert served.headers["Cache-Control"] == "public, max-age=86400"
        assert served.body.startswith(b"\x89PNG")
    assert pwa.asset("../secret", "/crm", AcmeApp) is None
    assert pwa.asset("sw-off.js", "/crm", AcmeApp) is None
    assert pwa.asset(None, "/crm", AcmeApp) is None
    with pytest.raises(ValueError):
        pwa.resource("../secret")


@pytest.mark.parametrize("name", ["sw.js", "sw-off.js", "register.js", "icon-192.png", "icon-512.png", "icon-maskable-512.png"])
def test_the_packaged_files_are_javas_byte_for_byte(name):
    java = JAVA_RESOURCES / name
    if not java.is_file():
        pytest.skip("the Java resources are not checked out next to this port")
    assert pwa.resource(name) == java.read_bytes()


def test_spa_fallback_never_answers_the_pwa_files():
    assert not ui_page.spa_candidate("/crm/mateu/v3/pwa/sw.js")
    assert not ui_page.spa_candidate("/crm/mateu/v3/pwa/whatever")
    assert pwa.is_endpoint("/crm/mateu/v3/pwa/sw.js")
    assert not pwa.is_endpoint(None)


# ---------------------------------------------------------------------------------------- served


def test_the_index_page_carries_it():
    html = ui_page.render_index(
        "<html><head><title>AQUIELTITULODELAPAGINA</title>"
        '<script type="module" crossorigin src="/assets/mateu-vaadin.js"></script>'
        "</head><body><!-- AQUIUI --><!-- HASTAAQUIUI --></body></html>",
        "/crm",
        "CRM",
        app_type=AcmeApp,
        build_id="b",
    )
    assert "/crm/mateu/v3/pwa/manifest.webmanifest" in html
    assert '<meta name="theme-color" content="#1f6feb">' in html


fastapi = pytest.importorskip("fastapi")
from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from mateu_ui.fastapi import add_mateu  # noqa: E402


def _client(base_url: str, ui_dir: Path | None = None) -> TestClient:
    fastapi_app = FastAPI()
    add_mateu(fastapi_app, AcmeApp, PwaHome, base_url=base_url, ui=ui_dir, build_id="pwa-build")
    return TestClient(fastapi_app, headers={"accept": "text/html,application/xhtml+xml,*/*;q=0.8"})


@pytest.fixture
def renderer(tmp_path) -> Path:
    (tmp_path / "assets").mkdir()
    (tmp_path / "assets" / "mateu-vaadin.js").write_text("// renderer")
    (tmp_path / "_index.html").write_text(
        "<html><head><title>AQUIELTITULODELAPAGINA</title>"
        '<script type="module" crossorigin src="/assets/mateu-vaadin.js"></script>'
        "</head><body><!-- AQUIUI --><!-- HASTAAQUIUI --></body></html>"
    )
    return tmp_path


@pytest.mark.parametrize("base_url,scope", [("", "/"), ("/crm", "/crm")])
def test_the_files_are_served_on_every_mount(base_url, scope):
    client = _client(base_url)
    response = client.get(f"{base_url}/mateu/v3/pwa/manifest.webmanifest")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/manifest+json"
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.text == pwa.manifest_json(AcmeApp, scope, scope)

    worker = client.get(f"{base_url}/mateu/v3/pwa/sw.js")
    assert worker.status_code == 200
    assert worker.headers["service-worker-allowed"] == scope
    assert worker.headers["cache-control"] == "no-cache"
    assert worker.content == pwa.resource(pwa.WORKER)

    icon = client.get(f"{base_url}/mateu/v3/pwa/icon-192.png")
    assert icon.status_code == 200 and icon.headers["content-type"] == "image/png"
    assert icon.content == pwa.resource(pwa.ICON_192)

    for missing in ("sw-off.js", "nope.js", "nope"):
        assert client.get(f"{base_url}/mateu/v3/pwa/{missing}").status_code == 404


def test_the_acme_manifest_fixture_over_the_wire():
    assert _client("/crm").get("/crm/mateu/v3/pwa/manifest.webmanifest").text == ACME_MANIFEST


@pytest.mark.parametrize("base_url", ["", "/crm"])
def test_the_page_served_with_a_renderer_carries_the_head_and_never_answers_the_files(renderer, base_url):
    client = _client(base_url, renderer)
    page = client.get(base_url or "/")
    assert page.status_code == 200
    dir_ = pwa.dir_of(base_url)
    assert f'<link rel="manifest" href="{dir_}manifest.webmanifest" crossorigin="use-credentials">' in page.text
    assert '<meta name="theme-color" content="#1f6feb">' in page.text
    assert f'data-sw="{dir_}sw.js?v=' in page.text
    assert "&amp;s=%2Fassets%2F" in page.text
    assert page.text.index('rel="manifest"') < page.text.index("</head>")
    # an unknown PWA file is a 404, never the page
    for missing in ("nope.js", "nope"):
        response = client.get(f"{dir_}{missing}")
        assert response.status_code == 404 and "<html" not in response.text
    # the version carries the build id
    expected = ui_page.render_index(
        renderer.joinpath("_index.html").read_text(), base_url, "Acme CRM", app_type=AcmeApp, build_id="pwa-build"
    )
    assert page.text == expected


def test_switched_off_the_page_has_no_head_and_the_worker_unregisters(renderer, monkeypatch):
    monkeypatch.setenv("MATEU_PWA_ENABLED", "false")
    client = _client("", renderer)
    assert 'rel="manifest"' not in client.get("/").text
    assert client.get("/mateu/v3/pwa/manifest.webmanifest").status_code == 404
    assert client.get("/mateu/v3/pwa/register.js").status_code == 404
    assert client.get("/mateu/v3/pwa/sw.js").content == pwa.resource(pwa.WORKER_OFF)
