package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.core.infra.declarative.orchestrators.crudorchestrator.CrudOrchestrator;
import io.mateu.core.infra.declarative.orchestrators.crudorchestrator.actionhandlers.SaveActionHandler;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.interfaces.HttpRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SaveActionHandlerTest {

  @Mock CrudOrchestrator<?, ?, ?, ?, ?, ?> orchestrator;
  @Mock HttpRequest httpRequest;

  private final SaveActionHandler handler = new SaveActionHandler();

  @Test
  void supportsOnlySaveAction() {
    assertThat(handler.supports("save")).isTrue();
    assertThat(handler.supports("create")).isFalse();
    assertThat(handler.supports("delete")).isFalse();
    assertThat(handler.supports("edit")).isFalse();
  }

  @Test
  void routeContainsSavedId() {
    when(orchestrator.save(httpRequest)).thenReturn("abc-123");
    var initial = CrudActionResult.of("save");

    var result = handler.handle(orchestrator, initial, httpRequest);

    assertThat(result.route()).isEqualTo("/abc-123");
  }

  @Test
  void savedIdIsPopulated() {
    when(orchestrator.save(httpRequest)).thenReturn("abc-123");
    var initial = CrudActionResult.of("save");

    var result = handler.handle(orchestrator, initial, httpRequest);

    assertThat(result.savedId()).isEqualTo("abc-123");
  }

  @Test
  void addsSuccessMessage() {
    when(orchestrator.save(httpRequest)).thenReturn("abc-123");
    var initial = CrudActionResult.of("save");

    var result = handler.handle(orchestrator, initial, httpRequest);

    assertThat(result.messages()).hasSize(1);
    assertThat(result.messages().get(0).variant()).isEqualTo(NotificationVariant.success);
  }
}
