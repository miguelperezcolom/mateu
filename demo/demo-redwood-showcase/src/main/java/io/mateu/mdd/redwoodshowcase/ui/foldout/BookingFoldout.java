package io.mateu.mdd.redwoodshowcase.ui.foldout;

import io.mateu.core.infra.declarative.orchestrators.foldout.Foldout;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.Chart;
import io.mateu.uidl.data.ChartData;
import io.mateu.uidl.data.ChartDataset;
import io.mateu.uidl.data.ChartType;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.FoldoutNavigation;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.ModelViewComponent;
import java.util.List;

/**
 * Demo of the declarative {@link Foldout} archetype: the first component field is the always
 * visible overview; {@code @Panel} fields are lateral panels the user folds in and out.
 */
@UI("/foldout-demo")
@Title("Booking 2026-08117")
public class BookingFoldout extends Foldout {

  List<Badge> badges =
      List.of(
          new Badge("Confirmed"),
          new Badge("12–19 Aug 2026"),
          new Badge("Double superior, sea view"),
          new Badge("Playa Azul"));

  Markdown overview =
      new Markdown(
          """
          **Guest:** Jane Smith
          **Hotel:** Playa Azul
          **Dates:** 12–19 Aug 2026
          **Room:** Double superior, sea view
          **Status:** Confirmed

          Total: **1.240 €** · Paid: 620 €
          """,
          null,
          null);

  @Panel(title = "Payments", subtitle = "Charges and refunds")
  Markdown payments =
      new Markdown(
          """
          | Date | Concept | Amount |
          |---|---|---|
          | 02/05 | Deposit | 620 € |
          | 12/08 | Balance | pending |
          """,
          null,
          null);

  @Panel(title = "Occupancy", subtitle = "Hotel occupancy that week")
  Chart occupancy =
      Chart.builder()
          .chartType(ChartType.line)
          .chartData(
              ChartData.builder()
                  .labels(List.of("12", "13", "14", "15", "16", "17", "18"))
                  .datasets(
                      List.of(
                          ChartDataset.builder()
                              .label("%")
                              .data(List.of(80d, 85d, 92d, 95d, 97d, 93d, 88d))
                              .build()))
                  .build())
          .build();

  @Panel(title = "Notes")
  Markdown notes =
      new Markdown(
          """
          - Guest asked for a **late checkout**
          - Allergic to nuts (breakfast)
          """,
          null,
          null);

  @Override
  public String overviewEditActionId() {
    return "editOverview";
  }

  // Vertical config: the overview Edit affordance opens a Dialog with the edit form.
  @Action
  public Dialog editOverview() {
    return Dialog.builder()
        .headerTitle("Edit booking")
        .width("32rem")
        .content(new ModelViewComponent(new BookingEditForm()))
        .build();
  }

  @Override
  public FoldoutNavigation navigationHeader() {
    return FoldoutNavigation.builder()
        .title("Booking 2026-08117")
        .parentLabel("Bookings")
        .parentActionId("goToParent")
        .previousActionId("previousBooking")
        .nextActionId("nextBooking")
        .build();
  }

  @Action
  public Message goToParent() {
    return Message.contrast("Would navigate to the Bookings list");
  }

  @Action
  public Message previousBooking() {
    return Message.success("Loaded previous booking");
  }

  @Action
  public Message nextBooking() {
    return Message.success("Loaded next booking");
  }
}
