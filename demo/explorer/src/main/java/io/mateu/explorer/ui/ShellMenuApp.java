package io.mateu.explorer.ui;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/** App-shell validation harness (MENU_ON_TOP): a menu over the Explorer's page routes. */
@UI("/shell-menu")
@Title("Explorer — Menu on top")
@App(value = AppVariant.MENU_ON_TOP, themeToggle = true)
public class ShellMenuApp {
  @Menu DashboardDemo dashboard;
  @Menu FoldoutDemo foldout;
  @Menu GeneralOverviewDemo generalOverview;
  @Menu WidthFixed widthFixed;
  @Menu WidthFull widthFull;
  @Menu WidthEdge widthEdge;
}
