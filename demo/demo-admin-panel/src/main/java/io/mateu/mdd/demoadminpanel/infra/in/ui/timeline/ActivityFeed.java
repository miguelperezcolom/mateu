package io.mateu.mdd.demoadminpanel.infra.in.ui.timeline;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Timeline;
import io.mateu.uidl.data.TimelineItem;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link Timeline} component: an order's activity feed. */
@UI("/timeline-demo")
@Title("Order activity")
public class ActivityFeed {

  @Section("History")
  Component feed =
      Timeline.builder()
          .items(
              List.of(
                  TimelineItem.builder()
                      .title("Order placed")
                      .description("3 items · 84.50 €")
                      .timestamp("Mar 3 · 09:02")
                      .icon("🛒")
                      .color("#3b82f6")
                      .build(),
                  TimelineItem.builder()
                      .title("Payment confirmed")
                      .timestamp("Mar 3 · 09:03")
                      .icon("💳")
                      .color("#10b981")
                      .build(),
                  TimelineItem.builder()
                      .title("Preparing")
                      .description("Warehouse Madrid")
                      .timestamp("Mar 3 · 11:40")
                      .icon("📦")
                      .build(),
                  TimelineItem.builder()
                      .title("Shipped")
                      .description("Tracking #RH-88213 — click for details")
                      .timestamp("Mar 4 · 08:15")
                      .icon("🚚")
                      .color("#f59e0b")
                      .actionId("openTracking")
                      .build(),
                  TimelineItem.builder()
                      .title("Delivered")
                      .timestamp("Mar 5 · 13:22")
                      .icon("✅")
                      .color("#10b981")
                      .build()))
          .build();
}
