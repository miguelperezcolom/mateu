package io.mateu.explorer.examples.behaviour.shellvariants;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/** {@code AppVariant.TILES}: the menu as a page of tiles — what AUTO picks for a menu with nested groups. */
@UI("/x/behaviour/shell-variants/tiles")
@Title("Tiles")
@App(AppVariant.TILES)
public class TilesApp {

  @Menu RoomsPage rooms;

  @Menu GuestsPage guests;

  @Menu ReportsMenu reports;
}
