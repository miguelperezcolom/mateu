# The Python twin (mateu-ui): Message with a variant (ERROR stays), Message.undoable(text,
# action_id, parameters) and an @action undo target that reads them from the request.
from mateu_ui.core import RunActionRq
from mateu_ui.uidl import Message, MessageVariant, action, button, title, ui

ROOM_214 = {"status": "Dirty"}


@ui("housekeeping")
@title("Housekeeping")
class HousekeepingBoard:
    @button()
    def success(self) -> Message:
        return Message("Room 118 inspected")

    @button()
    def error(self) -> Message:
        return Message("The minibar sensor of 214 is offline", MessageVariant.ERROR)

    @button()
    def mark_clean(self) -> Message:
        ROOM_214["status"] = "Clean"
        return Message.undoable("Room 214 marked clean", "restore", {"status": "Dirty"})

    @action
    def restore(self, request: RunActionRq) -> Message:
        ROOM_214["status"] = (request.parameters or {}).get("status")
        return Message(f"Room 214 is {ROOM_214['status']} again")
