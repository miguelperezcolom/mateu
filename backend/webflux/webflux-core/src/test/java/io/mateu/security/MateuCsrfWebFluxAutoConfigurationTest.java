package io.mateu.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.security.config.web.server.ServerHttpSecurity;

/**
 * B2 on WebFlux: CSRF protects every non-safe request except Mateu's JSON calls — what a cross-site
 * form can send to a Mateu path still needs the token.
 */
class MateuCsrfWebFluxAutoConfigurationTest {

  private static boolean protectedRequest(MockServerHttpRequest request) {
    return Boolean.TRUE.equals(
        MateuCsrfWebFluxAutoConfiguration.CSRF_PROTECTED
            .matches(MockServerWebExchange.from(request))
            .map(result -> result.isMatch())
            .block());
  }

  @Test
  void mateusJsonCallsAreExemptAndEverythingElseIsProtected() {
    assertThat(
            protectedRequest(
                MockServerHttpRequest.post("/hello/mateu/v3/sync/x")
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .build()))
        .isFalse();
    assertThat(
            protectedRequest(
                MockServerHttpRequest.post("/hello/mateu/v3/sync/x")
                    .header(HttpHeaders.CONTENT_TYPE, "text/plain")
                    .build()))
        .isTrue();
    assertThat(
            protectedRequest(
                MockServerHttpRequest.post("/api/orders")
                    .header(HttpHeaders.CONTENT_TYPE, "application/json")
                    .build()))
        .isTrue();
    // a safe method is never CSRF-checked
    assertThat(protectedRequest(MockServerHttpRequest.get("/api/orders").build())).isFalse();
  }

  @Test
  void theCustomizerInstallsTheMatcher() {
    var http = ServerHttpSecurity.http();
    assertThat(http.csrf(new MateuCsrfWebFluxAutoConfiguration().mateuCsrfExemption()).build())
        .isNotNull();
  }
}
