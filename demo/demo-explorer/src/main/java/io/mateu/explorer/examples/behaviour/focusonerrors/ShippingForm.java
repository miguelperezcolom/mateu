package io.mateu.explorer.examples.behaviour.focusonerrors;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;

/**
 * Press Ship with fields missing: each rejected field is marked invalid ON the control (so the
 * design system wires aria-invalid / aria-describedby and a screen reader reads the error with the
 * field), and focus MOVES to the first rejected one — a keyboard or screen-reader user lands on the
 * problem instead of hearing nothing.
 */
@Title("Shipping")
public class ShippingForm {

  String company = "Acme";
  @NotEmpty String recipient;
  @NotEmpty @Email String email;
  @NotEmpty String city;

  @Button
  @Action(validationRequired = true)
  Message ship() {
    return Message.success("Shipping to " + recipient + " in " + city);
  }
}
