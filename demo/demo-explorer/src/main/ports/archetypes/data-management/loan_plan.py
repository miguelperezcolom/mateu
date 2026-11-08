# The Python twin (mateu-ui): the same archetype — a grid view and a Gantt view with a toolbar
# switcher, plus the end and bottom DockedPanels the toolbar toggles.
from dataclasses import dataclass
from datetime import date

from mateu_ui.uidl import DataManagement, DockedPanel, ui
from mateu_ui.uidl.components import Gantt, GanttTask, Markdown, Text


@dataclass(frozen=True)
class Loan:
    id: str
    artwork: str
    borrower: str
    out: date
    back: date
    progress: int


LOANS = [
    Loan("l1", "Water Lilies", "SMK", date(2026, 9, 1), date(2027, 1, 15), 60),
    Loan("l2", "The Great Wave", "British Museum", date(2026, 10, 10), date(2027, 3, 30), 25),
    Loan("l3", "Melencolia I", "Albertina", date(2026, 11, 1), date(2027, 2, 10), 10),
    Loan("l4", "Self-Portrait", "Van Gogh Museum", date(2026, 12, 1), date(2027, 6, 1), 0),
]


@ui("data-management")
class LoanPlan(DataManagement):
    def grid_label(self):
        return "Table"

    def gantt_label(self):
        return "Timeline"

    # No fluent Grid component in mateu_ui yet: the table view is a Markdown table.
    def grid_view(self):
        rows = "".join(f"| {l.artwork} | {l.borrower} | {l.out} | {l.back} |\n" for l in LOANS)
        return Markdown(markdown="| Artwork | Borrower | Leaves | Returns |\n|---|---|---|---|\n" + rows)

    def gantt_view(self):
        return Gantt(tasks=tuple(
            GanttTask(id=l.id, title=f"{l.artwork} → {l.borrower}", start=l.out, end=l.back,
                      progress=l.progress)
            for l in LOANS
        ))

    def end_panel(self):
        return DockedPanel(id="summary", title="Summary", size="18rem", open=True,
                           content=Text(text="4 loans out · 2 return before March."))

    def bottom_panel(self):
        return DockedPanel(id="log", title="Activity", size="8rem", open=False,
                           content=Text(text="09:12 Ana extended “Water Lilies” to 15 January."))
