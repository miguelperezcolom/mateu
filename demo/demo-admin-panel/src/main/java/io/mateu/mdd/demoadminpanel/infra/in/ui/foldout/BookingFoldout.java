package io.mateu.mdd.demoadminpanel.infra.in.ui.foldout;

import io.mateu.core.infra.declarative.orchestrators.foldout.Foldout;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Chart;
import io.mateu.uidl.data.ChartData;
import io.mateu.uidl.data.ChartDataset;
import io.mateu.uidl.data.ChartType;
import io.mateu.uidl.data.Markdown;
import java.util.List;

/**
 * Demo of the declarative {@link Foldout} archetype: the first component field is the always
 * visible overview; {@code @Panel} fields are lateral panels the user folds in and out.
 */
@UI("/foldout-demo")
@Title("Booking 2026-08117")
public class BookingFoldout extends Foldout {

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

  @Panel(title = "Notes", open = false)
  Markdown notes =
      new Markdown(
          """
          - Guest asked for a **late checkout**
          - Allergic to nuts (breakfast)
          """,
          null,
          null);

  @Panel(title = "Guest profile", subtitle = "Contact and loyalty")
  Markdown guest =
      new Markdown(
          """
          **Jane Smith**
          Gold member · 12 stays

          📧 jane.smith@example.com
          📞 +34 600 123 456
          """,
          null,
          null);

  @Panel(title = "Room & board", subtitle = "Assigned room and plan")
  Markdown room =
      new Markdown(
          """
          | Field | Value |
          |---|---|
          | Room | 412 |
          | Type | Double superior |
          | View | Sea |
          | Board | Half board |
          """,
          null,
          null);

  @Panel(title = "Transfers", subtitle = "Airport pickup and drop-off")
  Markdown transfers =
      new Markdown(
          """
          - **Arrival** 12/08 14:20 · AY1834 · car booked
          - **Departure** 19/08 09:00 · shared shuttle
          """,
          null,
          null);

  @Panel(title = "Invoices", subtitle = "Issued documents")
  Markdown invoices =
      new Markdown(
          """
          | # | Date | Amount |
          |---|---|---|
          | F-2026-0442 | 02/05 | 620 € |
          | F-2026-1180 | pending | 620 € |
          """,
          null,
          null);

  @Panel(title = "Activity log", subtitle = "Recent changes", open = false)
  Markdown activity =
      new Markdown(
          """
          - 02/05 deposit received
          - 03/05 confirmation sent
          - 10/08 room 412 assigned
          """,
          null,
          null);
}
