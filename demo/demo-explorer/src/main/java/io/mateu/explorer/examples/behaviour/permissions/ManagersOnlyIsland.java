package io.mateu.explorer.examples.behaviour.permissions;

import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/** Loads the route whose routes.yaml entry declares {@code access: {roles: [manager]}}. */
public class ManagersOnlyIsland implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return MicroFrontend.builder()
        .route("/x/behaviour/permissions/managers")
        .style("display: block; width: 100%; min-height: 6rem;")
        .build();
  }
}
