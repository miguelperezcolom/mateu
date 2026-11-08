# The Python twin (mateu-ui): the same archetype — typed facets from the filters class (a text, a
# set[Enum] multi-select, a DateRange) and pre_search_content until the first search.
from dataclasses import dataclass
from datetime import date
from enum import Enum

from mateu_ui.uidl import DateRange, ListingData, SmartSearchPage, ui
from mateu_ui.uidl.components import EmptyState


class Classification(Enum):
    PAINTING = "PAINTING"
    SCULPTURE = "SCULPTURE"
    PRINT = "PRINT"
    PHOTOGRAPH = "PHOTOGRAPH"


class Filters:
    borrower: str | None = None
    classifications: set[Classification] | None = None
    returns: DateRange | None = None


@dataclass
class Loan:
    id: str = ""
    artwork: str = ""
    classification: Classification | None = None
    borrower: str = ""
    returns: date | None = None


LOANS = [
    Loan("L-101", "Water Lilies", Classification.PAINTING, "SMK Copenhagen", date(2027, 1, 15)),
    Loan("L-102", "The Thinker (cast)", Classification.SCULPTURE, "Cleveland Museum", date(2026, 12, 2)),
    Loan("L-103", "The Great Wave", Classification.PRINT, "British Museum", date(2027, 3, 30)),
    Loan("L-104", "Migrant Mother", Classification.PHOTOGRAPH, "MoMA", date(2026, 11, 20)),
    Loan("L-105", "Self-Portrait", Classification.PAINTING, "Van Gogh Museum", date(2027, 6, 1)),
    Loan("L-106", "Melencolia I", Classification.PRINT, "Albertina", date(2027, 2, 10)),
]


@ui("smart-search-page")
class LoanFinder(SmartSearchPage[Filters, Loan]):
    def page_subtitle(self):
        return "Outgoing loans — search by artwork, borrower, classification or return date"

    def pre_search_content(self):
        return EmptyState(icon="🔎", title="Search to get started",
                          description="Press Enter on an empty box to list every loan.")

    def search(self, request, http=None):
        text = request.search_text.lower()
        f = self.filters(request)
        return ListingData.of(
            l for l in LOANS
            if text in f"{l.artwork} {l.borrower}".lower()
            and (f is None or not f.borrower or f.borrower.lower() in l.borrower.lower())
            and (f is None or not f.classifications or l.classification in f.classifications)
            and (f is None or f.returns is None or f.returns.is_empty or f.returns.contains(l.returns))
        )
