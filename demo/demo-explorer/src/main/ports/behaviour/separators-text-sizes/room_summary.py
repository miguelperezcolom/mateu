# The Python twin (mateu-ui): Text(container, size, no_margins) and SeparatorBefore() markers.
from typing import Annotated

from mateu_ui.uidl import SeparatorBefore, Text, title, ui


@ui("room-summary")
@title("Room 214")
class RoomSummary:
    headline: Annotated[str, Text(container="h3", size="xl")] = "Sea-view double"
    caption: Annotated[str, Text(size="xs", no_margins=True)] = "Last cleaned today at 11:20"
    guest: str = "Ada Lovelace"
    nights: str = "4"
    minibar: Annotated[str, SeparatorBefore()] = "Restocked"
    housekeeping: str = "Turndown at 19:00"
