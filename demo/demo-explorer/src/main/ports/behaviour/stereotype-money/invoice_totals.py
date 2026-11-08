# The Python twin (mateu-ui): the Money() marker is the money stereotype; PlainText() keeps it read-only.
from decimal import Decimal
from typing import Annotated

from mateu_ui.uidl import Message, Money, PlainText, button, title, ui


@ui("invoice")
@title("Invoice")
class InvoiceTotals:
    subtotal: Annotated[Decimal, Money()] = Decimal("12450.5")
    credit_limit: Annotated[float, Money(), PlainText()] = 250000

    @button()
    def show(self) -> Message:
        return Message(f"Subtotal (as the server sees it): {self.subtotal}")
