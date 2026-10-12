package io.mateu.sample1.shell;

import io.mateu.sample1.Section1;
import io.mateu.uidl.annotations.Menu;

/** A group shown as cards: one navigable card and one whose entries are its actions. */
public class ShellQuickAccess {

  @Menu(description = "Echo the app context")
  ShellProbe checkIn;

  @Menu(description = "Two destinations as card actions")
  ShellCardActions billing;

  public static class ShellCardActions {
    @Menu Section1 folio;

    @Menu ShellProbe receipt;
  }
}
