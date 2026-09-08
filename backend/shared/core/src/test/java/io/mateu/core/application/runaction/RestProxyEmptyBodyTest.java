package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * What the proxy must make of a response with NO BODY.
 *
 * <p>A successful DELETE answers <b>204 No Content</b>. Feeding that empty body to the mapper
 * throws, and on the bulk path a throw is counted as a failed row — so a delete that had deleted
 * everything asked of it reported "1 of 1 failed": the rows already gone, the screen saying they
 * were not, and the listing left showing them.
 *
 * <p>The parsing itself is pinned here rather than end to end because a proxied call is made by the
 * SERVER: a browser-level fixture cannot intercept it, which is exactly why the probe does not try.
 */
class RestProxyEmptyBodyTest {

  // The production decision itself, not a copy of it: a test that restates the logic stays green
  // through the very change it exists to catch.
  private static Object bodyOf(String body) throws Exception {
    return RunActionUseCase.parseBody(body);
  }

  @Test
  @DisplayName("a 204's empty body is a success with nothing in it, not a parse failure")
  void anEmptyBodyIsASuccess() {
    assertThatCode(() -> assertThat(bodyOf("")).isEqualTo(java.util.Map.of()))
        .doesNotThrowAnyException();
    assertThatCode(() -> assertThat(bodyOf(null)).isEqualTo(java.util.Map.of()))
        .doesNotThrowAnyException();
    assertThatCode(() -> assertThat(bodyOf("   ")).isEqualTo(java.util.Map.of()))
        .doesNotThrowAnyException();
  }

  @Test
  @DisplayName("a body that IS there is still parsed, so nothing that worked starts differing")
  void aRealBodyIsStillParsed() throws Exception {
    assertThat(bodyOf("{\"id\":7,\"name\":\"Luke\"}"))
        .isEqualTo(java.util.Map.of("id", 7, "name", "Luke"));
  }

  @Test
  @DisplayName("malformed JSON still fails — an empty body is the exception, not a blanket amnesty")
  void malformedJsonStillFails() {
    assertThatCode(() -> bodyOf("{not json")).isInstanceOf(Exception.class);
  }
}
