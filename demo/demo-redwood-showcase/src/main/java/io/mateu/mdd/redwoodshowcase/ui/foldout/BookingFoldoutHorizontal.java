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
import io.mateu.uidl.data.FoldoutOrientation;
import io.mateu.uidl.data.Markdown;
import java.net.URI;
import java.util.List;

/**
 * Horizontal configuration of the {@link Foldout} archetype (RDS Foldout Layout Page Template): the
 * Page Overview spans the top full-width and the fold-out panels lay out in a row below it.
 */
@UI("/foldout-horizontal-demo")
@Title("Booking 2026-08117 · horizontal")
public class BookingFoldoutHorizontal extends Foldout {

  List<Badge> badges =
      List.of(
          new Badge("Confirmed"),
          new Badge("12–19 Aug 2026"),
          new Badge("Double superior, sea view"),
          new Badge("Playa Azul"));

  Markdown overview =
      new Markdown(
          """
          **Guest:** Jane Smith · **Hotel:** Playa Azul · **Dates:** 12–19 Aug 2026

          **Room:** Double superior, sea view · **Status:** Confirmed · Total **1.240 €** · Paid 620 €
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
  public FoldoutOrientation orientation() {
    return FoldoutOrientation.horizontal;
  }

  @Override
  public String overviewEditActionId() {
    return "editOverview";
  }

  // Horizontal config: the overview Edit affordance navigates to a dedicated edit page.
  @Action
  public URI editOverview() {
    return URI.create("/booking-edit");
  }
}

