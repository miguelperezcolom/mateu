package io.mateu.explorer.examples.components.breadcrumbs;

import io.mateu.uidl.data.Breadcrumb;
import io.mateu.uidl.data.Breadcrumbs;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** The same trail in Java — typically built from where the record sits in its hierarchy. */
public class ArtworkTrail implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return Breadcrumbs.builder()
        .breadcrumbs(
            List.of(
                new Breadcrumb("Collections", "/components/overview"),
                new Breadcrumb("Paintings", "/components/visualisation/charts"),
                new Breadcrumb("Post-Impressionism", "/components/visualisation/kanban")))
        .currentItemText("The Starry Night")
        .build();
  }
}
