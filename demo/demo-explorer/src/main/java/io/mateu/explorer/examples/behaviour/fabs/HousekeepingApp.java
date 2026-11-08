package io.mateu.explorer.examples.behaviour.fabs;

import io.mateu.uidl.annotations.Fab;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;

/**
 * {@code @Fab} on a method of the APP class: a floating action button present on every screen of
 * the app (stacked bottom-right). On a page class (see {@link RoomBoard}) the button belongs to
 * that page only.
 */
@UI("/x/behaviour/fabs")
@Title("Housekeeping")
public class HousekeepingApp {

  @Menu RoomBoard rooms;

  @Fab(icon = "vaadin:phone", label = "Call the front desk")
  public Message callFrontDesk() {
    return Message.success("Calling the front desk… (an app-level FAB)");
  }
}
