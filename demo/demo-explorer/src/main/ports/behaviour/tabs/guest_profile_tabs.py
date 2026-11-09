# The Python twin (mateu-ui): Tab("…", open=True) markers (the port has no tab shortcut).
from typing import Annotated

from mateu_ui.uidl import Tab, title, ui


@ui("guest-profile")
@title("Guest profile")
class GuestProfileTabs:
    name: Annotated[str, Tab("Identity")] = "Ada Lovelace"
    nationality: Annotated[str, Tab("Identity")] = "British"
    email: Annotated[str, Tab("Contact", open=True)] = "ada@example.com"
    phone: Annotated[str, Tab("Contact", open=True)] = "+44 20 0000 0000"
    pillow: Annotated[str, Tab("Preferences")] = "Feather"
