package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import io.mateu.core.infra.declarative.CrudOrchestrator;
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
class ViewActionHandlerTest {

  @Mock CrudOrchestrator<?, ?, ?, ?, ?, ?> orchestrator;
  @Mock HttpRequest httpRequest;

  private final ViewActionHandler handler = new ViewActionHandler();

  @BeforeEach
  void setUp() {
    when(orchestrator.getIdFieldForRow()).thenReturn("id");
  }

  @Test
  void supportsOnlyViewAction() {
    assertThat(handler.supports("view")).isTrue();
    assertThat(handler.supports("edit")).isFalse();
    assertThat(handler.supports("save")).isFalse();
  }

  @Test
  void usesIdFromComponentState() {
    when(httpRequest.getComponentState(Map.class)).thenReturn(Map.of("id", "view-id-1"));

    var result = handler.handle(orchestrator, CrudActionResult.of("view"), httpRequest);

    assertThat(result.route()).isEqualTo("/view-id-1");
    assertThat(result.savedId()).isEqualTo("view-id-1");
  }

  @Test
  void fallsBackToParameters() {
    when(httpRequest.getComponentState(Map.class)).thenReturn(Map.of());
    var rq = RunActionRqDto.builder().parameters(Map.of("id", "param-id-2")).build();
    when(httpRequest.runActionRq()).thenReturn(rq);

    var result = handler.handle(orchestrator, CrudActionResult.of("view"), httpRequest);

    assertThat(result.route()).isEqualTo("/param-id-2");
    assertThat(result.savedId()).isEqualTo("param-id-2");
  }

  @Test
  void noMessages() {
    when(httpRequest.getComponentState(Map.class)).thenReturn(Map.of("id", "x"));

    var result = handler.handle(orchestrator, CrudActionResult.of("view"), httpRequest);

    assertThat(result.messages()).isEmpty();
  }
}
