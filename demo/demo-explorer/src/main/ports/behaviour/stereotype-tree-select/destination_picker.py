# The Python twin (mateu-ui): TreeSelect() + an options() method whose options carry children.
from typing import Annotated

from mateu_ui.dtos import Option
from mateu_ui.uidl import Message, TreeSelect, button, title, ui


@ui("destination")
@title("Destination")
class DestinationPicker:
    region: Annotated[str, TreeSelect()] = ""
    island: Annotated[str, TreeSelect(leaves_only=True)] = ""

    def options(self, field_name):
        return [
            Option(value="es", label="Spain", children=[
                Option(value="baleares", label="Balearic Islands", children=[
                    Option(value="mallorca", label="Mallorca"), Option(value="menorca", label="Menorca")]),
                Option(value="canarias", label="Canary Islands", children=[
                    Option(value="tenerife", label="Tenerife"), Option(value="lanzarote", label="Lanzarote")]),
            ]),
            Option(value="pt", label="Portugal", children=[
                Option(value="madeira", label="Madeira"), Option(value="azores", label="Azores")]),
        ]

    @button()
    def go(self) -> Message:
        return Message(f"Region: {self.region} · island: {self.island}")
