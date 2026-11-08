package com.acme.helpdesk.ui;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * A screen of a "third-party" UI module (Acme's helpdesk). The jar carries the controller the MVC
 * annotation processor generated next to this class, in this package — which is why the app that
 * consumes it must NAME the package ({@code mateu.ui.modules=com.acme.helpdesk.ui}): Mateu
 * registers only its own beans, and the app's component scan does not reach {@code com.acme}.
 */
@UI("/helpdesk")
@Title("Acme helpdesk (a UI module)")
public class HelpdeskHome {

  @ReadOnly String shippedAs = "explorer-helpdesk-ui.jar, package com.acme.helpdesk.ui";

  @ReadOnly String mountedBy = "the Java remote, in-process, via mateu.ui.modules";

  @ReadOnly int openTickets = 3;

  @Button
  public void closeOne() {
    if (openTickets > 0) {
      openTickets--;
    }
  }
}
