package io.mateu.sample1.app;

import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ResponsiveGrid;
import io.mateu.uidl.data.Slotted;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * A Screen = Template + slots (coherence-plan #7): a named-area grid ("header / sidebar+main") whose
 * children are placed by their slot. Backs the layout e2e (layout-sizing.spec.ts).
 */
@UI("/template-demo")
public class TemplateDemo implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return ResponsiveGrid.template(
        "screen",
        "\"header header\" \"sidebar main\"",
        List.of(
            new Slotted("header", new Text("t-header", "Header slot")),
            new Slotted("sidebar", new Text("t-sidebar", "Sidebar slot")),
            new Slotted("main", new Text("t-main", "Main slot"))));
  }
}
