package io.mateu.explorer.examples.behaviour.sections;

import io.mateu.uidl.annotations.Notice;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import java.time.LocalDate;

/**
 * {@code @Section} groups the fields that FOLLOW it, until the next one, into a titled card. Its
 * attributes shape the card: {@code columns} (a count for that section only), {@code
 * propertyList} (read-only label / value rows), {@code frameless} (no card — for a band that brings
 * its own chrome), {@code sticky} (pinned while the page scrolls — see the sections index entry).
 */
@Title("Check-in")
public class CheckInSections {

  @Section(value = "", frameless = true)
  @Notice(theme = "info")
  String arrivalNotice = "Arriving today — room 214 is ready";

  @Section(value = "Guest", columns = 2)
  String firstName = "Ada";

  String lastName = "Lovelace";

  String email = "ada@example.com";

  String phone = "+44 20 0000 0000";

  @Section(value = "Document", propertyList = true)
  String documentType = "Passport";

  String documentNumber = "X1234567";

  LocalDate expires = LocalDate.of(2031, 4, 30);

  @Section("Notes")
  String notes = "";
}
