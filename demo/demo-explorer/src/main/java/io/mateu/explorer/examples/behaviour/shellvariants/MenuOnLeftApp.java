package io.mateu.explorer.examples.behaviour.shellvariants;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/** {@code AppVariant.MENU_ON_LEFT}: a side navigation column, groups expandable. */
@UI("/x/behaviour/shell-variants/left")
@Title("Menu on the left")
@App(AppVariant.MENU_ON_LEFT)
public class MenuOnLeftApp {

  @Menu RoomsPage rooms;

  @Menu GuestsPage guests;

  @Menu ReportsMenu reports;
}
