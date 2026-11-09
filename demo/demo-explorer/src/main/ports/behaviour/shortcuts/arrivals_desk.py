# The Python twin (mateu-ui): @shortcut on an action, OnRowSelected(..., shortcut=...) on a grid.
from dataclasses import dataclass
from typing import Annotated

from mateu_ui.uidl import Message, OnRowSelected, ReadOnly, button, shortcut, title, ui


@dataclass
class Arrival:
    guest: str
    room: str


@ui("arrivals")
@title("Arrivals")
class ArrivalsDesk:
    selected: Annotated[str, ReadOnly()] = "none"
    arrivals: Annotated[list[Arrival], ReadOnly(), OnRowSelected("pick", shortcut="ctrl+shift")] = [
        Arrival("Ada Lovelace", "214"), Arrival("Alan Turing", "118"), Arrival("Grace Hopper", "305"),
    ]

    @button()
    @shortcut("ctrl+alt+c")
    def check_in(self) -> Message:
        return Message(f"Checked in {self.selected}")

    def pick(self, arrival: Arrival):
        self.selected = arrival.guest
        return self
