"""Development mode (live reload): the registries forget what they read when a spec changes, the
watcher reports edits on disk, and the dev endpoints exist only with dev mode on."""

from __future__ import annotations

import time
from pathlib import Path

import pytest

from mateu_core import dev_specs
from mateu_core.rest_source_registry import RestSourceRegistry
from mateu_core.route_registry import RouteRegistry
from mateu_core.yaml_spec_loader import YamlSpecLoader


@pytest.fixture(autouse=True)
def dev_off_afterwards():
    yield
    dev_specs.enable(False)


def write(directory: Path, name: str, content: str) -> Path:
    path = directory / name
    path.write_text(content, encoding="utf-8")
    return path


def test_an_edited_route_table_is_read_again_after_a_change(tmp_path):
    write(tmp_path, "routes.yaml", "routes:\n  - route: live\n    definition: live.yaml\n")
    registry = RouteRegistry(str(tmp_path))
    assert registry.match("live") is not None
    assert registry.match("added") is None

    changed = write(
        tmp_path,
        "routes.yaml",
        "routes:\n  - route: live\n    definition: live.yaml\n  - route: added\n    definition: added.yaml\n",
    )
    dev_specs.changed([changed])

    assert registry.match("added") is not None


def test_an_edited_definition_and_source_catalogue_are_read_again(tmp_path):
    write(tmp_path, "live.yaml", "layout:\n  type: Text\n  text: one\n")
    write(tmp_path, "sources.yaml", "sources:\n  - name: live\n    source:\n      url: https://one.example\n")
    loader = YamlSpecLoader(str(tmp_path))
    sources = RestSourceRegistry(str(tmp_path))
    assert "one" in repr(loader.load_spec("live"))
    assert sources.get("live").source.url == "https://one.example"

    write(tmp_path, "live.yaml", "layout:\n  type: Text\n  text: two\n")
    changed = write(tmp_path, "sources.yaml", "sources:\n  - name: live\n    source:\n      url: https://two.example\n")
    dev_specs.changed([changed])

    assert sources.get("live").source.url == "https://two.example"
    assert "two" in repr(loader.load_spec("live"))


def test_a_route_file_is_an_app_level_change_and_a_page_is_not(tmp_path):
    events: list[str] = []
    unsubscribe = dev_specs.subscribe(events.append)
    try:
        dev_specs.changed([write(tmp_path, "routes.yaml", "routes: []\n")])
        dev_specs.changed([write(tmp_path, "page.yaml", "layout:\n  type: Text\n")])
        dev_specs.reload()
    finally:
        unsubscribe()
    assert '"scope":"app"' in events[0]
    assert '"type":"specs-changed"' in events[1] and '"scope":"page"' in events[1]
    assert '"type":"reload"' in events[2]


def test_a_new_catalogue_hooks_in_with_one_line():
    class Catalogue:
        invalidations = 0

        def __init__(self):
            dev_specs.register(self)

        def invalidate_specs(self):
            Catalogue.invalidations += 1

    catalogue = Catalogue()
    dev_specs.reload()
    assert Catalogue.invalidations == 1
    del catalogue


def test_the_watcher_reports_an_edit_on_disk(tmp_path):
    events: list[str] = []
    unsubscribe = dev_specs.subscribe(events.append)
    try:
        dev_specs.enable(True, str(tmp_path))
        time.sleep(0.4)
        write(tmp_path, "watched.yaml", "layout:\n  type: Text\n")
        deadline = time.time() + 10
        while not any("watched.yaml" in e for e in events) and time.time() < deadline:
            time.sleep(0.1)
    finally:
        unsubscribe()
    assert any("specs/ui/watched.yaml" in e for e in events)


def _app(live_reload: bool):
    from fastapi import FastAPI

    from mateu_fastapi import add_mateu

    app = FastAPI()
    add_mateu(app, live_reload=live_reload)
    return app


def test_the_dev_endpoints_do_not_exist_without_dev_mode():
    from fastapi.testclient import TestClient

    client = TestClient(_app(live_reload=False))
    assert client.get(dev_specs.EVENTS_PATH).status_code == 404
    assert client.post(dev_specs.RELOAD_PATH).status_code in (404, 405)


