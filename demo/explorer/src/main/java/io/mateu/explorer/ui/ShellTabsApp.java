package io.mateu.explorer.ui;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/** App-shell validation harness (TABS). */
@UI("/shell-tabs")
@Title("Explorer — Tabs")
@App(value = AppVariant.TABS, themeToggle = true)
public class ShellTabsApp {
  @Menu DashboardDemo dashboard;
  @Menu FoldoutDemo foldout;
  @Menu GeneralOverviewDemo generalOverview;
  @Menu WidthFixed widthFixed;
}
