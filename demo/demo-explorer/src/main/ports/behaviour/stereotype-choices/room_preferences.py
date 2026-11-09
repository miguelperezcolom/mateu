# The Python twin (mateu-ui): the same inference (≤ 4 constants → radios), the same humanised
# constant names; an enum's own __str__ wins.
from enum import Enum
from typing import Annotated

from mateu_ui.uidl import Message, UseRadioButtons, button, title, ui


class Bed(Enum):
    SINGLE = "SINGLE"
    DOUBLE = "DOUBLE"
    TWIN_BEDS = "TWIN_BEDS"


class Floor(Enum):
    GROUND = "GROUND"
    FIRST = "FIRST"
    SECOND = "SECOND"
    THIRD = "THIRD"
    FOURTH = "FOURTH"
    TOP = "TOP"

    def __str__(self):
        return "Penthouse ✨" if self is Floor.TOP else super().__str__()


@ui("room-preferences")
@title("Room preferences")
class RoomPreferences:
    bed: Bed = Bed.DOUBLE
    floor: Floor = Floor.FIRST
    alternative_floor: Annotated[Floor | None, UseRadioButtons()] = None

    @button()
    def save(self) -> Message:
        return Message(f"Bed {self.bed.name}, floor {self.floor.name}")
