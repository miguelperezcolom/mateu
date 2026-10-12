package io.mateu.sample1.shell;

import io.mateu.sample1.Section1;
import io.mateu.sample1.Section2;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** AUTO with a (shallow) group and more than 7 top-level entries: drawn as HAMBURGER_MENU. */
@UI("/shell-wide")
@Title("Shell wide")
public class ShellWideApp {

  @Menu Section1 page;

  @Menu Group group;

  @Menu ShellProbe e3;

  @Menu ShellProbe e4;

  @Menu ShellProbe e5;

  @Menu ShellProbe e6;

  @Menu ShellProbe e7;

  @Menu ShellProbe e8;

  public static class Group {
    @Menu Section2 monthly;
  }
}
