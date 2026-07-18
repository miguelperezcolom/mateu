package io.mateu.mdd.redwoodshowcase.ui.dashboard;

import io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.MetricTrend;

/**
 * Demo of the declarative {@link Dashboard} archetype on the Redwood renderer: consecutive
 * {@link MetricCard} fields become a scoreboard band, and {@code @Panel} component fields become
 * titled tiles on a responsive grid.
 */
@UI("/dashboard")
@Title("Overview")
public class OverviewDashboard extends Dashboard {

    MetricCard occupancy =
            MetricCard.builder()
                    .title("Occupancy")
                    .value("87")
                    .unit("%")
                    .trend(MetricTrend.up)
                    .trendLabel("+4 pts vs last week")
                    .icon("vaadin:bed")
                    .build();

    MetricCard revenue =
            MetricCard.builder()
                    .title("Revenue")
                    .value("128")
                    .unit("k€")
                    .trend(MetricTrend.up)
                    .trendLabel("+9% MoM")
                    .icon("vaadin:euro")
                    .build();

    MetricCard adr =
            MetricCard.builder()
                    .title("ADR")
                    .value("142")
                    .unit("€")
                    .trend(MetricTrend.neutral)
                    .trendLabel("stable")
                    .icon("vaadin:chart")
                    .build();

    MetricCard complaints =
            MetricCard.builder()
                    .title("Open complaints")
                    .value("3")
                    .trend(MetricTrend.down)
                    .trendLabel("-2 vs yesterday")
                    .icon("vaadin:comment")
                    .build();

    @Panel(title = "Today at a glance", colSpan = 2)
    Markdown today =
            Markdown.builder()
                    .markdown(
                            """
                            ### Arrivals & departures
                            - **24** check-ins expected
                            - **19** check-outs pending
                            - **6** rooms in maintenance

                            Housekeeping is on track; front desk staffed at full capacity.
                            """)
                    .build();

    @Panel(title = "Notes")
    Markdown notes =
            Markdown.builder()
                    .markdown(
                            """
                            The Ocean-facing suites are fully booked for the weekend.
                            Consider opening the Penthouse for walk-ins.
                            """)
                    .build();
}
