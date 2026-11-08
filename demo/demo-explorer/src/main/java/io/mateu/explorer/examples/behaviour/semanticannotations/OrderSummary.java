package io.mateu.explorer.examples.behaviour.semanticannotations;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;
import java.math.BigDecimal;

/**
 * Semantic (composed) annotations: any Mateu field, method or class annotation can be put on YOUR
 * annotation, and Mateu reads through it. One {@link TotalAmount} replaces three annotations at
 * every amount of the domain; {@link SaveAction} gives every screen the same Save.
 */
@Title("Order summary")
public class OrderSummary {

  @NotEmpty String reference = "ORD-0042";

  @TotalAmount BigDecimal total = new BigDecimal("1499.9");

  @SaveAction
  Message save() {
    return Message.success("Saved " + reference + " for " + total);
  }
}
