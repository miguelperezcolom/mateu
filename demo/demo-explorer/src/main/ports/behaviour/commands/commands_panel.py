# The Python twin (mateu-ui): commands are flow steps — Navigate, Announce… (a list returns several).
# The port has no SetWindowTitle step.
from mateu_ui.uidl import Announce, Navigate, button, title, ui


@ui("commands")
@title("Commands")
class CommandsPanel:
    @button("navigateTo")
    def navigate(self):
        return Navigate("/behaviour/forms/rules")

    @button("Announce")
    def announce(self):
        return [Announce("Three new arrivals"), Announce("Room 214 is not ready", assertive=True)]
