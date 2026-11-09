# The Python twin (mateu-ui): @app(..., chromeless=True) (implies command_center) + GlobalSearchSupplier.
from mateu_ui.uidl import GlobalSearchResult, GlobalSearchSupplier, app, menu_item

from .pages import GuestsPage, RoomsPage


@app("Kiosk", chromeless=True)
class KioskApp(GlobalSearchSupplier):
    @menu_item("Rooms")
    def rooms(self) -> RoomsPage:
        return RoomsPage()

    @menu_item("Guests")
    def guests(self) -> GuestsPage:
        return GuestsPage()

    def global_search(self, search_text: str) -> list[GlobalSearchResult]:
        hits = [GlobalSearchResult("Ada Lovelace", "Room 214", "/guests", "Guests")]
        return [h for h in hits if (search_text or "").lower() in h.label.lower()]
