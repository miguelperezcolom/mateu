package io.mateu.explorer.examples.distributed.versionskew;

import static io.mateu.explorer.examples.distributed.Links.column;
import static io.mateu.explorer.examples.distributed.Links.open;
import static io.mateu.explorer.examples.distributed.Links.row;
import static io.mateu.explorer.examples.distributed.Links.text;

import io.mateu.explorer.examples.distributed.Remotes;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Every answer of a /mateu/ path carries {@code X-Mateu-Build}. The renderer remembers the first
 * build each backend answered with; when a later SUCCESSFUL answer names another one, it shows
 * "This app has been updated…" with a Reload, once. Restart the Inventory remote with another
 * {@code MATEU_BUILD_ID} while its Stock screen is open in the console, then press "Reserve one".
 */
public class VersionSkew implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return column(
        text("The Inventory remote's build id right now: see the X-Mateu-Build header of "
            + Remotes.java() + "/mateu/v3/sync/inventory"),
        row(open("Open Stock in the console", "/fed/inventory/stock")));
  }
}
