package io.mateu.explorer.examples.components.appshell;

import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * The same shell authored in Java: the fluent {@link AppShell}. A mount's shell usually comes from
 * an {@code AppSupplier} bean (or simply from the {@code @UI} class with {@code @App} and {@code
 * @Menu} fields — this Explorer's own shell is one). Bound to a mount root, a view can also return
 * it as its component tree, as this one does; its menu routes are relative to the mount.
 */
public class MuseumShell implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return AppShell.builder()
        .title("City Museum")
        .subtitle("Back office, in Java")
        .variant(AppVariant.TABS)
        .homeRoute("collection")
        .menu(
            List.of(
                RouteLink.builder().label("Collection").route("collection").build(),
                RouteLink.builder().label("Visitors").route("visitors").build()))
        .build();
  }
}
