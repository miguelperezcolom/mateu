# The Python twin (mateu-ui): the ActionPanel component in a component tree; items dispatch their
# action_id (with parameters) to the view's @action methods.
from mateu_ui.core import RunActionRq
from mateu_ui.uidl import ComponentTreeSupplier, Message, action, title, ui
from mateu_ui.uidl.components import ActionPanel, ActionPanelCategory, ActionPanelItem


@ui("reservation-actions")
@title("Reservation ABC123")
class ReservationActions(ComponentTreeSupplier):
    def component(self):
        return ActionPanel(
            label="I want to…",
            shortcut="ctrl+i",
            categories=(
                ActionPanelCategory("Stay", (
                    ActionPanelItem("Change dates", "act", {"what": "change dates"}),
                    ActionPanelItem("Upgrade room", "act", {"what": "upgrade the room"}, populated=True),
                )),
                ActionPanelCategory("Billing", (
                    ActionPanelItem("Open folios", "act", {"what": "open the folios"}, count=3),
                )),
            ),
        )

    @action
    def act(self, request: RunActionRq) -> Message:
        return Message(f"You chose to {(request.parameters or {}).get('what')}")
