package io.mateu.explorer.examples.behaviour.shellvariants;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/** {@code AppVariant.TABS}: the entries as tabs — what AUTO picks with no menu groups. */
@UI("/x/behaviour/shell-variants/tabs")
@Title("Tabs")
@App(AppVariant.TABS)
public class TabsApp {

  @Menu RoomsPage rooms;

  @Menu GuestsPage guests;

  @Menu ReportsMenu reports;
}
