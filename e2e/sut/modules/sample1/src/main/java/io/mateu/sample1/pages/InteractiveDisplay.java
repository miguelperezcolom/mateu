package io.mateu.sample1.pages;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ActionPanel;
import io.mateu.uidl.data.ActionPanelCategory;
import io.mateu.uidl.data.ActionPanelItem;
import io.mateu.uidl.data.Calendar;
import io.mateu.uidl.data.CalendarEvent;
import io.mateu.uidl.data.CalloutCard;
import io.mateu.uidl.data.EmptyState;
import io.mateu.uidl.data.Feature;
import io.mateu.uidl.data.FeatureGrid;
import io.mateu.uidl.data.Gantt;
import io.mateu.uidl.data.GanttTask;
import io.mateu.uidl.data.Kanban;
import io.mateu.uidl.data.KanbanCard;
import io.mateu.uidl.data.KanbanColumn;
import io.mateu.uidl.data.MapMarker;
import io.mateu.uidl.data.MatrixCell;
import io.mateu.uidl.data.MatrixColumn;
import io.mateu.uidl.data.MatrixGrid;
import io.mateu.uidl.data.MatrixRow;
import io.mateu.uidl.data.MatrixSection;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.MetricCard;
import io.mateu.uidl.data.Notice;
import io.mateu.uidl.data.OfferCard;
import io.mateu.uidl.data.OrgChart;
import io.mateu.uidl.data.OrgNode;
import io.mateu.uidl.data.PlanningBlock;
import io.mateu.uidl.data.PlanningBoard;
import io.mateu.uidl.data.PlanningResource;
import io.mateu.uidl.data.PricingPlan;
import io.mateu.uidl.data.PricingTable;
import io.mateu.uidl.data.QueueGroup;
import io.mateu.uidl.data.QueueItem;
import io.mateu.uidl.data.Stat;
import io.mateu.uidl.data.StatusItem;
import io.mateu.uidl.data.StatusList;
import io.mateu.uidl.data.TaskQueue;
import io.mateu.uidl.data.Timeline;
import io.mateu.uidl.data.TimelineItem;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Every display component that RUNS something, composed in code, each naming a plain public method
 * of this class: the tree-referenced action ids must be advertised (or the browser drops the
 * click), and each handler echoes the action and the parameters it received, so
 * e2e/tests/shared/interactive-display.spec.ts can assert the whole round trip.
 */
