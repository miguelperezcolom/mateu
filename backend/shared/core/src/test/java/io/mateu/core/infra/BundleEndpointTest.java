package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class BundleEndpointTest {

  private final List<Boolean> exports = new ArrayList<>();

  private BundleEndpoint endpoint(BundleEndpoint.ManifestWriter writer) {
    return new BundleEndpoint(
        includeParamRoutes -> {
          exports.add(includeParamRoutes);
          return null;
        },
        writer);
  }

  @Test
  void rendersEachVariantOnceAndAnswersItFromCache() {
    var endpoint = endpoint(manifest -> "{\"n\":" + exports.size() + "}");

    var plain = endpoint.render(false);
    var withParams = endpoint.render(true);

    assertThat(plain).isEqualTo(new BundleEndpoint.Answer(200, "{\"n\":1}"));
    assertThat(withParams).isEqualTo(new BundleEndpoint.Answer(200, "{\"n\":2}"));
    assertThat(endpoint.render(false)).isEqualTo(plain);
    assertThat(endpoint.render(true)).isEqualTo(withParams);
    assertThat(exports).containsExactly(false, true);
  }

  @Test
  void aFailureAnswersTheErrorBoundarysGenericTextNotTheException() throws Exception {
    // the raw exception message used to be the body: SQL, paths, hostnames — written for
    // developers, not for whoever fetches the bundle
    String secret = "Bad \"value\" at C:\\path\nline 2, host db-01";
    var endpoint =
        endpoint(
            manifest -> {
              throw new IllegalStateException(secret);
            });

    var answer = endpoint.render(false);

    assertThat(answer.status()).isEqualTo(500);
    assertThat(answer.body()).doesNotContain("db-01");
    var json = new ObjectMapper().readTree(answer.body());
    assertThat(json.get("error").asText()).isEqualTo("Something went wrong");
    assertThat(json.get("message").asText())
        .matches("An unexpected error occurred\\. Reference: [0-9a-f]{12}");
  }

  @Test
  void aFailureRenderingTheManifestIsAnsweredTheSameWay() throws Exception {
    var endpoint =
        new BundleEndpoint(
            includeParamRoutes -> {
              throw new IllegalStateException("route /x blew up");
            },
            manifest -> "{}");

    var answer = endpoint.render(true);

    assertThat(answer.status()).isEqualTo(500);
    assertThat(new ObjectMapper().readTree(answer.body()).get("error").asText())
        .isEqualTo("Something went wrong");
  }

  @Test
  void detailedErrorsShowTheExceptionAsValidJson() throws Exception {
    String message = "Bad \"value\" at C:\\path\nline 2";
    var endpoint =
        endpoint(
            manifest -> {
              throw new IllegalStateException(message);
            });
    System.setProperty("mateu.errors.detailed", "true");
    try {
      var json = new ObjectMapper().readTree(endpoint.render(false).body());
      assertThat(json.get("error").asText()).isEqualTo("IllegalStateException");
      assertThat(json.get("message").asText()).startsWith(message + " (ref ");
    } finally {
      System.clearProperty("mateu.errors.detailed");
    }
  }

  @Test
  void aFailureIsNotCached() {
    var attempts = new int[] {0};
    var endpoint =
        endpoint(
            manifest -> {
              if (attempts[0]++ == 0) {
                throw new IllegalStateException("transient");
              }
              return "{}";
            });

    assertThat(endpoint.render(false).status()).isEqualTo(500);
    assertThat(endpoint.render(false)).isEqualTo(new BundleEndpoint.Answer(200, "{}"));
    assertThat(endpoint.render(false)).isEqualTo(new BundleEndpoint.Answer(200, "{}"));
    assertThat(exports).containsExactly(false, false);
  }
}
