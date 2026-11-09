package io.mateu.explorer.examples.behaviour.actionannotations;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Message;

/**
 * Where an action method shows up depends on its annotation:
 *
 * <ul>
 *   <li>{@code @Toolbar} — a button in the page header's toolbar;
 *   <li>{@code @Button} — a button under the form;
 *   <li>{@code @Action} alone — no button: it is callable (by a shortcut, a trigger, a component
 *       that names it, another action's {@code runAction}…) and configures behaviour ({@code
 *       validationRequired}, {@code confirmationRequired}, {@code shortcut}, {@code timeoutMillis}…).
 * </ul>
 *
 * A method's name is its action id; {@code @Label} renames the button; {@code buttonStyle} and
 * {@code order} style and sort it.
 */
@Title("Order 1042")
public class OrderActions {

  String customer = "Acme";

  @Toolbar
  Message refresh() {
    return Message.success("Refreshed from the toolbar");
  }

  @Toolbar(buttonStyle = ButtonStyle.primary)
  @Label("Ship order")
  Message ship() {
    return Message.success("Shipped (a primary toolbar button)");
  }

  @Button(order = 2)
  Message printInvoice() {
    return Message.success("Invoice printed (a form button)");
  }

  @Button(order = 1)
  @Action(validationRequired = true)
  Message save() {
    return Message.success("Saved " + customer + " (a validated form button)");
  }

  @Action(shortcut = "ctrl+alt+r")
  Message recalculate() {
    return Message.success("Recalculated — an @Action with no button, reached by Ctrl+Alt+R");
  }
}
