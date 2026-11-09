package io.mateu.explorer.examples.behaviour.permissions;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.DisabledUnless;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.ReadOnlyUnless;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * One record, three access levels — all decided on the SERVER, per request, from the caller's
 * roles:
 *
 * <ul>
 *   <li>{@code @EyesOnly} — the field (and its value) is not sent at all unless authorised;
 *   <li>{@code @ReadOnlyUnless} — shown, but editable only when authorised;
 *   <li>{@code @DisabledUnless} — on a button: shown, but inert unless authorised.
 * </ul>
 */
@Title("Payroll record")
public class PayrollRecord {

  String employee = "Ada Lovelace";

  @ReadOnlyUnless(roles = "manager")
  String department = "Engineering";

  @EyesOnly(roles = {"staff", "manager"})
  String internalNotes = "Prefers async stand-ups";

  @EyesOnly(roles = "manager")
  Integer salary = 72000;

  @Button
  @DisabledUnless(roles = "manager")
  Message approveRaise() {
    return Message.success("Raise approved for " + employee);
  }

  @Button
  Message whoAmI(HttpRequest httpRequest) {
    var role = httpRequest.appContext("demoRole");
    return new Message("You are acting as: " + (role == null ? "Guest (nothing picked)" : role));
  }
}
