package io.mateu.explorer.examples.distributed.remoteelementimports;

import static io.mateu.explorer.examples.distributed.Links.boxed;
import static io.mateu.explorer.examples.distributed.Links.caption;
import static io.mateu.explorer.examples.distributed.Links.column;
import static io.mateu.explorer.examples.distributed.Links.open;

import io.mateu.explorer.examples.distributed.Remotes;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * The Inventory remote's "Custom element" screen, twice:
 *
 * <ul>
 *   <li>in the federated console, whose app NAMES the remote in a RemoteMenu — the screen is
 *       trusted, and its {@code Element} imports {@code /inventory-assets/remote-badge.js} from the
 *       REMOTE's origin (the badge prints where its module came from);
 *   <li>embedded here, from an origin the Explorer's root app does not name — the renderer draws an
 *       untrusted screen through a strip that drops an Element's {@code import} (and its {@code on…}
 *       handlers): the badge never loads. Same rule as credential scope.
 * </ul>
 *
 * Because the screen is a route of the remote's app, the island names the app ({@code
 * serverSideType}).
 */
public class RemoteElement implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return column(
        open("Trusted: the screen in the federated console — /fed/element", "/fed/element"),
        caption("Untrusted: the same screen embedded here — its import is dropped"),
        boxed(
            MicroFrontend.builder()
                .baseUrl(Remotes.java() + "/inventory")
                .route("/element")
                .consumedRoute("")
                .serverSideType("io.mateu.explorer.remote.inventory.InventoryApp")
                .build()));
  }
}
