"""Component adapters (Java's ``ComponentAdapter<T>`` SPI): a plain domain object rendered through
its adapter — top-level when the model is routed, as an independent island when a form field holds
it — and rebuilt from the state by ``deserialize``; only the action ids the adapted view lists
reach the model. Plus component-holder fields on reflected pages (CustomField)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from mateu_core import MateuRegistry, RunActionRq, SyncHandler, type_name  # noqa: E402
from mateu_uidl import AdaptedView, ComponentAdapter, Message, ui  # noqa: E402
from mateu_uidl import components as fluent  # noqa: E402

MODULE = sys.modules[__name__]


@ui("adapter-demo")  # routing only: the adapter owns the whole UI
class Order:
    """A plain POJO: no Mateu markers on its fields."""

    customer = "Ana"
    lines = 2
    confirmed = False

    def confirm(self):
        self.confirmed = True

    def cancel_all(self):
        return Message("cancelled")

    def secret(self):  # NOT listed by the adapter
        raise AssertionError("must never run")


class OrderAdapter(ComponentAdapter[Order]):
    def type(self):
        return Order

    def adapt(self, order):
        return AdaptedView(
            components=[
                fluent.FormField(field_id="customer", label="Customer"),
                fluent.Text(text="confirmed" if order.confirmed else "pending"),
                fluent.Button(label="Confirm", action_id="confirm"),
            ],
            state={"customer": order.customer, "lines": order.lines, "confirmed": order.confirmed},
            data={"hint": "adapted"},
            actions=["confirm", "cancelAll"],
        )

    def deserialize(self, state):
        order = Order()
        if "customer" in state:
            order.customer = state["customer"]
        if "lines" in state:
            order.lines = int(state["lines"])
        if "confirmed" in state:
            order.confirmed = bool(state["confirmed"])
        return order


@ui("adapter-host")
class OrderHost:
    title_text: str = "Host"
    order: Order = None  # type: ignore[assignment]
    banner: fluent.Component = fluent.Text(text="a component in a form slot")

    def __init__(self):
        self.order = Order()
        self.order.customer = "Luis"


def handler() -> SyncHandler:
    return SyncHandler(MateuRegistry(MODULE))


def load(cls, **kw) -> dict:
    return handler().handle(RunActionRq(server_side_type=type_name(cls), **kw)).model_dump(by_alias=True, mode="json")


def test_a_routed_model_renders_through_its_adapter():
    out = load(Order)
    frag = out["fragments"][0]
    comp = frag["component"]
    assert comp["serverSideType"] == type_name(Order)
    assert comp["initialData"] == {"customer": "Ana", "lines": 2, "confirmed": False}
    assert [a["id"] for a in comp["actions"]] == ["confirm", "cancelAll"]
    assert frag["data"] == {"hint": "adapted"}
    assert "pending" in json.dumps(comp)


def test_a_listed_action_runs_on_the_model_rebuilt_from_the_state():
    out = load(Order, action_id="confirm", component_state={"customer": "Eva", "lines": 5})
    comp = out["fragments"][0]["component"]
    assert comp["initialData"] == {"customer": "Eva", "lines": 5, "confirmed": True}
    assert "confirmed" in json.dumps(comp)


def test_a_camel_case_action_reaches_the_snake_case_method():
    out = load(Order, action_id="cancelAll", component_state={})
    assert out["messages"][0]["text"] == "cancelled"


def test_an_unlisted_method_is_never_reachable():
    out = load(Order, action_id="secret", component_state={})
    assert out["messages"][0]["variant"] == "error"


def test_a_field_holding_an_adapted_object_is_an_island():
    comp = load(OrderHost)["fragments"][0]["component"]
    j = json.dumps(comp)
    customs = []

    def walk(n):
        if isinstance(n, dict):
            if isinstance(n.get("metadata"), dict) and n["metadata"].get("type") == "CustomField":
                customs.append(n["metadata"])
            for v in n.values():
                walk(v)
        elif isinstance(n, list):
            for v in n:
                walk(v)

    walk(comp)
    island = next(c for c in customs if c["content"]["type"] == "ServerSide")
    assert island["label"] == "Order"
    assert island["content"]["serverSideType"] == type_name(Order)
    assert island["content"]["initialData"]["customer"] == "Luis"
    assert "a component in a form slot" in j  # a plain component-holder field renders too
    # neither the island nor the component leak into the host's state
    assert set(comp["initialData"]) == {"titleText"}


def test_the_island_round_trips_through_the_adapter_by_its_type_name():
    out = load(Order, action_id="confirm", component_state={"customer": "Luis"})
    assert out["fragments"][0]["component"]["initialData"]["confirmed"] is True


def test_the_wire_cannot_write_a_component_holder_field():
    out = load(OrderHost, component_state={"banner": "hacked"})
    assert "a component in a form slot" in json.dumps(out)
