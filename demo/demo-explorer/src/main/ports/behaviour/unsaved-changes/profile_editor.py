# The Python twin (mateu-ui): @confirm_on_navigation_if_dirty; an action settles the guard by
# returning the MarkClean / MarkDirty flow steps.
from mateu_ui.uidl import button, confirm_on_navigation_if_dirty, title, ui
from mateu_ui.uidl.flow import MarkClean, MarkDirty


@ui("profile")
@title("Profile")
@confirm_on_navigation_if_dirty
class ProfileEditor:
    name: str | None = "Ada Lovelace"
    email: str | None = "ada@example.com"

    @button()
    def save(self):
        return MarkClean()

    @button()
    def mark_dirty(self):
        return MarkDirty()
