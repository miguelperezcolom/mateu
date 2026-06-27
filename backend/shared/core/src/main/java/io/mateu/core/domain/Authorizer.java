package io.mateu.core.domain;

import static io.mateu.core.infra.JsonSerializer.fromJson;

import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Decides whether a restricted ({@link EyesOnly}) element is visible for the current request, by
 * inspecting the standard JWT Bearer token. Provider-agnostic: roles are gathered from the common
 * claim shapes (Keycloak {@code realm_access.roles} and {@code resource_access.*.roles}, plus a
 * top-level {@code roles} claim as used by Okta / Azure AD / generic OIDC); groups, scopes and
 * permissions come from their conventional claims. A token only needs to satisfy each dimension the
 * annotation actually declares (AND across declared dimensions, OR within each).
 */
public class Authorizer {

  public static boolean isAuthorized(EyesOnly eyesOnly, HttpRequest httpRequest) {
    if (eyesOnly == null) return true;
    boolean restricted =
        eyesOnly.roles().length > 0
            || eyesOnly.groups().length > 0
            || eyesOnly.scopes().length > 0
            || eyesOnly.permissions().length > 0;
    if (!restricted) return true;
    if (httpRequest == null) return false; // restrictions present but no request → deny

    String authHeader = httpRequest.getHeaderValue("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      return false; // no token → no access to restricted content
    }

    try {
      String token = authHeader.substring(7);
      String[] parts = token.split("\\.");
      if (parts.length < 2) return false;

      String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
      Map<String, Object> claims = fromJson(payload);

      if (eyesOnly.roles().length > 0 && !anyMatch(extractRoles(claims), eyesOnly.roles())) {
        return false;
      }
      if (eyesOnly.groups().length > 0
          && !anyMatch(asStringList(claims.get("groups")), eyesOnly.groups())) {
        return false;
      }
      if (eyesOnly.scopes().length > 0 && !anyMatch(extractScopes(claims), eyesOnly.scopes())) {
        return false;
      }
      if (eyesOnly.permissions().length > 0
          && !anyMatch(asStringList(claims.get("permissions")), eyesOnly.permissions())) {
        return false;
      }
      return true;

    } catch (Exception e) {
      // Malformed token or cast error → deny by default
      return false;
    }
  }

  /** Roles from Keycloak (realm_access.roles + resource_access.*.roles) and top-level "roles". */
  @SuppressWarnings("unchecked")
  private static List<String> extractRoles(Map<String, Object> claims) {
    Set<String> roles = new LinkedHashSet<>();
    Object realmAccess = claims.get("realm_access");
    if (realmAccess instanceof Map<?, ?> ra) {
      roles.addAll(asStringList(((Map<String, Object>) ra).get("roles")));
    }
    Object resourceAccess = claims.get("resource_access");
    if (resourceAccess instanceof Map<?, ?> resources) {
      for (Object client : resources.values()) {
        if (client instanceof Map<?, ?> c) {
          roles.addAll(asStringList(((Map<String, Object>) c).get("roles")));
        }
      }
    }
    roles.addAll(asStringList(claims.get("roles"))); // Okta / Azure AD / generic OIDC
    return new ArrayList<>(roles);
  }

  /**
   * Scopes from the standard space-delimited "scope" claim (or the "scp" array used by Azure AD).
   */
  private static List<String> extractScopes(Map<String, Object> claims) {
    Object scope = claims.get("scope");
    if (scope instanceof String s) return Arrays.asList(s.split(" "));
    return asStringList(claims.getOrDefault("scp", scope));
  }

  /** Coerce a claim value (List, space-delimited String, or null) into a list of strings. */
  @SuppressWarnings("unchecked")
  private static List<String> asStringList(Object value) {
    if (value instanceof List<?> list) {
      List<String> out = new ArrayList<>(list.size());
      for (Object o : list) if (o != null) out.add(String.valueOf(o));
      return out;
    }
    if (value instanceof String s && !s.isBlank()) return Arrays.asList(s.split(" "));
    return List.of();
  }

  private static boolean anyMatch(List<String> have, String[] required) {
    return Arrays.stream(required).anyMatch(have::contains);
  }
}