def test_the_dev_endpoints_in_dev_mode(tmp_path, monkeypatch):
    import asyncio

    from fastapi.testclient import TestClient

    monkeypatch.setenv("MATEU_DEV_SPECS_DIR", str(tmp_path))
    app = _app(live_reload=True)
    assert TestClient(app).post(dev_specs.RELOAD_PATH).status_code == 204

    # The stream never ends, so it is driven directly rather than through a blocking client.
    endpoint = next(r.endpoint for r in app.routes if getattr(r, "path", None) == dev_specs.EVENTS_PATH)

    class Browser:
        async def is_disconnected(self):
            return False

    async def first_two_events():
        response = await endpoint(Browser())
        assert response.media_type == "text/event-stream"
        frames = response.body_iterator
        hello = await frames.__anext__()
        dev_specs.reload()
        reload = await asyncio.wait_for(frames.__anext__(), timeout=5)
        await frames.aclose()
        return hello, reload

    hello, reload = asyncio.run(first_two_events())
    assert hello.startswith("data: ") and hello.endswith("\n\n")
    assert dev_specs.BOOT_ID in hello
    assert '"type":"reload"' in reload


# ── the authoring catalogues reload too (actions, translations, and their scope) ────────────────


def _live_app_module():
    """A one-app module for a SyncHandler (built lazily: the decorators register on import)."""
    import sys
    import types

    from mateu_uidl import app, ui

    module = types.ModuleType("live_reload_app")

    @ui("live-shell")
    @app("Live shell")
    class LiveShell:
        pass

    LiveShell.__module__ = module.__name__
    module.LiveShell = LiveShell
    sys.modules[module.__name__] = module
    return module, LiveShell


def _actions(target: str) -> str:
    return (
        "type: Actions\nactions:\n  - id: liveFlow\n    steps:\n"
        f"      - type: Navigate\n        route: {target}\n"
    )


def test_an_edited_action_catalogue_is_what_the_next_sync_ships(tmp_path, monkeypatch):
    import json

    from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name

    monkeypatch.setenv("MATEU_SPECS_DIR", str(tmp_path))
    write(tmp_path, "actions.yaml", _actions("first-target"))
    module, shell = _live_app_module()
    handler = SyncHandler(MateuRegistry(module))

    def app() -> str:
        inc = handler.handle(RunActionRq(server_side_type=type_name(shell)))
        return json.dumps(inc.model_dump(by_alias=True, mode="json"))

    assert "first-target" in app()

    dev_specs.changed([write(tmp_path, "actions.yaml", _actions("second-target"))])

    after = app()
    assert "second-target" in after
    assert "first-target" not in after


def test_an_edited_translation_is_what_the_next_sync_shows(tmp_path, monkeypatch):
    import json

    from mateu_core import MateuRegistry, RunActionRq, SyncHandler
    from mateu_core.request_context import MateuRequest, bound_request

    monkeypatch.setenv("MATEU_SPECS_DIR", str(tmp_path))
    (tmp_path / "translations").mkdir()
    write(tmp_path, "translations/en.yaml", "messages:\n  live:\n    greeting: Hello from version one\n")
    write(tmp_path, "routes.yaml", "routes:\n  - route: live-greeting\n    layout: live-greeting.yaml\n")
    write(
        tmp_path,
        "live-greeting.yaml",
        'layout:\n  type: VerticalLayout\n  content:\n    - {type: Text, text: "${i18n.live.greeting}"}\n',
    )
    module, _ = _live_app_module()
    handler = SyncHandler(MateuRegistry(module))

    def page() -> str:
        with bound_request(MateuRequest(headers={"accept-language": "en"})):
            inc = handler.handle(RunActionRq(route="/live-greeting"))
        return json.dumps(inc.model_dump(by_alias=True, mode="json"))

    assert "Hello from version one" in page()

    dev_specs.changed(
        [write(tmp_path, "translations/en.yaml", "messages:\n  live:\n    greeting: Hello from version two\n")]
    )

    after = page()
    assert "Hello from version two" in after
    assert "Hello from version one" not in after


def test_app_wide_catalogues_are_app_level_changes(tmp_path):
    (tmp_path / "translations").mkdir()
    (tmp_path / "environments").mkdir()
    events: list[str] = []
    unsubscribe = dev_specs.subscribe(events.append)
    try:
        dev_specs.changed([write(tmp_path, "project.yaml", "type: Project\nrenderer: vaadin\n")])
        dev_specs.changed([write(tmp_path, "actions.yaml", "{}\n")])
        dev_specs.changed([write(tmp_path, "translations/es.yaml", "messages: {}\n")])
        dev_specs.changed([write(tmp_path, "environments/pre.yaml", "sources: {}\n")])
        dev_specs.changed([write(tmp_path, "typed-env.yaml", "type: Environment\nname: x\nsources: {}\n")])
    finally:
        unsubscribe()
    assert len(events) == 5
    assert all('"scope": "app"' in e or '"scope":"app"' in e for e in events)
