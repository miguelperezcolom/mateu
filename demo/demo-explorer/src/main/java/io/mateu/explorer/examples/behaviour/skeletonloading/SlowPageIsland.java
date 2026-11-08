package io.mateu.explorer.examples.behaviour.skeletonloading;

import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/** Explorer plumbing: loads the slow route into a box with no content yet. */
public class SlowPageIsland implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return MicroFrontend.builder()
        .route("/x/behaviour/skeleton-loading/slow")
        .style("display: block; width: 100%; min-height: 10rem;")
        .build();
  }
}
