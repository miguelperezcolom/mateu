# The Python twin (mateu-ui): @overline / @title_placeholder / @subtitle on the class;
# HeaderBadge and Timestamp field markers; KPIs are @kpi methods in this port.
from typing import Annotated

from mateu_ui.uidl import HeaderBadge, Timestamp, kpi, overline, subtitle, title_placeholder, ui


@ui("new-booking")
@overline("Reservations")
@title_placeholder("New booking…")
@subtitle("Fill in the guest to give the booking its name")
class NewBookingPage:
    guest: str = ""
    room: str = "214"
    status: Annotated[str, HeaderBadge(color="success")] = "Confirmed"
    vip: Annotated[bool, HeaderBadge(color="warning", label="VIP")] = True
    updated_at: Annotated[str, Timestamp("Last updated")] = "2026-11-08 09:30"

    @kpi("Nights")
    def nights(self) -> str:
        return "4"

    @kpi("Total")
    def total(self) -> str:
        return "€ 1,240"
