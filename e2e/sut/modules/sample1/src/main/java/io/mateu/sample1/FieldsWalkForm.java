package io.mateu.sample1;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.SliderMax;
import io.mateu.uidl.annotations.SliderMin;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * Walkthrough fixture: one field per basic data type and per input stereotype, each with a value
 * set, and an {@code echo} action that prints what the SERVER received. The interaction specs edit
 * every field in the browser and read the echo back, so a value the client sends in a shape the
 * server cannot coerce (the class of bug where a field silently resets to its initializer) shows
 * up as a wrong echo instead of passing unnoticed.
 */
@UI("/walk-fields")
@Title("Fields walk")
@Getter
@Setter
public class FieldsWalkForm {

  String text = "hello";

  @Stereotype(FieldStereotype.textarea)
  String notes = "first line";

  @Stereotype(FieldStereotype.email)
  String email = "a@b.com";

  @Stereotype(FieldStereotype.password)
  String secret = "s3cret";

  int count = 3;

  Integer boxedCount;

  long big = 10;

  double ratio = 1.5;

  BigDecimal price = new BigDecimal("9.99");

  @Stereotype(FieldStereotype.money)
  BigDecimal fee = new BigDecimal("12.50");

  Amount total = new Amount("EUR", 25.5);

  LocalDate date = LocalDate.of(2026, 1, 15);

  LocalTime time = LocalTime.of(10, 30);

  LocalDateTime when = LocalDateTime.of(2026, 1, 15, 10, 30);

  boolean active;

  @Stereotype(FieldStereotype.toggle)
  boolean enabled;

  /** Three constants: renders as radio buttons (small-enum inference). */
  Size size = Size.MEDIUM;

  /** Six constants: renders as a select, with humanized labels. */
  Phase phase = Phase.CHECK_IN;

  List<Phase> phases = List.of(Phase.BOOKED);

  @Stereotype(FieldStereotype.color)
  String color = "#ff0000";

  @Stereotype(FieldStereotype.stars)
  int rating = 3;

  @Stereotype(FieldStereotype.slider)
  @SliderMin(0)
  @SliderMax(100)
  int level = 50;

  @Button
  public Message echo() {
    return new Message(
        "echo:"
            + " text="
            + text
            + " notes="
            + notes
            + " email="
            + email
            + " secret="
            + secret
            + " count="
            + count
            + " boxedCount="
            + boxedCount
            + " big="
            + big
            + " ratio="
            + ratio
            + " price="
            + price
            + " fee="
            + fee
            + " total="
            + (total == null ? null : total.currency() + "/" + total.value())
            + " date="
            + date
            + " time="
            + time
            + " when="
            + when
            + " active="
            + active
            + " enabled="
            + enabled
            + " size="
            + size
            + " phase="
            + phase
            + " phases="
            + phases
            + " color="
            + color
            + " rating="
            + rating
            + " level="
            + level);
  }

  public enum Size {
    SMALL,
    MEDIUM,
    LARGE
  }

  public enum Phase {
    BOOKED,
    @Label("Arrived")
    CHECK_IN,
    IN_HOUSE,
    CHECK_OUT,
    NO_SHOW,
    CANCELLED
  }
}
