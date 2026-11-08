# The Python twin (mateu-ui): @inline_editing on the crud makes every column an in-place editor;
# each committed cell saves its row through save(). ReadOnly() keeps a column display-only.
from typing import Annotated

from mateu_ui.uidl import Crud, ReadOnly, inline_editing, title, ui


class Item:
    id: Annotated[str, ReadOnly()] = ""
    name: str = ""
    stock: int = 0
    price: float = 0.0
    active: bool = True


def _item(i: int) -> Item:
    it = Item()
    it.id, it.name, it.stock, it.price, it.active = f"SKU-{500 + i}", f"Item {i}", i * 17 % 120, 1.5 + i * 7 % 30, i % 6 != 0
    return it


STORE = {it.id: it for it in (_item(i) for i in range(50))}


@ui("stock")
@title("Stock")
@inline_editing
class StockCrud(Crud[Item]):
    def fetch(self, search):
        return STORE.values()

    def get(self, id):
        return STORE.get(id)

    def save(self, entity):
        STORE[entity.id] = entity
