package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.MessageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * An action that answers plain text shows it as a message and leaves the screen as it was. It used
 * to replace the component that ran it with a {@code <p>} holding the text — the form vanished
 * behind its own confirmation — so the idiom became {@code List.of(new Message(text), new
 * State(this))}.
 */
class ActionReturningTextSyncTest {

  @UI("/text-returning")
  public static class Form {
    String name = "n";

    @Toolbar
    public String preview() {
      return "LLM: gpt\nNo warnings.";
    }

    @Toolbar
    public java.util.List<Object> previewAndKeep() {
      return java.util.List.of("done", new io.mateu.uidl.data.State(this));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Form.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto run(String actionId) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/text-returning")
            .consumedRoute("/text-returning")
            .actionId(actionId)
            .serverSideType(Form.class.getName())
            .initiatorComponentId("cmp-1")
            .componentState(Map.of("name", "n"))
            .build());
  }

  @Test
  void anActionReturningTextShowsItAsAMessageAndLeavesTheFormAlone() {
    var increment = run("preview");
    assertThat(increment.messages())
        .extracting(MessageDto::text)
        .containsExactly("LLM: gpt\nNo warnings.");
    assertThat(increment.fragments()).isEmpty();
  }

  @Test
  void textBesideTheStateIsAMessageTooAndTheStateStillTravels() {
    var increment = run("previewAndKeep");
    assertThat(increment.messages()).extracting(MessageDto::text).containsExactly("done");
    assertThat(increment.fragments()).hasSize(1);
    assertThat(increment.fragments().get(0).component()).isNull();
  }
}
