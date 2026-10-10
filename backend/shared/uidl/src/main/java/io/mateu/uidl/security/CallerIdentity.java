package io.mateu.uidl.security;

import java.util.List;

/**
 * Who is calling, as far as Mateu's access control is concerned: the dimensions {@code @EyesOnly},
 * {@code @ReadOnlyUnless}, {@code @DisabledUnless} and YAML {@code access:} match against.
 *
 * <p>Only a TRUSTED source may produce one: the principal the hosting framework already
 * authenticated (Spring Security, Quarkus/Micronaut/Helidon security, a JAX-RS {@code
 * SecurityContext}) or a {@link PrincipalResolver} the application supplies. Never the payload of a
 * Bearer token Mateu would decode itself — anyone can write one; Mateu does not authenticate.
 *
 * @param name the principal's name (display only; null when unknown)
 * @param roles roles
 * @param groups groups
 * @param scopes OAuth scopes
 * @param permissions fine-grained permissions
 */
public record CallerIdentity(
    String name,
    List<String> roles,
    List<String> groups,
    List<String> scopes,
    List<String> permissions) {

  private static final CallerIdentity ANONYMOUS =
      new CallerIdentity(null, List.of(), List.of(), List.of(), List.of());

  public CallerIdentity {
    roles = roles == null ? List.of() : List.copyOf(roles);
    groups = groups == null ? List.of() : List.copyOf(groups);
    scopes = scopes == null ? List.of() : List.copyOf(scopes);
    permissions = permissions == null ? List.of() : List.copyOf(permissions);
  }

  /** No identity: every restricted element is denied. */
  public static CallerIdentity anonymous() {
    return ANONYMOUS;
  }

  /** A caller known only by its name and roles. */
  public static CallerIdentity withRoles(String name, List<String> roles) {
    return new CallerIdentity(name, roles, List.of(), List.of(), List.of());
  }
}
