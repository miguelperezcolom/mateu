package io.mateu.explorer.examples.behaviour.plaintext;

import io.mateu.uidl.annotations.Multiline;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import java.time.LocalDate;

/**
 * {@code @PlainText} renders values as dense read-only TEXT instead of disabled inputs — on a
 * field, or on the class for every field. A long value is cut with an ellipsis; {@code @Multiline}
 * lets it wrap instead.
 */
@Title("Guest card")
@PlainText
public class GuestCard {

  String name = "Ada Lovelace";

  LocalDate arrival = LocalDate.of(2026, 12, 20);

  int nights = 4;

  String preferencesCut =
      "Quiet room away from the lift, extra pillows, sparkling water on arrival, late breakfast";

  @Multiline
  String preferencesWrapped =
      "Quiet room away from the lift, extra pillows, sparkling water on arrival, late breakfast";
}
