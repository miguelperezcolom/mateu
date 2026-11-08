package io.mateu.explorer.examples.components.kpis;

import io.mateu.uidl.data.ComparisonCard;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Meter;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.MetricTrend;
import io.mateu.uidl.data.Scoreboard;
import io.mateu.uidl.data.Stat;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * KPIs in Java. A MetricCard or a Stat with an {@code actionId} is clickable — press "Arrivals" or
 * "Room revenue": the method of that name runs on the server (a drill-in).
 */
public class FrontDeskKpis implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .content(
            List.of(
                Scoreboard.builder()
                    .metrics(
                        List.of(
                            MetricCard.builder()
                                .title("Arrivals")
                                .value("42")
                                .trend(MetricTrend.up)
                                .trendLabel("+6 vs yesterday")
                                .timeframe("Today")
                                .actionId("openArrivals")
                                .build(),
                            MetricCard.builder().title("In house").value("196").unit("guests").timeframe("Now").build()))
                    .build(),
                HorizontalLayout.builder()
                    .spacing(true)
                    .wrap(true)
                    .content(
                        List.of(
                            Stat.builder()
                                .label("Room revenue")
                                .value("184,320")
                                .unit("€")
                                .delta("+12%")
                                .trend("up")
                                .spark(List.of(120.0, 135.0, 128.0, 150.0, 162.0, 171.0, 184.0))
                                .actionId("openRevenue")
                                .build(),
                            Meter.builder()
                                .label("Credit used")
                                .value(1180.0)
                                .max(1500.0)
                                .unit("€")
                                .warnAt(1050.0)
                                .dangerAt(1350.0)
                                .style("min-width: 16rem;")
                                .build()))
                    .build(),
                ComparisonCard.builder()
                    .title("ADR")
                    .leftLabel("Nov 2025")
                    .leftValue("€ 131")
                    .rightLabel("Nov 2026")
                    .rightValue("€ 142")
                    .delta("+8.4%")
                    .trend("up")
                    .build()))
        .build();
  }

  public Message openArrivals() {
    return new Message("42 arrivals today — 9 already checked in");
  }

  public Message openRevenue() {
    return new Message("Room revenue by segment: direct 41%, OTA 38%, corporate 21%");
  }
}
