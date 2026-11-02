package io.mateu.dtos;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * A micro frontend (and its requests) is EMBEDDED only when it names a chrome: absent or blank
 * keeps the top-level shape every micro frontend had before, which still drives the window.
 */
class EmbeddedChromeTest {

  private static MicroFrontendDto microFrontend(String chrome) {
    return new MicroFrontendDto(
        "/remote", "/widget", "", null, null, "remote.Widget", null, null, null, null, chrome);
  }

  private static RunActionRqDto request(String embeddedChrome) {
    return RunActionRqDto.builder().actionId("").embeddedChrome(embeddedChrome).build();
  }

  @Test
  void aMicroFrontendIsEmbeddedOnlyWhenItNamesAChrome() {
    assertThat(microFrontend(null).embedded()).isFalse();
    assertThat(microFrontend("  ").embedded()).isFalse();
    assertThat(microFrontend("NONE").embedded()).isTrue();
  }

  @Test
  void theChromeSurvivesEmbeddingTheAnswerAndGoingToTheClient() {
    var embedded = microFrontend("COMPACT");
    assertThat(embedded.embedding(null).chrome()).isEqualTo("COMPACT");
    assertThat(embedded.forClient().chrome()).isEqualTo("COMPACT");
    assertThat(embedded.forClient().server()).isNull();
  }

  @Test
  void aRequestIsEmbeddedOnlyWhenItNamesAChrome() {
    assertThat(request(null).embedded()).isFalse();
    assertThat(request("").embedded()).isFalse();
    assertThat(request("PAGE").embedded()).isTrue();
    assertThat(request("PAGE").toString()).contains("embeddedChrome=PAGE");
    assertThat(request(null).toString()).doesNotContain("embeddedChrome");
  }

  @Test
  void theOlderRequestShapeIsTopLevel() {
    var older = new RunActionRqDto(null, null, null, null, null, "", null, null, null, null);
    assertThat(older.embedded()).isFalse();
    assertThat(older.componentState()).isEmpty();
    assertThat(older.appState()).isEmpty();
  }
}
