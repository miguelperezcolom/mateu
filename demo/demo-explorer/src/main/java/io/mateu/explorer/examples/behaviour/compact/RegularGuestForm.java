package io.mateu.explorer.examples.behaviour.compact;

import io.mateu.uidl.annotations.Title;
import java.time.LocalDate;

/** The regular density, for comparison. */
@Title("Guest — regular")
public class RegularGuestForm {
  String name = "Ada Lovelace";
  String email = "ada@example.com";
  String phone = "+44 20 0000 0000";
  LocalDate arrival = LocalDate.of(2026, 12, 20);
  LocalDate departure = LocalDate.of(2026, 12, 24);
  String room = "214";
}
