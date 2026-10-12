package io.mateu.sample1.shell;

import io.mateu.sample1.Section1;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/** An explicit RAIL shell. */
@UI("/shell-rail")
@Title("Shell rail")
@App(AppVariant.RAIL)
public class ShellRailApp {

  @Menu Section1 page;

  @Menu ShellReports reports;
}
