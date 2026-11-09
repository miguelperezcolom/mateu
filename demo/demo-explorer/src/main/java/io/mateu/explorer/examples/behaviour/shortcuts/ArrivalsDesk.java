package io.mateu.explorer.examples.behaviour.shortcuts;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.OnRowSelected;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import java.util.List;

/**
 * Keyboard shortcuts, declared where the action is:
 *
 * <ul>
 *   <li>{@code @Action(shortcut = "ctrl+alt+c")} on an action (its button shows it as a tooltip);
 *   <li>{@code @OnRowSelected(shortcut = "ctrl+shift")} on a grid: the combo plus a digit selects
 *       that row (Ctrl+Shift+2 → the second);
 *   <li>{@code @Tab(shortcut = "alt+1")} selects a tab (see the Tabs entry).
 * </ul>
 *
 * Letters and digits match by physical key, so they work on any keyboard layout.
 */
@Title("Arrivals")
public class ArrivalsDesk {

  @ReadOnly String selected = "none";

  @ReadOnly
  @Stereotype(FieldStereotype.grid)
  @OnRowSelected(value = "pick", shortcut = "ctrl+shift")
  List<Arrival> arrivals =
      List.of(new Arrival("Ada Lovelace", "214"), new Arrival("Alan Turing", "118"), new Arrival("Grace Hopper", "305"));

  @Button
  @Action(shortcut = "ctrl+alt+c")
  Message checkIn() {
    return Message.success("Checked in " + selected + " (Ctrl+Alt+C)");
  }

  public ArrivalsDesk pick(Arrival arrival) {
    selected = arrival.guest();
    return this;
  }

  public record Arrival(String guest, String room) {}
}
