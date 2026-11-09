package io.mateu.explorer.examples.archetypes.foldout;

import io.mateu.core.infra.declarative.orchestrators.foldout.Foldout;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Chart;
import io.mateu.uidl.data.ChartData;
import io.mateu.uidl.data.ChartDataset;
import io.mateu.uidl.data.ChartType;
import io.mateu.uidl.data.FoldoutNavigation;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/**
 * The {@code Foldout} archetype: the first component field is the overview, always in view; each
 * {@code @Panel} field is a lateral panel the user folds in and out ({@code open = false} starts
 * folded, and {@link #panelSummary} is what its folded strip shows). The navigation header names
 * the parent and the previous / next record.
 */
@Title("Impressions of light")
public class ExhibitionFoldout extends Foldout {

  Markdown overview =
      new Markdown(
          """
          **Impressions of light**
          Galleries 5–6 · 12 Jan – 30 Apr 2027

          64 works · 11 lenders · curator: A. Lindqvist
          """,
          null,
          null);

  @Panel(title = "Works", subtitle = "By lender")
  Chart works =
      Chart.builder()
          .chartType(ChartType.bar)
          .chartData(
              ChartData.builder()
                  .labels(List.of("Own collection", "SMK", "Musée d'Orsay", "Others"))
                  .datasets(List.of(
                      ChartDataset.builder().label("Works").data(List.of(31d, 12d, 9d, 12d)).build()))
                  .build())
          .build();

  @Panel(title = "Budget", open = false)
  Markdown budget = new Markdown("Spent **€182,000** of €240,000 (76%).", null, null);

  @Panel(title = "Risks", open = false)
  Markdown risks = new Markdown("- Courier strike in January\n- Gallery 6 humidity", null, null);

  @Override
  protected Component panelSummary(String panelFieldName) {
    return switch (panelFieldName) {
      case "budget" -> new Text("76% spent");
      case "risks" -> new Text("2 open");
      default -> null;
    };
  }

  @Override
  public FoldoutNavigation navigationHeader() {
    return FoldoutNavigation.builder()
        .title("Impressions of light")
        .parentLabel("Exhibitions")
        .parentActionId("toExhibitions")
        .previousActionId("previousExhibition")
        .nextActionId("nextExhibition")
        .build();
  }

  @Action
  Message toExhibitions() {
    return new Message("Would go back to the exhibitions list");
  }

  @Action
  Message previousExhibition() {
    return new Message("Previous exhibition: Dutch drawings");
  }

  @Action
  Message nextExhibition() {
    return new Message("Next exhibition: Hokusai's Fuji");
  }
}
