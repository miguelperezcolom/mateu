package io.mateu.explorer.examples.behaviour.routescopes;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * Explorer plumbing: loads the route {@code x/behaviour/route-scopes/planets/:id} (declared in
 * routes.yaml, with its scopes) for one id, with buttons to move to another id.
 */
public class RouteScopesIsland implements ComponentTreeSupplier {

  int planetId = 1;

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .content(
            List.of(
                HorizontalLayout.builder()
                    .content(
                        List.of(
                            Button.builder().label("‹ Previous planet").actionId("previous").build(),
                            Button.builder().label("Next planet ›").actionId("next").build()))
                    .spacing(true)
                    .build(),
                MicroFrontend.builder()
                    .route("/x/behaviour/route-scopes/planets/" + planetId)
                    .style("display: block; width: 100%; min-height: 12rem;")
                    .build()))
        .fullWidth(true)
        .build();
  }

  public RouteScopesIsland previous() {
    planetId = planetId <= 1 ? 8 : planetId - 1;
    return this;
  }

  public RouteScopesIsland next() {
    planetId = planetId >= 8 ? 1 : planetId + 1;
    return this;
  }
}
