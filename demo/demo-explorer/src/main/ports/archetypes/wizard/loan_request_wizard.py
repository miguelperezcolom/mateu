# The Python twin (mateu-ui): steps are NUMBERED Step(n) fields of the wizard itself; the hooks are
# step_skippable, before_step_navigate, Draftable and @wizard_completion_action(available_from_step).
# No step_applies (branching) hook in Python yet: the insurance step always shows, so its insurer
# is not required here.
from enum import Enum
from typing import Annotated

from mateu_ui.uidl import (
    Draftable, Message, MessageVariant, PlainText, Required, Step, Wizard, title, ui,
    wizard_completion_action, wizard_progress,
)


class Scope(Enum):
    NATIONAL = "NATIONAL"
    INTERNATIONAL = "INTERNATIONAL"


@ui("wizard")
@title("Request a loan")
@wizard_progress("rail")
class LoanRequestWizard(Wizard, Draftable):
    artwork: Annotated[str, Step(1), Required()] = "Water Lilies"
    scope: Annotated[Scope, Step(1), Required()] = Scope.NATIONAL

    institution: Annotated[str | None, Step(2), Required()] = None
    contact_email: Annotated[str | None, Step(2)] = None

    insurer: Annotated[str | None, Step(3)] = None
    policy_number: Annotated[str | None, Step(3)] = None

    notes: Annotated[str | None, Step(4)] = None

    result: Annotated[str, Step(5), PlainText()] = ""

    def step_title(self, step):
        return {1: "Artwork", 2: "Borrower", 3: "Insurance", 4: "Notes", 5: "Done"}.get(step)

    def step_skippable(self, step):
        return step == 4

    def before_step_navigate(self, from_step, to_step):
        if from_step == 2 and self.institution and "blocked" in self.institution.lower():
            return Message("That institution is not on the lenders' register", MessageVariant.ERROR)
        return None

    def save_draft(self):
        return Message(f"Draft saved for “{self.artwork}”", MessageVariant.SUCCESS)

    @wizard_completion_action("Send request", available_from_step=4)
    def send(self):
        self.result = f"Request sent: “{self.artwork}” to {self.institution}."
        return None
