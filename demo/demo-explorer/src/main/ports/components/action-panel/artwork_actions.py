# The Python twin (mateu-ui): an "I want to…" panel; each item runs the method named by its action_id.
from mateu_ui.core import RunActionRq
from mateu_ui.uidl import ComponentTreeSupplier, Message, action, ui
from mateu_ui.uidl import components as fluent


@ui("artwork-actions")
class ArtworkActions(ComponentTreeSupplier):
    def component(self):
        return fluent.ActionPanel(
            label="I want to…",
            shortcut="ctrl+i",
            hide_unpopulated_toggle=True,
            categories=(
                fluent.ActionPanelCategory(title="Loans", actions=(
                    fluent.ActionPanelItem(label="Review open requests", action_id="openLoans",
                                           parameters={"status": "open"}, count=3, populated=True),
                    fluent.ActionPanelItem(label="Print the courier sheet", action_id="print"),
                )),
                fluent.ActionPanelCategory(title="Conservation", actions=(
                    fluent.ActionPanelItem(label="Overdue checks", action_id="openChecks", count=27, populated=True),
                )),
            ),
        )

    @action
    def open_loans(self, request: RunActionRq) -> Message:
        return Message(f"Loans filtered by {(request.parameters or {}).get('status')}")

    @action
    def print(self) -> Message:
        return Message("Sending the courier sheet to the printer…")

    @action
    def open_checks(self) -> Message:
        return Message("27 checks are overdue.")
