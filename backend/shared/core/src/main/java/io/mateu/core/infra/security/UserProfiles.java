package io.mateu.core.infra.security;

import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.security.UserProfile;
import io.mateu.uidl.security.UserProfileSupplier;
import java.security.Principal;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;

/**
 * The signed-in user the header's user menu shows. Only for a caller with an identity ({@link
 * IdentityResolver}); then the app's {@link UserProfileSupplier} beans first, else what the
 * principal the framework authenticated says about the person:
 *
 * <ul>
 *   <li>name: {@code name}, else {@code given_name} + {@code family_name}, else {@code
 *       preferred_username}, {@code login} (GitHub), {@code nickname}, else the identity's name;
 *   <li>email: {@code email};
 *   <li>picture: {@code picture} (OIDC), else {@code avatar_url} (GitHub) — http(s) only.
 * </ul>
 *
 * Read from the login's user attributes (Spring's OAuth2 login) and the token's claims. Display
 * only: nothing here grants or denies.
 */
@Slf4j
public final class UserProfiles {

  private UserProfiles() {}

  /** The signed-in user, or empty for an anonymous caller. */
  public static Optional<UserProfile> of(HttpRequest httpRequest) {
    var identity = IdentityResolver.resolve(httpRequest);
    if (identity.name() == null || identity.name().isBlank()) {
      return Optional.empty();
    }
    for (var supplier : suppliers()) {
      try {
        var supplied = supplier.profile(httpRequest);
        if (supplied != null && supplied.isPresent()) {
          return supplied;
        }
      } catch (RuntimeException e) {
        log.warn("UserProfileSupplier {} failed: {}", supplier.getClass().getName(), e.toString());
      }
    }
    Principal principal = null;
    try {
      principal = httpRequest.getUserPrincipal();
    } catch (RuntimeException ignored) {
      // an adapter that cannot tell
    }
    Map<String, Object> claims = new LinkedHashMap<>();
    if (principal != null) {
      claims.putAll(CallerIdentities.loginAttributesOf(principal));
      CallerIdentities.claimsOf(principal).forEach(claims::putIfAbsent);
    }
    return Optional.of(fromClaims(claims, identity.name()));
  }

  /** What the claims say about the person; {@code fallbackName} when they name nobody. */
  static UserProfile fromClaims(Map<String, Object> claims, String fallbackName) {
    var name = text(claims, "name");
    if (name == null) {
      var given = text(claims, "given_name");
      var family = text(claims, "family_name");
      if (given != null || family != null) {
        name = ((given != null ? given : "") + " " + (family != null ? family : "")).trim();
      }
    }
    if (name == null) name = text(claims, "preferred_username");
    if (name == null) name = text(claims, "login");
    if (name == null) name = text(claims, "nickname");
    if (name == null) name = fallbackName;
    var picture = text(claims, "picture");
    if (!isHttp(picture)) picture = text(claims, "avatar_url");
    return new UserProfile(name, text(claims, "email"), isHttp(picture) ? picture : null);
  }

  private static String text(Map<String, Object> claims, String key) {
    var value = claims.get(key);
    if (value == null) return null;
    var text = String.valueOf(value).trim();
    return text.isEmpty() ? null : text;
  }

  private static boolean isHttp(String url) {
    return url != null && (url.startsWith("https://") || url.startsWith("http://"));
  }

  private static Collection<UserProfileSupplier> suppliers() {
    try {
      if (!MateuBeanProvider.isInitialized()) {
        return List.of();
      }
      return MateuBeanProvider.getSingletonBeans(UserProfileSupplier.class);
    } catch (RuntimeException notInitialised) {
      return List.of();
    }
  }
}
