# The pages the small Python demo apps of these entries navigate to.
from mateu_ui.uidl import title, ui


@ui("rooms")
@title("Rooms")
class RoomsPage:
    room: str = "214"
    status: str = "Ready"


@ui("guests")
@title("Guests")
class GuestsPage:
    guest: str = "Ada Lovelace"
