# The Python twin (mateu-ui): @edit_in_drawer opens New and row edits in a drawer over the
# listing; display() turns on "Save and next"; a UserFacingException from save() shows inside it.
import dataclasses

from mateu_ui.uidl import Crud, CrudDisplay, Toggle, UserFacingException, edit_in_drawer, title, ui


class Order:
    id: str = ""
    customer: str = ""
    amount: float = 0.0


def _order(i: int) -> Order:
    o = Order()
    o.id, o.customer, o.amount = f"ORD-{1001 + i}", f"Customer {i}", 25.0 + i * 37 % 480
    return o


STORE = {o.id: o for o in (_order(i) for i in range(50))}


@ui("orders")
@title("Orders — edit in a drawer")
@edit_in_drawer
class DrawerOrdersCrud(Crud[Order]):
    def display(self):
        return dataclasses.replace(CrudDisplay.defaults(), save_and_next=Toggle.on)

    def fetch(self, search):
        return STORE.values()

    def get(self, id):
        return STORE.get(id)

    def save(self, entity):
        if entity.amount > 10_000:
            raise UserFacingException("An order cannot exceed 10,000.", title="Over the credit limit")
        STORE[entity.id] = entity
