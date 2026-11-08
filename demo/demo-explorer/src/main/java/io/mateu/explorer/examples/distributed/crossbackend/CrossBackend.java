package io.mateu.explorer.examples.distributed.crossbackend;

import static io.mateu.explorer.examples.distributed.Links.boxed;
import static io.mateu.explorer.examples.distributed.Links.column;
import static io.mateu.explorer.examples.distributed.Links.open;
import static io.mateu.explorer.examples.distributed.Links.row;

import io.mateu.explorer.examples.distributed.Remotes;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * A Python service in the same shell: the wire is the same, so the console federates it with a
 * {@code RemoteMenu} like any Java remote, and a page embeds one of its screens like any other.
 * (Start remotes/python-remote first.)
 */
public class CrossBackend implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return column(
        row(open("The console — Reports is the Python section", "/fed")),
        boxed(
            MicroFrontend.builder()
                .baseUrl(Remotes.python())
                .route("/reports/sales")
                .consumedRoute("")
                .build()));
  }
}
