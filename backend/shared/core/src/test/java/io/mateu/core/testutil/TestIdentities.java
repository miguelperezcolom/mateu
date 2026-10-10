package io.mateu.core.testutil;

import io.mateu.core.infra.security.AuthenticatedPrincipal;
import io.mateu.core.infra.security.CallerIdentities;
import io.mateu.uidl.security.CallerIdentity;
import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * Authenticated callers for tests. Mateu does not authenticate: it reads the principal the hosting
 * framework put on the request. Tests simulate that principal — directly, or through {@link
 * #ROLES_HEADER}, which {@link FakeHttpRequest} (the adapter stand-in of {@link TestMateu}) turns
 * into one.
 */
public final class TestIdentities {

  /** Test-only: comma-separated roles of the caller the "framework" authenticated. */
  public static final String ROLES_HEADER = "X-Test-Authenticated-Roles";

  private TestIdentities() {}

  /** The headers of a request whose caller the framework authenticated with these roles. */
  public static Map<String, String> headersWithRoles(String... roles) {
    return Map.of(ROLES_HEADER, String.join(",", roles));
  }

  /** A principal the framework authenticated, carrying these claims. */
  @SuppressWarnings("unchecked")
  public static Principal principal(Map<String, ?> claims) {
    return new AuthenticatedPrincipal(CallerIdentities.fromClaims((Map<String, Object>) claims));
  }

  /** A principal the framework authenticated, with these roles. */
  public static Principal principalWithRoles(String... roles) {
    return new AuthenticatedPrincipal(CallerIdentity.withRoles("test-user", List.of(roles)));
  }
}
