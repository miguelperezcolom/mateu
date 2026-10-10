package io.mateu.core.infra.security;

import io.mateu.uidl.security.CallerIdentity;
import java.lang.reflect.Method;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Builds a {@link CallerIdentity} from the principal the hosting framework authenticated (and,
 * through {@link #fromClaims}, from the claims that principal carries).
 *
 * <p>Claims are read provider-agnostically: roles from Keycloak ({@code realm_access.roles}, {@code
 * resource_access.*.roles}) plus a top-level {@code roles} claim (Okta / Azure AD / generic OIDC);
 * groups from {@code groups}; scopes from the space-delimited {@code scope} claim or the {@code
 * scp} array; permissions from {@code permissions}.
 *
 * <p>Framework principals are read REFLECTIVELY, so the core needs no security library:
 *
 * <ul>
 *   <li>Spring Security — an {@code Authentication}: its {@code getTokenAttributes()} (a verified
 *       JWT / introspected token) as claims, and its authorities: {@code ROLE_x} → role {@code x},
 *       {@code SCOPE_x} → scope {@code x}, anything else → both a role and a permission;
 *   <li>MicroProfile JWT ({@code JsonWebToken}: Quarkus, Helidon) — its claims, and {@code
 *       getGroups()} as groups AND roles (what MP JWT maps {@code @RolesAllowed} to);
 *   <li>Micronaut Security — an {@code Authentication}: {@code getRoles()} and {@code
 *       getAttributes()} as claims;
 *   <li>{@link AuthenticatedPrincipal} — what an adapter builds when its framework exposes the
 *       identity some other way (Quarkus' {@code SecurityIdentity});
 *   <li>any other principal — known by its name only (no roles).
 * </ul>
 */
public final class CallerIdentities {

  private CallerIdentities() {}

  /** The identity carried by VERIFIED claims. */
  public static CallerIdentity fromClaims(Map<String, Object> claims) {
    if (claims == null) {
      return CallerIdentity.anonymous();
    }
    return new CallerIdentity(
        nameOf(claims),
        extractRoles(claims),
        asStringList(claims.get("groups")),
        extractScopes(claims),
        asStringList(claims.get("permissions")));
  }

  /** The identity of a principal the hosting framework authenticated; empty when there is none. */
  @SuppressWarnings("unchecked")
  public static Optional<CallerIdentity> fromPrincipal(Principal principal) {
    if (principal == null || isAnonymous(principal)) {
      return Optional.empty();
    }
    if (principal instanceof AuthenticatedPrincipal authenticated) {
      return Optional.of(authenticated.identity());
    }
    Map<String, Object> claims = new LinkedHashMap<>();
    Object tokenAttributes = invoke(principal, "getTokenAttributes"); // Spring Security
    if (tokenAttributes instanceof Map<?, ?> map) {
      claims.putAll((Map<String, Object>) map);
    }
    Object attributes = invoke(principal, "getAttributes"); // Micronaut Security
    if (attributes instanceof Map<?, ?> map) {
      map.forEach((k, v) -> claims.putIfAbsent(String.valueOf(k), v));
    }
    Object claimNames = invoke(principal, "getClaimNames"); // MicroProfile JWT
    if (claimNames instanceof Collection<?> names) {
      for (Object name : names) {
        Object value = invoke(principal, "getClaim", String.valueOf(name));
        if (value != null) {
          claims.putIfAbsent(String.valueOf(name), plain(value));
        }
      }
    }
    var base = fromClaims(claims);
    Set<String> roles = new LinkedHashSet<>(base.roles());
    Set<String> groups = new LinkedHashSet<>(base.groups());
    Set<String> scopes = new LinkedHashSet<>(base.scopes());
    Set<String> permissions = new LinkedHashSet<>(base.permissions());
    Object authorities = invoke(principal, "getAuthorities"); // Spring Security
    if (authorities instanceof Collection<?> granted) {
      for (Object authority : granted) {
        Object text = invoke(authority, "getAuthority");
        if (text == null) {
          continue;
        }
        var value = String.valueOf(text);
        if (value.startsWith("ROLE_")) {
          roles.add(value.substring("ROLE_".length()));
        } else if (value.startsWith("SCOPE_")) {
          scopes.add(value.substring("SCOPE_".length()));
        } else {
          roles.add(value);
          permissions.add(value);
        }
      }
    }
    Object micronautRoles = invoke(principal, "getRoles"); // Micronaut Security
    if (micronautRoles instanceof Collection<?> values) {
      values.forEach(v -> roles.add(String.valueOf(v)));
    }
    Object mpGroups = invoke(principal, "getGroups"); // MicroProfile JWT
    if (mpGroups instanceof Collection<?> values) {
      values.forEach(
          v -> {
            roles.add(String.valueOf(v));
            groups.add(String.valueOf(v));
          });
    }
    var name = principal.getName() != null ? principal.getName() : base.name();
    return Optional.of(
        new CallerIdentity(
            name,
            List.copyOf(roles),
            List.copyOf(groups),
            List.copyOf(scopes),
            List.copyOf(permissions)));
  }

  private static boolean isAnonymous(Principal principal) {
    if (principal.getClass().getSimpleName().contains("Anonymous")) {
      return true; // Spring's AnonymousAuthenticationToken is "authenticated" — but nobody
    }
    return invoke(principal, "isAuthenticated") instanceof Boolean authenticated && !authenticated;
  }

  private static String nameOf(Map<String, Object> claims) {
    var preferred = claims.get("preferred_username");
    if (preferred != null) {
      return String.valueOf(preferred);
    }
    var subject = claims.get("sub");
    return subject != null ? String.valueOf(subject) : null;
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

  /** Scopes from the space-delimited "scope" claim (or the "scp" array used by Azure AD). */
  private static List<String> extractScopes(Map<String, Object> claims) {
    Object scope = claims.get("scope");
    if (scope instanceof String s) {
      return Arrays.stream(s.split(" ")).filter(v -> !v.isBlank()).toList();
    }
    return asStringList(claims.getOrDefault("scp", scope));
  }

  /** Coerce a claim value (Collection, space-delimited String, or null) into a list of strings. */
  static List<String> asStringList(Object value) {
    if (value instanceof Collection<?> list) {
      List<String> out = new ArrayList<>(list.size());
      for (Object o : list) {
        if (o != null) {
          out.add(String.valueOf(plain(o)));
        }
      }
      return out;
    }
    if (value instanceof String s && !s.isBlank()) {
      return Arrays.stream(s.split(" ")).filter(v -> !v.isBlank()).toList();
    }
    return List.of();
  }

  /** A JSON-P value (MicroProfile JWT claims) as a plain Java value. */
  private static Object plain(Object value) {
    var type = value.getClass().getName();
    if (type.startsWith("jakarta.json.") || type.startsWith("org.glassfish.json.")) {
      Object string = invoke(value, "getString");
      if (string != null) {
        return string;
      }
      if (value instanceof Collection<?> values) {
        return values.stream().map(CallerIdentities::plain).toList();
      }
      if (value instanceof Map<?, ?> map) {
        Map<String, Object> out = new LinkedHashMap<>();
        map.forEach((k, v) -> out.put(String.valueOf(k), v == null ? null : plain(v)));
        return out;
      }
      var text = value.toString();
      return text.length() > 1 && text.startsWith("\"") && text.endsWith("\"")
          ? text.substring(1, text.length() - 1)
          : text;
    }
    return value;
  }

  private static Object invoke(Object target, String method, Object... args) {
    if (target == null) {
      return null;
    }
    try {
      Class<?>[] types = new Class<?>[args.length];
      Arrays.fill(types, String.class);
      Method m = target.getClass().getMethod(method, types);
      m.trySetAccessible(); // a public method declared on a package-private implementation class
      return m.invoke(target, args);
    } catch (ReflectiveOperationException | RuntimeException e) {
      return null;
    }
  }
}
