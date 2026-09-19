package io.mateu.sample1.app;

import io.mateu.core.infra.declarative.orchestrators.dashboard.Dashboard;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.Text;

/**
 * A Dashboard archetype (coherence-plan #9): consecutive MetricCard fields group into a Scoreboard
 * band, a @Panel component field becomes a titled tile. Consolidated onto the one ResponsiveGrid —
 * backs the layout e2e (layout-sizing.spec.ts) which asserts it renders as a grid with the KPIs and
 * the panel.
 */
@UI("/dashboard-grid")
@Title("Ops dashboard")
public class DashboardDemo extends Dashboard {

  MetricCard revenue = MetricCard.builder().title("Revenue").value("1.2").unit("M€").build();

  MetricCard occupancy = MetricCard.builder().title("Occupancy").value("87%").build();

  @Panel(title = "Notes")
  Text notes = new Text("notes-text", "All systems nominal");

  @Override
  protected int columns() {
    return 3;
  }
}
