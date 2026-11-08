package io.mateu.explorer.examples.behaviour.idlesession;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * After {@code idleTimeoutMinutes} without activity (in ANY tab of the app) a dialog warns that the
 * session is about to end and counts {@code idleWarningSeconds} down. "Stay signed in" keeps the
 * server session alive; letting it run out sends the browser to {@code idleSignOutUrl}.
 *
 * <p>Demo values: 1 minute, warning for the last 50 seconds — so it appears after ~10 idle seconds.
 * Signing out here just lands back on this Explorer entry.
 */
@UI("/apps/idle")
@Title("Idle session demo")
@App(
    idleTimeoutMinutes = 1,
    idleWarningSeconds = 50,
    idleSignOutUrl = "/behaviour/app/idle-session?signedOut=true")
public class IdleDemoApp {

  @Menu Desk desk;

  @Title("Leave the mouse and keyboard alone for 10 seconds")
  @ReadOnly
  public static class Desk {
    String hint = "A warning dialog appears and counts down; press 'Stay signed in' to keep going.";
  }
}
