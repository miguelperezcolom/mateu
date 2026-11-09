# The Python twin (mateu-ui): @zones(...) on the class, Section(..., zone=...) per field.
from typing import Annotated

from mateu_ui.uidl import Section, title, ui, zones


@ui("reservation")
@title("Reservation")
@zones(("left", "64%"), ("right", "36%"))
class ReservationDesk:
    locator: Annotated[str, Section("Stay")] = "ABC123"
    guest: Annotated[str, Section("Guest", zone="left")] = "Ada Lovelace"
    email: Annotated[str, Section("Guest", zone="left")] = "ada@example.com"
    room: Annotated[str, Section("Room", zone="right")] = "214"
    card: Annotated[str, Section("Payment", zone="right")] = "**** 4242"
