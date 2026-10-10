package io.mateu.core.domain;

import io.mateu.core.infra.security.IdentityResolver;
import io.mateu.uidl.annotations.DisabledUnless;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.ReadOnlyUnless;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.security.CallerIdentity;
import java.util.Arrays;
import java.util.List;

/**
 * Decides whether a restricted ({@link EyesOnly}, {@link ReadOnlyUnless}, {@link DisabledUnless},
 * YAML {@code access:}) element is available for the current request. The caller's identity comes
 * from {@link IdentityResolver} — the framework's authenticated principal, a {@code
 * PrincipalResolver}, or a Bearer token whose signature was VERIFIED — never from an unverified
 * token (unless the local-development opt-out {@code mateu.security.trust-unverified-tokens=true}
 * is on). A caller only needs to satisfy each dimension the annotation actually declares (AND
 * across declared dimensions, OR within each).
 */
public class Authorizer {

  /** Whether the request satisfies an {@link EyesOnly} restriction (used for visibility). */
  public static boolean isAuthorized(EyesOnly eyesOnly, HttpRequest httpRequest) {
    if (eyesOnly == null) return true;
    return matches(
        eyesOnly.roles(),
        eyesOnly.groups(),
        eyesOnly.scopes(),
        eyesOnly.permissions(),
        httpRequest);
  }

  /** Whether the request satisfies a {@link ReadOnlyUnless} restriction (else the field is RO). */
  public static boolean isAuthorized(ReadOnlyUnless readOnlyUnless, HttpRequest httpRequest) {
    if (readOnlyUnless == null) return true;
    return matches(
        readOnlyUnless.roles(),
        readOnlyUnless.groups(),
        readOnlyUnless.scopes(),
        readOnlyUnless.permissions(),
        httpRequest);
  }

  /** Whether the request satisfies a {@link DisabledUnless} restriction (else the field is off). */
  public static boolean isAuthorized(DisabledUnless disabledUnless, HttpRequest httpRequest) {
    if (disabledUnless == null) return true;
    return matches(
        disabledUnless.roles(),
        disabledUnless.groups(),
        disabledUnless.scopes(),
        disabledUnless.permissions(),
        httpRequest);
  }

  /**
   * Whether the request satisfies an {@link io.mateu.uidl.data.Access} restriction authored as data
   * ({@code access:} / {@code eyesOnly:} / {@code readOnlyUnless:} / {@code disabledUnless:} in
   * YAML). The SAME predicate as the annotations — one rule, two spellings.
   */
  public static boolean isAuthorized(io.mateu.uidl.data.Access access, HttpRequest httpRequest) {
    if (access == null) return true;
    return matches(
        access.roles().toArray(String[]::new),
        access.groups().toArray(String[]::new),
        access.scopes().toArray(String[]::new),
        access.permissions().toArray(String[]::new),
        httpRequest);
  }

  /**
   * Core identity predicate shared by every access-control annotation: true unless the declared
   * dimensions are present and the caller's identity fails to satisfy them (AND across declared
   * dimensions, OR within each). No dimension declared → true; no request / no trusted identity →
   * false.
   */
  private static boolean matches(
      String[] roles,
      String[] groups,
      String[] scopes,
      String[] permissions,
      HttpRequest httpRequest) {
    boolean restricted =
        roles.length > 0 || groups.length > 0 || scopes.length > 0 || permissions.length > 0;
    if (!restricted) return true;
    if (httpRequest == null) return false; // restrictions present but no request → deny

    CallerIdentity identity = IdentityResolver.resolve(httpRequest);
    if (roles.length > 0 && !anyMatch(identity.roles(), roles)) {
      return false;
    }
    if (groups.length > 0 && !anyMatch(identity.groups(), groups)) {
      return false;
    }
    if (scopes.length > 0 && !anyMatch(identity.scopes(), scopes)) {
      return false;
    }
    return permissions.length == 0 || anyMatch(identity.permissions(), permissions);
  }

  private static boolean anyMatch(List<String> have, String[] required) {
    return Arrays.stream(required).anyMatch(have::contains);
  }
}
