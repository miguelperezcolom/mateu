# The Python twin (mateu-ui): @toc on the class (the port has no sticky sections).
from typing import Annotated

from mateu_ui.uidl import Multiline, Section, title, toc, ui


@ui("handbook")
@title("Hotel handbook")
@toc
class HotelHandbook:
    check_in_from: Annotated[str, Section("Arrival")] = "15:00"
    rooms: Annotated[str, Section("Rooms"), Multiline()] = "…"
    restaurant: Annotated[str, Section("Restaurant"), Multiline()] = "…"
    spa: Annotated[str, Section("Spa"), Multiline()] = "…"
    excursions: Annotated[str, Section("Excursions"), Multiline()] = "…"
    departure: Annotated[str, Section("Departure"), Multiline()] = "…"
