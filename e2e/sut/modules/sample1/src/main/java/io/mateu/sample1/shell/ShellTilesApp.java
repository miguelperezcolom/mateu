package io.mateu.sample1.shell;

import io.mateu.sample1.Section1;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** AUTO with a group holding a group (menu depth > 2): drawn as TILES. */
@UI("/shell-tiles")
@Title("Shell tiles")
public class ShellTilesApp {

  @Menu Section1 page;

  @Menu ShellReports reports;
}
