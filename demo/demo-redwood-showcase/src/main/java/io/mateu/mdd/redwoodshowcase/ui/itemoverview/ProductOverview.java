package io.mateu.mdd.redwoodshowcase.ui.itemoverview;

import io.mateu.core.infra.declarative.orchestrators.itemoverview.ItemOverview;
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
 * Demo of the {@link ItemOverview} archetype: key info pinned on the left, the rest of the page in
 * tabs on the right.
 */
@UI("/product-overview")
@Title("Ergonomic chair EC-200")
public class ProductOverview extends ItemOverview {

  Markdown keyInfo =
      new Markdown(
          """
          ### Ergonomic chair EC-200

          **SKU:** EC-200-BLK
          **Category:** Office seating
          **Status:** Active
          **Stock:** 143 units
          **Price:** 349 €

          Lumbar support, 4D armrests, mesh back.
          """,
          null,
          null);

  @Panel(title = "Sales")
  Chart sales =
      Chart.builder()
          .chartType(ChartType.bar)
          .chartData(
              ChartData.builder()
                  .labels(List.of("Jan", "Feb", "Mar", "Apr", "May", "Jun"))
                  .datasets(
                      List.of(
                          ChartDataset.builder()
                              .label("Units")
                              .data(List.of(42d, 55d, 38d, 61d, 70d, 66d))
                              .build()))
                  .build())
          .build();

  @Panel(title = "Specifications")
  Markdown specs =
      new Markdown(
          """
          | Property | Value |
          |---|---|
          | Max load | 130 kg |
          | Seat height | 44–54 cm |
          | Materials | Mesh, aluminium |
          | Warranty | 5 years |
          """,
          null,
          null);

  @Panel(title = "Reviews")
  Markdown reviews =
      new Markdown(
          """
          ⭐⭐⭐⭐⭐ *"Best chair I've owned"* — María
          ⭐⭐⭐⭐ *"Great support, assembly took a while"* — Joan
          """,
          null,
          null);
}
