package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.function.UnaryOperator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * A value substituted into a JSON body template.
 *
 * <p>The body of a proxied write is a shape with holes, and the holes are filled with data the
 * author does not control. Without escaping, a name carrying a quote or a description carrying a
 * newline closes the string early — and it fails INVISIBLY: the endpoint answers 400 and all the
 * user sees is that saving does nothing.
 */
class TemplateInterpolatorJsonTest {

  private static final ObjectMapper JSON = new ObjectMapper();

  @Test
  @DisplayName("escapes the characters that would close the string early")
  void escapesTheDangerousOnes() {
    assertThat(TemplateInterpolator.jsonEscape("a \"quoted\" word"))
        .isEqualTo("a \\\"quoted\\\" word");
    assertThat(TemplateInterpolator.jsonEscape("back\\slash")).isEqualTo("back\\\\slash");
    assertThat(TemplateInterpolator.jsonEscape("two\nlines")).isEqualTo("two\\nlines");
    assertThat(TemplateInterpolator.jsonEscape("a\tb")).isEqualTo("a\\tb");
    assertThat(TemplateInterpolator.jsonEscape("ab")).isEqualTo("a\\u0001b");
  }

  @Test
  @DisplayName("leaves ordinary text alone, and never adds the surrounding quotes")
  void leavesOrdinaryTextAlone() {
    // The template already wrote the quotes; a second pair would break what this protects.
    assertThat(TemplateInterpolator.jsonEscape("Millennium Falcón")).isEqualTo("Millennium Falcón");
    assertThat(TemplateInterpolator.jsonEscape("Luke")).isEqualTo("Luke");
    assertThat(TemplateInterpolator.jsonEscape(null)).isEmpty();
  }

  @Test
  @DisplayName("the whole point: a body with a hostile value still parses")
  void aBodyWithAHostileValueStillParses() throws Exception {
    var state =
        Map.<String, Object>of(
            "name", "Obi-Wan \"Ben\" Kenobi", "crawl", "It is a period\nof civil war.");
    var template = "{\"name\":\"${state.name}\",\"crawl\":\"${state.crawl}\"}";

    var broken = TemplateInterpolator.interpolate(template, state, null);
    assertThatThrownBy(() -> JSON.readTree(broken)).isInstanceOf(Exception.class);

    var fixed =
        TemplateInterpolator.interpolate(template, state, null, TemplateInterpolator::jsonEscape);
    var parsed = JSON.readTree(fixed);
    assertThat(parsed.get("name").asText()).isEqualTo("Obi-Wan \"Ben\" Kenobi");
    assertThat(parsed.get("crawl").asText()).isEqualTo("It is a period\nof civil war.");
  }

  @Test
  @DisplayName("the template's own punctuation is never escaped — only what goes into it")
  void onlyTheValuesAreEscaped() {
    var out =
        TemplateInterpolator.interpolate(
            "{\"a\":\"${state.a}\"}", Map.of("a", "x"), null, TemplateInterpolator::jsonEscape);
    assertThat(out).isEqualTo("{\"a\":\"x\"}");
  }

  @Test
  @DisplayName("an unescaped interpolation is unchanged, so nothing that worked starts differing")
  void theDefaultIsUnchanged() {
    assertThat(TemplateInterpolator.interpolate("hi ${state.a}", Map.of("a", "there"), null))
        .isEqualTo("hi there");
    assertThat(
            TemplateInterpolator.interpolate(
                "hi ${state.a}", Map.of("a", "there"), null, UnaryOperator.identity()))
        .isEqualTo("hi there");
  }

  @Test
  @DisplayName("a secret is escaped too — it is a value like any other")
  void secretsAreEscapedAsWell() {
    var out =
        TemplateInterpolator.interpolate(
            "{\"k\":\"${secret.K}\"}", Map.of(), key -> "a\"b", TemplateInterpolator::jsonEscape);
    assertThat(out).isEqualTo("{\"k\":\"a\\\"b\"}");
  }

  @Test
  @DisplayName("a request is known to be JSON by what it declares, whatever the header casing")
  void declaresJson() {
    assertThat(TemplateInterpolator.declaresJson(Map.of("Content-Type", "application/json")))
        .isTrue();
    assertThat(
            TemplateInterpolator.declaresJson(
                Map.of("content-type", "application/json; charset=utf-8")))
        .isTrue();
    assertThat(TemplateInterpolator.declaresJson(Map.of("Content-Type", "text/plain"))).isFalse();
    assertThat(TemplateInterpolator.declaresJson(Map.of())).isFalse();
    assertThat(TemplateInterpolator.declaresJson(null)).isFalse();
  }
}
