package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.CancelEditActionHandler;
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
class CancelEditActionHandlerTest {

  @Mock Crud<?, ?, ?, ?, ?, ?> orchestrator;
  @Mock HttpRequest httpRequest;

  private final CancelEditActionHandler handler = new CancelEditActionHandler();

  @BeforeEach
  void setUp() {
    when(orchestrator.getIdFieldForRow()).thenReturn("id");
  }

  @Test
  void supportsOnlyCancelEditAction() {
    assertThat(handler.supports("cancel-edit", httpRequest)).isTrue();
    assertThat(handler.supports("cancel-view", httpRequest)).isFalse();
    assertThat(handler.supports("edit", httpRequest)).isFalse();
  }

  @Test
  void routeIsViewOfEntityWhenIdInComponentState() {
    when(httpRequest.getComponentState(Map.class)).thenReturn(Map.of("id", "entity-1"));

    var result = (CrudActionResult) handler.handleAction("cancel-edit", httpRequest, orchestrator);

    assertThat(result.route()).isEqualTo("/entity-1");
    assertThat(result.savedId()).isEqualTo("entity-1");
  }

  @Test
  void fallsBackToParameters() {
    when(httpRequest.getComponentState(Map.class)).thenReturn(Map.of());
    var rq = RunActionRqDto.builder().parameters(Map.of("id", "param-entity-2")).build();
    when(httpRequest.runActionRq()).thenReturn(rq);

    var result = (CrudActionResult) handler.handleAction("cancel-edit", httpRequest, orchestrator);

    assertThat(result.route()).isEqualTo("/param-entity-2");
  }

  @Test
  void fallsBackToInitiatorState() {
    when(httpRequest.getComponentState(Map.class)).thenReturn(Map.of());
    var rq =
        RunActionRqDto.builder()
            .parameters(Map.of("initiatorState", Map.of("id", "initiator-entity-3")))
            .build();
    when(httpRequest.runActionRq()).thenReturn(rq);

    var result = (CrudActionResult) handler.handleAction("cancel-edit", httpRequest, orchestrator);

    assertThat(result.route()).isEqualTo("/initiator-entity-3");
  }

  @Test
  void noMessages() {
    when(httpRequest.getComponentState(Map.class)).thenReturn(Map.of("id", "x"));

    var result = (CrudActionResult) handler.handleAction("cancel-edit", httpRequest, orchestrator);

    assertThat(result.messages()).isEmpty();
  }
}
