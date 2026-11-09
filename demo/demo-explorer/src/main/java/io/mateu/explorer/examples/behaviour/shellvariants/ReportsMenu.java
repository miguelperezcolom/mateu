package io.mateu.explorer.examples.behaviour.shellvariants;

import io.mateu.uidl.annotations.Menu;

/** A menu GROUP: a {@code @Menu} field whose type holds more {@code @Menu} fields. */
public class ReportsMenu {

  @Menu RoomsPage occupancy;

  @Menu GuestsPage arrivals;
}
