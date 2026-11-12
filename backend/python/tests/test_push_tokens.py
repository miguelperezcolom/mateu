"""Push notifications on the Mateu mobile app (mirrors Java's ``PushTokensSyncTest``): an app class
implementing ``PushTokenRegistry`` advertises ``pushNotifications``, and the ``_push-register`` /
``_push-unregister`` app-level actions hand it a validated registration carrying the caller the host
authenticated — never one from the request body."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_ui.core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_ui.core.action_guard import MateuForbiddenException  # noqa: E402
from mateu_ui.uidl import (  # noqa: E402
    Identity,
    PushRegistration,
    PushTokenRegistry,
    UserFacingException,
    app,
    menu_item,
    ui,
)

TOKEN = "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
KEY = "p0123456789abcdef"
CALLS: list[tuple[str, PushRegistration]] = []


@ui("push-home")
class PushHome:
    name: str | None = None


@ui("push")
@app("Orders")
class PushApp(PushTokenRegistry):
    @menu_item("Home")
    def home(self) -> PushHome:
        return PushHome()

    def register_push_token(self, registration: PushRegistration) -> None:
        CALLS.append(("register", registration))

    def unregister_push_token(self, registration: PushRegistration) -> None:
        CALLS.append(("unregister", registration))


@ui("push-plain")
@app("Plain")
class PlainApp:
    @menu_item("Home")
    def home(self) -> PushHome:
        return PushHome()


MODULE = sys.modules[__name__]


def handler(principal: str | None = None) -> SyncHandler:
    return SyncHandler(
        MateuRegistry(MODULE),
        identity_provider=(lambda: Identity(name=principal)) if principal else None,
    )


def params(**overrides) -> dict:
    # a principal in the body is never read
    return {"token": TOKEN, "service": "expo", "platform": "android", "uiKey": KEY,
            "principal": "someone-else", **overrides}


def run(cls, action_id, parameters, principal=None):
    return handler(principal).handle(
        RunActionRq(
            route="/push",
            server_side_type=type_name(cls),
            action_id=action_id,
            initiator_component_id="_ux",
            component_state={},
            parameters=parameters,
        )
    )


def app_meta(cls) -> dict:
    inc = handler().handle(RunActionRq(server_side_type=type_name(cls)))
    return inc.model_dump(by_alias=True, mode="json")["fragments"][0]["component"]["metadata"]


@pytest.fixture(autouse=True)
def _clear():
    CALLS.clear()


def test_an_app_with_a_registry_advertises_push():
    assert app_meta(PushApp)["pushNotifications"] is True
    assert app_meta(PlainApp)["pushNotifications"] is False


def test_register_and_unregister_reach_the_registry_with_the_authenticated_caller():
    run(PushApp, "_push-register", params(), principal="alice")
    run(PushApp, "_push-unregister", params(), principal="alice")
    assert [c for c, _ in CALLS] == ["register", "unregister"]
    assert CALLS[0][1] == PushRegistration(TOKEN, "expo", "android", KEY, "alice")


def test_an_anonymous_caller_registers_with_no_principal():
    run(PushApp, "_push-register", params())
    assert len(CALLS) == 1 and CALLS[0][1].principal is None


@pytest.mark.parametrize(
    "key,value",
    [
        ("token", "not-a-token"),
        ("token", "ExponentPushToken[ab]"),
        ("service", "fcm"),
        ("platform", "web"),
        ("uiKey", "short"),
        ("uiKey", "../../etc/passwd"),
    ],
)
def test_a_malformed_registration_never_reaches_the_registry(key, value):
    try:
        answer = run(PushApp, "_push-register", params(**{key: value}))
        assert answer.messages
    except UserFacingException:
        pass  # refused either way
    assert CALLS == []


def test_an_app_without_a_registry_refuses():
    with pytest.raises(MateuForbiddenException):
        run(PlainApp, "_push-register", params())
    assert CALLS == []
