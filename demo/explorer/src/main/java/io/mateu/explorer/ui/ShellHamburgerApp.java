package io.mateu.explorer.ui;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/** App-shell validation harness (HAMBURGUER_MENU: drawer + side-nav). */
@UI("/shell-hamburger")
@Title("Explorer — Hamburger")
@App(value = AppVariant.HAMBURGUER_MENU, themeToggle = true)
public class ShellHamburgerApp {
  @Menu DashboardDemo dashboard;
  @Menu FoldoutDemo foldout;
  @Menu GeneralOverviewDemo generalOverview;
  @Menu WidthFixed widthFixed;
  @Menu WidthFull widthFull;
  @Menu WidthEdge widthEdge;
}
