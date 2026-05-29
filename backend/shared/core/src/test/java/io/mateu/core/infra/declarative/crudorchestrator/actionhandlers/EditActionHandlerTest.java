package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudOrchestrator;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.EditActionHandler;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class EditActionHandlerTest {

  @Mock CrudOrchestrator<?, ?, ?, ?, ?, ?> orchestrator;
  @Mock HttpRequest httpRequest;

  private final EditActionHandler handler = new EditActionHandler();

  @BeforeEach
  void setUp() {
    when(orchestrator.getIdFieldForRow()).thenReturn("id");
  }

  @Test
  void supportsOnlyEditAction() {
    assertThat(handler.supports("edit", httpRequest)).isTrue();
    assertThat(handler.supports("view", httpRequest)).isFalse();
    assertThat(handler.supports("save", httpRequest)).isFalse();
  }

  @Test
  void usesIdFromComponentState() {
    when(httpRequest.getComponentState(Map.class)).thenReturn(Map.of("id", "state-id-1"));

    var result = (CrudActionResult) handler.handleAction("edit", httpRequest, orchestrator);

    assertThat(result.route()).isEqualTo("/state-id-1/edit");
    assertThat(result.savedId()).isEqualTo("state-id-1");
  }

  @Test
  void fallsBackToParameters() {
    when(httpRequest.getComponentState(Map.class)).thenReturn(Map.of());
    var rq = RunActionRqDto.builder().parameters(Map.of("id", "param-id-2")).build();
    when(httpRequest.runActionRq()).thenReturn(rq);

    var result = (CrudActionResult) handler.handleAction("edit", httpRequest, orchestrator);

    assertThat(result.route()).isEqualTo("/param-id-2/edit");
    assertThat(result.savedId()).isEqualTo("param-id-2");
  }

  @Test
  void fallsBackToInitiatorState() {
    when(httpRequest.getComponentState(Map.class)).thenReturn(Map.of());
    var rq =
        RunActionRqDto.builder()
            .parameters(Map.of("initiatorState", Map.of("id", "initiator-id-3")))
            .build();
    when(httpRequest.runActionRq()).thenReturn(rq);

    var result = (CrudActionResult) handler.handleAction("edit", httpRequest, orchestrator);

    assertThat(result.route()).isEqualTo("/initiator-id-3/edit");
    assertThat(result.savedId()).isEqualTo("initiator-id-3");
  }

  @Test
  void noMessages() {
    when(httpRequest.getComponentState(Map.class)).thenReturn(Map.of("id", "x"));

    var result = (CrudActionResult) handler.handleAction("edit", httpRequest, orchestrator);

    assertThat(result.messages()).isEmpty();
  }
}
