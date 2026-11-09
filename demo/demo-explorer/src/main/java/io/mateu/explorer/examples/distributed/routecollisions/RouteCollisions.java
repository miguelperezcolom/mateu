package io.mateu.explorer.examples.distributed.routecollisions;

import static io.mateu.explorer.examples.distributed.Links.column;
import static io.mateu.explorer.examples.distributed.Links.open;
import static io.mateu.explorer.examples.distributed.Links.row;
import static io.mateu.explorer.examples.distributed.Links.text;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Inventory and Orders both have a route called {@code about}. Routes are relative to each remote's
 * mount and are spliced into the shell as they are, so the two leaves collide: the later one wins,
 * silently — so the renderer warns, ONCE per collision, in the browser console.
 */
public class RouteCollisions implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return column(
        text("Open the console with the browser's developer tools open, and look for the warning about"
            + " the route 'about'."),
        row(open("Open the federated console — /fed", "/fed")));
  }
}