@UI("/arch/interactive")
@Title("Interactive display")
public class InteractiveDisplay implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .content(
            List.of(
                MetricCard.builder().title("Revenue").value("1.2M").actionId("drillRevenue").build(),
                Stat.builder().label("Arrivals").value("12").actionId("openArrivals").build(),
                Gantt.builder()
                    .onTaskSelectionActionId("pickTask")
                    .tasks(
                        List.of(
                            GanttTask.builder()
                                .id("t1")
                                .title("Design")
                                .start(LocalDate.of(2026, 10, 1))
                                .end(LocalDate.of(2026, 10, 10))
                                .progress(50)
                                .build()))
                    .build(),
                Kanban.builder()
                    .columns(
                        List.of(
                            KanbanColumn.builder()
                                .id("todo")
                                .title("To do")
                                .cards(
                                    List.of(
                                        KanbanCard.builder()
                                            .id("k1")
                                            .title("Write docs")
                                            .actionId("openCard")
                                            .build()))
                                .build()))
                    .build(),
                PlanningBoard.builder()
                    .from(LocalDate.of(2026, 10, 1))
                    .to(LocalDate.of(2026, 10, 7))
                    .moveActionId("moveBlock")
                    .selectActionId("pickBlock")
                    .resources(
                        List.of(
                            PlanningResource.builder().id("r101").label("Room 101").build(),
                            PlanningResource.builder().id("r102").label("Room 102").build()))
                    .blocks(
                        List.of(
                            PlanningBlock.builder()
                                .id("b1")
                                .resourceId("r101")
                                .start(LocalDate.of(2026, 10, 2))
                                .end(LocalDate.of(2026, 10, 4))
                                .label("Smith")
                                .build()))
                    .build(),
                MatrixGrid.builder()
                    .rowHeaderLabel("Type")
                    .cellActionId("openCell")
                    .editActionId("editCell")
                    .columns(
                        List.of(
                            MatrixColumn.builder().id("d1").label("1").group("October").build(),
                            MatrixColumn.builder().id("d2").label("2").group("October").build()))
                    .sections(
                        List.of(
                            MatrixSection.builder()
                                .id("rooms")
                                .title("Rooms")
                                .rows(
                                    List.of(
                                        MatrixRow.builder()
                                            .id("dbl")
                                            .label("Double")
                                            .editable(true)
                                            .cells(
                                                List.of(
                                                    MatrixCell.builder().value("4").build(),
                                                    MatrixCell.builder().value("2").build()))
                                            .build(),
                                        MatrixRow.builder()
                                            .id("sgl")
                                            .label("Single")
                                            .cells(
                                                List.of(
                                                    MatrixCell.builder().value("7").link(true).build(),
                                                    MatrixCell.builder().value("1").build()))
                                            .build()))
                                .build()))
                    .build(),
                ActionPanel.builder()
                    .label("I want to…")
                    .categories(
                        List.of(
                            ActionPanelCategory.builder()
                                .title("Booking")
                                .actions(
                                    List.of(
                                        ActionPanelItem.builder()
                                            .label("Cancel booking")
                                            .actionId("cancelBooking")
                                            .parameters(Map.of("reason", "test"))
                                            .populated(true)
                                            .build()))
                                .build()))
                    .build(),
                io.mateu.uidl.data.Map.builder()
                    .markerActionId("openMarker")
                    .markers(List.of(new MapMarker("m1", 39.57, 2.65, "Palma", null, null)))
                    .build(),
                Calendar.builder()
                    .month(LocalDate.of(2026, 10, 1))
                    .dayActionId("openDay")
                    .events(
                        List.of(
                            CalendarEvent.builder()
                                .id("ev1")
                                .title("Meeting")
                                .date(LocalDate.of(2026, 10, 5))
                                .actionId("openEvent")
                                .build()))
                    .build(),
                TaskQueue.builder()
                    .actionId("openItem")
                    .groups(
                        List.of(
                            QueueGroup.builder()
                                .label("Today")
                                .items(
                                    List.of(
                                        QueueItem.builder().id("q1").title("Call Ada").build()))
                                .build()))
                    .build(),
                Timeline.builder()
                    .items(
                        List.of(
                            TimelineItem.builder()
                                .id("e1")
                                .title("Created")
                                .actionId("openTimeline")
                                .build()))
                    .build(),
                OrgChart.builder()
                    .root(
                        OrgNode.builder()
                            .id("ceo")
                            .title("CEO")
                            .actionId("openNode")
                            .children(List.of())
                            .build())
                    .build(),
                StatusList.builder()
                    .items(
                        List.of(
                            StatusItem.builder()
                                .id("s1")
                                .title("Payment")
                                .actionLabel("Retry")
                                .actionId("retryPayment")
                                .build()))
                    .build(),
                FeatureGrid.builder()
                    .features(
                        List.of(
                            Feature.builder().title("Fast").actionId("openFeature").build()))
                    .build(),
                PricingTable.builder()
                    .plans(
                        List.of(
                            PricingPlan.builder()
                                .id("basic")
                                .name("Basic")
                                .price("9 €")
                                .ctaLabel("Choose")
                                .actionId("choosePlan")
                                .build()))
                    .build(),
                OfferCard.builder()
                    .title("Breakfast")
                    .actionLabel("Add breakfast")
                    .actionId("addOffer")
                    .build(),
                CalloutCard.builder()
                    .title("Upgrade")
                    .ctaLabel("Upgrade now")
                    .actionId("upgrade")
                    .build(),
                Notice.builder()
                    .text("Two complaints pending")
                    .actionLabel("Review")
                    .actionId("reviewComplaints")
                    .build(),
                EmptyState.builder()
                    .title("Nothing here")
                    .actionLabel("New booking")
                    .actionId("newBooking")
                    .build()))
        .build();
  }

  private static Message echo(String action, HttpRequest httpRequest) {
    var parameters = httpRequest.runActionRq().parameters();
    var shown = new TreeMap<String, Object>();
    if (parameters != null) {
      parameters.forEach(
          (key, value) -> {
            if (!key.startsWith("__")) shown.put(key, value);
          });
    }
    return Message.success(action + " " + shown);
  }

  public Message drillRevenue(HttpRequest rq) {
    return echo("drillRevenue", rq);
  }

  public Message openArrivals(HttpRequest rq) {
    return echo("openArrivals", rq);
  }

  public Message pickTask(HttpRequest rq) {
    return echo("pickTask", rq);
  }

  public Message openCard(HttpRequest rq) {
    return echo("openCard", rq);
  }

  public Message moveBlock(HttpRequest rq) {
    return echo("moveBlock", rq);
  }

  public Message pickBlock(HttpRequest rq) {
    return echo("pickBlock", rq);
  }

  public Message openCell(HttpRequest rq) {
    return echo("openCell", rq);
  }

  public Message editCell(HttpRequest rq) {
    return echo("editCell", rq);
  }

  public Message cancelBooking(HttpRequest rq) {
    return echo("cancelBooking", rq);
  }

  public Message openMarker(HttpRequest rq) {
    return echo("openMarker", rq);
  }

  public Message openDay(HttpRequest rq) {
    return echo("openDay", rq);
  }

  public Message openEvent(HttpRequest rq) {
    return echo("openEvent", rq);
  }

  public Message openItem(HttpRequest rq) {
    return echo("openItem", rq);
  }

  public Message openTimeline(HttpRequest rq) {
    return echo("openTimeline", rq);
  }

  public Message openNode(HttpRequest rq) {
    return echo("openNode", rq);
  }

  public Message retryPayment(HttpRequest rq) {
    return echo("retryPayment", rq);
  }

  public Message openFeature(HttpRequest rq) {
    return echo("openFeature", rq);
  }

  public Message choosePlan(HttpRequest rq) {
    return echo("choosePlan", rq);
  }

  public Message addOffer(HttpRequest rq) {
    return echo("addOffer", rq);
  }

  public Message upgrade(HttpRequest rq) {
    return echo("upgrade", rq);
  }

  public Message reviewComplaints(HttpRequest rq) {
    return echo("reviewComplaints", rq);
  }

  public Message newBooking(HttpRequest rq) {
    return echo("newBooking", rq);
  }
}
