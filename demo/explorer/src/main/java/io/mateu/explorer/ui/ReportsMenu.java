package io.mateu.explorer.ui;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.interfaces.Submenu;

/** A submenu group (Reports) — exercises TILES hub tiles and RAIL sub-panels. */
public class ReportsMenu implements Submenu {
  @Menu DashboardDemo dashboard;
  @Menu GeneralOverviewDemo generalOverview;
}
