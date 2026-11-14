package com.example.workshop;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.State;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;

/**
 * Workshop, lab 01: a screen of your own. Fields are the state of the screen, the bean-validation
 * annotations its rules, the {@code @Button} method its behaviour. No @UI: it is reached through
 * its {@code @Menu} field in {@link Shell}, so it renders inside the app shell at /quote.
 */
@Title("Quote")
public class Quote {

  @Min(1) int quantity = 1;

  @Min(0) @Stereotype(FieldStereotype.money) double unitPrice;

  @Min(0) @Max(100) int discount;

  @ReadOnly @Stereotype(FieldStereotype.money) double total;

  // An action answers with what the browser should do: State(this) sends the changed fields back
  // (a bare void would change total on the server only), the Message shows a toast.
  @Button
  public List<Object> calculate() {
    total = Math.round(quantity * unitPrice * (100 - discount)) / 100.0;
    return List.of(new State(this), new Message("Total: " + total));
  }
}
