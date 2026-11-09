package io.mateu.explorer.examples.behaviour.autopage;

import io.mateu.uidl.annotations.AutoPage;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.MetricTrend;
import io.mateu.uidl.data.Text;

/**
 * A plain class — no {@code Dashboard} superclass — that only DECLARES metric cards and a panel.
 * Page-level inference sees a dashboard and composes one: the cards become the KPI band, the
 * {@code @Panel} a tile. A card's {@code actionId} still runs this class's method.
 */
@Title("Front desk board")
@AutoPage
public class FrontDeskBoard {

  MetricCard arrivals =
      MetricCard.builder()
          .title("Arrivals")
          .value("12")
          .trend(MetricTrend.up)
          .timeframe("today")
          .actionId("openArrivals")
          .build();

  MetricCard departures =
      MetricCard.builder().title("Departures").value("9").timeframe("today").build();

  @Panel(title = "Notes")
  Text notes = new Text("Two VIPs arriving at noon.");

  public Message openArrivals() {
    return Message.success("Drilling into today's 12 arrivals");
  }
}
