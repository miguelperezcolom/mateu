"""@toolbar — the Python analogue of Java's @Toolbar (M-A5). The wire shape is pinned by the
``page-toolbar`` conformance case; these pin that a toolbar action runs, that the server re-checks
the form's constraints before it (like a @button), and that an @eyes_only one is neither shown
nor runnable."""

import sys
from pathlib import Path
from typing import Annotated

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_ui.core.action_guard import MateuForbiddenException  # noqa: E402
from mateu_ui.uidl import Required, UserFacingException, eyes_only, title, toolbar, ui  # noqa: E402

CALLS: list[str] = []


@ui("toolbar-page")
@title("Toolbar page")
class ToolbarPage:
    name: Annotated[str, Required()] = ""

    @toolbar
    def publish(self):
        CALLS.append(f"publish {self.name}")

    @toolbar
    @eyes_only(roles=["admin"])
    def purge(self):
        CALLS.append("purge")


MODULE = sys.modules[__name__]
TYPE = f"{__name__}.ToolbarPage"


def run(action_id: str = "", state: dict | None = None):
    return SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route="/toolbar-page", consumed_route="/toolbar-page", action_id=action_id,
        server_side_type=TYPE, component_state=state or {},
    ))


def test_the_toolbar_shows_only_what_the_caller_may_run():
    page = run().fragments[0].component.children[0].metadata
    assert [b.action_id for b in page.toolbar] == ["publish"]


def test_a_toolbar_action_runs_once_the_form_is_valid():
    CALLS.clear()
    run("publish", {"name": "Ada"})
    assert CALLS == ["publish Ada"]


def test_the_server_rechecks_the_constraints_before_a_toolbar_action():
    CALLS.clear()
    with pytest.raises(UserFacingException):
        run("publish", {"name": ""})
    assert CALLS == []


def test_a_hidden_toolbar_action_is_not_runnable():
    CALLS.clear()
    with pytest.raises(MateuForbiddenException):
        run("purge", {"name": "Ada"})
    assert CALLS == []
