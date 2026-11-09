# The Python twin (mateu-ui): the widget from the annotation type; Stereotype("…") for another one.
from datetime import date, datetime, time
from typing import Annotated

from mateu_ui.uidl import Message, Password, SliderMax, SliderMin, Stereotype, button, title, ui


@ui("every-basic-field")
@title("Every basic field")
class EveryBasicField:
    text: str = "Hello"
    integer: int = 42
    decimal: float = 3.14
    flag: bool = True
    a_date: date = date(2026, 11, 8)
    a_time: time = time(9, 30)
    date_time: datetime = datetime(2026, 11, 8, 9, 30)

    email: Annotated[str, Stereotype("email")] = "ada@example.com"
    password: Annotated[str, Password()] = "secret"
    notes: Annotated[str, Stereotype("textarea")] = ""
    active: Annotated[bool, Stereotype("toggle")] = True
    rating: Annotated[int, Stereotype("stars")] = 4
    volume: Annotated[int, Stereotype("slider"), SliderMin(0), SliderMax(100)] = 30

    @button()
    def show(self) -> Message:
        return Message(f"integer={self.integer} date={self.a_date} rating={self.rating} volume={self.volume}")
