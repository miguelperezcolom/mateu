# The Python twin (mateu-ui): a @list_toolbar_button method is a bulk action; its typed list
# parameter receives the selected rows.
from mateu_ui.uidl import Crud, Message, list_toolbar_button, title, ui


class Order:
    id: str = ""
    customer: str = ""
    status: str = "Open"


def _order(i: int) -> Order:
    o = Order()
    o.id, o.customer = f"ORD-{1001 + i}", f"Customer {i}"
    return o


STORE = {o.id: o for o in (_order(i) for i in range(50))}


@ui("orders")
@title("Orders — bulk actions")
class BulkOrdersCrud(Crud[Order]):
    def fetch(self, search):
        return STORE.values()

    def get(self, id):
        return STORE.get(id)

    @list_toolbar_button("Mark as shipped")
    def mark_as_shipped(self, rows: list[Order]):
        for row in rows:
            STORE[row.id].status = "Shipped"
        return Message(f"{len(rows)} orders marked as shipped")

    @list_toolbar_button("Cancel orders", confirmation_required=True)
    def cancel_orders(self, rows: list[Order]):
        for row in rows:
            STORE[row.id].status = "Cancelled"
        return Message(f"{len(rows)} orders cancelled")
