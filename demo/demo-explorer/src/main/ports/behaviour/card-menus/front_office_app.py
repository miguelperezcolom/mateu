# The Python twin (mateu-ui): @menu_group(..., display=MenuDisplay.cards) makes a folder a card
# panel; a "/" in a group nests a folder (a card with actions). (Rule leaves are Java-only.)
from mateu_ui.uidl import AppVariant, MenuDisplay, app, menu_group, menu_item

from .pages import GuestsPage, RoomsPage


@app("Front office", variant=AppVariant.MENU_ON_TOP)
@menu_group("Quick access", display=MenuDisplay.cards)
@menu_group("Quick access/Billing", description="Two destinations, shown as the card's actions")
class FrontOfficeApp:
    @menu_item("Rooms")
    def rooms(self) -> RoomsPage:
        return RoomsPage()

    @menu_item("Room plan", group="Quick access", description="Who is in which room")
    def room_plan(self) -> RoomsPage:
        return RoomsPage()

    @menu_item("Guest list", group="Quick access", description="Today's arrivals and departures")
    def guest_list(self) -> GuestsPage:
        return GuestsPage()

    @menu_item("Folios", group="Quick access/Billing")
    def folios(self) -> RoomsPage:
        return RoomsPage()

    @menu_item("Invoices", group="Quick access/Billing")
    def invoices(self) -> GuestsPage:
        return GuestsPage()
