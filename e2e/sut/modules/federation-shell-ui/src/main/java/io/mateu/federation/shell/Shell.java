package io.mateu.federation.shell;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RemoteMenu;

/**
 * The SHELL app root {@code @UI("")} aggregating the remote service over HTTP. The menu path
 * "/remote" coincides with the remote's own {@code @UI("/remote")} route; the remote is reached at
 * an ABSOLUTE base URL (server-to-server, no browser CORS). This lives in its OWN module so the
 * shell app does NOT locally register a "/remote" route — otherwise the shell would resolve the
 * deep link against a local route instead of the RemoteMenu.
 */
@UI("")
@Title("Federation Shell")
public class Shell {

    @Menu
    RemoteMenu remote =
            new RemoteMenu("http://localhost:8085/remote").withLabel("Remote").withPath("/remote");

}
