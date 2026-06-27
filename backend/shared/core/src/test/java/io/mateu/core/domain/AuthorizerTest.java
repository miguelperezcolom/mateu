package io.mateu.core.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.annotation.Annotation;
import java.util.Base64;
import java.util.Map;
import org.junit.jupiter.api.Test;

class AuthorizerTest {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  // ── helpers ────────────────────────────────────────────────────────────────

  private static String jwt(Map<String, Object> claims) {
    try {
      String enc =
          Base64.getUrlEncoder().withoutPadding().encodeToString(MAPPER.writeValueAsBytes(claims));
      return "header." + enc + ".sig";
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  private static HttpRequest requestWith(Map<String, Object> claims) {
    HttpRequest req = mock(HttpRequest.class);
    when(req.getHeaderValue("Authorization")).thenReturn("Bearer " + jwt(claims));
    return req;
  }

  private static EyesOnly eyesOnly(
      String[] roles, String[] groups, String[] scopes, String[] permissions) {
    return new EyesOnly() {
      public Class<? extends Annotation> annotationType() {
        return EyesOnly.class;
      }

      public String[] roles() {
        return roles;
      }

      public String[] groups() {
        return groups;
      }

      public String[] scopes() {
        return scopes;
      }

      public String[] permissions() {
        return permissions;
      }
    };
  }

  private static final String[] NONE = new String[0];

  // ── tests ──────────────────────────────────────────────────────────────────

  @Test
  void noAnnotationIsAlwaysAuthorized() {
    assertThat(Authorizer.isAuthorized(null, null)).isTrue();
  }

  @Test
  void unrestrictedAnnotationIsAuthorizedWithoutToken() {
    assertThat(Authorizer.isAuthorized(eyesOnly(NONE, NONE, NONE, NONE), null)).isTrue();
  }

  @Test
  void restrictedButNoTokenIsDenied() {
    EyesOnly e = eyesOnly(new String[] {"admin"}, NONE, NONE, NONE);
    assertThat(Authorizer.isAuthorized(e, null)).isFalse();
    HttpRequest noAuth = mock(HttpRequest.class);
    when(noAuth.getHeaderValue("Authorization")).thenReturn(null);
    assertThat(Authorizer.isAuthorized(e, noAuth)).isFalse();
  }

  @Test
  void keycloakRealmRoleMatches() {
    var req =
        requestWith(Map.of("realm_access", Map.of("roles", java.util.List.of("admin", "user"))));
    assertThat(Authorizer.isAuthorized(eyesOnly(new String[] {"admin"}, NONE, NONE, NONE), req))
        .isTrue();
    assertThat(
            Authorizer.isAuthorized(eyesOnly(new String[] {"superadmin"}, NONE, NONE, NONE), req))
        .isFalse();
  }

  @Test
  void keycloakClientRoleMatches() {
    var req =
        requestWith(
            Map.of(
                "resource_access", Map.of("my-app", Map.of("roles", java.util.List.of("editor")))));
    assertThat(Authorizer.isAuthorized(eyesOnly(new String[] {"editor"}, NONE, NONE, NONE), req))
        .isTrue();
  }

  @Test
  void oktaAzureTopLevelRolesClaimMatches() {
    var req = requestWith(Map.of("roles", java.util.List.of("Finance.Reader")));
    assertThat(
            Authorizer.isAuthorized(
                eyesOnly(new String[] {"Finance.Reader"}, NONE, NONE, NONE), req))
        .isTrue();
  }

  @Test
  void groupsClaimMatches() {
    var req = requestWith(Map.of("groups", java.util.List.of("finance", "ops")));
    assertThat(Authorizer.isAuthorized(eyesOnly(NONE, new String[] {"finance"}, NONE, NONE), req))
        .isTrue();
    assertThat(Authorizer.isAuthorized(eyesOnly(NONE, new String[] {"hr"}, NONE, NONE), req))
        .isFalse();
  }

  @Test
  void scopesClaimMatches() {
    var req = requestWith(Map.of("scope", "openid profile orders:read"));
    assertThat(
            Authorizer.isAuthorized(eyesOnly(NONE, NONE, new String[] {"orders:read"}, NONE), req))
        .isTrue();
    assertThat(
            Authorizer.isAuthorized(eyesOnly(NONE, NONE, new String[] {"orders:write"}, NONE), req))
        .isFalse();
  }

  @Test
  void auth0PermissionsClaimMatches() {
    var req = requestWith(Map.of("permissions", java.util.List.of("read:invoices")));
    assertThat(
            Authorizer.isAuthorized(
                eyesOnly(NONE, NONE, NONE, new String[] {"read:invoices"}), req))
        .isTrue();
  }

  @Test
  void allDeclaredDimensionsMustBeSatisfied() {
    var req =
        requestWith(
            Map.of(
                "realm_access", Map.of("roles", java.util.List.of("admin")),
                "groups", java.util.List.of("ops")));
    // role matches but group does not → denied
    assertThat(
            Authorizer.isAuthorized(
                eyesOnly(new String[] {"admin"}, new String[] {"finance"}, NONE, NONE), req))
        .isFalse();
    // both match → authorized
    assertThat(
            Authorizer.isAuthorized(
                eyesOnly(new String[] {"admin"}, new String[] {"ops"}, NONE, NONE), req))
        .isTrue();
  }
}
