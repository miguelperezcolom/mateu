package io.mateu.explorer.examples.behaviour.zones;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Zone;
import io.mateu.uidl.annotations.Zones;
import java.time.LocalDate;

/**
 * {@code @Zones} declares columns; {@code @Section(zone = …)} puts a section in one. A section
 * with no zone is a full-width band, so a header can sit across the top of the columns. Columns
 * wrap below each other when the window is too narrow for them.
 */
@Title("Reservation")
@Zones({@Zone(name = "left", width = "64%"), @Zone(name = "right", width = "36%")})
public class ReservationDesk {

  @Section("Stay")
  String locator = "ABC123";

  LocalDate arrival = LocalDate.of(2026, 12, 20);

  LocalDate departure = LocalDate.of(2026, 12, 24);

  @Section(value = "Guest", zone = "left")
  String guest = "Ada Lovelace";

  String email = "ada@example.com";

  String phone = "+44 20 0000 0000";

  @Section(value = "Room", zone = "right")
  String room = "214";

  String board = "Half board";

  @Section(value = "Payment", zone = "right")
  String card = "**** 4242";
}
