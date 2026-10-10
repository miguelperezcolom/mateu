package io.mateu.core.infra.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.sun.net.httpserver.HttpServer;
import io.mateu.core.domain.Authorizer;
import io.mateu.core.testutil.TestTokens;
import io.mateu.uidl.data.Access;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.KeyPairGenerator;
import java.security.Principal;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.Base64;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Mateu derives roles ONLY from a trusted source: a verified token, the framework's authenticated
 * principal, or a PrincipalResolver. A forged token — unsigned, wrongly signed or expired — is no
 * identity at all.
 */
class IdentityResolverTest {

  private static final Map<String, Object> ADMIN = Map.of("roles", List.of("admin"));

  @BeforeEach
  void configured() {
    TestTokens.configure();
    System.clearProperty(IdentityResolver.TRUST_UNVERIFIED_TOKENS);
    System.clearProperty(JwtTokenVerifier.JWKS_URI);
    System.clearProperty(JwtTokenVerifier.ISSUER);
  }

  @AfterEach
  void restore() {
    configured();
  }

  private static HttpRequest bearer(String token) {
    HttpRequest req = mock(HttpRequest.class);
    when(req.getHeaderValue("Authorization")).thenReturn("Bearer " + token);
    return req;
  }

  private static String unsigned(Map<String, Object> claims) {
    var enc = Base64.getUrlEncoder().withoutPadding();
    return enc.encodeToString("{\"alg\":\"none\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8))
        + "."
        + enc.encodeToString(
            io.mateu.core.infra.JsonSerializer.toJson(claims).getBytes(StandardCharsets.UTF_8))
        + ".";
  }

  private static boolean admin(HttpRequest req) {
    return Authorizer.isAuthorized(Access.roles("admin"), req);
  }

  @Test
  void aProperlySignedTokenGetsItsRoles() {
    var req = bearer(TestTokens.signed(ADMIN));
    assertThat(IdentityResolver.resolve(req).roles()).containsExactly("admin");
    assertThat(IdentityResolver.resolve(req).name()).isEqualTo("test-user");
    assertThat(admin(req)).isTrue();
  }

  @Test
  void anUnsignedTokenGetsNoRoles() {
    assertThat(admin(bearer(unsigned(ADMIN)))).isFalse();
    // the shape the old Authorizer accepted: any header, the claims, any signature
    assertThat(admin(bearer("header." + unsigned(ADMIN).split("\\.")[1] + ".sig"))).isFalse();
  }

  @Test
  void aTokenSignedWithAnotherKeyGetsNoRoles() {
    var forged =
        TestTokens.sign(
            ADMIN, "an-attacker-secret-0123456789abcdef", Instant.now().plusSeconds(600));
    assertThat(admin(bearer(forged))).isFalse();
  }

  @Test
  void anExpiredTokenIsRejected() {
    var expired = TestTokens.sign(ADMIN, TestTokens.SECRET, Instant.now().minusSeconds(3600));
    assertThat(admin(bearer(expired))).isFalse();
  }

  @Test
  void aTokenWithNoExpiryIsRejected() {
    var eternal = TestTokens.sign(ADMIN, TestTokens.SECRET, null);
    assertThat(admin(bearer(eternal))).isFalse();
  }

  @Test
  void theIssuerIsCheckedWhenConfigured() {
    System.setProperty(JwtTokenVerifier.ISSUER, "https://idp.example.com");
    assertThat(admin(bearer(TestTokens.signed(ADMIN)))).isFalse();
    var right =
        JWT.create()
            .withIssuer("https://idp.example.com")
            .withExpiresAt(Instant.now().plusSeconds(600))
            .withClaim("roles", List.of("admin"))
            .sign(Algorithm.HMAC256(TestTokens.SECRET));
    assertThat(admin(bearer(right))).isTrue();
  }

  @Test
  void withNoVerifierConfiguredATokenIsIgnored() {
    System.clearProperty(JwtTokenVerifier.SECRET);
    assertThat(JwtTokenVerifier.configured()).isFalse();
    // even a token that WOULD verify: nothing can verify it, so nothing is trusted
    assertThat(
            admin(bearer(TestTokens.sign(ADMIN, TestTokens.SECRET, Instant.now().plusSeconds(60)))))
        .isFalse();
    assertThat(admin(bearer(unsigned(ADMIN)))).isFalse();
  }

  @Test
  void theDevelopmentOptOutReadsUnverifiedClaims() {
    System.clearProperty(JwtTokenVerifier.SECRET);
    System.setProperty(IdentityResolver.TRUST_UNVERIFIED_TOKENS, "true");
    assertThat(admin(bearer(unsigned(ADMIN)))).isTrue();
  }

  @Test
  void anHmacTokenIsRejectedWhenOnlyAJwksIsConfigured() {
    System.clearProperty(JwtTokenVerifier.SECRET);
    System.setProperty(JwtTokenVerifier.JWKS_URI, "http://127.0.0.1:1/never-called");
    assertThat(admin(bearer(TestTokens.sign(ADMIN, "whatever", Instant.now().plusSeconds(60)))))
        .isFalse();
  }

  @Test
  void anRs256TokenVerifiesAgainstTheJwks() throws Exception {
    var generator = KeyPairGenerator.getInstance("RSA");
    generator.initialize(2048);
    var pair = generator.generateKeyPair();
    var publicKey = (RSAPublicKey) pair.getPublic();
    var enc = Base64.getUrlEncoder().withoutPadding();
    var jwks =
        "{\"keys\":[{\"kty\":\"RSA\",\"kid\":\"k1\",\"use\":\"sig\",\"n\":\""
            + enc.encodeToString(unsignedBytes(publicKey.getModulus().toByteArray()))
            + "\",\"e\":\""
            + enc.encodeToString(unsignedBytes(publicKey.getPublicExponent().toByteArray()))
            + "\"}]}";
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    server.createContext(
        "/certs",
        exchange -> {
          var body = jwks.getBytes(StandardCharsets.UTF_8);
          exchange.sendResponseHeaders(200, body.length);
          exchange.getResponseBody().write(body);
          exchange.close();
        });
    server.start();
    try {
      System.clearProperty(JwtTokenVerifier.SECRET);
      System.setProperty(
          JwtTokenVerifier.JWKS_URI,
          "http://127.0.0.1:" + server.getAddress().getPort() + "/certs");
      var token =
          JWT.create()
              .withKeyId("k1")
              .withExpiresAt(Instant.now().plusSeconds(600))
              .withClaim("realm_access", Map.of("roles", List.of("admin")))
              .sign(Algorithm.RSA256(publicKey, (RSAPrivateKey) pair.getPrivate()));
      assertThat(admin(bearer(token))).isTrue();

      var other = generator.generateKeyPair();
      var forged =
          JWT.create()
              .withKeyId("k1")
              .withExpiresAt(Instant.now().plusSeconds(600))
              .withClaim("roles", List.of("admin"))
              .sign(
                  Algorithm.RSA256(
                      (RSAPublicKey) other.getPublic(), (RSAPrivateKey) other.getPrivate()));
      assertThat(admin(bearer(forged))).isFalse();
    } finally {
      server.stop(0);
    }
  }

  private static byte[] unsignedBytes(byte[] bytes) {
    return bytes.length > 1 && bytes[0] == 0
        ? java.util.Arrays.copyOfRange(bytes, 1, bytes.length)
        : bytes;
  }

  /** Spring Security's Authentication, as far as the reflective reader is concerned. */
  public static class FakeAuthentication implements Principal {
    public String getName() {
      return "ana";
    }

    public boolean isAuthenticated() {
      return true;
    }

    public Collection<FakeAuthority> getAuthorities() {
      return List.of(
          new FakeAuthority("ROLE_admin"),
          new FakeAuthority("SCOPE_orders:read"),
          new FakeAuthority("invoice.approve"));
    }
  }

  public record FakeAuthority(String authority) {
    public String getAuthority() {
      return authority;
    }
  }

  @Test
  void theFrameworkPrincipalWinsOverTheToken() {
    HttpRequest req = bearer(unsigned(Map.of("roles", List.of("forged"))));
    when(req.getUserPrincipal()).thenReturn(new FakeAuthentication());
    var identity = IdentityResolver.resolve(req);
    assertThat(identity.name()).isEqualTo("ana");
    assertThat(identity.roles()).contains("admin", "invoice.approve").doesNotContain("forged");
    assertThat(identity.scopes()).containsExactly("orders:read");
    assertThat(identity.permissions()).containsExactly("invoice.approve");
    assertThat(admin(req)).isTrue();
  }

  @Test
  void aFrameworkPrincipalWorksWithNoTokenAndNoVerifier() {
    System.clearProperty(JwtTokenVerifier.SECRET);
    HttpRequest req = mock(HttpRequest.class);
    when(req.getUserPrincipal()).thenReturn(new FakeAuthentication());
    assertThat(admin(req)).isTrue();
  }

  @Test
  void anAdapterBuiltPrincipalIsReadAsIs() {
    HttpRequest req = mock(HttpRequest.class);
    when(req.getUserPrincipal())
        .thenReturn(
            new AuthenticatedPrincipal(
                io.mateu.uidl.security.CallerIdentity.withRoles("bob", List.of("admin"))));
    assertThat(admin(req)).isTrue();
  }

  @Test
  void anAnonymousFrameworkPrincipalIsNobody() {
    HttpRequest req = mock(HttpRequest.class);
    when(req.getUserPrincipal())
        .thenReturn(
            new Principal() {
              public String getName() {
                return "anonymousUser";
              }

              @SuppressWarnings("unused")
              public boolean isAuthenticated() {
                return false;
              }
            });
    assertThat(IdentityResolver.resolve(req).roles()).isEmpty();
  }
}
