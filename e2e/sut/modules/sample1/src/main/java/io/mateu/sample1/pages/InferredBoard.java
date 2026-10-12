package io.mateu.sample1.pages;

import io.mateu.uidl.annotations.AutoPage;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.MetricTrend;
import io.mateu.uidl.data.Text;

/**
 * A plain class that only DECLARES data: @AutoPage composes it into a dashboard (no archetype
 * subclass). e2e/tests/shared/archetypes.spec.ts: it renders as one, names the window from its
 * own @Title and its metric drills in.
 */
@UI("/arch/auto-page")
@Title("Operations board")
@AutoPage
public class InferredBoard {

  public MetricCard arrivals =
      MetricCard.builder()
          .title("Arrivals")
          .value("12")
          .trend(MetricTrend.up)
          .actionId("openArrivals")
          .build();

  public MetricCard departures = MetricCard.builder().title("Departures").value("9").build();

  @Panel(title = "Notes")
  public Text notes = new Text("Two VIPs arriving at noon");

  public Message openArrivals() {
    return Message.success("Arrivals drill-in");
  }
}
