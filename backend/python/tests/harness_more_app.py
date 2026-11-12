"""More screens for ``test_testing_harness_more.py``: overlays, commands, errors, field kinds."""

from __future__ import annotations

from enum import Enum
from typing import Annotated

from mateu_ui.uidl import components as fluent
from mateu_ui.dtos import UICommand
from mateu_ui.uidl import (
    CloseOverlay,
    Message,
    Navigate,
    ReadOnly,
    Required,
    RunAction,
    UserFacingException,
    button,
    rest_action,
    disabled_unless,
    title,
    trigger,
    ui,
)
from mateu_ui.uidl.components import EmbeddedView
from mateu_ui.uidl.views import ComponentTreeSupplier

CALLS: list[str] = []


class Size(Enum):
    Small = "Small"
    Large = "Large"


@ui("harness-actions")
@title("Actions")
@trigger("OnValueChange", "changed", property_name="size")
class HarnessActions:
    name: Annotated[str, Required()] = "Ada"
    code: Annotated[str, ReadOnly()] = "X-1"
    size: Size = Size.Small

    @button
    def changed(self) -> None:
        CALLS.append(f"changed:{self.size}")

    @button
    def drawer(self) -> fluent.Drawer:
        return fluent.Drawer(header_title="Details", content=fluent.Text(text="Inside the drawer"))

    @button
    def go(self):
        return Navigate("harness-target")

    @button
    def close(self):
        return CloseOverlay()

    @button
    def again(self):
        return RunAction("ping")

    @button
    def ping(self) -> Message:
        CALLS.append("ping")
        return Message("pong")

    @button
    def titled(self):
        return UICommand(target_component_id="ux_main", type="SetWindowTitle", data="A new title")

    @button
    def refuse(self) -> None:
        raise UserFacingException("Not now")

    @button
    def boom(self) -> None:
        raise RuntimeError("a bug")

    @button
    def pushed(self):
        return UICommand(target_component_id="ux_main", type="PushStateToHistory", data="/harness-actions/pushed")

    @button
    def loop(self):
        return RunAction("loop")

    @button
    @disabled_unless(roles=("admin",))
    def admin_only(self) -> Message:
        return Message("admin")


@ui("harness-target")
@title("Target")
class HarnessTarget:
    note: str = "arrived"


@ui("harness-tree")
@title("Tree")
class HarnessTree(ComponentTreeSupplier):
    """A fluent page: a button that NAVIGATES, one that opens a dialog embedding a routed view."""

    def component(self):
        return fluent.VerticalLayout(content=(
            fluent.Text(text="A fluent page"),
            fluent.Button(label="To target", route="harness-target"),
            fluent.Button(label="Embed", action_id="embed"),
        ))

    @button
    def embed(self) -> fluent.Dialog:
        return fluent.Dialog(header_title="Embedded", content=EmbeddedView(HarnessTarget()))


@ui("harness-rest")
@title("Rest")
class HarnessRest:
    note: str = ""

    @button
    @rest_action(url="https://example.com/api/notes", success_message="Sent")
    def send(self) -> None:
        pass

