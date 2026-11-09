package io.mateu.explorer.examples.behaviour.fieldtypesbasic;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.SliderMax;
import io.mateu.uidl.annotations.SliderMin;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * The widget comes from the Java TYPE; a {@code @Stereotype} asks for a different one on the same
 * type. Nothing else is declared here.
 */
@Title("Every basic field")
public class EveryBasicField {

  // by type
  String text = "Hello";
  int integer = 42;
  double decimal = 3.14;
  boolean flag = true;
  LocalDate date = LocalDate.of(2026, 11, 8);
  LocalTime time = LocalTime.of(9, 30);
  LocalDateTime dateTime = LocalDateTime.of(2026, 11, 8, 9, 30);

  // by stereotype
  @Stereotype(FieldStereotype.email)
  String email = "ada@example.com";

  @Stereotype(FieldStereotype.password)
  String password = "secret";

  @Stereotype(FieldStereotype.textarea)
  String notes = "Several\nlines";

  @Stereotype(FieldStereotype.link)
  String website = "https://mateu.io";

  @Stereotype(FieldStereotype.toggle)
  boolean active = true;

  @Stereotype(FieldStereotype.stars)
  int rating = 4;

  @Stereotype(FieldStereotype.slider)
  @SliderMin(0)
  @SliderMax(100)
  int volume = 30;

  @Stereotype(FieldStereotype.color)
  String colour = "#3366ff";

  @Button
  Message show() {
    return Message.success(
        "integer=" + integer + " date=" + date + " rating=" + rating + " volume=" + volume);
  }
}
