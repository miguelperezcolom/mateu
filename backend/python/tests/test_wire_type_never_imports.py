"""A ``serverSideType`` from the wire never imports a module (GA review P1).

``MateuRegistry.authored_type`` imports the module of a name read from an AUTHORED file (a
routes.yaml / YAML page ``viewModel:``); a name the REQUEST sends goes through ``known_type``, which
only looks up what is registered or already bound — an import runs the module's top-level code, so
a wire-chosen name would let any caller run any importable module (Java's WireTypePolicy loads
nothing that is not registered)."""

from __future__ import annotations

import sys
import textwrap
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, type_name  # noqa: E402
from mateu_ui.uidl import app, ui  # noqa: E402


@ui("/wire-home")
@app("Home", live_updates=True)
class WireHome:
    pass


MODULE = sys.modules[__name__]


def _planted(tmp_path: Path, monkeypatch, name: str) -> Path:
    marker = tmp_path / f"{name}.ran"
    (tmp_path / f"{name}.py").write_text(
        textwrap.dedent(
            f"""
            from pathlib import Path
            Path({str(marker)!r}).write_text("imported")
            class X:
                pass
            """
        )
    )
    monkeypatch.syspath_prepend(str(tmp_path))
    return marker


def test_known_type_never_imports(tmp_path, monkeypatch):
    marker = _planted(tmp_path, monkeypatch, "mateu_planted_known")
    registry = MateuRegistry(MODULE)
    assert registry.known_type("mateu_planted_known.X") is None
    assert not marker.exists()
    assert registry.known_type(type_name(WireHome)) is WireHome


def test_authored_type_imports_and_then_is_known(tmp_path, monkeypatch):
    marker = _planted(tmp_path, monkeypatch, "mateu_planted_authored")
    registry = MateuRegistry(MODULE)
    cls = registry.authored_type("mateu_planted_authored.X")
    assert cls is not None and marker.exists()
    assert registry.known_type("mateu_planted_authored.X") is cls


def test_the_live_updates_stream_does_not_import_the_named_module(tmp_path, monkeypatch):
    import fastapi
    from fastapi.testclient import TestClient

    import mateu_ui.fastapi
    from mateu_ui.fastapi import add_mateu

    marker = _planted(tmp_path, monkeypatch, "mateu_planted_sse")
    monkeypatch.setattr(mateu_ui.fastapi, "LIVE_MAX_SECONDS", 0.2)
    monkeypatch.setattr(mateu_ui.fastapi, "LIVE_HEARTBEAT_SECONDS", 0.1)
    api = fastapi.FastAPI()
    add_mateu(api, MODULE)
    client = TestClient(api)
    client.post(
        "/mateu/v3/sse/wire-home",
        json={"route": "/wire-home", "actionId": "_live-updates", "serverSideType": "mateu_planted_sse.X"},
    )
    assert not marker.exists(), "a request-chosen module was imported"
    assert "mateu_planted_sse" not in sys.modules
