package io.mateu.explorer.examples.behaviour.shellvariants;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/** {@code AppVariant.HAMBURGER_SECTIONS}: ☰ for the sections, the current section's entries as a band (the Explorer's own shell). */
@UI("/x/behaviour/shell-variants/sections")
@Title("Hamburger + sections")
@App(AppVariant.HAMBURGER_SECTIONS)
public class SectionsApp {

  @Menu RoomsPage rooms;

  @Menu GuestsPage guests;

  @Menu ReportsMenu reports;
}
