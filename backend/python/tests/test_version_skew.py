"""The version-skew transport headers: ``X-Mateu-Build`` on every Mateu response (a load, a refused
action, a 404), the override, its CORS exposure, and the one-time warning for a renderer speaking
another wire major."""

from __future__ import annotations

import logging
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

fastapi = pytest.importorskip("fastapi")
from fastapi.testclient import TestClient  # noqa: E402

from mateu_ui.core import version_skew  # noqa: E402
from mateu_ui.core.version_skew import VersionSkew, compute_build_id, wire_of  # noqa: E402
from mateu_ui.dtos import WIRE_VERSION  # noqa: E402
from mateu_ui.fastapi import add_mateu  # noqa: E402
from mateu_ui.uidl import button, title, ui  # noqa: E402

MODULE = sys.modules[__name__]


@ui("skew-probe")
@title("Skew probe")
class SkewProbe:
    name: str = "x"

    @button()
    def hello(self):
        from mateu_ui.uidl import Message

        return Message("hi")


def client(**kwargs) -> TestClient:
    app = fastapi.FastAPI()
    add_mateu(app, MODULE, **kwargs)
    return TestClient(app)


def sync(c: TestClient, action: str = "", headers=None):
    return c.post(
        "/mateu/v3/sync/skew-probe",
        json={"route": "skew-probe", "actionId": action, "componentState": {"name": "x"}},
        headers=headers or {},
    )


def test_every_mateu_response_carries_the_build_header(monkeypatch):
    monkeypatch.delenv(version_skew.BUILD_ID_ENV, raising=False)
    c = client()
    ok = sync(c)
    assert ok.status_code == 200
    build = ok.headers["x-mateu-build"]
    assert len(build) == 16 and all(ch in "0123456789abcdef" for ch in build)

    refused = sync(c, "no-such-action")
    assert refused.status_code == 403
    assert refused.headers["x-mateu-build"] == build

    missing = c.post("/mateu/v3/nothing-here", json={})
    assert missing.status_code == 404
    assert missing.headers["x-mateu-build"] == build


def test_a_non_mateu_path_does_not_carry_it():
    r = client().get("/somewhere-else")
    assert "x-mateu-build" not in r.headers


def test_the_build_id_is_stable_across_apps_of_the_same_release(monkeypatch):
    monkeypatch.delenv(version_skew.BUILD_ID_ENV, raising=False)
    assert sync(client()).headers["x-mateu-build"] == sync(client()).headers["x-mateu-build"]


def test_the_option_overrides_it_sanitised():
    build = sync(client(build_id="release 42/blue" + "x" * 80)).headers["x-mateu-build"]
    assert build.startswith("release42blue")
    assert len(build) == 64


def test_the_environment_overrides_it_when_no_option_is_set(monkeypatch):
    monkeypatch.setenv(version_skew.BUILD_ID_ENV, "v1.2.3")
    assert sync(client()).headers["x-mateu-build"] == "v1.2.3"
    assert sync(client(build_id="opt")).headers["x-mateu-build"] == "opt"


def test_specs_and_code_change_the_computed_id(tmp_path):
    (tmp_path / "home.yaml").write_text("type: VerticalLayout\n")
    before = compute_build_id([SkewProbe], tmp_path)
    assert compute_build_id([SkewProbe], tmp_path) == before
    (tmp_path / "home.yaml").write_text("type: HorizontalLayout\n")
    assert compute_build_id([SkewProbe], tmp_path) != before
    assert compute_build_id([], tmp_path) != compute_build_id([SkewProbe], tmp_path)


def test_cors_exposes_the_build_header():
    c = client(cors_origins=["https://app.example"])
    r = sync(c, headers={"Origin": "https://app.example"})
    assert r.headers["access-control-allow-origin"] == "https://app.example"
    exposed = [h.strip().lower() for h in r.headers["access-control-expose-headers"].split(",")]
    assert "x-mateu-build" in exposed
    assert "x-mateu-correlation-id" in exposed


def test_without_cors_nothing_is_exposed():
    r = sync(client(), headers={"Origin": "https://app.example"})
    assert "access-control-expose-headers" not in r.headers


def test_a_renderer_of_another_wire_major_is_warned_about_once(caplog):
    c = client()
    with caplog.at_level(logging.WARNING, logger="mateu.version_skew"):
        sync(c, headers={"X-Mateu-Renderer": "vaadin/2.9.0 wire/2.4"})
        sync(c, headers={"X-Mateu-Renderer": "vaadin/2.9.0 wire/2.4"})
        sync(c, headers={"X-Mateu-Renderer": "vaadin/3.0.0 wire/3.0"})
        sync(c, headers={"X-Mateu-Renderer": "garbled"})
        sync(c)
    lines = [r.getMessage() for r in caplog.records if r.name == "mateu.version_skew"]
    assert lines == [
        f"Renderer 'vaadin/2.9.0 wire/2.4' speaks wire 2.4; this server speaks {WIRE_VERSION}. "
        "Upgrade the renderer or the server so their majors match."
    ]


def test_the_remembered_renderers_are_bounded():
    skew = VersionSkew([], configured="x")
    for i in range(version_skew.MAX_REMEMBERED_RENDERERS):
        assert skew.warning_for(f"r/{i} wire/2.0", "3.0") is not None
    assert skew.warning_for("r/overflow wire/2.0", "3.0") is None
    assert skew.warning_for("r/0 wire/2.0", "3.0") is None
    assert wire_of("redwood/3.0.0 wire/2.1") == (2, "2.1")
    assert wire_of("redwood/3.0.0") is None
