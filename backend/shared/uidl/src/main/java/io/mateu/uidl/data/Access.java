package io.mateu.uidl.data;

import java.util.List;

/**
 * An identity restriction authored as DATA — the YAML twin of {@code @EyesOnly}, {@code
 * ReadOnlyUnless} and {@code DisabledUnless}, with the same four dimensions and the same matching
 * (it is evaluated by the very same {@code Authorizer}): a request satisfies it when its JWT Bearer
 * token carries at least one of the listed values in EVERY dimension that lists any (AND across
 * dimensions, OR within one). No dimension listed means unrestricted; no token means denied.
 *
 * <p>Where it is authored, and what an unsatisfied one does — always decided on the SERVER from the
 * request identity, never in the browser:
 *
 * <ul>
 *   <li>{@code access:} on a route entry ({@code routes.yaml}) — the route, and everything nested
 *       under it, answers 403 (the same as a class-level {@code @EyesOnly} on a {@code @UI});
 *   <li>{@code access:} on an app-shell menu item — the item is not sent (a link to a route that
 *       declares {@code access:} inherits it);
 *   <li>{@code access:} on a declared action ({@code actions:}) — the action is not advertised, a
 *       button naming it is disabled, and a call that reaches the server anyway answers 403;
 *   <li>{@code eyesOnly:} / {@code readOnlyUnless:} / {@code disabledUnless:} on any component of a
 *       definition — the component is removed / made read-only / disabled.
 * </ul>
 *
 * <p>Named {@link #restricts()} rather than {@code isRestricted()}: this record travels in the
 * bundle manifest (inside a route entry), and Jackson reads an {@code isX()} accessor on a record
 * as an extra property that then fails to deserialise.
 */
public record Access(
    List<String> roles, List<String> groups, List<String> scopes, List<String> permissions) {

  public Access {
    roles = roles == null ? List.of() : List.copyOf(roles);
    groups = groups == null ? List.of() : List.copyOf(groups);
    scopes = scopes == null ? List.of() : List.copyOf(scopes);
    permissions = permissions == null ? List.of() : List.copyOf(permissions);
  }

  /** Restricted to the given roles only — the common case. */
  public static Access roles(String... roles) {
    return new Access(List.of(roles), null, null, null);
  }

  /** Whether any dimension is declared — an empty restriction lets everybody through. */
  public boolean restricts() {
    return !roles.isEmpty() || !groups.isEmpty() || !scopes.isEmpty() || !permissions.isEmpty();
  }
}
