package io.mateu.sample1.shell;

import io.mateu.sample1.Section2;
import io.mateu.uidl.annotations.Menu;

/** A menu group holding a page and a nested group. */
public class ShellReports {

  @Menu Section2 monthly;

  @Menu ShellArchive archive;

  /** A group nested inside another group. */
  public static class ShellArchive {

    @Menu ShellProbe yearly;
  }
}
