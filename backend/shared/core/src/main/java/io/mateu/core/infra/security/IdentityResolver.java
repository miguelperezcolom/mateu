package io.mateu.core.infra.security;

import static io.mateu.core.infra.JsonSerializer.fromJson;

import io.mateu.core.infra.MateuSettings;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.security.CallerIdentity;
import io.mateu.uidl.security.PrincipalResolver;
import io.mateu.uidl.security.TokenVerifier;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicBoolean;
import lombok.extern.slf4j.Slf4j;

/**
 * Who the caller is — the ONE place Mateu's access control ({@code @EyesOnly},
 * {@code @ReadOnlyUnless}, {@code @DisabledUnless}, YAML {@code access:}, menu visibility) gets its
 * identity from. Sources, first match wins:
 *
 * <ol>
 *   <li>a {@link PrincipalResolver} bean supplied by the application;
 *   <li>the principal the hosting framework authenticated ({@link HttpRequest#getUserPrincipal()}:
 *       Spring Security, Micronaut/Quarkus/Helidon security, JAX-RS);
 *   <li>the Bearer token, VERIFIED by a {@link TokenVerifier} bean, else by the built-in {@link
 *       JwtTokenVerifier} when {@code mateu.security.jwt.jwks-uri} / {@code
 *       mateu.security.jwt.secret} is configured — a token that fails verification is no identity;
 *   <li>only with {@code mateu.security.trust-unverified-tokens=true} (local development, never the
 *       default): the Bearer token's claims, UNVERIFIED;
 *   <li>otherwise: {@link CallerIdentity#anonymous()} — every restricted element is denied.
 * </ol>
 *
 * The result is cached on the request.
 */
@Slf4j
public final class IdentityResolver {

  public static final String TRUST_UNVERIFIED_TOKENS = "mateu.security.trust-unverified-tokens";

  static final String ATTRIBUTE = "mateu.callerIdentity";

  private static final AtomicBoolean WARNED_UNCONFIGURED = new AtomicBoolean();
  private static final AtomicBoolean WARNED_UNVERIFIED = new AtomicBoolean();
  private static final AtomicBoolean WARNED_TOKEN_IGNORED = new AtomicBoolean();

  private IdentityResolver() {}

