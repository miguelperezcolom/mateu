package io.mateu.explorer.ui;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/** App-shell validation harness (TILES: top nav + submenu hub grid). */
@UI("/shell-tiles")
@Title("Explorer — Tiles")
@App(value = AppVariant.TILES, themeToggle = true)
public class ShellTilesApp {
  @Menu ReportsMenu reports;
  @Menu WidthsMenu widths;
  @Menu FoldoutDemo foldout;
}
