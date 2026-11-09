# The Python twin (mateu-ui): @toolbar / @button methods; @shortcut binds a key; the method name
# (camelCased) is the action id.
from mateu_ui.uidl import Message, button, shortcut, title, toolbar, ui


@ui("order-actions")
@title("Order 1042")
class OrderActions:
    customer: str = "Acme"

    @toolbar()
    def refresh(self) -> Message:
        return Message("Refreshed from the toolbar")

    @toolbar("Ship order", button_style="primary")
    def ship(self) -> Message:
        return Message("Shipped")

    @button()
    def print_invoice(self) -> Message:
        return Message("Invoice printed (a form button)")

    @button()
    @shortcut("ctrl+alt+r")
    def recalculate(self) -> Message:
        return Message("Recalculated")
