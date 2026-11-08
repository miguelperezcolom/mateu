# The Python twin (mateu-ui): @trigger(on_value_change) + an options() method reading the state.
from typing import Annotated

from mateu_ui.dtos import Option
from mateu_ui.uidl import ReadOnly, TriggerType, title, trigger, ui

CITIES = {
    "Spain": ["Madrid", "Palma", "Seville"],
    "France": ["Paris", "Lyon", "Nice"],
    "Italy": ["Rome", "Milan", "Naples"],
}


@ui("order-line")
@title("Order line")
@trigger(TriggerType.on_value_change, "country_changed", property_name="country")
@trigger(TriggerType.on_value_change, "recalculate", property_name="quantity")
@trigger(TriggerType.on_value_change, "recalculate", property_name="unitPrice")
class OrderLineForm:
    country: str = "Spain"
    city: str | None = None
    quantity: int = 1
    unit_price: float = 10
    total: Annotated[float, ReadOnly()] = 10

    def options(self, field_name):
        if field_name == "country":
            return [Option(value=c, label=c) for c in CITIES]
        if field_name == "city":
            return [Option(value=c, label=c) for c in CITIES.get(self.country, [])]
        return []

    def country_changed(self):
        if self.city and self.city not in CITIES.get(self.country, []):
            self.city = None
        return self

    def recalculate(self):
        self.total = self.quantity * self.unit_price
        return self