  /** The caller's identity; anonymous when there is no trusted source for it. */
  public static CallerIdentity resolve(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return CallerIdentity.anonymous();
    }
    try {
      if (httpRequest.getAttribute(ATTRIBUTE) instanceof CallerIdentity cached) {
        return cached;
      }
    } catch (RuntimeException ignored) {
      // a request with no attribute storage
    }
    var identity = compute(httpRequest);
    try {
      httpRequest.setAttribute(ATTRIBUTE, identity);
    } catch (RuntimeException ignored) {
      // not cacheable: computed again next time
    }
    return identity;
  }

  private static CallerIdentity compute(HttpRequest httpRequest) {
    for (var resolver : beans(PrincipalResolver.class)) {
      try {
        var resolved = resolver.resolve(httpRequest);
        if (resolved != null && resolved.isPresent()) {
          return resolved.get();
        }
      } catch (RuntimeException e) {
        log.warn("PrincipalResolver {} failed: {}", resolver.getClass().getName(), e.toString());
      }
    }
    java.security.Principal principal = null;
    try {
      principal = httpRequest.getUserPrincipal();
    } catch (RuntimeException ignored) {
      // an adapter that cannot tell
    }
    var fromFramework = CallerIdentities.fromPrincipal(principal);
    if (fromFramework.isPresent()) {
      return fromFramework.get();
    }
    var token = bearerToken(httpRequest);
    if (token == null) {
      return CallerIdentity.anonymous();
    }
    var verifier = tokenVerifier();
    if (verifier != null) {
      Optional<Map<String, Object>> claims;
      try {
        claims = verifier.verify(token);
      } catch (RuntimeException e) {
        log.debug("TokenVerifier failed: {}", e.toString());
        claims = Optional.empty();
      }
      return claims != null && claims.isPresent()
          ? CallerIdentities.fromClaims(claims.get())
          : CallerIdentity.anonymous();
    }
    if (trustsUnverifiedTokens()) {
      warnUnverified();
      return CallerIdentities.fromClaims(unverifiedClaims(token));
    }
    if (WARNED_TOKEN_IGNORED.compareAndSet(false, true)) {
      log.warn(
          "A Bearer token arrived, but Mateu has no way to VERIFY it, so it is ignored and the caller"
              + " has no roles: restricted UI (@EyesOnly, @ReadOnlyUnless, @DisabledUnless, YAML"
              + " access:) stays hidden/denied. Configure {} or {}, register a TokenVerifier or"
              + " PrincipalResolver bean, or let your framework authenticate the request (Spring"
              + " Security resource server, quarkus-oidc, micronaut-security, MicroProfile JWT).",
          JwtTokenVerifier.JWKS_URI,
          JwtTokenVerifier.SECRET);
    }
    return CallerIdentity.anonymous();
  }

  /**
   * Logs, once per JVM, what this configuration means for restricted UI. Called by every adapter
   * once the application has started.
   */
  public static void warnOnStartup() {
    if (trustsUnverifiedTokens()) {
      warnUnverified();
      return;
    }
    if (!beans(PrincipalResolver.class).isEmpty() || tokenVerifier() != null) {
      return;
    }
    if (WARNED_UNCONFIGURED.compareAndSet(false, true)) {
      log.warn(
          "\n"
              + "*******************************************************************************\n"
              + "* Mateu: NO TOKEN VERIFIER IS CONFIGURED.                                     *\n"
              + "* Roles come only from a principal your framework authenticated (Spring      *\n"
              + "* Security, quarkus-oidc / smallrye-jwt, micronaut-security, Helidon security) *\n"
              + "* or from a PrincipalResolver bean. Bearer tokens are NOT trusted on their    *\n"
              + "* own: without one of those, every @EyesOnly / @ReadOnlyUnless /             *\n"
              + "* @DisabledUnless / access: element stays hidden or denied.                   *\n"
              + "* Configure mateu.security.jwt.jwks-uri (+ issuer, audience), or             *\n"
              + "* mateu.security.jwt.secret for HS256 in development.                         *\n"
              + "*******************************************************************************");
    }
  }

  /** Whether the local-development opt-out is on. */
  public static boolean trustsUnverifiedTokens() {
    return MateuSettings.isTrue(TRUST_UNVERIFIED_TOKENS);
  }

  private static void warnUnverified() {
    if (WARNED_UNVERIFIED.compareAndSet(false, true)) {
      log.warn(
          "\n"
              + "*******************************************************************************\n"
              + "* Mateu: mateu.security.trust-unverified-tokens=true                          *\n"
              + "* Bearer tokens are read WITHOUT verifying their signature. Anyone can forge  *\n"
              + "* the roles that drive @EyesOnly / @ReadOnlyUnless / @DisabledUnless /        *\n"
              + "* access:. LOCAL DEVELOPMENT ONLY — never enable it in a deployed profile.    *\n"
              + "*******************************************************************************");
    }
  }

  private static TokenVerifier tokenVerifier() {
    var supplied = beans(TokenVerifier.class);
    if (!supplied.isEmpty()) {
      return supplied.iterator().next();
    }
    return JwtTokenVerifier.fromSettings();
  }

  private static <T> Collection<T> beans(Class<T> type) {
    if (!MateuBeanProvider.isInitialized()) {
      return List.of();
    }
    try {
      var found = MateuBeanProvider.getBeans(type);
      return found != null ? found : List.of();
    } catch (RuntimeException e) {
      return List.of();
    }
  }

  private static String bearerToken(HttpRequest httpRequest) {
    String header;
    try {
      header = httpRequest.getHeaderValue("Authorization");
    } catch (RuntimeException e) {
      return null;
    }
    if (header == null || !header.regionMatches(true, 0, "Bearer ", 0, 7)) {
      return null;
    }
    var token = header.substring(7).trim();
    return token.isEmpty() ? null : token;
  }

  private static Map<String, Object> unverifiedClaims(String token) {
    try {
      var parts = token.split("\\.");
      if (parts.length < 2) {
        return Map.of();
      }
      return fromJson(new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8));
    } catch (RuntimeException e) {
      return Map.of();
    }
  }
}
