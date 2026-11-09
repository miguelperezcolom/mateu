# The Python twin (mateu-ui): @fab(icon, label, order) on a page method.
from mateu_ui.uidl import Message, MessageVariant, fab, title, ui


@ui("rooms")
@title("Rooms to clean")
class RoomBoard:
    next: str = "214"

    @fab("vaadin:plus", "Report an incident", 0)
    def report_incident(self) -> Message:
        return Message(f"Incident reported for room {self.next}", MessageVariant.WARNING)

    @fab("vaadin:check", "Mark clean", 1)
    def mark_clean(self) -> Message:
        return Message(f"Room {self.next} marked clean")
