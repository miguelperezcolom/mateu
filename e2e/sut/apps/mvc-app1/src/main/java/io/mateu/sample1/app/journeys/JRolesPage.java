package io.mateu.sample1.app.journeys;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.DisabledUnless;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.ReadOnlyUnless;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;

/**
 * One screen, three callers (tests/journeys/access.spec.ts): anonymous sees neither the internal
 * note nor an editable credit limit; staff sees the note; a manager can also edit the limit and
 * approve. The roles come from {@link CookieRolesPrincipalResolver}.
 */
@UI("/j/roles")
@Title("Customer access")
public class JRolesPage {

  String customer = "Acme Corp";

  @EyesOnly(roles = "staff")
  String internalNote = "Pays late on purpose";

  @ReadOnlyUnless(roles = "manager")
  String creditLimit = "5000";

  @Button
  @DisabledUnless(roles = "manager")
  public Message approve() {
    return new Message("Approved " + customer + " with a limit of " + creditLimit);
  }
}
