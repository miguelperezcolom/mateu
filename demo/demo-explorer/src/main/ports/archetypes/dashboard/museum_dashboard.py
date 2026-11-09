# The Python twin (mateu-ui): the same archetype — MetricCard fields form the KPI band,
# Panel(...) fields the tiles; a card's action_id runs the method of that name.
from typing import Annotated

from mateu_ui.uidl import Dashboard, Message, Panel, title, ui
from mateu_ui.uidl.components import Chart, ChartData, ChartDataset, MetricCard, MetricTrend


@ui("dashboard")
@title("Museum operations")
class MuseumDashboard(Dashboard):
    visitors: MetricCard = MetricCard(
        title="Visitors", value="48,210", trend=MetricTrend.up, trend_label="+6% vs last month",
        timeframe="This month", action_id="drillIntoVisitors",
    )
    loans: MetricCard = MetricCard(title="Active loans", value="37", timeframe="Today")

    per_museum: Annotated[Chart, Panel("Visitors per museum", subtitle="Last 30 days", col_span=2)] = Chart(
        chart_type="bar",
        chart_data=ChartData(
            labels=("The Met", "SMK", "Cleveland"),
            datasets=(ChartDataset(label="Visitors", data=(26400, 9800, 12010)),),
        ),
    )

    def drill_into_visitors(self) -> Message:
        return Message("Drilling into visitors…")
