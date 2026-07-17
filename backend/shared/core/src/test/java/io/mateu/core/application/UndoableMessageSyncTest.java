package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Undoable toasts: an action returns {@link Message#undoable} and the toast carries the undo action
 * id + parameters on the wire; the frontend's Undo button dispatches that action on the initiator,
 * which reverses the effect (here: archive → restore).
 */
class UndoableMessageSyncTest {

  static List<String> archived;

  @SuppressWarnings("unused")
  @UI("/archive-demo")
  @Title("Archive")
  public static class ArchivePage {

    String name = "x";

    @Button
    public Message archive(HttpRequest httpRequest) {
      archived.add("doc-7");
      return Message.undoable("Documento archivado", "restore", Map.of("docId", "doc-7"));
    }

    public Message restore(HttpRequest httpRequest) {
      // the Undo button's undoParameters travel as ACTION PARAMETERS (not component state)
      var docId = String.valueOf(httpRequest.runActionRq().parameters().get("docId"));
      archived.remove(docId);
      return Message.success("Documento restaurado");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ArchivePage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    archived = new java.util.ArrayList<>();
  }

  private io.mateu.dtos.UIIncrementDto run(String actionId, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/archive-demo")
            .consumedRoute("/archive-demo")
            .serverSideType(ArchivePage.class.getName())
            .actionId(actionId)
            .initiatorComponentId("c1")
            .componentState(Map.of())
            .parameters(parameters)
            .build());
  }

  @Test
  void theUndoableToastCarriesTheUndoActionAndParametersOnTheWire() {
    var increment = run("archive", null);
    assertThat(archived).containsExactly("doc-7");
    var message = increment.messages().get(0);
    assertThat(message.text()).isEqualTo("Documento archivado");
    assertThat(message.undoLabel()).isEqualTo("Deshacer");
    assertThat(message.undoActionId()).isEqualTo("restore");
    assertThat(message.undoParameters()).containsEntry("docId", "doc-7");
    assertThat(message.duration()).isEqualTo(10000);
  }

  @Test
  void dispatchingTheUndoActionReversesTheEffect() {
    run("archive", null);
    var increment = run("restore", Map.of("docId", "doc-7"));
    assertThat(archived).isEmpty();
    assertThat(increment.messages()).extracting(m -> m.text()).contains("Documento restaurado");
  }

  @Test
  void plainMessagesCarryNoUndoFields() {
    run("archive", null);
    var increment = run("restore", Map.of("docId", "doc-7"));
    var message = increment.messages().get(0);
    assertThat(message.undoActionId()).isNull();
    assertThat(message.undoLabel()).isNull();
  }
}
