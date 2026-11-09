package io.mateu.explorer.examples.distributed.identity;

import static io.mateu.explorer.examples.distributed.Links.boxed;
import static io.mateu.explorer.examples.distributed.Links.column;

import io.mateu.explorer.examples.distributed.Remotes;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.data.Resolve;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * The same identity echo behind three registered remotes, each with its own identity strategy
 * (DistributedRemotesConfig). Resolved SERVER side, so what the echo prints is what THIS server
 * sent on the user's behalf:
 *
 * <ul>
 *   <li>{@code forward-authorization} (the default) — the caller's {@code Authorization} header, as
 *       it reached this server;
 *   <li>{@code none} — nothing: the remote is called anonymously;
 *   <li>an app strategy ({@code explorer-demo-user}) — whatever headers the app's bean returns.
 * </ul>
 *
 * Mateu never mints or verifies a token: the remote decides who the caller is with its own
 * framework's security.
 */
public class IdentityAcrossRemotes implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return column(boxed(echo("/id-forward")), boxed(echo("/id-none")), boxed(echo("/id-custom")));
  }

  private static MicroFrontend echo(String mount) {
    return MicroFrontend.builder()
        .baseUrl(Remotes.java() + mount)
        .route("")
        .consumedRoute("_empty")
        .resolve(Resolve.SERVER)
        .build();
  }
}
