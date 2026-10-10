package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;
import java.util.function.Function;
import org.junit.jupiter.api.Test;

/**
 * URL templates encode what they substitute, by position, so a value from the client state cannot
 * steer the request. The same cases are pinned in libs/mateu (interpolateUrl.test.ts), .NET
 * (UrlTemplateTests) and Python (test_url_template.py) — both legs must reach the same URL.
 */
class TemplateInterpolatorUrlTest {

  private static final Function<String, String> SECRETS =
      k ->
          switch (k) {
            case "BASE" -> "https://api.example.com/v1";
            case "KEY" -> "a&b=c d";
            default -> null;
          };

  private static String url(String template, Map<String, Object> state) {
    return TemplateInterpolator.interpolateUrl(template, state, SECRETS);
  }

  @Test
  void aPathValueCannotAddSegmentsOrAQuery() {
    assertThat(url("https://api.example.com/people/${state.id}", Map.of("id", "1/../../admin?x=")))
        .isEqualTo("https://api.example.com/people/1%2F..%2F..%2Fadmin%3Fx%3D");
  }

  @Test
  void aQueryValueCannotAddParameters() {
    assertThat(url("/search?q=${state.q}&page=1", Map.of("q", "a b&page=99#frag")))
        .isEqualTo("/search?q=a%20b%26page%3D99%23frag&page=1");
  }

  @Test
  void unicodeAndReservedCharactersAreEncodedTheSameEverywhere() {
    assertThat(url("/x/${state.v}", Map.of("v", "Ñandú !'()*~._-")))
        .isEqualTo("/x/%C3%91and%C3%BA%20%21%27%28%29%2A~._-");
  }

  @Test
  void aSecretInTheQueryIsEncodedToo() {
    assertThat(url("https://h/x?key=${secret.KEY}", Map.of()))
        .isEqualTo("https://h/x?key=a%26b%3Dc%20d");
  }

  @Test
  void aConfiguredOriginIsSubstitutedRaw() {
    assertThat(url("${secret.BASE}/people/${state.id}", Map.of("id", 7)))
        .isEqualTo("https://api.example.com/v1/people/7");
  }

  @Test
  void clientStateCannotChooseTheOrigin() {
    assertThatThrownBy(() -> url("${state.base}/people", Map.of("base", "http://169.254.169.254")))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> url("https://${state.host}/people", Map.of("host", "evil")))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void aDotSegmentIsRefusedInThePath() {
    assertThatThrownBy(() -> url("/people/${state.id}", Map.of("id", "..")))
        .isInstanceOf(IllegalArgumentException.class);
    // in the query a dot is just a dot
    assertThat(url("/people?id=${state.id}", Map.of("id", ".."))).isEqualTo("/people?id=..");
  }

  @Test
  void missingValuesAndTemplatesWithoutPlaceholders() {
    assertThat(url("/people/${state.missing}", Map.of())).isEqualTo("/people/");
    assertThat(url("https://h/x", Map.of())).isEqualTo("https://h/x");
    assertThat(url(null, Map.of())).isEmpty();
  }
}
