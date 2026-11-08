package io.mateu.explorer.examples.behaviour.permissions;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.security.CallerIdentity;
import io.mateu.uidl.security.PrincipalResolver;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

/**
 * A DEMO DEVICE — never do this in a real app.
 *
 * <p>Mateu does not authenticate: in a real app the caller's roles come from what your framework
 * authenticated (Spring Security, Quarkus OIDC, a JWT your gateway verified…), and Mateu reads them
 * from there. To let a visitor of the Explorer <em>feel</em> the permission annotations without
 * logging in, this resolver takes the role from the "Role (demo)" selector of {@link
 * PermissionsDemoApp} — an {@code @AppContext} value the browser sends with every request. Anybody
 * can pick any role, which is exactly why a real app must never trust a value the client chose.
 */
@Component
public class DemoRoleResolver implements PrincipalResolver {

  @Override
  public Optional<CallerIdentity> resolve(HttpRequest httpRequest) {
    var role = httpRequest.appContext("demoRole");
    if (role == null) {
      return Optional.empty(); // nothing picked: anonymous
    }
    return switch (role.toString()) {
      case "Staff" -> Optional.of(CallerIdentity.withRoles("demo-staff", List.of("staff")));
      case "Manager" ->
          Optional.of(CallerIdentity.withRoles("demo-manager", List.of("staff", "manager")));
      default -> Optional.empty(); // Guest
    };
  }
}
