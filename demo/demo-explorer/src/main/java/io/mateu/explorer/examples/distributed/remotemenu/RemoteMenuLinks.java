package io.mateu.explorer.examples.distributed.remotemenu;

import static io.mateu.explorer.examples.distributed.Links.caption;
import static io.mateu.explorer.examples.distributed.Links.column;
import static io.mateu.explorer.examples.distributed.Links.open;
import static io.mateu.explorer.examples.distributed.Links.row;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/** The federated console, and deep links straight into screens its remotes own. */
public class RemoteMenuLinks implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return column(
        open("Open the federated console — /fed", "/fed"),
        caption("Deep links into remote screens (the URL stays on this shell)"),
        row(
            open("/fed/inventory/stock (Java remote)", "/fed/inventory/stock"),
            open("/fed/orders/order/o-2 (YAML remote, with a path param)", "/fed/orders/order/o-2"),
            open("/fed/help/faq (static bundle)", "/fed/help/faq")));
  }
}
