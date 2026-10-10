package io.mateu.core.infra.security;

import static io.mateu.core.infra.JsonSerializer.fromJson;

import java.math.BigInteger;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.AlgorithmParameters;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.ECParameterSpec;
import java.security.spec.ECPoint;
import java.security.spec.ECPublicKeySpec;
import java.security.spec.RSAPublicKeySpec;
import java.time.Duration;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

/**
 * The public keys of a JWKS endpoint (RSA and EC), fetched lazily and cached. A key id that is not
 * in the cache refreshes it — at most once a minute, so a stream of tokens with made-up {@code
 * kid}s cannot turn this server into a client hammering the identity provider. The cache is also
 * refreshed when it is older than ten minutes (key rotation).
 */
@Slf4j
final class JwksKeys {

  private static final Duration MAX_AGE = Duration.ofMinutes(10);
  private static final Duration MIN_REFRESH_INTERVAL = Duration.ofMinutes(1);
  private static final HttpClient CLIENT =
      HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

  private final String uri;
  private volatile Map<String, PublicKey> keys = Map.of();
  private volatile long fetchedAt;

  JwksKeys(String uri) {
    this.uri = uri;
  }

  String uri() {
    return uri;
  }

  /** The key for {@code kid}; with no kid, the only key of the set (else null). */
  PublicKey key(String kid) {
    long now = System.currentTimeMillis();
    if (keys.isEmpty() || now - fetchedAt > MAX_AGE.toMillis()) {
      refresh(now);
    }
    var found = lookup(kid);
    if (found == null && now - fetchedAt > MIN_REFRESH_INTERVAL.toMillis()) {
      refresh(now);
      found = lookup(kid);
    }
    return found;
  }

  private PublicKey lookup(String kid) {
    var current = keys;
    if (kid == null) {
      return current.size() == 1 ? current.values().iterator().next() : null;
    }
    return current.get(kid);
  }

  private synchronized void refresh(long now) {
    if (now - fetchedAt < MIN_REFRESH_INTERVAL.toMillis() && !keys.isEmpty()) {
      return; // another thread just did
    }
    fetchedAt = now;
    try {
      var response =
          CLIENT.send(
              HttpRequest.newBuilder(URI.create(uri)).timeout(Duration.ofSeconds(5)).GET().build(),
              HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() / 100 != 2) {
        log.warn("JWKS {} answered HTTP {}", uri, response.statusCode());
        return;
      }
      keys = parse(response.body());
    } catch (Exception e) {
      if (e instanceof InterruptedException) {
        Thread.currentThread().interrupt();
      }
      log.warn("Could not fetch the JWKS at {}: {}", uri, e.toString());
    }
  }

  /** Parses a JWKS document ({@code {"keys": [...]}}) into kid → public key. */
  @SuppressWarnings("unchecked")
  static Map<String, PublicKey> parse(String json) throws Exception {
    Map<String, Object> document = fromJson(json);
    Map<String, PublicKey> parsed = new LinkedHashMap<>();
    if (!(document.get("keys") instanceof List<?> list)) {
      return parsed;
    }
    int index = 0;
    for (Object entry : list) {
      if (!(entry instanceof Map<?, ?> raw)) {
        continue;
      }
      var jwk = (Map<String, Object>) raw;
      if (jwk.get("use") != null && !"sig".equals(jwk.get("use"))) {
        continue; // an encryption key
      }
      var key = toKey(jwk);
      if (key != null) {
        var kid = jwk.get("kid") != null ? String.valueOf(jwk.get("kid")) : "#" + index;
        parsed.put(kid, key);
      }
      index++;
    }
    return parsed;
  }

  private static PublicKey toKey(Map<String, Object> jwk) throws Exception {
    var kty = String.valueOf(jwk.get("kty"));
    if ("RSA".equals(kty)) {
      return KeyFactory.getInstance("RSA")
          .generatePublic(new RSAPublicKeySpec(unsigned(jwk.get("n")), unsigned(jwk.get("e"))));
    }
    if ("EC".equals(kty)) {
      var curve =
          switch (String.valueOf(jwk.get("crv"))) {
            case "P-256" -> "secp256r1";
            case "P-384" -> "secp384r1";
            case "P-521" -> "secp521r1";
            default -> null;
          };
      if (curve == null) {
        return null;
      }
      var parameters = AlgorithmParameters.getInstance("EC");
      parameters.init(new ECGenParameterSpec(curve));
      var spec = parameters.getParameterSpec(ECParameterSpec.class);
      var point = new ECPoint(unsigned(jwk.get("x")), unsigned(jwk.get("y")));
      return KeyFactory.getInstance("EC").generatePublic(new ECPublicKeySpec(point, spec));
    }
    return null;
  }

  private static BigInteger unsigned(Object base64Url) {
    return new BigInteger(1, Base64.getUrlDecoder().decode(String.valueOf(base64Url)));
  }
}
