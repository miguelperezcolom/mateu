"""Component adapters: render a domain object that is NOT a Mateu view — no decorators, no markers —
and rebuild it from the state on the way back (Java's ``ComponentAdapter<T>`` SPI).

    class OrderAdapter(ComponentAdapter[Order]):
        def type(self):
            return Order

        def adapt(self, order):
            return AdaptedView(
                components=[fluent.FormField(field_id="customer", label="Customer"),
                            fluent.Button(label="Confirm", action_id="confirm")],
                state={"customer": order.customer},
                actions=["confirm"],
            )

        def deserialize(self, state):
            order = Order()
            if "customer" in state:
                order.customer = state["customer"]
            return order

Put the adapter class in a module (or pass it) given to ``add_mateu``/``MateuRegistry`` and it is
discovered like the views. A routed model (``@ui`` on the model class, routing only) renders through
its adapter; a model held by a FIELD of an ordinary form renders as an independent island with its
own state and actions. An action id the adapter lists runs the model's method of that name
(camelCase or snake_case); returning None (or the model) re-renders it.

``deserialize`` also builds the FIRST instance, from an empty state: guard each assignment with
``if key in state`` so the model's own defaults survive.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Generic, TypeVar

T = TypeVar("T")


@dataclass(frozen=True)
class AdaptedView:
    """What an adapter makes of a model: the components to show, the state they bind to, extra
    fragment data and the action ids the view exposes."""

    components: list = field(default_factory=list)
    state: dict[str, Any] = field(default_factory=dict)
    data: dict[str, Any] = field(default_factory=dict)
    actions: list[str] = field(default_factory=list)


class ComponentAdapter(Generic[T]):
    """Adapts objects of :meth:`type` to Mateu components and back."""

    def type(self) -> type:
        raise NotImplementedError

    def adapt(self, model: T) -> AdaptedView:
        raise NotImplementedError

    def deserialize(self, state: dict[str, Any]) -> T:
        raise NotImplementedError


__all__ = ["AdaptedView", "ComponentAdapter"]
