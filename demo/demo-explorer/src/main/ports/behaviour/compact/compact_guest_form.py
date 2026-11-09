# The Python twin (mateu-ui): @compact on the class.
from datetime import date

from mateu_ui.uidl import compact, title, ui


@ui("compact-guest")
@title("Guest — compact")
@compact
class CompactGuestForm:
    name: str = "Ada Lovelace"
    email: str = "ada@example.com"
    arrival: date = date(2026, 12, 20)
    room: str = "214"
