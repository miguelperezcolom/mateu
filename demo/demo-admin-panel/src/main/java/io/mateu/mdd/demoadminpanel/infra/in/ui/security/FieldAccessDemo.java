package io.mateu.mdd.demoadminpanel.infra.in.ui.security;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.DisabledUnless;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnlyUnless;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import java.math.BigDecimal;

/**
 * Permission-driven field and button state. The same identity dimensions as {@link EyesOnly}
 * (roles/groups/scopes/permissions, read from the JWT Bearer token by {@code Authorizer}) drive
 * three states:
 *
 * <ul>
 *   <li>{@link EyesOnly} on a field — <b>hidden</b> unless authorized;
 *   <li>{@link ReadOnlyUnless} — <b>read-only</b> unless authorized (field or whole class);
 *   <li>{@link DisabledUnless} — <b>disabled</b> unless authorized (field or {@code @Button} /
 *       {@code @Toolbar} method).
 * </ul>
 *
 * <p>Without a matching Bearer token every restricted element is locked down (hidden / read-only /
 * disabled) — that is the correct default. Send a JWT whose claims include the required
 * roles/scopes to see them unlock. Matching is AND across declared dimensions, OR within each.
 */
@UI("/field-access")
@Title("Field access by permission")
public class FieldAccessDemo {

  @Label("Name (always editable)")
  String name = "Jane Doe";

  @EyesOnly(roles = "hr")
  @Label("SSN — hidden unless role 'hr'")
  String ssn = "***-**-1234";

  @ReadOnlyUnless(roles = "manager")
  @Label("Salary — read-only unless role 'manager'")
  BigDecimal salary = new BigDecimal("54000");

  @DisabledUnless(scopes = "write")
  @Label("Internal note — disabled unless scope 'write'")
  String note = "";

  @Toolbar
  @DisabledUnless(roles = "approver")
  Object approve(HttpRequest httpRequest) {
    return Message.success("Approved");
  }

  @Button
  Object save(HttpRequest httpRequest) {
    return Message.success("Saved");
  }
}
