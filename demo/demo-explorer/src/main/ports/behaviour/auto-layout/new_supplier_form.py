# The Python twin (mateu-ui): @auto_layout applies the same rules and thresholds as Java.
from typing import Annotated

from mateu_ui.uidl import Multiline, Required, auto_layout, title, ui


@ui("new-supplier")
@title("New supplier")
@auto_layout
class NewSupplierForm:
    name: Annotated[str | None, Required()] = None
    email: Annotated[str | None, Required()] = None
    phone: Annotated[str | None, Required()] = None
    delivery_notes: Annotated[str | None, Multiline()] = None
    billing_notes: Annotated[str | None, Multiline()] = None
    internal_notes: Annotated[str | None, Multiline()] = None
    certifications: Annotated[str | None, Multiline()] = None
    website: str | None = None
