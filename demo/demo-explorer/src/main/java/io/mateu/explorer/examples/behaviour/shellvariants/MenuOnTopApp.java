package io.mateu.explorer.examples.behaviour.shellvariants;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/** {@code AppVariant.MENU_ON_TOP}: the menu as a bar under the header; groups open as dropdowns. */
@UI("/x/behaviour/shell-variants/top")
@Title("Menu on top")
@App(AppVariant.MENU_ON_TOP)
public class MenuOnTopApp {

  @Menu RoomsPage rooms;

  @Menu GuestsPage guests;

  @Menu ReportsMenu reports;
}
