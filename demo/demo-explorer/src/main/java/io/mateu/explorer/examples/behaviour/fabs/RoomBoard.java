package io.mateu.explorer.examples.behaviour.fabs;

import io.mateu.uidl.annotations.Fab;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;

/** Page-level FABs: they appear while this page is shown, ordered by {@code order}. */
@Title("Rooms to clean")
public class RoomBoard {

  String next = "214";

  @Fab(icon = "vaadin:plus", label = "Report an incident", order = 0)
  public Message reportIncident() {
    return Message.warning("Incident reported for room " + next);
  }

  @Fab(icon = "vaadin:check", label = "Mark clean", order = 1)
  public Message markClean() {
    return Message.success("Room " + next + " marked clean");
  }
}
