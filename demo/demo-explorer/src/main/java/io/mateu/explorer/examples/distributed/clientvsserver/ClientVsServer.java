package io.mateu.explorer.examples.distributed.clientvsserver;

import static io.mateu.explorer.examples.distributed.Links.boxed;
import static io.mateu.explorer.examples.distributed.Links.caption;
import static io.mateu.explorer.examples.distributed.Links.column;

import io.mateu.explorer.examples.distributed.Remotes;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.data.Resolve;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * The same remote screen embedded twice, and two remotes that cannot be resolved in time:
 *
 * <ul>
 *   <li>CLIENT (the default): the page arrives with a placeholder and the BROWSER asks the remote;
 *   <li>SERVER: THIS server asks the remote while it builds the page and embeds the answer — it is
 *       in the first paint, with no extra round trip. After that the island talks to the remote
 *       directly ("Like" goes to the remote, never through the host);
 *   <li>SERVER, but slow: the remote takes 2 s, the budget is 300 ms ({@code timeoutMs} here; the
 *       {@code slow} remote declares the same) — the call is cancelled and the island DEGRADES to
 *       CLIENT: the browser asks it, so it still appears, two seconds later;
 *   <li>SERVER, but down: nothing listens — degraded to CLIENT too; the browser's call fails.
 * </ul>
 *
 * A SERVER micro frontend must be under a registered remote (DistributedRemotesConfig).
 */
public class ClientVsServer implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return column(
        caption("resolve = CLIENT — the browser asks the remote after the page arrives"),
        boxed(fast(Resolve.CLIENT)),
        caption("resolve = SERVER — embedded in this page's own response"),
        boxed(fast(Resolve.SERVER)),
        caption("resolve = SERVER, timeoutMs = 300, the remote takes 2 s — degraded to CLIENT"),
        boxed(
            MicroFrontend.builder()
                .baseUrl(Remotes.java() + "/mf-slow")
                .route("")
                .consumedRoute("_empty")
                .resolve(Resolve.SERVER)
                .timeoutMs(300)
                .build()),
        caption("resolve = SERVER, the remote is down — degraded to CLIENT, the call fails"),
        boxed(
            MicroFrontend.builder()
                .baseUrl(Remotes.down() + "/remote-down")
                .route("")
                .consumedRoute("_empty")
                .resolve(Resolve.SERVER)
                .build()));
  }

  private static MicroFrontend fast(Resolve resolve) {
    return MicroFrontend.builder()
        .baseUrl(Remotes.java() + "/mf-fast")
        .route("")
        .consumedRoute("_empty")
        .resolve(resolve)
        .build();
  }
}
