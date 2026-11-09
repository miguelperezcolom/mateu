# The Python twin (mateu-ui): the same archetype — Button fields are the hero's calls to action,
# Panel(...) fields the highlight tiles; the hero_* methods are the hooks.
from typing import Annotated

from mateu_ui.uidl import HeroTone, Message, MessageVariant, Panel, Welcome, ui
from mateu_ui.uidl.components import Button, Markdown


@ui("welcome")
class MuseumWelcome(Welcome):
    visit: Button = Button(label="Plan your visit", action_id="planVisit", button_style="primary")
    collection: Button = Button(label="Browse the collection", action_id="browse")

    hours: Annotated[Markdown, Panel("Open today")] = Markdown(
        markdown="10:00 – 18:00 · late opening on Fridays until 21:00")
    on_view: Annotated[Markdown, Panel("On view")] = Markdown(
        markdown="**Impressions of light** — 64 paintings, until 12 January")
    members: Annotated[Markdown, Panel("Members")] = Markdown(
        markdown="Free entry, previews and 10% in the shop.")

    def hero_overline(self):
        return "Good morning"

    def hero_title(self):
        return "Welcome to the City Museum"

    def hero_subtitle(self):
        return "Five thousand years of art, three floors, one afternoon"

    def hero_tone(self):
        return HeroTone.plum

    def plan_visit(self) -> Message:
        return Message("Your visit planner would open here.", MessageVariant.SUCCESS)

    def browse(self) -> Message:
        return Message("The collection would open here.", MessageVariant.INFO)
