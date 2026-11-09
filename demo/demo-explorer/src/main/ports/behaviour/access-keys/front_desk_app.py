# The Python twin (mateu-ui): @app(..., access_keys=True).
from mateu_ui.uidl import AppVariant, Message, app, button, menu_item, title, ui


@ui("check-in")
@title("Check-in")
class CheckInPage:
    guest: str = "Ada Lovelace"

    @button()
    def assign_room(self) -> Message:
        return Message("Room assigned")

    @button()
    def print_card(self) -> Message:
        return Message("Registration card printed")


@app("Front desk", variant=AppVariant.MENU_ON_TOP, access_keys=True)
class FrontDeskApp:
    @menu_item("Check-in")
    def check_in(self) -> CheckInPage:
        return CheckInPage()
