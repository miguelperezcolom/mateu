package io.mateu.explorer.ui;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/** App-shell validation harness (RAIL: vertical icon rail + fly-out sub-panels). */
@UI("/shell-rail")
@Title("Explorer — Rail")
@App(value = AppVariant.RAIL, themeToggle = true)
public class ShellRailApp {
  @Menu ReportsMenu reports;
  @Menu WidthsMenu widths;
  @Menu FoldoutDemo foldout;
}
