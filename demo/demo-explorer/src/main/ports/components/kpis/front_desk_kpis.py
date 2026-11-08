# The Python twin (mateu-ui): the same KPIs as a component tree. A MetricCard or a Stat with an
# action_id is clickable; the method of that name (snake_case) runs on the server.
from mateu_ui.uidl import ComponentTreeSupplier, Message, title, ui
from mateu_ui.uidl.components import (
    ComparisonCard, Meter, MetricCard, MetricTrend, Scoreboard, Stat, VerticalLayout,
)


@ui("front-desk-kpis")
@title("Front desk")
class FrontDeskKpis(ComponentTreeSupplier):
    def component(self) -> VerticalLayout:
        return VerticalLayout(
            spacing=True,
            content=(
                Scoreboard(metrics=(
                    MetricCard(title="Arrivals", value="42", trend=MetricTrend.up,
                               trend_label="+6 vs yesterday", timeframe="Today",
                               action_id="openArrivals"),
                    MetricCard(title="In house", value="196", unit="guests", timeframe="Now"),
                )),
                Stat(label="Room revenue", value="184,320", unit="€", delta="+12%", trend="up",
                     spark=(120, 135, 128, 150, 162, 171, 184), action_id="openRevenue"),
                Meter(label="Credit used", value=1180, max=1500, unit="€", warn_at=1050, danger_at=1350),
                ComparisonCard(title="ADR", left_label="Nov 2025", left_value="€ 131",
                               right_label="Nov 2026", right_value="€ 142", delta="+8.4%", trend="up"),
            ),
        )

    def open_arrivals(self) -> Message:
        return Message("42 arrivals today — 9 already checked in")

    def open_revenue(self) -> Message:
        return Message("Room revenue by segment: direct 41%, OTA 38%, corporate 21%")
