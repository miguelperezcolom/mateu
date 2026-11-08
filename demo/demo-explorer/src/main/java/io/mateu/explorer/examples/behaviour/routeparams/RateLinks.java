package io.mateu.explorer.examples.behaviour.routeparams;

import io.mateu.explorer.examples.behaviour.shellvariants.AppPreview;
import io.mateu.uidl.data.Anchor;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** Explorer plumbing: links to try the routes of {@link RateRoutes} with different URLs. */
public class RateLinks implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .content(
            List.of(
                link("/x/behaviour/route-params/web/palma"),
                link("/x/behaviour/route-params/web/palma?currency=USD&nights=3"),
                link("/x/behaviour/route-params/web/palma?channel=staff"),
                link("/x/behaviour/route-params/agents/ibiza?nights=7"),
                AppPreview.frame("/x/behaviour/route-params/web/palma?currency=USD&channel=staff", "22rem")))
        .build();
  }

  static Anchor link(String url) {
    return new Anchor(url + " ↗", url, "_blank", null, null);
  }
}
