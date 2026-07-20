package io.mateu.federation.remote;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * The REMOTE service's own app root — a path-prefixed root {@code @UI("/remote")} with its own
 * menu. Its {@code @UI} route deliberately COINCIDES with the shell's menu path ("/remote"), which
 * is the exact topology that triggered the federation root-deep-link bug: entering that path by URL
 * mounted the remote's whole app shell (its chrome + menu) nested inside the shell and looped.
 */
@UI("/remote")
@Title("Remote App")
public class Remote {

    @Menu
    RemotePage page;

}
