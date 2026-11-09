package io.mateu.explorer.examples.behaviour.shellvariants;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/** {@code AppVariant.HAMBURGER_MENU}: the menu folded behind a ☰ button — what AUTO picks for more than 7 entries. */
@UI("/x/behaviour/shell-variants/hamburger")
@Title("Hamburger")
@App(AppVariant.HAMBURGER_MENU)
public class HamburgerApp {

  @Menu RoomsPage rooms;

  @Menu GuestsPage guests;

  @Menu ReportsMenu reports;
}
