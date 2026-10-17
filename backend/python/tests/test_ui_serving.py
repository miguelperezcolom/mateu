"""``add_mateu(ui=…)``: this server serves a web renderer's page like a Java app does — until
2026-10-17 it answered the sync API only and a first-time user had nothing to open in a browser.
The renderer is the ``static/`` folder of the mateu-vaadin / mateu-redwood jar (here: the one
checked into the repo) or the jar itself; the page answers the mount and its deep links, the assets
the origin root, and the API is never answered with the page."""

from __future__ import annotations

import sys
import zipfile
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

fastapi = pytest.importorskip("fastapi")
from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from mateu_core import ui_page  # noqa: E402
from mateu_fastapi import add_mateu  # noqa: E402
from mateu_uidl import app as mateu_app, menu_item, title, ui  # noqa: E402

MODULE = sys.modules[__name__]
VAADIN_STATIC = Path(__file__).resolve().parents[3] / "backend/shared/frontend/vaadin-lit/src/main/resources/static"


@ui("ui-probe")
@title("Probe")
class Probe:
    name: str = "x"


@mateu_app("Shop console")
class ShopApp:
    probe = menu_item("Probe", Probe)


def client(ui, base_url: str = "", **kwargs) -> TestClient:
    app = FastAPI()
    add_mateu(app, MODULE, base_url=base_url, ui=ui, **kwargs)

    @app.get("/mine")
    def mine():
        return {"mine": True}

    # a browser navigation; a `*/*` (fetch, curl) is a data fetch and never gets the page (Java's rule)
    return TestClient(app, headers={"accept": "text/html,application/xhtml+xml,*/*;q=0.8"})


@pytest.fixture(scope="module")
def vaadin_static() -> Path:
    if not (VAADIN_STATIC / "_index.html").is_file():
        pytest.skip("the Vaadin renderer bundle is not checked out next to this test")
    return VAADIN_STATIC


def test_without_a_renderer_the_server_answers_the_api_only(monkeypatch):
    monkeypatch.delenv(ui_page.ENV_VAR, raising=False)
    c = client(None)
    assert c.get("/", headers={"accept": "application/json"}).status_code == 404
    assert c.post("/mateu/v3/sync", json={"route": "ui-probe"}).status_code == 200


def test_without_a_renderer_a_browser_at_the_mount_gets_a_hint_not_a_json_404(monkeypatch):
    monkeypatch.delenv(ui_page.ENV_VAR, raising=False)
    for base_url, mount in (("", "/"), ("/shop", "/shop")):
        c = client(None, base_url=base_url)
        page = c.get(mount)
        assert page.status_code == 404  # there is still no page here
        assert page.headers["content-type"].startswith("text/html")
        assert "MATEU_UI" in page.text
        assert f"POST {base_url}/mateu/v3/sync/{{route}}" in page.text
        # a data fetch, a deep link and the API keep their plain 404s; the app's own routes win
        assert c.get(mount, headers={"accept": "*/*"}).headers["content-type"].startswith("application/json")
        assert "MATEU_UI" not in c.get(base_url + "/somewhere").text
        assert c.get("/mine").json() == {"mine": True}


def test_the_page_is_served_at_the_mount_and_its_deep_links_aimed_at_the_mount(vaadin_static):
    c = client(vaadin_static)
    home = c.get("/")
    assert home.status_code == 200
    assert home.headers["content-type"].startswith("text/html")
    assert home.headers["cache-control"] == "no-cache"
    assert '<mateu-ui baseUrl="" pathPrefix="" style="width:100%;height:100vh;"></mateu-ui>' in home.text
    assert "<title>Shop console</title>" in home.text  # the app's title, like Java's index
    assert "AQUIELTITULODELAPAGINA" not in home.text and "<!-- AQUIUI -->" not in home.text
    assert "AQUI" not in home.text and "vite.svg" not in home.text  # the shipped template: no marker
    assert ui_page.DEFAULT_FAVICON in home.text
    assert "text/mateu-deferred" in home.text  # the deferred-boot replayer travels with the page
    assert '<script type="module" crossorigin src="/assets/mateu-vaadin.js">' in home.text

    deep = c.get("/ui-probe", headers={"accept": "text/html,application/xhtml+xml"})
    assert deep.status_code == 200 and "<mateu-ui" in deep.text
    assert c.get("/ui-probe/7/edit").status_code == 200  # any depth


def test_the_renderers_assets_are_served_at_the_origin_root(vaadin_static):
    c = client(vaadin_static)
    js = c.get("/assets/mateu-vaadin.js")
    assert js.status_code == 200
    assert js.headers["content-type"].startswith("text/javascript")
    assert js.headers["cache-control"] == "no-cache"  # no hash in the name: revalidate (Java's rule)
    css = c.get("/assets/index.css")
    assert css.status_code == 200 and css.headers["content-type"].startswith("text/css")
    assert c.get("/assets/mateu-icon.svg").headers["content-type"].startswith("image/svg+xml")
    assert c.get("/assets/nope.js").status_code == 404
    # a path can never escape the renderer's folder (the client normalises `..`; the server must too)
    files = ui_page.RendererFiles.at(vaadin_static)
    assert files.read("../pom.xml") is None and files.read("assets/../../pom.xml") is None
    assert files.read("assets/index.css") is not None


