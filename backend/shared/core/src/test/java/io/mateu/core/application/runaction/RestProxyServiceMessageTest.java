package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * What a proxied call that failed tells the USER: the service's own message (Space's portrait
 * upload answers 400 {@code {"message": "Image larger than 2 MB"}}), not "Request failed (HTTP
 * 400)". The same rule runs in the browser for a direct call (libs/mateu serviceMessage.ts, Redwood
 * serviceMessageOf) — these cases are mirrored there.
 */
class RestProxyServiceMessageTest {

  @Test
  @DisplayName("the usual error shapes give their message, in this order")
  void theUsualShapes() {
    assertThat(
            RestProxyCalls.serviceMessageOf(
                "{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Image larger than 2 MB\"}"))
        .isEqualTo("Image larger than 2 MB");
    assertThat(
            RestProxyCalls.serviceMessageOf(
                "{\"title\":\"Invalid\",\"detail\":\"Name is required\"}"))
        .isEqualTo("Name is required");
    assertThat(RestProxyCalls.serviceMessageOf("{\"error\":\"not allowed\"}"))
        .isEqualTo("not allowed");
    assertThat(RestProxyCalls.serviceMessageOf("{\"error\":{\"message\":\"quota exceeded\"}}"))
        .isEqualTo("quota exceeded");
    assertThat(RestProxyCalls.serviceMessageOf("{\"title\":\"Conflict\"}")).isEqualTo("Conflict");
    assertThat(RestProxyCalls.serviceMessageOf("Astronaut still on a crew"))
        .isEqualTo("Astronaut still on a crew");
  }

  @Test
  @DisplayName("nothing worth showing gives null: empty, HTML, a list, a long text, no message key")
  void nothingWorthShowing() {
    assertThat(RestProxyCalls.serviceMessageOf(null)).isNull();
    assertThat(RestProxyCalls.serviceMessageOf("  ")).isNull();
    assertThat(RestProxyCalls.serviceMessageOf("<html><body>502 Bad Gateway</body></html>"))
        .isNull();
    assertThat(RestProxyCalls.serviceMessageOf("[1,2]")).isNull();
    assertThat(RestProxyCalls.serviceMessageOf("x".repeat(301))).isNull();
    assertThat(RestProxyCalls.serviceMessageOf("{\"status\":500}")).isNull();
    assertThat(RestProxyCalls.serviceMessageOf("{not json")).isNull();
  }

  @Test
  @DisplayName("control characters go, whitespace folds, a long message is clipped to 300")
  void cleanedAndClipped() {
    assertThat(RestProxyCalls.serviceMessageOf("{\"message\":\"two\\u0007\\n  lines\"}"))
        .isEqualTo("two lines");
    var clipped = RestProxyCalls.serviceMessageOf("{\"message\":\"" + "y".repeat(400) + "\"}");
    assertThat(clipped).hasSize(300).endsWith("…");
  }
}
