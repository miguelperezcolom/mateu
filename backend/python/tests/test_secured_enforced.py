"""``@secured`` is ENFORCED with the semantics of ``@eyes_only(permissions=[p])`` (3.0-alpha.412) —
before, nothing read it and a "secured" view was open to everyone. The view and its actions are
refused (403) to a caller without the permission or with no principal, served to one holding it,
and the menu entry leading to it hides. It stays deprecated, naming ``eyes_only``."""

from __future__ import annotations

import sys
import warnings
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuForbiddenException, MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.uidl import Identity, Message, app, button, menu_item, secured, title, ui  # noqa: E402

MODULE = sys.modules[__name__]
RAN: list[str] = []

with warnings.catch_warnings():
    warnings.simplefilter("ignore", DeprecationWarning)

    @ui("sec-orders")
    @title("Orders")
    @secured("orders.read")
    class SecuredOrders:
        total: str = "42 orders"

        @button()
        def export(self):
            RAN.append("export")
            return Message("exported")


@ui("sec-open")
@title("Open")
class OpenPage:
    name: str = "x"


@app("Secured app")
class SecuredApp:
    @menu_item("Open")
    def open(self) -> OpenPage:
        return OpenPage()

    @menu_item("Orders")
    def orders(self) -> SecuredOrders:
        return SecuredOrders()


def handler(identity: Identity | None) -> SyncHandler:
    return SyncHandler(
        MateuRegistry(MODULE),
        identity_provider=(lambda: identity) if identity is not None else None,
    )


NO_PERMISSION = Identity(roles=("staff",), permissions=("orders.write",))
READER = Identity(permissions=("orders.read",))


@pytest.mark.parametrize("identity", [None, NO_PERMISSION], ids=["no principal", "without permission"])
def test_a_secured_view_and_its_actions_are_refused(identity):
    RAN.clear()
    with pytest.raises(MateuForbiddenException):
        handler(identity).handle(RunActionRq(route="sec-orders"))
    with pytest.raises(MateuForbiddenException):
        handler(identity).handle(RunActionRq(server_side_type=type_name(SecuredOrders)))
    with pytest.raises(MateuForbiddenException):
        handler(identity).handle(
            RunActionRq(server_side_type=type_name(SecuredOrders), action_id="export", route="sec-orders")
        )
    assert RAN == []


def test_a_secured_view_is_served_to_a_principal_holding_the_permission():
    RAN.clear()
    assert "42 orders" in handler(READER).handle(RunActionRq(route="sec-orders")).model_dump_json()
    handler(READER).handle(RunActionRq(server_side_type=type_name(SecuredOrders), action_id="export"))
    assert RAN == ["export"]


def test_the_menu_entry_leading_to_a_secured_view_hides_without_the_permission():
    def labels(identity):
        meta = handler(identity).handle(RunActionRq(server_side_type=type_name(SecuredApp))).model_dump(
            by_alias=True
        )
        return [m["label"] for m in meta["fragments"][0]["component"]["metadata"]["menu"]]

    assert labels(None) == ["Open"]
    assert labels(NO_PERMISSION) == ["Open"]
    assert labels(READER) == ["Open", "Orders"]
