package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.TextDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * What the run-action entry point answers when there is nothing to run: the editor's live preview
 * of YAML that does not parse, and an action sent to a route nothing answers (a stale tab after a
 * redeploy) — a short error text, never a not-found PAGE replacing the screen the user clicked on.
 */
class RunActionEdgesSyncTest {

  @UI("/edges")
  @Title("Edges")
  public static class EdgesPage {
    public String name = "x";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(EdgesPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static String textOf(io.mateu.dtos.UIIncrementDto increment) {
    var component = (ClientSideComponentDto) increment.fragments().get(0).component();
    return ((TextDto) component.metadata()).text();
  }

  @Test
  void aPreviewOfYamlThatDoesNotParseSaysSo() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .actionId("__preview__")
                .initiatorComponentId("preview")
                .parameters(Map.of("_yaml", "type: [unclosed"))
                .build());
    assertThat(textOf(increment)).isEqualTo("Invalid or empty YAML");
  }

  @Test
  void aPreviewWithNoYamlAtAllSaysSo() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .actionId("__preview__")
                .initiatorComponentId("preview")
                .build());
    assertThat(textOf(increment)).isEqualTo("Invalid or empty YAML");
  }

  @Test
  void anActionOnARouteNothingAnswersIsAShortErrorNotAPage() {
    var increment =
        mateu.run(RunActionRqDto.builder().route("/no/such/screen").actionId("save").build());
    assertThat(textOf(increment)).isEqualTo("Not found.");
  }
}
