# The Python twin (mateu-ui): GroupBy() groups the rows, Aggregate() adds subtotals and totals,
# computed over the whole filtered result.
from typing import Annotated

from mateu_ui.uidl import Aggregate, AggregateFunction, Crud, GroupBy, title, ui


class Sale:
    id: str = ""
    region: Annotated[str, GroupBy()] = ""
    product: str = ""
    units: Annotated[int, Aggregate(AggregateFunction.sum)] = 0
    amount: Annotated[float, Aggregate(AggregateFunction.sum)] = 0.0


REGIONS = ["North", "South", "East", "West"]
PRODUCTS = ["Chairs", "Tables", "Lamps", "Shelves", "Desks"]


def _sale(i: int) -> Sale:
    s = Sale()
    s.id, s.region, s.product = f"S-{101 + i}", REGIONS[i * 3 % 4], PRODUCTS[i % 5]
    s.units = 1 + i * 7 % 12
    s.amount = s.units * (20.0 + i * 13 % 90)
    return s


STORE = {s.id: s for s in (_sale(i) for i in range(50))}


@ui("sales")
@title("Sales by region")
class SalesCrud(Crud[Sale]):
    def fetch(self, search):
        text = (search or "").lower()
        return [s for s in STORE.values() if text in f"{s.id} {s.region} {s.product}".lower()]

    def get(self, id):
        return STORE.get(id)
