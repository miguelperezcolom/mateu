package io.mateu.core.testutil;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import io.mateu.core.infra.security.JwtTokenVerifier;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Bearer tokens for tests. Mateu no longer trusts an unverified token, so tests sign theirs with a
 * shared HS256 secret — configured (as {@code mateu.security.jwt.secret}) the first time this class
 * is used.
 */
public final class TestTokens {

  public static final String SECRET = "mateu-tests-hs256-secret-0123456789abcdef";

  static {
    System.setProperty(JwtTokenVerifier.SECRET, SECRET);
  }

  private TestTokens() {}

  /** Makes sure the test secret is configured (it is, once this class is loaded). */
  public static void configure() {
    System.setProperty(JwtTokenVerifier.SECRET, SECRET);
  }

  /** A token carrying {@code claims}, signed with the test secret, valid for an hour. */
  public static String signed(Map<String, ?> claims) {
    configure();
    return sign(claims, SECRET, Instant.now().plusSeconds(3600));
  }

  /** Same, as an {@code Authorization} header value. */
  public static String bearer(Map<String, ?> claims) {
    return "Bearer " + signed(claims);
  }

  /** A token with a top-level {@code roles} claim. */
  public static String bearerWithRoles(String... roles) {
    return bearer(Map.of("roles", List.of(roles)));
  }

  /** Signs with an arbitrary secret and expiry (forged / expired tokens in negative tests). */
  public static String sign(Map<String, ?> claims, String secret, Instant expiresAt) {
    var builder = JWT.create().withSubject("test-user");
    if (expiresAt != null) {
      builder.withExpiresAt(expiresAt);
    }
    claims.forEach(
        (name, value) -> {
          if (value instanceof List<?> list) {
            builder.withClaim(name, list.stream().map(String::valueOf).toList());
          } else if (value instanceof Map<?, ?> map) {
            @SuppressWarnings("unchecked")
            var asMap = (Map<String, Object>) map;
            builder.withClaim(name, asMap);
          } else {
            builder.withClaim(name, String.valueOf(value));
          }
        });
    return builder.sign(Algorithm.HMAC256(secret));
  }
}
