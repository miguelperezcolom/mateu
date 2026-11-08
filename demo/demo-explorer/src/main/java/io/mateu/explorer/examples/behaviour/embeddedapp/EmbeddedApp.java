package io.mateu.explorer.examples.behaviour.embeddedapp;

import io.mateu.uidl.data.Anchor;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * Explorer plumbing for the app-level examples: a WHOLE app (its own {@code @UI} mount, with its
 * own header) drawn inside the entry page as a micro frontend, plus a link to open it on its own.
 * Each entry has a one-line subclass naming its mount.
 */
public abstract class EmbeddedApp implements ComponentTreeSupplier {

  /** The mount of the embedded app, e.g. {@code /apps/idle}. */
  protected abstract String baseUrl();

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .content(
            List.of(
                new Anchor("Open this app on its own ↗", baseUrl(), "_blank", null, null),
                MicroFrontend.builder()
                    .baseUrl(baseUrl())
                    .route("")
                    .consumedRoute("_empty") // the app's root, as a top-level page load asks for it
                    .style("display: block; width: 100%; min-height: 26rem;")
                    .build()))
        .fullWidth(true)
        .build();
  }
}
