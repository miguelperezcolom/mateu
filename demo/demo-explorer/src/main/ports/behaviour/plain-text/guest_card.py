# The Python twin (mateu-ui): @plain_text on the class (Multiline() to wrap a field).
from datetime import date
from typing import Annotated

from mateu_ui.uidl import Multiline, plain_text, title, ui

PREFS = "Quiet room away from the lift, extra pillows, sparkling water on arrival, late breakfast"


@ui("guest-card")
@title("Guest card")
@plain_text
class GuestCard:
    name: str = "Ada Lovelace"
    arrival: date = date(2026, 12, 20)
    nights: int = 4
    preferences_cut: str = PREFS
    preferences_wrapped: Annotated[str, Multiline()] = PREFS
