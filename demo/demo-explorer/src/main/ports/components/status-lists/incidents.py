# The Python twin (mateu-ui): a StatusList, a Ledger and a ProcessMonitor as a component tree.
# A row's action and the process's fix button run the methods of those names.
from mateu_ui.uidl import ComponentTreeSupplier, Message, title, ui
from mateu_ui.uidl.components import (
    Ledger, LedgerLine, ProcessItem, ProcessMonitor, StatusItem, StatusList, VerticalLayout,
)


@ui("incidents")
@title("Incidents")
class Incidents(ComponentTreeSupplier):
    def component(self) -> VerticalLayout:
        return VerticalLayout(
            spacing=True,
            content=(
                StatusList(items=(
                    StatusItem(id="305", icon="🔧", title="Room 305 — air conditioning",
                               description="Reported 08:40", status="Open", status_color="error",
                               action_label="Assign", action_id="assign"),
                    StatusItem(id="118", icon="💧", title="Room 118 — leaking tap",
                               description="Plumber on the way", status="In progress",
                               status_color="warning"),
                )),
                Ledger(currency="€", total_label="Balance due", lines=(
                    LedgerLine(concept="Room 102 — 3 nights", amount=1140),
                    LedgerLine(concept="Breakfast", included=True, included_label="Included"),
                    LedgerLine(concept="Deposit", amount=-250),
                )),
                ProcessMonitor(items=(
                    ProcessItem(id="export", name="Invoice export", systems=("PMS", "ERP"), ok=88,
                                errors=4, status="error", action_label="Retry", action_id="retryExport"),
                )),
            ),
        )

    def assign(self) -> Message:
        return Message("Assigned to maintenance")

    def retry_export(self) -> Message:
        return Message("Invoice export re-queued: 4 invoices")
