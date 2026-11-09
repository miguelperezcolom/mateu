package io.mateu.explorer.examples.behaviour.returnstate;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.State;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;

/**
 * What an action returns decides how much of the screen changes:
 *
 * <ul>
 *   <li>{@code this} — the form, rebuilt from the new instance;
 *   <li>{@link State} — only the VALUES travel back; the components stay as they are;
 *   <li>{@link Data} — the {@code data} channel only (what {@code ${data.x}} reads), the values
 *       untouched.
 * </ul>
 */
@Title("Occupancy")
public class OccupancyCounter {

  @Section("Guests in house ${data.updatedAt ? '— checked at ' + data.updatedAt : ''}")
  int guests = 140;

  @Section("Shift")
  String receptionist = "Grace";

  @Button
  @Label("Arrival (+1) → State")
  State arrival() {
    guests++;
    return new State(this);
  }

  @Button
  @Label("Departure (−1) → this")
  OccupancyCounter departure() {
    guests--;
    return this;
  }

  @Button
  @Label("Check time → Data")
  Data check() {
    return new Data(Map.of("updatedAt", LocalTime.now().truncatedTo(ChronoUnit.SECONDS).toString()));
  }
}
