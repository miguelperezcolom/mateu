package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.core.infra.declarative.orchestrators.crud.CrudOrchestrator;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.CreateActionHandler;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.interfaces.HttpRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CreateActionHandlerTest {

  @Mock CrudOrchestrator<?, ?, ?, ?, ?, ?> orchestrator;
  @Mock HttpRequest httpRequest;

  private final CreateActionHandler handler = new CreateActionHandler();

  @Test
  void supportsOnlyCreateAction() {
    assertThat(handler.supports("create", httpRequest)).isTrue();
    assertThat(handler.supports("save", httpRequest)).isFalse();
    assertThat(handler.supports("new", httpRequest)).isFalse();
  }

  @Test
  void routeContainsNewlySavedId() {
    when(orchestrator.saveNew(httpRequest)).thenReturn("new-456");

    var result = (CrudActionResult) handler.handleAction("create", httpRequest, orchestrator);

    assertThat(result.route()).isEqualTo("/new-456");
  }

  @Test
  void savedIdIsPopulated() {
    when(orchestrator.saveNew(httpRequest)).thenReturn("new-456");

    var result = (CrudActionResult) handler.handleAction("create", httpRequest, orchestrator);

    assertThat(result.savedId()).isEqualTo("new-456");
  }

  @Test
  void addsSuccessMessage() {
    when(orchestrator.saveNew(httpRequest)).thenReturn("new-456");

    var result = (CrudActionResult) handler.handleAction("create", httpRequest, orchestrator);

    assertThat(result.messages()).hasSize(1);
    assertThat(result.messages().get(0).variant()).isEqualTo(NotificationVariant.success);
  }
}
