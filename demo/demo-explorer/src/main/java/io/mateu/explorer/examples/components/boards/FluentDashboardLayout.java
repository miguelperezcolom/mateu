package io.mateu.explorer.examples.components.boards;

import io.mateu.uidl.data.DashboardLayout;
import io.mateu.uidl.data.DashboardPanel;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.MetricTrend;
import io.mateu.uidl.data.Stat;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * A DashboardLayout in Java. The MetricCard names an {@code actionId}: because this view has a
 * public method of that name, the tile is clickable and the method runs on the server.
 */
public class FluentDashboardLayout implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return DashboardLayout.builder()
        .columns(3)
        .items(
            List.of(
                MetricCard.builder()
                    .title("Occupancy")
                    .value("87%")
                    .trend(MetricTrend.up)
                    .trendLabel("+4 pts")
                    .timeframe("Tonight")
                    .actionId("openOccupancy")
                    .build(),
                DashboardPanel.builder()
                    .title("Revenue")
                    .subtitle("This month")
                    .colSpan(2)
                    .content(
                        Stat.builder()
                            .label("Room revenue")
                            .value("184,320")
                            .unit("€")
                            .delta("+12%")
                            .trend("up")
                            .spark(List.of(120.0, 135.0, 128.0, 150.0, 162.0, 171.0, 184.0))
                            .build())
                    .build()))
        .build();
  }

  public Message openOccupancy() {
    return new Message("Drilling into occupancy: 174 of 200 rooms sold tonight");
  }
}
