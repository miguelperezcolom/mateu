package io.mateu.explorer.examples.distributed.credentialscope;

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
 * Where the BROWSER may send the user's Bearer token: the page's own origin, the top-level
 * {@code <mateu-ui>}'s base url, origins the host page lists ({@code <meta
 * name="mateu-credential-origins">}), and the remotes an app served from one of those NAMES in a
 * {@code RemoteMenu}. Every other origin is called anonymously.
 *
 * <p>Below, a CLIENT micro frontend of the identity echo: the Explorer's root app names no remote,
 * so the browser calls the Java remote WITHOUT the token. In the federated console, whose app names
 * Inventory in a RemoteMenu, the same browser sends it ("Who am I?").
 */
public class CredentialScope implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return column(
        caption("From this page (the remote is not named by the Explorer's app)"),
        boxed(
            MicroFrontend.builder()
                .baseUrl(Remotes.java() + "/id-none")
                .route("")
                .consumedRoute("_empty")
                .build()),
        open("From the console (the remote IS named by a RemoteMenu) — Who am I?", "/fed/inventory/whoami"));
  }
}
