package io.mateu.explorer.examples.distributed.embeddedchrome;

import static io.mateu.explorer.examples.distributed.Links.boxed;
import static io.mateu.explorer.examples.distributed.Links.caption;
import static io.mateu.explorer.examples.distributed.Links.column;

import io.mateu.explorer.examples.distributed.Remotes;
import io.mateu.uidl.data.EmbeddedChrome;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.data.Resolve;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * One remote PAGE ({@code /mf-page}: title, subtitle, a toolbar action) embedded three times. An
 * embedded page is a block of this page, so it never sets the window title, the favicon or the
 * browser history (the remote's server strips those commands for an embedded request), and
 * {@code chrome} decides how much of its header it keeps.
 */
public class EmbeddedChromes implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return column(
        caption("chrome = NONE — only the content"),
        boxed(page(EmbeddedChrome.NONE)),
        caption("chrome = COMPACT — the content and the page's actions"),
        boxed(page(EmbeddedChrome.COMPACT)),
        caption("chrome = PAGE — the whole header, but no breadcrumb"),
        boxed(page(EmbeddedChrome.PAGE)));
  }

  private static MicroFrontend page(EmbeddedChrome chrome) {
    return MicroFrontend.builder()
        .baseUrl(Remotes.java() + "/mf-page")
        .route("")
        .consumedRoute("_empty")
        .resolve(Resolve.SERVER)
        .chrome(chrome)
        .build();
  }
}
