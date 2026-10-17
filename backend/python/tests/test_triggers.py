"""Triggers a Python view declares — the mirror of Java's @Trigger / @SubscribeTo (M-A5). The full
wire of every kind is pinned by the ``triggers`` conformance case; these pin the options around
it: a subscription's source/from/condition, a raw on_custom_event listening on the component
itself, the event travelling as ``eventName`` (the member the renderers read), and the actions a
trigger names being runnable."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler  # noqa: E402
from mateu_uidl import SubscriptionSource, TriggerType, subscribe_to, title, trigger, ui  # noqa: E402

CALLS: list[str] = []


@ui("trigger-options")
@title("Trigger options")
@trigger(TriggerType.on_custom_event, "on_ping", event_name="ping")
@trigger("OnLoad", "poll")
@subscribe_to("order-saved", "reload_orders", source=SubscriptionSource.COMPONENT, from_="orders", condition="state.live")
class TriggerOptions:
    name: str = ""

    def on_ping(self):
        CALLS.append("ping")

    def poll(self):
        CALLS.append("poll")

    def reload_orders(self):
        CALLS.append("reload")


MODULE = sys.modules[__name__]


def triggers() -> list[dict]:
    inc = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(route="/trigger-options", consumed_route="/trigger-options"))
    component = json.loads(json.dumps(inc.model_dump(by_alias=True, mode="json")))["fragments"][0]["component"]
    return component["triggers"]


def test_a_subscription_carries_its_source_from_and_condition_and_its_event_as_event_name():
    sub = next(t for t in triggers() if t["actionId"] == "reloadOrders")
    assert sub["type"] == "OnCustomEvent"
    assert sub["eventName"] == "order-saved"
    assert "event" not in sub  # no renderer reads it: the port used to send only this
    assert (sub["source"], sub["from"], sub["condition"]) == ("COMPONENT", "orders", "state.live")


def test_a_raw_custom_event_trigger_listens_on_the_component_itself():
    raw = next(t for t in triggers() if t["actionId"] == "onPing")
    assert (raw["type"], raw["eventName"], raw["source"]) == ("OnCustomEvent", "ping", "SELF")


def test_an_on_load_trigger_fires_once_by_default():
    load = next(t for t in triggers() if t["actionId"] == "poll")
    assert (load["type"], load["times"], load["timeoutMillis"]) == ("OnLoad", 1, 0)


def test_the_actions_triggers_name_are_advertised_and_run():
    inc = SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(route="/trigger-options", consumed_route="/trigger-options"))
    advertised = {a.id for a in inc.fragments[0].component.actions}
    assert {"onPing", "poll", "reloadOrders"} <= advertised
    CALLS.clear()
    SyncHandler(MateuRegistry(MODULE)).handle(RunActionRq(
        route="/trigger-options", consumed_route="/trigger-options", action_id="poll",
        server_side_type=f"{__name__}.TriggerOptions",
    ))
    assert CALLS == ["poll"]
