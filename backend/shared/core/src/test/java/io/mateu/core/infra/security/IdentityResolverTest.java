package io.mateu.core.infra.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import io.mateu.core.domain.Authorizer;
import io.mateu.uidl.data.Access;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.security.CallerIdentity;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.Base64;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * Mateu does not authenticate: roles come only from the principal the hosting framework
 * authenticated (or a PrincipalResolver). A Bearer token on its own — whatever it claims — is no
 * identity at all.
 */
class IdentityResolverTest {

  private static String unsigned(Map<String, Object> claims) {
    var enc = Base64.getUrlEncoder().withoutPadding();
    return enc.encodeToString("{\"alg\":\"none\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8))
        + "."
        + enc.encodeToString(
            io.mateu.core.infra.JsonSerializer.toJson(claims).getBytes(StandardCharsets.UTF_8))
        + ".";
  }

  private static HttpRequest bearer(String token) {
    HttpRequest req = mock(HttpRequest.class);
    when(req.getHeaderValue("Authorization")).thenReturn("Bearer " + token);
    return req;
  }

  private static boolean admin(HttpRequest req) {
    return Authorizer.isAuthorized(Access.roles("admin"), req);
  }

  @Test
  void aBearerTokenAloneGrantsNothing() {
    assertThat(admin(bearer(unsigned(Map.of("roles", List.of("admin")))))).isFalse();
    assertThat(admin(bearer(unsigned(Map.of("realm_access", Map.of("roles", List.of("admin")))))))
        .isFalse();
    assertThat(IdentityResolver.resolve(bearer("header.payload.signature")).roles()).isEmpty();
  }

  /** Spring Security's Authentication, as far as the reflective reader is concerned. */
  public static class FakeAuthentication implements Principal {
    public String getName() {
      return "ana";
    }

    public boolean isAuthenticated() {
      return true;
    }

    public Collection<FakeAuthority> getAuthorities() {
      return List.of(
          new FakeAuthority("ROLE_admin"),
          new FakeAuthority("SCOPE_orders:read"),
          new FakeAuthority("invoice.approve"));
    }

    public Map<String, Object> getTokenAttributes() {
      return Map.of("realm_access", Map.of("roles", List.of("auditor")), "groups", List.of("emea"));
    }
  }

  public record FakeAuthority(String authority) {
    public String getAuthority() {
      return authority;
    }
  }

  @Test
  void theFrameworkPrincipalGivesTheRoles() {
    HttpRequest req = bearer(unsigned(Map.of("roles", List.of("forged"))));
    when(req.getUserPrincipal()).thenReturn(new FakeAuthentication());
    var identity = IdentityResolver.resolve(req);
    assertThat(identity.name()).isEqualTo("ana");
    assertThat(identity.roles())
        .contains("admin", "auditor", "invoice.approve")
        .doesNotContain("forged");
    assertThat(identity.groups()).containsExactly("emea");
    assertThat(identity.scopes()).containsExactly("orders:read");
    assertThat(identity.permissions()).containsExactly("invoice.approve");
    assertThat(admin(req)).isTrue();
  }

  @Test
  void anAdapterBuiltPrincipalIsReadAsIs() {
    HttpRequest req = mock(HttpRequest.class);
    when(req.getUserPrincipal())
        .thenReturn(new AuthenticatedPrincipal(CallerIdentity.withRoles("bob", List.of("admin"))));
    assertThat(admin(req)).isTrue();
  }

  /** A MicroProfile JWT principal (Quarkus, Helidon): its groups are roles. */
  public static class FakeJsonWebToken implements Principal {
    public String getName() {
      return "carl";
    }

    public java.util.Set<String> getGroups() {
      return java.util.Set.of("admin");
    }

    public java.util.Set<String> getClaimNames() {
      return java.util.Set.of("scope");
    }

    public Object getClaim(String name) {
      return "scope".equals(name) ? "orders:write" : null;
    }
  }

  @Test
  void aMicroProfileJwtPrincipalGivesItsGroupsAndClaims() {
    HttpRequest req = mock(HttpRequest.class);
    when(req.getUserPrincipal()).thenReturn(new FakeJsonWebToken());
    var identity = IdentityResolver.resolve(req);
    assertThat(identity.roles()).containsExactly("admin");
    assertThat(identity.scopes()).containsExactly("orders:write");
  }

  @Test
  void anAnonymousFrameworkPrincipalIsNobody() {
    HttpRequest req = mock(HttpRequest.class);
    when(req.getUserPrincipal())
        .thenReturn(
            new Principal() {
              public String getName() {
                return "anonymousUser";
              }

              @SuppressWarnings("unused")
              public boolean isAuthenticated() {
                return false;
              }
            });
    assertThat(IdentityResolver.resolve(req).roles()).isEmpty();
  }

  @Test
  void noRequestIsNobody() {
    assertThat(IdentityResolver.resolve(null)).isEqualTo(CallerIdentity.anonymous());
  }
}
