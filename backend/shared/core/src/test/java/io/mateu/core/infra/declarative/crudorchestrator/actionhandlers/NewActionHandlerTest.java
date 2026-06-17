package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudActionResult;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers.NewActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NewActionHandlerTest {

  @Mock Crud<?, ?, ?, ?, ?, ?> orchestrator;
  @Mock HttpRequest httpRequest;

  private final NewActionHandler handler = new NewActionHandler();

  @Test
  void supportsOnlyNewAction() {
    assertThat(handler.supports("new", httpRequest)).isTrue();
    assertThat(handler.supports("create", httpRequest)).isFalse();
    assertThat(handler.supports("save", httpRequest)).isFalse();
  }

  @Test
  void alwaysRedirectsToNewRoute() {
    var result = (CrudActionResult) handler.handleAction("new", httpRequest, orchestrator);

    assertThat(result.route()).isEqualTo("/new");
  }

  @Test
  void noSavedId() {
    var result = (CrudActionResult) handler.handleAction("new", httpRequest, orchestrator);

    assertThat(result.savedId()).isNull();
  }

  @Test
  void noMessages() {
    var result = (CrudActionResult) handler.handleAction("new", httpRequest, orchestrator);

    assertThat(result.messages()).isEmpty();
  }
}
