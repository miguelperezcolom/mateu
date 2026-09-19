package io.mateu.sample1.app;

import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.GridTrack;
import io.mateu.uidl.data.ResponsiveGrid;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * One responsive grid as THE layout foundation (coherence-plan #9): a grid with three column tracks
 * sized hug / fill / fixed. Backs the layout e2e (layout-sizing.spec.ts) which asserts the rendered
 * grid carries the resolved grid-template-columns.
 */
@UI("/responsive-grid")
public class ResponsiveGridDemo implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return new ResponsiveGrid(
        "demo-grid",
        List.of(GridTrack.hug(), GridTrack.fill(), GridTrack.fixed("15rem")),
        "1rem",
        List.of(
            new Text("g-a", "hug column"),
            new Text("g-b", "fill column"),
            new Text("g-c", "fixed 15rem column")),
        null);
  }
}
