# The Python twin (mateu-ui): the same archetype — switcher_options/load pick the record, overview
# draws it and info is the side panel. (No record_label hook in Python yet: the switcher is unlabelled.)
from dataclasses import dataclass

from mateu_ui.uidl import GeneralOverview, ui
from mateu_ui.uidl.components import (
    BulletedList, Card, ChipItem, EntityHeader, Fact, Text, VerticalLayout,
)


@dataclass(frozen=True)
class Museum:
    id: str
    name: str
    city: str
    status: str
    works: int
    visitors: str
    news: tuple[str, ...]


MUSEUMS = [
    Museum("met", "The Met", "New York", "Open", 1820, "26,400",
           ("New wing for arms and armour", "Monet loan returned from SMK")),
    Museum("smk", "SMK", "Copenhagen", "Open", 640, "9,800", ("Water Lilies on loan until January",)),
    Museum("cma", "Cleveland Museum of Art", "Cleveland", "Partly closed", 910, "12,010",
           ("Gallery 6 closed for installation", "Open access images updated")),
]


@ui("general-overview")
class MuseumOverview(GeneralOverview):
    def switcher_options(self):
        return [(m.id, m.name) for m in MUSEUMS]

    def load(self, record_id):
        return next((m for m in MUSEUMS if m.id == record_id), None)

    def overview(self, museum):
        return VerticalLayout(spacing=True, content=(
            EntityHeader(
                title=museum.name,
                subtitle=museum.city,
                badges=(ChipItem(label=museum.status,
                                 color="success" if museum.status == "Open" else "warning"),),
                facts=(Fact(label="Works", value=str(museum.works)),),
                metric_label="Visitors this month",
                metric_value=museum.visitors,
            ),
            Card(title=Text(text="About"),
                 content=Text(text=f"{museum.name} lends and borrows through the network.")),
        ))

    def info(self, museum):
        """The complementary side panel of the template; display() can switch it off."""
        return Card(title=Text(text="Recent news"), content=BulletedList(id="news", items=museum.news))
