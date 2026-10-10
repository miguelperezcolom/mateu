package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CorsPolicyTest {

  @Test
  void disabledUnlessOriginsAreListed() {
    assertThat(CorsPolicy.of(null, null).enabled()).isFalse();
    assertThat(CorsPolicy.of("  ", "true").enabled()).isFalse();
    assertThat(CorsPolicy.of(" , ", null).enabled()).isFalse();
    var disabled = CorsPolicy.disabled();
    assertThat(disabled.allows("https://evil.example")).isFalse();
    assertThat(disabled.responseHeaders("https://evil.example")).isEmpty();
    assertThat(disabled.preflightHeaders("https://evil.example", "POST", "content-type")).isNull();
  }

  @Test
  void allowsOnlyTheListedOrigins() {
    var policy = CorsPolicy.of("https://ui.example.com/, http://localhost:9006", null);
    assertThat(policy.allows("https://ui.example.com")).isTrue();
    assertThat(policy.allows("http://localhost:9006")).isTrue();
    assertThat(policy.allows("https://evil.example")).isFalse();
    assertThat(policy.allows(null)).isFalse();
    assertThat(policy.allowCredentials()).isFalse();
    assertThat(policy.exactOrigins())
        .containsExactly("https://ui.example.com", "http://localhost:9006");
  }

  @Test
  void preflightEchoesTheOriginAndTheRequestedHeaders() {
    var policy = CorsPolicy.of("https://ui.example.com", "true");
    var headers =
        policy.preflightHeaders("https://ui.example.com", "POST", "content-type, x-session-id");
    assertThat(headers)
        .containsEntry("Access-Control-Allow-Origin", "https://ui.example.com")
        .containsEntry("Access-Control-Allow-Headers", "content-type, x-session-id")
        .containsEntry("Access-Control-Allow-Credentials", "true")
        .containsEntry("Vary", "Origin")
        .containsKey("Access-Control-Allow-Methods")
        .containsKey("Access-Control-Max-Age");
    assertThat(policy.preflightHeaders("https://ui.example.com", "DELETE", null)).isNull();
    assertThat(policy.preflightHeaders("https://evil.example", "POST", null)).isNull();
  }

  @Test
  void anyOriginNeverCarriesCredentials() {
    var policy = CorsPolicy.of("*", "true");
    assertThat(policy.allowCredentials()).isFalse();
    assertThat(policy.allows("https://whatever.example")).isTrue();
    assertThat(policy.responseHeaders("https://whatever.example"))
        .containsEntry("Access-Control-Allow-Origin", "*")
        .doesNotContainKey("Access-Control-Allow-Credentials");
    assertThat(policy.originPatterns()).containsExactly("*");
  }

  @Test
  void wildcardPatterns() {
    var policy = CorsPolicy.of("https://*.example.com", null);
    assertThat(policy.allows("https://ui.example.com")).isTrue();
    assertThat(policy.allows("https://ui.example.com.evil.net")).isFalse();
    assertThat(policy.allows("https://example.org")).isFalse();
  }

  @Test
  void appliesOnlyToMateuEndpoints() {
    assertThat(CorsPolicy.appliesTo("/mateu/v3/sync/x")).isTrue();
    assertThat(CorsPolicy.appliesTo("/admin/mateu/v3/sse/x")).isTrue();
    assertThat(CorsPolicy.appliesTo("/mateu/mcp")).isTrue();
    assertThat(CorsPolicy.appliesTo("/api/orders")).isFalse();
    assertThat(CorsPolicy.appliesTo("/")).isFalse();
    assertThat(CorsPolicy.appliesTo(null)).isFalse();
  }

  @Test
  void preflightDetection() {
    assertThat(CorsPolicy.isPreflight("OPTIONS", "https://a", "POST")).isTrue();
    assertThat(CorsPolicy.isPreflight("OPTIONS", null, "POST")).isFalse();
    assertThat(CorsPolicy.isPreflight("POST", "https://a", "POST")).isFalse();
  }
}
