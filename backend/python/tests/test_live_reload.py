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
