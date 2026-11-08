# The Python twin (mateu-ui): @banner(theme, title) methods return the description.
from mateu_ui.uidl import BannerTheme, banner, title, ui


@ui("front-desk")
@title("Front desk")
class MaintenanceNotices:
    room: str = "214"

    @banner(BannerTheme.INFO, "Lift maintenance")
    def lift(self) -> str:
        return "The east lift is out of service until 14:00."

    @banner(BannerTheme.WARNING, "Overbooking risk")
    def overbooking(self) -> str:
        return "Saturday is at 103% — confirm the walk-in policy."
