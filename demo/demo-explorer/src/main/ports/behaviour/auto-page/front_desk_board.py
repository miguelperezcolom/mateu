# The Python twin (mateu-ui): a plain class (no Dashboard base) whose MetricCard fields make page
# inference compose a dashboard; @auto_page makes it explicit.
from typing import Annotated

from mateu_ui.uidl import Message, Panel, auto_page, title, ui
from mateu_ui.uidl.components import MetricCard, MetricTrend, Text


@ui("front-desk-board")
@title("Front desk board")
@auto_page
class FrontDeskBoard:
    arrivals: MetricCard = MetricCard(
        title="Arrivals", value="12", trend=MetricTrend.up, timeframe="today", action_id="openArrivals"
    )
    departures: MetricCard = MetricCard(title="Departures", value="9", timeframe="today")
    notes: Annotated[Text, Panel("Notes")] = Text(text="Two VIPs arriving at noon.")

    def open_arrivals(self) -> Message:
        return Message("Drilling into today's 12 arrivals")
