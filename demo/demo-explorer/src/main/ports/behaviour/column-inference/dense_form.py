# The Python twin (mateu-ui): the same inference (1 column up to 6 fields, 2 from 7) and the same
# @form_layout(columns, labels_aside) declaration.
from mateu_ui.uidl import form_layout, title, ui


@ui("dense-form")
@title("Dense form — labels aside")
@form_layout(columns=1)
class DenseForm:
    name: str = ""
    email: str = ""
    phone: str = ""
    company: str = ""
    city: str = ""
    country: str = ""
