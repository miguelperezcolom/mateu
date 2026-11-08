# The Python twin (mateu-ui): HomeRouteSupplier on the @app class (else the first menu leaf).
from mateu_ui.uidl import AppVariant, HomeRouteSupplier, app, menu_item

from .pages import GuestsPage, RoomsPage


@app("Concierge", variant=AppVariant.MENU_ON_TOP)
class ConciergeApp(HomeRouteSupplier):
    @menu_item("Rooms")
    def rooms(self) -> RoomsPage:
        return RoomsPage()

    @menu_item("Guests")
    def guests(self) -> GuestsPage:
        return GuestsPage()

    def home_route(self) -> str:
        return "guests"
