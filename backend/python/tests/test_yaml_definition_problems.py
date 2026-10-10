"""An unreadable definition used to be silent in this port: a YAML syntax error or a routes.yaml
entry naming a layout file that does not exist answered "not found" with nothing in the log. The
loader now names the file, the line and what to do — the mirror of Java's YamlSpecProblemsTest."""

from __future__ import annotations

import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core.route_registry import RouteRegistry  # noqa: E402
from mateu_core.yaml_spec_loader import YamlSpecLoader  # noqa: E402


def specs(tmp_path: Path, layout: str, body: str) -> Path:
    (tmp_path / "app.ui.yaml").write_text("type: UI\nbasePath: /\nroutes:\n  - routes.yaml\n")
    (tmp_path / "routes.yaml").write_text(f"routes:\n  - route: form\n    layout: {layout}\n")
    (tmp_path / "form.yaml").write_text(body)
    return tmp_path


def load(directory: Path, route: str):
    return YamlSpecLoader(str(directory), RouteRegistry(str(directory))).load_spec(route)


def test_a_syntax_error_is_logged_with_its_line(tmp_path, caplog):
    body = "type: VerticalLayout\ncontent:\n  - {type: Text, text: a\n  - {type: Text, text: b}\n"
    with caplog.at_level(logging.WARNING, logger="mateu.yaml_specs"):
        assert load(specs(tmp_path, "form.yaml", body), "form") is None
    message = caplog.text
    assert "form.yaml, line " in message
    assert "Page not found" in message


def test_a_layout_file_that_does_not_exist_is_named(tmp_path, caplog):
    body = "type: VerticalLayout\ncontent: []\n"
    with caplog.at_level(logging.WARNING, logger="mateu.yaml_specs"):
        assert load(specs(tmp_path, "from.yaml", body), "form") is None
    assert 'route "form" names layout "from.yaml"' in caplog.text
    assert "does not exist" in caplog.text
