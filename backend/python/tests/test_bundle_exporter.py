"""The static-bundle exporter (``mateu_ui.bundle``): what it renders, what it ships, what it
refuses with ``--static``, and the files it writes — the Python twin of Java's
``MateuBundleExporterTest`` / ``StaticSafetyCheckTest`` / ``BundleContentLoadTest``."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from mateu_ui.bundle import BundleExporter, is_client_expandable, to_sync_path
from mateu_ui.bundle import static_safety, writer
from mateu_ui.bundle.__main__ import main
from mateu_ui.bundle.inliner import DefinitionInliner
from mateu_ui.core import MateuRegistry, SyncHandler
from mateu_ui.uidl import app, button, eyes_only, menu_item, rest_action, title, ui

RENDERER = Path(__file__).resolve().parents[2] / "shared" / "frontend" / "vaadin-lit" / "src" / "main" / "resources" / "static"


@ui("/bundle-hello")
@title("Bundle hello")
class BundleHello:
    greeting: str = "Pre-rendered"


@ui("/bundle-secret")
@eyes_only(roles=("admin",))
class BundleSecret:
    secret: str = "only for admins"


@ui("/bundle-server-action")
class BundleServerAction:
    name: str = ""

    @button("Save")
    def save(self):
        return None


@ui("/bundle-rest-action")
class BundleRestAction:
    name: str = ""

    @button("Save")
    @rest_action(url="https://api.example.com/save")
    def save(self):
        return None


@ui("/bundle-broken")
class BundleBroken:
    def __init__(self):
        raise RuntimeError("needs a database")


@app("Bundle app")
class BundleApp:
    @menu_item("Hello")
    def bundle_hello(self) -> BundleHello:
        return BundleHello()


@pytest.fixture
def no_specs(tmp_path, monkeypatch):
    monkeypatch.setenv("MATEU_SPECS_DIR", str(tmp_path / "nothing"))
    return tmp_path


def exporter(*sources, specs: Path | None = None) -> BundleExporter:
    return BundleExporter(SyncHandler(MateuRegistry(*sources)), specs)


def entries_by_route(manifest) -> dict:
    return {e.route: e for e in manifest.entries}


def test_sync_paths_mirror_the_browser():
    assert to_sync_path("") == "_no_route"
    assert to_sync_path("/") == "_no_route"
    assert to_sync_path("/orders/42") == "orders/42"


def test_a_code_app_bundles_its_root_and_both_loads_of_a_sub_route(no_specs):
    manifest = exporter(BundleApp, BundleHello).export_all("")
    entries = entries_by_route(manifest)
    assert set(entries) == {"", "/bundle-hello"}
    root = json.loads(entries[""].json)
    assert root["fragments"][0]["component"]["metadata"]["type"] == "App"
    assert entries[""].content_json is None  # the root's fresh load IS the shell
    hello = entries["/bundle-hello"]
    assert hello.ok
    shell = json.loads(hello.json)["fragments"][0]
    assert shell["component"]["metadata"]["type"] == "App"
    content = json.loads(hello.content_json)
    assert content["fragments"][0]["component"]["serverSideType"].endswith("BundleHello")
    # a pre-rendered fragment targets nobody: the browser aims it at whoever asked
    assert shell["targetComponentId"] is None
    assert content["fragments"][0]["targetComponentId"] is None


def test_a_page_with_no_shell_is_its_own_content(no_specs):
    entry = exporter(BundleHello).export_route("", "/bundle-hello")
    assert entry.ok and entry.content_json is None
    assert "Pre-rendered" in entry.json


def test_a_route_that_cannot_render_is_skipped_with_its_reason(no_specs):
    entry = exporter(BundleBroken).export_route("", "/bundle-broken")
    assert not entry.ok
    assert "needs a database" in entry.skip_reason


def test_an_identity_dependent_screen_is_kept_backend_served(no_specs):
    entry = entries_by_route(exporter(BundleSecret).export_all(""))["/bundle-secret"]
    assert not entry.ok
    assert "eyes_only" in entry.skip_reason


def _specs(tmp_path: Path, files: dict[str, str]) -> Path:
    specs = tmp_path / "specs" / "ui"
    for name, text in files.items():
        f = specs / name
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(text)
    return specs


ORDERS = {
    "routes.yaml": "routes:\n  - route: orders/:id\n    layout: order.yaml\n  - route: about\n    layout: about.yaml\n",
    "order.yaml": "layout:\n  type: VerticalLayout\n  content:\n    - type: Text\n      text: Order\n",
    "about.yaml": "layout:\n  type: VerticalLayout\n  content:\n    - type: Partial\n      ref: footer\n",
    "partials/footer.yaml": "content:\n  - type: Text\n    text: One\n  - type: Text\n    text: Two\n",
}


def test_param_routes_are_skipped_unless_bundled_as_templates(tmp_path, monkeypatch):
    specs = _specs(tmp_path, ORDERS)
    monkeypatch.setenv("MATEU_SPECS_DIR", str(specs))
    assert "/orders/:id" not in entries_by_route(exporter(specs=specs).export_all(""))
    entry = entries_by_route(exporter(specs=specs).export_all("", include_param_routes=True))["/orders/:id"]
    assert entry.ok
    assert entry.route_pattern == "^orders/([^/]+)$"
    assert entry.param_names == ["id"]
    assert entry.sync_path == "orders/:id"


def test_specs_mode_ships_the_definition_raw_with_its_partials_inlined(tmp_path, monkeypatch):
    specs = _specs(tmp_path, ORDERS)
    monkeypatch.setenv("MATEU_SPECS_DIR", str(specs))
    manifest = exporter(specs=specs).export_all("", specs_only=True)
    assert "/about" not in entries_by_route(manifest)
    about = manifest.definitions["about.yaml"]
    # the partial's two components are SPLICED into the list that held the reference
    assert [c["text"] for c in about["layout"]["content"]] == ["One", "Two"]
    assert manifest.to_wire()["routes"]["routes"][1]["definition"] == "about.yaml"


def test_the_inliner_leaves_an_unknown_partial_as_a_reference(tmp_path):
    tree = {"type": "VerticalLayout", "content": [{"type": "Partial", "ref": "missing"}]}
    assert DefinitionInliner(tmp_path).inline(tree) == tree


def test_only_the_types_the_expander_knows_are_left_to_the_browser():
    assert is_client_expandable({"type": "Listing"})
    assert is_client_expandable({"layout": {"type": "VerticalLayout"}})
    assert not is_client_expandable({"type": "Wizard"})
    assert not is_client_expandable(None)


def test_the_manifest_has_java_s_members_in_java_s_order(no_specs):
    wire = exporter(BundleHello).export_all("").to_wire()
    assert list(wire) == [
        "baseUrl", "generatedAt", "staticOnly", "entries", "routes", "sources",
        "requiredCapabilities", "definitions", "actions", "translations", "environment", "mockSources",
    ]
    assert list(wire["entries"][0]) == [
        "route", "syncPath", "json", "ok", "skipReason", "routePattern", "paramNames", "contentJson",
    ]


def test_the_structure_hash_ignores_the_build_time_and_the_source_catalogue():
    from mateu_ui.bundle import BundleEntry, BundleManifest

    def manifest(at: str, url: str, content: str | None = None) -> BundleManifest:
        shell = json.dumps({"fragments": [{"component": {"metadata": {"restSources": [{"url": url}]}}}]})
        return BundleManifest("", at, True, [BundleEntry("/x", "x", shell, True, content_json=content)])

    assert manifest("t1", "https://a").structure_hash() == manifest("t2", "https://b").structure_hash()
    assert manifest("t", "https://a").structure_hash() != manifest("t", "https://a", "{}").structure_hash()


# ── static safety ──────────────────────────────────────────────────────────────────────────────


def test_a_python_action_method_needs_a_server(no_specs):
    ex = exporter(BundleServerAction)
    violations = [str(v) for v in ex.static_safety(ex.export_all(""))]
    assert any("BundleServerAction.save() is a Python action method" in v for v in violations)


def test_a_rest_action_runs_in_the_browser(no_specs):
    ex = exporter(BundleRestAction)
    assert [str(v) for v in ex.static_safety(ex.export_all(""))] == []


def test_a_skipped_route_and_an_eyes_only_class_need_a_server(no_specs):
    ex = exporter(BundleSecret, BundleBroken)
    violations = [str(v) for v in ex.static_safety(ex.export_all(""))]
    assert any(v.startswith("/bundle-secret — could not be bundled") for v in violations)
    assert any("BundleSecret declares @eyes_only" in v for v in violations)
    assert any(v.startswith("/bundle-broken — could not be bundled") for v in violations)


def test_proxied_and_secret_sources_need_a_server():
    catalog = [{"name": "crm", "source": {"url": "https://crm.example.com", "proxy": True}}]
    assert "server proxy" in str(static_safety.check_source("/a", {"ref": "crm"}, catalog, "a source")[0])
    secret = {"url": "https://x.example.com?key=${secret.KEY}"}
    assert "secret" in str(static_safety.check_source("/a", secret, [], "a source")[0])
    assert static_safety.check_source("/a", {"url": "https://ok.example.com"}, [], "a source") == []


def test_a_definition_button_without_a_rest_action_needs_a_server():
    definition = {
        "actions": [{"id": "send", "restAction": {"source": {"url": "https://x"}}}],
        "layout": {
            "type": "VerticalLayout",
            "content": [
                {"type": "Button", "actionId": "send"},
                {"type": "Button", "actionId": "save"},
                {"type": "Button", "actionId": "go", "route": "/x"},
                {"type": "Map", "markerActionId": "pick"},
            ],
        },
    }
    reasons = [v.reason for v in static_safety.check_definition("/p", definition, [])]
    assert len(reasons) == 2
    assert any("button 'save'" in r for r in reasons)
    assert any("Map runs action 'pick' (markerActionId)" in r for r in reasons)


def test_a_trigger_running_a_server_action_needs_a_server():
    wire = {"triggers": [{"type": "OnLoad", "actionId": "load"}], "actions": [{"id": "x"}]}
    assert "OnLoad trigger runs action 'load'" in static_safety.check_wire("/p", wire, [])[0].reason


def test_a_shell_header_action_that_is_not_client_side_needs_a_server():
    shell = {"type": "AppShell", "headerActions": [{"actionId": "logout"}, {"actionId": "x", "route": "/x"}]}
    assert "header action 'logout'" in static_safety.check_shell_header_actions("/", shell)[0].reason


# ── the CLI and the files ──────────────────────────────────────────────────────────────────────


def test_the_cli_writes_a_self_contained_static_site(no_specs, tmp_path):
    out = tmp_path / "dist"
    code = main([__name__ + ":BundleApp", __name__ + ":BundleHello", "--ui", str(RENDERER), "--out", str(out),
                 "--title", "Bundled", "--static", "-q"])
    assert code == 0
    manifest = json.loads((out / "manifest.json").read_text())
    assert {e["route"] for e in manifest["entries"]} == {"", "/bundle-hello"}
    index = (out / "index.html").read_text()
    assert 'bundleUrl="/manifest.json"' in index
    assert "<title>Bundled</title>" in index or "Bundled" in index
    assert "AQUIUI" not in index and "AQUIELTITULODELAPAGINA" not in index
    assert 'rel="manifest"' in index
    assert (out / "assets").is_dir()
    assert not (out / "_index.html").exists()
    assert (out / "_redirects").read_text() == "/*    /index.html    200\n"
    assert (out / "mateu-sw.js").is_file()
    assert (out / "pwa" / "manifest.webmanifest").is_file()
    mobile = json.loads((out / "mateu" / "v3" / "manifest").read_text())
    assert mobile["bundle"] == "manifest.json"


def test_the_cli_fails_a_static_bundle_that_needs_a_server(no_specs, tmp_path, capsys):
    code = main([__name__ + ":BundleServerAction", "--ui", str(RENDERER), "--out", str(tmp_path / "d"),
                 "--static", "-q"])
    assert code == 1
    assert "still need a server" in capsys.readouterr().err


def test_without_static_a_hybrid_bundle_builds(no_specs, tmp_path):
    assert main([__name__ + ":BundleServerAction", "--ui", str(RENDERER), "--out", str(tmp_path / "d"), "-q"]) == 0


def test_the_cli_asks_for_a_renderer(no_specs, tmp_path, monkeypatch, capsys):
    monkeypatch.delenv("MATEU_UI", raising=False)
    assert main(["--out", str(tmp_path / "d"), "-q"]) == 2
    assert "no renderer" in capsys.readouterr().err


def test_a_bundle_under_a_path_points_everything_at_it(tmp_path):
    assert writer.base_path_of("https://cdn.example.com/app/") == "/app"
    assert writer.base_path_of("/app") == "/app"
    assert writer.base_path_of("") == ""
    html = writer.stamp_index(
        "<head></head><!-- AQUIUI --><x><!-- HASTAAQUIUI -->AQUIELTITULODELAPAGINA", "/app", "T"
    )
    assert 'bundleUrl="/app/manifest.json"' in html and html.endswith("T")
