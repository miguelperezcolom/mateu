# The Python twin (mateu-ui): Listing[T] plus the capabilities it declares as base classes —
# search, view, create and delete, no Editable, so no Edit button and no route for one.
import re
from dataclasses import dataclass

from mateu_ui.uidl import (
    Creatable, Deletable, Listing, ListingData, Navigable, Searchable, title, ui,
)


@dataclass
class Lender:
    id: str = ""
    name: str = ""
    city: str = ""
    active_loans: int = 0


LENDERS = [
    Lender("smk", "SMK — Statens Museum for Kunst", "Copenhagen", 3),
    Lender("orsay", "Musée d'Orsay", "Paris", 2),
    Lender("bm", "British Museum", "London", 1),
]


@ui("crud")
@title("Lending institutions")
class LenderListing(Listing[Lender], Searchable, Navigable[Lender, str],
                    Creatable[Lender, str], Deletable[str]):
    def search(self, request, http=None):
        text = request.search_text.lower()
        return ListingData.of(l for l in LENDERS if text in f"{l.name} {l.city}".lower())

    def view(self, id, http=None):
        return next(l for l in LENDERS if l.id == id)

    def creation_form(self, http=None):
        return Lender()

    def create(self, form, http=None):
        form.id = re.sub("[^a-z]", "", form.name.lower())
        LENDERS.append(form)
        return form.id

    def delete_all_by_id(self, selected_ids, http=None):
        LENDERS[:] = [l for l in LENDERS if l.id not in selected_ids]
