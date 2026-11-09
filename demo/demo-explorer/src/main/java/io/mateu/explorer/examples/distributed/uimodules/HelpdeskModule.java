package io.mateu.explorer.examples.distributed.uimodules;

import static io.mateu.explorer.examples.distributed.Links.boxed;
import static io.mateu.explorer.examples.distributed.Links.column;
import static io.mateu.explorer.examples.distributed.Links.open;

import io.mateu.explorer.examples.distributed.Remotes;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * The helpdesk UI module ({@code explorer-helpdesk-ui.jar}, package {@code com.acme.helpdesk.ui})
 * runs IN-PROCESS inside the Java remote, which names its package in {@code mateu.ui.modules}.
 * Embedded here from that remote; "Close one" runs in the remote's process, in the module's class.
 */
public class HelpdeskModule implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return column(
        open("Open the module's own mount — /helpdesk on the Java remote", Remotes.java() + "/helpdesk"),
        boxed(MicroFrontend.builder().baseUrl(Remotes.java() + "/helpdesk").route("").consumedRoute("_empty").build()));
  }
}
