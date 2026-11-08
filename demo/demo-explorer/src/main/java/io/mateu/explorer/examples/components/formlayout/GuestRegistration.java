package io.mateu.explorer.examples.components.formlayout;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Help;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * The same form the DECLARATIVE way: you write the fields of a class and Mateu builds the
 * FormSection / FormLayout / FormField tree for you. Each {@code @Section} becomes a titled card,
 * the field types pick the widgets (a date picker, a checkbox, a select for an enum), and
 * the column count is inferred (one column up to 6 fields, two from 7 on).
 */
@Title("Guest registration")
public class GuestRegistration {

  enum Pillow {
    SOFT,
    FIRM
  }

  @Section("Guest")
  @NotEmpty
  String firstName;

  @NotEmpty String lastName;

  LocalDate birthDate;

  @Email
  @Help("We send the booking confirmation here")
  String email;

  boolean vip;

  @Section("Stay preferences")
  Pillow pillow = Pillow.SOFT;

  @Min(1)
  @Max(6)
  int guests = 2;

  @Section("Payment")
  @Stereotype(FieldStereotype.money)
  BigDecimal deposit = new BigDecimal("250.00");

  LocalDate paidOn;

  @Button
  public Message register() {
    return Message.success("Registered " + firstName + " " + lastName + " (" + guests + " guests)");
  }
}
