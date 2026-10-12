package io.mateu.sample1.shell;

import io.mateu.sample1.Section1;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/** An explicit MENU_ON_LEFT shell. */
@UI("/shell-left")
@Title("Shell left")
@App(AppVariant.MENU_ON_LEFT)
public class ShellLeftApp {

  @Menu Section1 page;

  @Menu ShellReports reports;
}
