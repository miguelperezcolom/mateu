package io.mateu.explorer.examples.behaviour.shellvariants;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/** {@code AppVariant.RAIL}: a narrow icon rail on the left. */
@UI("/x/behaviour/shell-variants/rail")
@Title("Rail")
@App(AppVariant.RAIL)
public class RailApp {

  @Menu RoomsPage rooms;

  @Menu GuestsPage guests;

  @Menu ReportsMenu reports;
}
