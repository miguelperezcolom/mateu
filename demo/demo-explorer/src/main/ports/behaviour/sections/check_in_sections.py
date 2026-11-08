# The Python twin (mateu-ui): Section(...) markers with property_list / frameless
# (the port has no columns / sticky).
from typing import Annotated

from mateu_ui.uidl import Section, title, ui

GUEST = Section("Guest")
DOCUMENT = Section("Document", property_list=True)


@ui("check-in")
@title("Check-in")
class CheckInSections:
    first_name: Annotated[str, GUEST] = "Ada"
    last_name: Annotated[str, GUEST] = "Lovelace"
    email: Annotated[str, GUEST] = "ada@example.com"
    document_type: Annotated[str, DOCUMENT] = "Passport"
    document_number: Annotated[str, DOCUMENT] = "X1234567"
    notes: Annotated[str, Section("Notes")] = ""
