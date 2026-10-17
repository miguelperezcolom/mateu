package io.mateu.core.infra.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/** B2: only a JSON call to a Mateu endpoint may skip the framework's CSRF check. */
class CsrfExemptionTest {

  @Test
  void aJsonCallToAMateuEndpointIsExempt() {
    assertThat(CsrfExemption.isMateuJsonCall("/mateu/v3/sync/_no_route", "application/json"))
        .isTrue();
    assertThat(
            CsrfExemption.isMateuJsonCall(
                "/admin/mateu/v3/sse/x?continue", "application/json; charset=UTF-8"))
        .isTrue();
    assertThat(CsrfExemption.isMateuJsonCall("/mateu/mcp", "application/vnd.api+json")).isTrue();
    assertThat(CsrfExemption.isMateuJsonCall("/mateu/dev/reload", "application/json")).isTrue();
    // the dev endpoints (mateu.dev=true only) post nothing: exempt whatever the type
    assertThat(CsrfExemption.isMateuJsonCall("/mateu/dev/reload", null)).isTrue();
  }

  @Test
  void whatABrowserCanForgeWithoutAPreflightIsNot() {
    for (var simple :
        new String[] {
          "text/plain", "application/x-www-form-urlencoded", "multipart/form-data; boundary=x", null
        }) {
      assertThat(CsrfExemption.isMateuJsonCall("/mateu/v3/sync/x", simple)).isFalse();
    }
  }

  @Test
  void theApplicationsOwnEndpointsAreNot() {
    assertThat(CsrfExemption.isMateuJsonCall("/api/orders", "application/json")).isFalse();
    assertThat(CsrfExemption.isMateuJsonCall("/mateu-like/v3", "application/json")).isFalse();
    assertThat(CsrfExemption.isMateuEndpoint(null)).isFalse();
    assertThat(CsrfExemption.isJson("text/json")).isFalse();
  }
}
