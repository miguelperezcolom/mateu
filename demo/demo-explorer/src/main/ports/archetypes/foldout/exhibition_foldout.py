# The Python twin (mateu-ui): the same archetype — the overview, Panel(...) fold-out panels
# (open=False starts folded, panel_summary fills the folded strip) and the navigation header.
from typing import Annotated

from mateu_ui.uidl import Foldout, Message, MessageVariant, Panel, title, ui
from mateu_ui.uidl.components import Chart, ChartData, ChartDataset, FoldoutNavigation, Markdown, Text


@ui("foldout")
@title("Impressions of light")
class ExhibitionFoldout(Foldout):
    overview: Markdown = Markdown(markdown="""\
**Impressions of light**
Galleries 5–6 · 12 Jan – 30 Apr 2027

64 works · 11 lenders · curator: A. Lindqvist
""")

    works: Annotated[Chart, Panel("Works", subtitle="By lender")] = Chart(
        chart_type="bar",
        chart_data=ChartData(
            labels=("Own collection", "SMK", "Musée d'Orsay", "Others"),
            datasets=(ChartDataset(label="Works", data=(31, 12, 9, 12)),),
        ),
    )

    budget: Annotated[Markdown, Panel("Budget", open=False)] = Markdown(
        markdown="Spent **€182,000** of €240,000 (76%).")

    risks: Annotated[Markdown, Panel("Risks", open=False)] = Markdown(
        markdown="- Courier strike in January\n- Gallery 6 humidity")

    def panel_summary(self, panel_field_name):
        return {"budget": Text(text="76% spent"), "risks": Text(text="2 open")}.get(panel_field_name)

    def navigation_header(self):
        return FoldoutNavigation(
            title="Impressions of light",
            parent_label="Exhibitions",
            parent_action_id="toExhibitions",
            previous_action_id="previousExhibition",
            next_action_id="nextExhibition",
        )

    def to_exhibitions(self) -> Message:
        return Message("Would go back to the exhibitions list", MessageVariant.INFO)

    def previous_exhibition(self) -> Message:
        return Message("Previous exhibition: Dutch drawings", MessageVariant.INFO)

    def next_exhibition(self) -> Message:
        return Message("Next exhibition: Hokusai's Fuji", MessageVariant.INFO)
