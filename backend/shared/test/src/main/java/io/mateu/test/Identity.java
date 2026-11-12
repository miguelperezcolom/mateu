package io.mateu.test;

import io.mateu.core.infra.security.AuthenticatedPrincipal;
import io.mateu.core.infra.security.CallerIdentities;
import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.security.CallerIdentity;
import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * Who the test is, as far as Mateu's access rules ({@code @EyesOnly}, {@code @ReadOnlyUnless},
 * {@code @DisabledUnless}, YAML {@code access:}) are concerned. Mateu does not authenticate: in an
 * app it reads the principal the host framework authenticated; in a test, the test states it.
 */
@Experimental("test harness (3.0)")
public final class Identity {

  private static final Identity ANONYMOUS = new Identity(null);

  private final CallerIdentity caller;

  private Identity(CallerIdentity caller) {
    this.caller = caller;
  }

  /**
   * Nobody signed in: every restricted element is denied. The default.
   *
   * @return the anonymous identity
   */
  public static Identity anonymous() {
    return ANONYMOUS;
  }

  /**
   * A signed-in user with these roles.
   *
   * @param roles the roles
   * @return the identity
   */
  public static Identity withRoles(String... roles) {
    return new Identity(CallerIdentity.withRoles("test-user", List.of(roles)));
  }

  /**
   * A signed-in user described by token claims, read the way Mateu reads a token the framework
   * verified ({@code sub}, {@code roles}, {@code groups}, {@code scope}, {@code permissions}…).
   *
   * @param claims the claims
   * @return the identity
   */
  public static Identity withClaims(Map<String, ?> claims) {
    @SuppressWarnings("unchecked")
    var map = (Map<String, Object>) claims;
    return new Identity(CallerIdentities.fromClaims(map));
  }

  /**
   * Every dimension spelled out.
   *
   * @param caller the caller
   * @return the identity
   */
  public static Identity of(CallerIdentity caller) {
    return new Identity(caller);
  }

  Principal principal() {
    return caller == null ? null : new AuthenticatedPrincipal(caller);
  }

  @Override
  public String toString() {
    return caller == null ? "anonymous" : caller.toString();
  }
}
