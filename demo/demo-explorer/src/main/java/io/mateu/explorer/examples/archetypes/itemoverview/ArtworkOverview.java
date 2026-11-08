package io.mateu.explorer.examples.archetypes.itemoverview;

import io.mateu.core.infra.declarative.orchestrators.itemoverview.ItemOverview;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Chart;
import io.mateu.uidl.data.ChartData;
import io.mateu.uidl.data.ChartDataset;
import io.mateu.uidl.data.ChartType;
import io.mateu.uidl.data.Markdown;
import java.util.List;

/**
 * The {@code ItemOverview} archetype: the first component field without {@code @Panel} is the key
 * information, pinned on the left; every {@code @Panel} field is a tab on the right.
 */
@Title("Water Lilies")
public class ArtworkOverview extends ItemOverview {

  Markdown keyInfo =
      new Markdown(
          """
          ### Water Lilies
          - **Artist:** Claude Monet
          - **Date:** 1906
          - **Medium:** Oil on canvas
          - **Size:** 89.9 × 94.1 cm
          - **Location:** On loan to SMK
          """,
          null,
          null);

  @Panel(title = "Description")
  Markdown description =
      new Markdown(
          "One of some 250 paintings of the lily pond at Giverny. The horizon has gone: only water,"
              + " reflected sky and the flowers remain.",
          null,
          null);

  @Panel(title = "Visitors")
  Chart visitors =
      Chart.builder()
          .chartType(ChartType.line)
          .chartData(
              ChartData.builder()
                  .labels(List.of("Jun", "Jul", "Aug", "Sep", "Oct"))
                  .datasets(List.of(ChartDataset.builder()
                      .label("Visitors (k)")
                      .data(List.of(31d, 42d, 47d, 29d, 24d))
                      .build()))
                  .build())
          .build();

  @Panel(title = "Provenance")
  Markdown provenance =
      new Markdown(
          """
          | Year | Owner |
          |---|---|
          | 1906 | The artist |
          | 1926 | Durand-Ruel, Paris |
          | 1955 | Acquired by the museum |
          """,
          null,
          null);

  @Override
  protected String panelWidth() {
    return "18rem";
  }
}
