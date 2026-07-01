package io.mateu.core.domain;

import static io.mateu.core.infra.JsonSerializer.fromJson;

import io.mateu.uidl.annotations.DisabledUnless;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.ReadOnlyUnless;
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
   * Core identity predicate shared by every access-control annotation: true unless the declared
   * dimensions are present and the JWT Bearer token fails to satisfy them (AND across declared
   * dimensions, OR within each). No dimension declared → true; no request/token → false.
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

      if (roles.length > 0 && !anyMatch(extractRoles(claims), roles)) {
        return false;
      }
      if (groups.length > 0 && !anyMatch(asStringList(claims.get("groups")), groups)) {
        return false;
      }
      if (scopes.length > 0 && !anyMatch(extractScopes(claims), scopes)) {
        return false;
      }
      if (permissions.length > 0
          && !anyMatch(asStringList(claims.get("permissions")), permissions)) {
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
