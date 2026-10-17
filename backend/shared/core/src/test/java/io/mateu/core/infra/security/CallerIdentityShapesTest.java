package io.mateu.core.infra.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

/**
 * Mateu reads the caller from whatever the host framework authenticated, so each framework's
 * principal shape must yield the same identity: Spring's authorities (ROLE_/SCOPE_/plain) and token
 * attributes, Micronaut's attributes + roles, MicroProfile JWT's claims + groups, Keycloak's
 * realm/client roles; and an anonymous or unauthenticated principal is nobody.
 */
class CallerIdentityShapesTest {

  /** Spring Security shape: getAuthorities() of objects with getAuthority(), token attributes. */
  public static class SpringLikeToken implements Principal {
    public record Authority(String value) {
      public String getAuthority() {
        return value;
      }
    }

    public List<Object> getAuthorities() {
      return List.of(
          new Authority("ROLE_admin"),
          new Authority("SCOPE_orders.read"),
          new Authority("approve-invoices"),
          "not an authority object");
    }

    public Map<String, Object> getTokenAttributes() {
      return Map.of("sub", "u-1", "scope", "profile  email", "groups", List.of("ops"));
    }

    public boolean isAuthenticated() {
      return true;
    }

    @Override
    public String getName() {
      return "ada";
    }
  }

  /** Micronaut Security shape: getAttributes() + getRoles(). */
  public static class MicronautLike implements Principal {
    public Map<String, Object> getAttributes() {
      return Map.of("preferred_username", "grace", "permissions", "read write");
    }

    public List<String> getRoles() {
      return List.of("clerk");
    }

    @Override
    public String getName() {
      return null; // the name then comes from the claims
    }
  }

  /** MicroProfile JWT shape: claim names + getClaim(name) + getGroups(). */
  public static class MpJwtLike implements Principal {
    public Set<String> getClaimNames() {
      return Set.of("sub", "scp", "missing");
    }

    public Object getClaim(String name) {
      return switch (name) {
        case "sub" -> "u-9";
        case "scp" -> List.of("a", "b");
        default -> null;
      };
    }

    public Set<String> getGroups() {
      return Set.of("auditors");
    }

    @Override
    public String getName() {
      return "linus";
    }
  }

  public static class AnonymousAuthenticationToken implements Principal {
    @Override
    public String getName() {
      return "anonymousUser";
    }
  }

  public static class NotAuthenticated implements Principal {
    public boolean isAuthenticated() {
      return false;
    }

    @Override
    public String getName() {
      return "someone";
    }
  }

  @Test
  void springAuthoritiesSplitIntoRolesScopesAndPermissions() {
    var id = CallerIdentities.fromPrincipal(new SpringLikeToken()).orElseThrow();
    assertThat(id.name()).isEqualTo("ada");
    assertThat(id.roles()).contains("admin", "approve-invoices");
    assertThat(id.scopes()).contains("orders.read", "profile", "email");
    assertThat(id.permissions()).contains("approve-invoices");
    assertThat(id.groups()).containsExactly("ops");
  }

  @Test
  void micronautAttributesAndRolesAreRead() {
    var id = CallerIdentities.fromPrincipal(new MicronautLike()).orElseThrow();
    assertThat(id.name()).isEqualTo("grace");
    assertThat(id.roles()).containsExactly("clerk");
    assertThat(id.permissions()).containsExactly("read", "write");
  }

  @Test
  void microProfileClaimsAndGroupsAreRead() {
    var id = CallerIdentities.fromPrincipal(new MpJwtLike()).orElseThrow();
    assertThat(id.name()).isEqualTo("linus");
    assertThat(id.scopes()).containsExactly("a", "b");
    assertThat(id.roles()).containsExactly("auditors");
    assertThat(id.groups()).containsExactly("auditors");
  }

  @Test
  void anonymousAndUnauthenticatedPrincipalsAreNobody() {
    assertThat(CallerIdentities.fromPrincipal(new AnonymousAuthenticationToken())).isEmpty();
    assertThat(CallerIdentities.fromPrincipal(new NotAuthenticated())).isEmpty();
    assertThat(CallerIdentities.fromPrincipal(null)).isEmpty();
  }

  @Test
  void keycloakRealmAndClientRolesAndOidcRolesAreAllRoles() {
    var id =
        CallerIdentities.fromClaims(
            Map.of(
                "sub", "u-2",
                "realm_access", Map.of("roles", List.of("realm-admin")),
                "resource_access",
                    Map.of("app", Map.of("roles", List.of("app-editor")), "junk", "x"),
                "roles", List.of("oidc-role"),
                "groups", " "));
    assertThat(id.name()).isEqualTo("u-2");
    assertThat(id.roles()).containsExactly("realm-admin", "app-editor", "oidc-role");
    assertThat(id.groups()).isEmpty();
    assertThat(CallerIdentities.fromClaims(null).roles()).isEmpty();
  }
}
