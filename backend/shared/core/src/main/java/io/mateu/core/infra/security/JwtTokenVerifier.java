package io.mateu.core.infra.security;

import static io.mateu.core.infra.JsonSerializer.fromJson;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.ECDSAKeyProvider;
import com.auth0.jwt.interfaces.RSAKeyProvider;
import io.mateu.core.infra.MateuSettings;
import io.mateu.uidl.security.TokenVerifier;
import java.nio.charset.StandardCharsets;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;

/**
 * Mateu's built-in {@link TokenVerifier}: checks a JWT's signature, its time window ({@code exp} is
 * REQUIRED, {@code nbf} honoured, with a small clock skew) and, when configured, its issuer and
 * audience — and only then answers its claims. Configured with:
 *
 * <pre>
 * mateu.security.jwt.jwks-uri=https://idp.example.com/realms/acme/protocol/openid-connect/certs
 * mateu.security.jwt.issuer=https://idp.example.com/realms/acme
 * mateu.security.jwt.audience=my-app
 * mateu.security.jwt.secret=...   (HS256/384/512: development and tests)
 * mateu.security.jwt.clock-skew-seconds=30
 * </pre>
 *
 * <p>The algorithm is never chosen by the token alone: HMAC algorithms are accepted only when a
 * {@code secret} is configured and RSA/ECDSA ones only when a {@code jwks-uri} is, so a token
 * cannot downgrade itself (the {@code alg: none} and RS→HS confusion attacks).
 */
@Slf4j
public final class JwtTokenVerifier implements TokenVerifier {

  public static final String JWKS_URI = "mateu.security.jwt.jwks-uri";
  public static final String ISSUER = "mateu.security.jwt.issuer";
  public static final String AUDIENCE = "mateu.security.jwt.audience";
  public static final String SECRET = "mateu.security.jwt.secret";
  public static final String CLOCK_SKEW = "mateu.security.jwt.clock-skew-seconds";

  private static volatile JwtTokenVerifier cached;

  private final String secret;
  private final JwksKeys jwks;
  private final String issuer;
  private final String audience;
  private final long clockSkewSeconds;

  public JwtTokenVerifier(
      String secret, String jwksUri, String issuer, String audience, long clockSkewSeconds) {
    this.secret = blankToNull(secret);
    this.jwks = blankToNull(jwksUri) != null ? new JwksKeys(jwksUri.trim()) : null;
    this.issuer = blankToNull(issuer);
    this.audience = blankToNull(audience);
    this.clockSkewSeconds = Math.max(0, clockSkewSeconds);
  }

  /**
   * The verifier the configuration describes, or null when neither a jwks-uri nor a secret is
   * configured. Rebuilt only when the configuration changes (so the JWKS cache survives).
   */
  public static JwtTokenVerifier fromSettings() {
    var secret = MateuSettings.get(SECRET);
    var jwksUri = MateuSettings.get(JWKS_URI);
    if (secret == null && jwksUri == null) {
      return null;
    }
    var issuer = MateuSettings.get(ISSUER);
    var audience = MateuSettings.get(AUDIENCE);
    long skew = 30;
    var configuredSkew = MateuSettings.get(CLOCK_SKEW);
    if (configuredSkew != null) {
      try {
        skew = Long.parseLong(configuredSkew);
      } catch (NumberFormatException e) {
        log.warn("Ignoring {}={}: not a number of seconds", CLOCK_SKEW, configuredSkew);
      }
    }
    var current = cached;
    if (current != null && current.sameConfig(secret, jwksUri, issuer, audience, skew)) {
      return current;
    }
    var built = new JwtTokenVerifier(secret, jwksUri, issuer, audience, skew);
    cached = built;
    return built;
  }

  /** Whether any verification source (jwks-uri or secret) is configured. */
  public static boolean configured() {
    return MateuSettings.get(SECRET) != null || MateuSettings.get(JWKS_URI) != null;
  }

  @Override
  public Optional<Map<String, Object>> verify(String token) {
    if (token == null || token.isBlank()) {
      return Optional.empty();
    }
    try {
      DecodedJWT unverified = JWT.decode(token);
      var algorithm = algorithmFor(unverified.getAlgorithm());
      if (algorithm == null) {
        log.debug("Rejecting a Bearer token signed with {}", unverified.getAlgorithm());
        return Optional.empty();
      }
      var verification =
          JWT.require(algorithm).acceptLeeway(clockSkewSeconds).withClaimPresence("exp");
      if (issuer != null) {
        verification.withIssuer(issuer);
      }
      if (audience != null) {
        verification.withAudience(audience);
      }
      DecodedJWT verified = verification.build().verify(unverified);
      var payload =
          new String(Base64.getUrlDecoder().decode(verified.getPayload()), StandardCharsets.UTF_8);
      return Optional.of(fromJson(payload));
    } catch (Exception e) {
      log.debug("Rejecting a Bearer token: {}", e.getMessage());
      return Optional.empty();
    }
  }

  private Algorithm algorithmFor(String alg) {
    if (alg == null) {
      return null;
    }
    if (secret != null) {
      switch (alg) {
        case "HS256":
          return Algorithm.HMAC256(secret);
        case "HS384":
          return Algorithm.HMAC384(secret);
        case "HS512":
          return Algorithm.HMAC512(secret);
        default:
          break;
      }
    }
    if (jwks != null) {
      RSAKeyProvider rsa = rsaKeys();
      ECDSAKeyProvider ec = ecKeys();
      switch (alg) {
        case "RS256":
          return Algorithm.RSA256(rsa);
        case "RS384":
          return Algorithm.RSA384(rsa);
        case "RS512":
          return Algorithm.RSA512(rsa);
        case "ES256":
          return Algorithm.ECDSA256(ec);
        case "ES384":
          return Algorithm.ECDSA384(ec);
        case "ES512":
          return Algorithm.ECDSA512(ec);
        default:
          break;
      }
    }
    return null; // "none", an HMAC token with no secret, an RSA one with no JWKS, PS*, …
  }

  private RSAKeyProvider rsaKeys() {
    return new RSAKeyProvider() {
      @Override
      public RSAPublicKey getPublicKeyById(String keyId) {
        return jwks.key(keyId) instanceof RSAPublicKey key ? key : null;
      }

      @Override
      public RSAPrivateKey getPrivateKey() {
        return null;
      }

      @Override
      public String getPrivateKeyId() {
        return null;
      }
    };
  }

  private ECDSAKeyProvider ecKeys() {
    return new ECDSAKeyProvider() {
      @Override
      public ECPublicKey getPublicKeyById(String keyId) {
        return jwks.key(keyId) instanceof ECPublicKey key ? key : null;
      }

      @Override
      public ECPrivateKey getPrivateKey() {
        return null;
      }

      @Override
      public String getPrivateKeyId() {
        return null;
      }
    };
  }

  private boolean sameConfig(
      String secret, String jwksUri, String issuer, String audience, long skew) {
    return Objects.equals(this.secret, blankToNull(secret))
        && Objects.equals(jwks != null ? jwks.uri() : null, blankToNull(jwksUri))
        && Objects.equals(this.issuer, blankToNull(issuer))
        && Objects.equals(this.audience, blankToNull(audience))
        && this.clockSkewSeconds == Math.max(0, skew);
  }

  private static String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }
}