def test_the_api_and_the_apps_own_routes_are_never_answered_with_the_page(vaadin_static):
    c = client(vaadin_static)
    # an API miss stays a miss (a data fetch to a missing endpoint must never get the index)
    assert c.get("/mateu/v3/nothing").status_code in (404, 405)
    assert c.post("/mateu/v3/sync", json={"route": "ui-probe"}).status_code == 200
    # a deep link asked for as JSON is a data fetch, not a navigation
    assert c.get("/ui-probe", headers={"accept": "application/json"}).status_code == 404
    # the app's own routes win, registered before or after add_mateu
    assert c.get("/mine").json() == {"mine": True}


def test_a_mount_serves_its_page_under_its_prefix_only(vaadin_static):
    c = client(vaadin_static, base_url="/shop")
    for path in ("/shop", "/shop/", "/shop/ui-probe"):
        r = c.get(path)
        assert r.status_code == 200, path
        assert '<mateu-ui baseUrl="/shop" pathPrefix="/shop"' in r.text
    assert c.get("/other").status_code == 404
    assert c.get("/assets/mateu-vaadin.js").status_code == 200  # assets stay at the origin root
    assert c.post("/shop/mateu/v3/sync", json={"route": "ui-probe"}).status_code == 200


def test_the_renderer_jar_itself_can_be_served(vaadin_static, tmp_path):
    jar = tmp_path / "mateu-vaadin-3.0-test.jar"
    with zipfile.ZipFile(jar, "w") as z:
        z.write(vaadin_static / "_index.html", "static/_index.html")
        z.write(vaadin_static / "assets" / "index.css", "static/assets/index.css")
        z.writestr("META-INF/MANIFEST.MF", "Manifest-Version: 1.0\n")
    c = client(str(jar))
    assert "<mateu-ui" in c.get("/").text
    assert c.get("/assets/index.css").status_code == 200
    assert c.get("/META-INF/MANIFEST.MF").status_code == 404  # only the renderer's own files


def test_the_renderer_comes_from_the_environment_when_not_passed(vaadin_static, monkeypatch):
    monkeypatch.setenv(ui_page.ENV_VAR, str(vaadin_static))
    assert "<mateu-ui" in client(None).get("/").text


def test_a_wrong_location_fails_at_startup_not_at_the_first_request(tmp_path):
    with pytest.raises(FileNotFoundError):
        client(tmp_path / "missing")
    (tmp_path / "notarenderer").mkdir()
    with pytest.raises(FileNotFoundError, match="_index.html"):
        client(tmp_path / "notarenderer")


def test_a_served_page_carries_no_template_marker_and_mateus_favicon():
    # the shape of the renderer templates (Vaadin: favicon marker; Redwood/VB: keycloak + js markers)
    html = (
        "<html><head><!-- AQUIFAVICON --><!-- AQUIKEYCLOAK --><title>AQUIELTITULODELAPAGINA</title>"
        '<!-- AQUIJS --><script src="/x.js"></script><!-- HASTAAQUIJS --></head>'
        "<body><!-- AQUIUI --><p>x</p><!-- HASTAAQUIUI --></body></html>"
    )
    page = ui_page.render_index(html, "/admin", "T")
    assert "AQUI" not in page and "vite.svg" not in page
    assert ui_page.DEFAULT_FAVICON in page
    assert ui_page.DEFAULT_FAVICON == '<link rel="icon" type="image/svg+xml" href="/assets/mateu-icon.svg" />'
    assert '<script src="/x.js"></script>' in page


def test_mount_ui_mirrors_javas_index_page():
    html = "<html><title>AQUIELTITULODELAPAGINA</title><body><!-- AQUIUI --><p>x</p><!-- HASTAAQUIUI --></body></html>"
    out = ui_page.render_index(html, '/a"b', "T")
    assert '<mateu-ui baseUrl="/a&quot;b" pathPrefix="/a&quot;b" style="width:100%;height:100vh;"></mateu-ui>' in out
    assert "<p>x</p>" not in out and out.endswith("</mateu-ui>" + ui_page.DEFERRED_BOOT + "</body></html>")
    assert ui_page.mount_ui("<html>no markers</html>", "") == "<html>no markers</html>"
    assert ui_page.spa_candidate("/orders/7") and not ui_page.spa_candidate("/mateu/v3/x")
    assert not ui_page.spa_candidate("/") and not ui_page.spa_candidate("/a.js")
    assert ui_page.accepts_html(None) and ui_page.accepts_html("text/html,*/*")
    assert not ui_page.accepts_html("application/json")
    assert ui_page.cache_control_for("/version_123/x.js") == ui_page.IMMUTABLE_CACHE_CONTROL
    assert ui_page.cache_control_for("/_redwood/app.js") == "no-cache"
    assert ui_page.cache_control_for("/vite.svg") is None
