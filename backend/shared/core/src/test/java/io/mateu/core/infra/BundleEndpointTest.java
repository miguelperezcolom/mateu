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
  void aSerializationFailureAnswersAValidJsonErrorBody() throws Exception {
    // the old body was "{\"error\":\"" + message + "\"}": a quote, a backslash or a newline in the
    // message made it invalid JSON
    String message = "Bad \"value\" at C:\\path\nline 2";
    var endpoint =
        endpoint(
            manifest -> {
              throw new IllegalStateException(message);
            });

    var answer = endpoint.render(false);

    assertThat(answer.status()).isEqualTo(500);
    var json = new ObjectMapper().readTree(answer.body());
    assertThat(json.size()).isEqualTo(1);
    assertThat(json.get("error").asText()).isEqualTo(message);
  }

  @Test
  void aFailureWithNoMessageStillAnswersJson() throws Exception {
    var endpoint =
        endpoint(
            manifest -> {
              throw new IllegalStateException();
            });

    var json = new ObjectMapper().readTree(endpoint.render(true).body());

    assertThat(json.get("error").asText()).isEqualTo("null");
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
