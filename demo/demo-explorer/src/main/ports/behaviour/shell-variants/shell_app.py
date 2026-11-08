# The Python twin (mateu-ui): @app(title, variant=...); menu entries are @menu_item methods,
# group= nests them. variant "" = auto.
from mateu_ui.uidl import AppVariant, app, menu_item

from .pages import GuestsPage, RoomsPage


@app("Menu on the left", variant=AppVariant.MENU_ON_LEFT)
class ShellApp:
    @menu_item("Rooms")
    def rooms(self) -> RoomsPage:
        return RoomsPage()

    @menu_item("Guests")
    def guests(self) -> GuestsPage:
        return GuestsPage()

    @menu_item("Occupancy", group="Reports")
    def occupancy(self) -> RoomsPage:
        return RoomsPage()

    @menu_item("Arrivals", group="Reports")
    def arrivals(self) -> GuestsPage:
        return GuestsPage()
