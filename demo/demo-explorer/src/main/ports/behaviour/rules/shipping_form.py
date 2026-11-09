# The Python twin (mateu-ui): Hidden("expr") markers and a RuleSupplier for the rest.
# Python's Disabled() takes no expression — a conditional disable is a Rule.
from typing import Annotated

from mateu_ui.uidl import Hidden, Rule, RuleSupplier, title, ui


@ui("shipping")
@title("Shipping")
class ShippingForm(RuleSupplier):
    company: bool = False
    company_name: Annotated[str | None, Hidden("!state.company")] = None
    vat_number: Annotated[str | None, Hidden("!state.company")] = None
    gift_wrap: bool = False
    gift_message: str | None = None

    def rules(self) -> list[Rule]:
        return [
            Rule("true", "SetDataValue", "giftMessage", "disabled", expression="!state.giftWrap"),
            Rule("true", "SetDataValue", "vatNumber", "required", expression="!!state.company"),
        ]
